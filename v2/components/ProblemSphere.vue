<script setup lang="ts">
// The fractured-sphere WebGL stage, driven entirely by a SphereVariant.
//
// Geometry comes from utils/sphereVariants (pure math on baked Voronoi cells);
// this component only turns those number arrays into three.js objects and
// animates them. three.js is dynamically imported inside onMounted so it never
// enters the server bundle or blocks hydration — the labels are ordinary DOM
// text and render server-side.
//
// Draw-call strategy: variants that don't animate per shard (no drift) get all
// shards merged into a single mesh + single LineSegments — 2 draw calls no
// matter how many shards. Only drift variants pay for per-shard objects.
import type * as THREE_NS from 'three'
import type {
    SphereVariant, ShardGeometry, ParticleLayer, FollowConfig, OrbitConfig,
} from '~/utils/sphereVariants'

const props = withDefaults(defineProps<{ variant?: SphereVariant }>(), {
    variant: () => getVariant(DEFAULT_VARIANT_ID),
})

const stageRef = ref<HTMLElement | null>(null)
const glCanvasRef = ref<HTMLCanvasElement | null>(null)
const overlayRef = ref<HTMLCanvasElement | null>(null)
const labelEls: (HTMLElement | null)[] = []

const ROTATION_AXIS: [number, number, number] = [0.32, 0.88, 0.2]
const ANGULAR_SPEED = (Math.PI * 2) / 70000 // one full revolution per ~70s
const LABEL_FADE_START = -0.12
const LABEL_FADE_END = 0.5
const LABEL_WIDTH = 200
const CAMERA_FOV = 32
const SPHERE_FILL = 0.62 // sphere diameter as a fraction of the stage's smaller side
const REDUCED_MOTION_POSE = 5200 // fixed elapsed-ms giving a well-composed static pose
const PARTICLE_COLOR = 0xeef3ff // silver-white; the particle orbs are monochrome

// Grains are drawn as shaded points rather than three's PointsMaterial so each
// one can carry its own size, twinkle and depth brightness on the GPU — a few
// thousand vertex-colour updates per frame on the CPU would not be free, and
// square unlit dots don't read as glowing dust.
const PARTICLE_VERT = `
attribute float aShade;
attribute float aSize;
attribute float aRate;
attribute float aPhase;
uniform float uPointScale;
uniform float uLoop;
uniform float uTwinkle;
uniform float uDepthFade;
varying float vBright;
void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    // Perspective size attenuation, in device pixels. Clamped because plenty of
    // GPUs cap gl_PointSize an order of magnitude below what a near, large
    // grain would ask for, and a silent clamp is worse than a deliberate one.
    gl_PointSize = clamp(aSize * uPointScale / -mv.z, 1.0, 64.0);
    // Whole cycles per loop, so every grain is back where it started on the wrap.
    float twinkle = 1.0 + uTwinkle * sin(6.28318530718 * aRate * uLoop + aPhase);
    // The camera sits on +z looking at the origin, so world.z is signed depth.
    // Additive points occlude nothing, so dimming the far half is the only
    // thing that makes the cloud read as a volume once it turns.
    float front = smoothstep(-1.25, 1.25, world.z);
    vBright = max(aShade * twinkle * mix(1.0 - uDepthFade, 1.0, front), 0.0);
}
`

const PARTICLE_FRAG = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vBright;
void main() {
    // Two exponents of the same radial falloff: a tight bright centre plus a
    // wide faint skirt. That is enough to read as bloom, with no texture and
    // no post-processing pass.
    float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (r > 1.0) discard;
    float falloff = 1.0 - r;
    gl_FragColor = vec4(uColor, (pow(falloff, 1.7) + pow(falloff, 0.6) * 0.4) * uOpacity * vBright);
}
`

let THREE: typeof THREE_NS | null = null
let renderer: THREE_NS.WebGLRenderer | null = null
let scene: THREE_NS.Scene | null = null
let camera: THREE_NS.PerspectiveCamera | null = null
let group: THREE_NS.Group | null = null
let axis: THREE_NS.Vector3 | null = null
let overlayCtx: CanvasRenderingContext2D | null = null

// Per-shard objects, only populated for variants that tumble.
let shardMeshes: THREE_NS.Object3D[] = []
let shardData: ShardGeometry[] = []
let labelShards: ShardGeometry[] = []
let animatesShards = false

// Particle-orb strata. Each turns about its own axis relative to the sphere's
// spin, and may additionally chase the invisible orbiting target.
interface Stratum {
    holder: THREE_NS.Group
    axis: THREE_NS.Vector3
    spin: number
    follow: FollowConfig | null
    /** Orthonormal basis of the orbit plane, for evaluating the tug direction
     *  without building a quaternion every frame. Only set when it follows. */
    tugU: THREE_NS.Vector3 | null
    tugV: THREE_NS.Vector3 | null
}
let strata: Stratum[] = []
let orbit: OrbitConfig | null = null
// Every grain material, so the per-frame loop phase and the per-resize point
// scale can be pushed to all of them at once.
let particleMaterials: THREE_NS.ShaderMaterial[] = []
let coreGlow: THREE_NS.Sprite | null = null
let coreGlowTexture: THREE_NS.Texture | null = null
let coreGlowOpacity = 0
let pointScale = 1

let rafId = 0
let startTime = 0
let stageW = 0
let stageH = 0
let io: IntersectionObserver | null = null
let inView = false
let reducedMotion = false
let disposed = false

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
}

/** A first-order lag's steady-state response to one sinusoidal component of the
 *  target's surge: same frequency, amplitude cut by 1/sqrt(1 + (wT)^2) and phase
 *  pulled back by atan(wT).
 *
 *  Solved in closed form rather than integrated. A simulated follower would
 *  still be settling when the loop wraps, and every periodic term here has to
 *  land back where it started or the 16s seam shows. It also means the harmonic
 *  is attenuated and delayed more than the fundamental for free — which is why
 *  one `lag` number per stratum is enough to give each its own velocity curve
 *  instead of the same curve at two amplitudes. */
function laggedSurge(amp: number, cycles: number, lag: number, loop: number) {
    const w = Math.PI * 2 * cycles
    return (amp / Math.hypot(1, w * lag)) * Math.sin(w * loop - Math.atan(w * lag))
}

/** How far ahead of a constant rate a stratum currently believes the target is.
 *  Fundamental plus skewed harmonic, both through the same lag. */
function followSurge(cfg: OrbitConfig, follow: FollowConfig, loop: number) {
    const amp = cfg.surge * follow.gain
    return (
        laggedSurge(amp, cfg.cycles, follow.lag, loop) +
        laggedSurge(amp * cfg.skew, cfg.cycles * 2, follow.lag, loop)
    )
}

/** Two unit vectors spanning the plane normal to `n`. The seed is picked to be
 *  the axis `n` leans on least, so the cross product stays well conditioned. */
function planeBasis(n: THREE_NS.Vector3) {
    const seed = Math.abs(n.x) < 0.9
        ? new THREE!.Vector3(1, 0, 0)
        : new THREE!.Vector3(0, 1, 0)
    const u = new THREE!.Vector3().crossVectors(seed, n).normalize()
    const v = new THREE!.Vector3().crossVectors(n, u).normalize()
    return { u, v }
}

function makeMaterials() {
    const body = new THREE!.MeshStandardMaterial({
        color: 0x14403c,
        emissive: 0x081a1f,
        metalness: 0.12,
        roughness: 0.82,
        flatShading: true,
        // Slabs expose interior walls whose winding is awkward to guarantee;
        // double-siding is cheaper than getting it subtly wrong.
        side: props.variant.thickness > 0 ? THREE!.DoubleSide : THREE!.FrontSide,
    })
    const edge = new THREE!.LineBasicMaterial({ color: 0xcfe6e2, transparent: true, opacity: 0.62 })
    return { body, edge }
}

function makeParticleMaterial(layer: ParticleLayer, depthFade: number) {
    const material = new THREE!.ShaderMaterial({
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        uniforms: {
            uColor: { value: new THREE!.Color(PARTICLE_COLOR) },
            uOpacity: { value: layer.opacity },
            uTwinkle: { value: layer.twinkle?.amp ?? 0 },
            uDepthFade: { value: depthFade },
            uPointScale: { value: pointScale },
            uLoop: { value: 0 },
        },
        transparent: true,
        blending: THREE!.AdditiveBlending,
        // Additive glows shouldn't occlude each other; depth writes off also
        // spares the sort artifacts of thousands of blended points.
        depthWrite: false,
    })
    particleMaterials.push(material)
    return material
}

/** A soft radial falloff painted once into a canvas. Sprites need a map, and
 *  the gradient is smoother than anything a stack of points can build. */
function makeGlowTexture() {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.12, 'rgba(244,248,255,0.5)')
    gradient.addColorStop(0.36, 'rgba(228,238,255,0.13)')
    gradient.addColorStop(1, 'rgba(214,230,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new THREE!.CanvasTexture(canvas)
}

// Particle path: the sphere as layered points instead of fracture plates —
// grains carrying their own size, twinkle and depth brightness, optionally a
// constellation web, optionally a sprite halo for the core.
function buildParticleSphere(cells: (typeof SPHERE_CELL_SETS)[number], labelIdx: number[]) {
    const particles = props.variant.particles!
    const orb = buildParticleOrb(particles)

    shardData = []
    shardMeshes = []
    animatesShards = false
    // Labels anchor to the same cell seeds the plate variants use, lifted just
    // clear of the star shell so leader lines start on the surface.
    labelShards = labelIdx.map((i) => ({
        positions: [], edges: [], anchor: cells[i].s, radialOffset: 0.06, driftPhase: 0,
    }))

    orbit = particles.orbit ?? null
    const orbitAxis = orbit ? new THREE!.Vector3(...orbit.axis).normalize() : null
    const orbitPlane = orbitAxis ? planeBasis(orbitAxis) : null

    orb.layers.forEach((layerGeometry, layerIndex) => {
        const layer = particles.layers[layerIndex]
        const geometry = new THREE!.BufferGeometry()
        geometry.setAttribute('position', new THREE!.Float32BufferAttribute(layerGeometry.positions, 3))
        geometry.setAttribute('aShade', new THREE!.Float32BufferAttribute(layerGeometry.shades, 1))
        geometry.setAttribute('aSize', new THREE!.Float32BufferAttribute(layerGeometry.sizes, 1))
        geometry.setAttribute('aRate', new THREE!.Float32BufferAttribute(layerGeometry.rates, 1))
        geometry.setAttribute('aPhase', new THREE!.Float32BufferAttribute(layerGeometry.phases, 1))

        const holder = new THREE!.Group()
        holder.add(new THREE!.Points(geometry, makeParticleMaterial(layer, particles.depthFade ?? 0)))
        group!.add(holder)

        // A follower turns about the orbit axis, so its surge carries it around
        // the target's own plane rather than just modulating the sphere's spin.
        const follow = layer.follow ?? null
        let stratumAxis = axis!
        if (layer.axis) stratumAxis = new THREE!.Vector3(...layer.axis).normalize()
        else if (follow && orbitAxis) stratumAxis = orbitAxis
        strata.push({
            holder,
            axis: stratumAxis,
            spin: layer.spin,
            follow,
            tugU: follow?.tug && orbitPlane ? orbitPlane.u : null,
            tugV: follow?.tug && orbitPlane ? orbitPlane.v : null,
        })
    })

    if (orb.links.length) {
        const linkGeometry = new THREE!.BufferGeometry()
        linkGeometry.setAttribute('position', new THREE!.Float32BufferAttribute(orb.links, 3))
        const linkMaterial = new THREE!.LineBasicMaterial({
            color: 0xbfd0dd,
            transparent: true,
            opacity: particles.linkOpacity ?? 0.25,
            blending: THREE!.AdditiveBlending,
            depthWrite: false,
        })
        group!.add(new THREE!.LineSegments(linkGeometry, linkMaterial))
    }

    // The halo is parented to the stratum it belongs to, so it inherits that
    // stratum's chase — otherwise the grains sprint away from their own glow.
    // Falling back to the group keeps it riding the sphere's plain rotation.
    if (particles.glow) {
        coreGlowTexture = makeGlowTexture()
        coreGlowOpacity = particles.glow.opacity
        coreGlow = new THREE!.Sprite(
            new THREE!.SpriteMaterial({
                map: coreGlowTexture,
                transparent: true,
                opacity: coreGlowOpacity,
                blending: THREE!.AdditiveBlending,
                depthWrite: false,
            })
        )
        coreGlow.position.set(...particles.glow.center)
        coreGlow.scale.setScalar(particles.glow.size)
        const host = particles.glow.layer !== undefined ? strata[particles.glow.layer]?.holder : null
        ;(host ?? group!).add(coreGlow)
    }
}

function buildSphere() {
    if (!THREE || !scene) return
    const variant = props.variant
    const cells = SPHERE_CELL_SETS[variant.cells]
    const labelIdx = resolveLabelCells(cells)

    group = new THREE.Group()
    scene.add(group)

    if (variant.particles) {
        buildParticleSphere(cells, labelIdx)
        return
    }

    shardData = buildVariantShards(variant, cells)
    labelShards = labelIdx.map((i) => shardData[i])
    animatesShards = variant.drift > 0

    const { body: bodyMat, edge: edgeMat } = makeMaterials()

    // Opaque core, so plates can stay thin without exposing the shell interior
    // through the steps between them. One cheap draw instead of deep prisms.
    if (variant.core) {
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x0c2a2b,
            roughness: 0.95,
            metalness: 0,
        })
        group.add(new THREE.Mesh(new THREE.SphereGeometry(variant.core, 48, 32), coreMat))
    }

    if (animatesShards) {
        // Each shard is its own object so it can tumble about its own anchor.
        shardMeshes = shardData.map((shard) => {
            const holder = new THREE!.Group()
            const [ax, ay, az] = shard.anchor

            const local: number[] = []
            for (let i = 0; i < shard.positions.length; i += 3) {
                local.push(shard.positions[i] - ax, shard.positions[i + 1] - ay, shard.positions[i + 2] - az)
            }
            const geom = new THREE!.BufferGeometry()
            geom.setAttribute('position', new THREE!.Float32BufferAttribute(local, 3))
            geom.computeVertexNormals()
            holder.add(new THREE!.Mesh(geom, bodyMat))

            if (shard.edges.length) {
                const localEdges: number[] = []
                for (let i = 0; i < shard.edges.length; i += 3) {
                    localEdges.push(shard.edges[i] - ax, shard.edges[i + 1] - ay, shard.edges[i + 2] - az)
                }
                const eg = new THREE!.BufferGeometry()
                eg.setAttribute('position', new THREE!.Float32BufferAttribute(localEdges, 3))
                holder.add(new THREE!.LineSegments(eg, edgeMat))
            }

            holder.position.set(ax, ay, az)
            group!.add(holder)
            return holder
        })
    } else {
        // Static variants: merge everything. Explode is a fixed offset, so it
        // can be baked straight into the merged vertex positions.
        shardMeshes = []
        const merged: number[] = []
        const mergedEdges: number[] = []
        for (const shard of shardData) {
            const [ax, ay, az] = shard.anchor
            const o = shard.radialOffset
            for (let i = 0; i < shard.positions.length; i += 3) {
                merged.push(shard.positions[i] + ax * o, shard.positions[i + 1] + ay * o, shard.positions[i + 2] + az * o)
            }
            for (let i = 0; i < shard.edges.length; i += 3) {
                mergedEdges.push(shard.edges[i] + ax * o, shard.edges[i + 1] + ay * o, shard.edges[i + 2] + az * o)
            }
        }
        const geom = new THREE.BufferGeometry()
        geom.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3))
        geom.computeVertexNormals()
        group.add(new THREE.Mesh(geom, bodyMat))

        if (mergedEdges.length) {
            const eg = new THREE.BufferGeometry()
            eg.setAttribute('position', new THREE.Float32BufferAttribute(mergedEdges, 3))
            group.add(new THREE.LineSegments(eg, edgeMat))
        }
    }
}

function buildScene() {
    if (!THREE) return
    const canvas = glCanvasRef.value
    if (!canvas) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    camera.position.set(0, 0, 6) // real distance is set per-size in sizeStage()
    camera.lookAt(0, 0, 0)

    // Ambient keeps shadowed faces legible on black; a teal key from the upper
    // left gives each face its own value so the fracture reads as volume; a dim
    // cool fill recovers the terminator. Variants that carry no edge strokes
    // lean harder on this contrast, so the mix is per-variant.
    const light = props.variant.light ?? DEFAULT_LIGHT
    scene.add(new THREE.AmbientLight(0x3a635f, light.ambient))
    const key = new THREE.DirectionalLight(0x9defe0, light.key)
    key.position.set(...light.keyPos)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x2f6a86, light.fill)
    fill.position.set(3, -2, 2)
    scene.add(fill)

    axis = new THREE.Vector3(...ROTATION_AXIS).normalize()

    buildSphere()

    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setClearColor(0x000000, 0)
    }
    overlayCtx = overlayRef.value?.getContext('2d') ?? null
}

function disposeSceneObjects() {
    scene?.traverse((obj) => {
        const mesh = obj as THREE_NS.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
    })
    // Textures aren't reachable from a material's own dispose(), so the glow
    // map has to be released by hand or it leaks on every variant switch.
    coreGlowTexture?.dispose()
    coreGlowTexture = null
    coreGlow = null
    scene = null
    group = null
    shardMeshes = []
    strata = []
    orbit = null
    particleMaterials = []
}

function sizeStage() {
    const stage = stageRef.value
    if (!stage || !renderer || !camera) return

    const rect = stage.getBoundingClientRect()
    stageW = rect.width
    stageH = rect.height
    if (!stageW || !stageH) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(stageW, stageH, false)
    camera.aspect = stageW / stageH

    // Distance the camera so the unit sphere's projected diameter is a fixed
    // fraction of the stage's smaller side — regardless of aspect. This is the
    // 3D analogue of a `radiusPx = min(w,h) * k` calc, and is what keeps the
    // sphere from overflowing a narrow (mobile) stage.
    const vFov = (CAMERA_FOV * Math.PI) / 180
    camera.position.z = stageH / (Math.tan(vFov / 2) * SPHERE_FILL * Math.min(stageW, stageH))
    camera.updateProjectionMatrix()

    // Device pixels per world unit at unit depth — the shader divides it by the
    // point's view depth to get gl_PointSize, so a grain's `size` stays a real
    // world diameter and its pixel size tracks the sphere across viewports.
    pointScale = 0.5 * stageH * dpr * camera.projectionMatrix.elements[5]
    for (const material of particleMaterials) material.uniforms.uPointScale.value = pointScale

    const overlay = overlayRef.value
    if (overlay) {
        overlay.width = Math.round(stageW * dpr)
        overlay.height = Math.round(stageH * dpr)
        overlay.style.width = `${stageW}px`
        overlay.style.height = `${stageH}px`
        overlayCtx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
}

let resizeTicking = false
function onResize() {
    if (resizeTicking) return
    resizeTicking = true
    requestAnimationFrame(() => {
        resizeTicking = false
        sizeStage()
        if (reducedMotion) drawFrame(REDUCED_MOTION_POSE, true)
    })
}

const _v = {
    tmp: null as THREE_NS.Vector3 | null,
    glow: null as THREE_NS.Vector3 | null,
    tug: null as THREE_NS.Vector3 | null,
}
function drawFrame(elapsed: number, forceLabelsVisible = false) {
    if (!THREE || !renderer || !scene || !camera || !group || !axis) return
    const variant = props.variant
    const particles = variant.particles

    // Variants with a loop period drive everything off it: the spin takes a
    // whole number of loops per revolution and every modulation is a whole
    // number of cycles per loop, so the piece repeats exactly. Everything else
    // keeps the open-ended slow rotation.
    const loopMs = particles?.loopMs ?? 0
    const loop = loopMs ? (elapsed % loopMs) / loopMs : 0
    const angle = loopMs
        ? (elapsed / (loopMs * (particles!.loopsPerTurn ?? 1))) * Math.PI * 2
        : elapsed * ANGULAR_SPEED
    group.setRotationFromAxisAngle(axis, angle)

    // Layered parallax for particle orbs: each stratum adds its own steady
    // rotation on top of the group's spin, and a following stratum adds the
    // lagged surge of the invisible target plus a sway toward where it thinks
    // that target currently is. The two together are what read as chasing
    // something rather than as strata geared to each other.
    for (const stratum of strata) {
        const surge = orbit && stratum.follow ? followSurge(orbit, stratum.follow, loop) : 0
        stratum.holder.setRotationFromAxisAngle(stratum.axis, angle * stratum.spin + surge)

        if (orbit && stratum.follow?.tug && stratum.tugU && stratum.tugV) {
            if (!_v.tug) _v.tug = new THREE.Vector3()
            // The tug angle carries the same surge as the rotation, so a
            // stratum's sway and its spin-up stay in step with each other.
            const theta = Math.PI * 2 * orbit.rate * loop + surge
            stratum.holder.position
                .copy(_v.tug.copy(stratum.tugU).multiplyScalar(Math.cos(theta))
                    .addScaledVector(stratum.tugV, Math.sin(theta)))
                .multiplyScalar(stratum.follow.tug)
        }
    }
    for (const material of particleMaterials) material.uniforms.uLoop.value = loop

    // The halo can't dim itself the way the grains do in the vertex shader, so
    // its depth term is applied here — same curve, same signed world z. It is
    // parented to a stratum that moves independently of the group, so its world
    // position has to come from the graph rather than from the group's rotation.
    if (coreGlow && particles?.glow) {
        if (!_v.glow) _v.glow = new THREE.Vector3()
        group.updateMatrixWorld(true)
        const world = coreGlow.getWorldPosition(_v.glow)
        const front = smoothstep(-1.25, 1.25, world.z)
        const depth = 1 - (particles.depthFade ?? 0) * (1 - front)
        const breathe = 1 + 0.12 * Math.sin(loop * Math.PI * 2)
        coreGlow.material.opacity = coreGlowOpacity * depth * breathe
    }

    // Per-shard tumble + gentle radial breathing, for drift variants only.
    if (animatesShards && shardMeshes.length) {
        const t = elapsed * 0.00035
        for (let i = 0; i < shardMeshes.length; i++) {
            const holder = shardMeshes[i]
            const shard = shardData[i]
            const phase = shard.driftPhase
            holder.rotation.set(
                Math.sin(t + phase) * variant.drift,
                Math.cos(t * 0.83 + phase) * variant.drift,
                Math.sin(t * 1.17 + phase) * variant.drift * 0.6
            )
            const breathe = 1 + shard.radialOffset + Math.sin(t * 0.9 + phase) * 0.02
            holder.position.set(
                shard.anchor[0] * breathe,
                shard.anchor[1] * breathe,
                shard.anchor[2] * breathe
            )
        }
    }

    renderer.render(scene, camera)

    if (!overlayCtx) return
    overlayCtx.clearRect(0, 0, stageW, stageH)
    // Label-less variants stand on their own — no pins, no leader lines.
    if (variant.labels === false) return
    if (!_v.tmp) _v.tmp = new THREE.Vector3()

    SPHERE_LABELS.forEach((label, i) => {
        const el = labelEls[i]
        const shard = labelShards[i]
        if (!el || !shard) return

        // Anchor sits on the shard's surface, including any radial offset, so
        // the leader line still touches the shard it belongs to.
        const r = 1 + shard.radialOffset
        const world = _v.tmp!.set(shard.anchor[0] * r, shard.anchor[1] * r, shard.anchor[2] * r)
            .applyQuaternion(group!.quaternion)
        const depth = world.z // > 0 == facing the camera (camera sits on +z)
        const ndc = world.clone().project(camera!)
        const anchorX = (ndc.x * 0.5 + 0.5) * stageW
        const anchorY = (-ndc.y * 0.5 + 0.5) * stageH

        const opacity = forceLabelsVisible ? 1 : smoothstep(LABEL_FADE_START, LABEL_FADE_END, depth)
        const tickTopY = anchorY - label.tickLength
        const elbowX = anchorX + label.xOffset
        // Clamp to the stage so a label never pushes the page's scrollable
        // width past the viewport on narrow screens.
        const labelX = Math.min(Math.max(elbowX + 8, 4), Math.max(stageW - LABEL_WIDTH - 4, 4))

        el.style.transform = `translate3d(${labelX.toFixed(1)}px, ${(tickTopY - 46).toFixed(1)}px, 0)`
        el.style.opacity = opacity.toFixed(3)

        if (opacity > 0.01) {
            overlayCtx!.beginPath()
            overlayCtx!.moveTo(anchorX, anchorY)
            overlayCtx!.lineTo(anchorX, tickTopY)
            overlayCtx!.lineTo(labelX - 8, tickTopY)
            overlayCtx!.strokeStyle = `rgba(255,255,255,${(0.55 * opacity).toFixed(3)})`
            overlayCtx!.lineWidth = 1.25
            overlayCtx!.stroke()
        }
    })
}

function loop(timestamp: number) {
    if (!startTime) startTime = timestamp
    drawFrame(timestamp - startTime)
    if (inView && !reducedMotion && !disposed) rafId = requestAnimationFrame(loop)
}

function start() {
    if (rafId || reducedMotion || disposed) return
    rafId = requestAnimationFrame(loop)
}

function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
}

// Swapping variants tears the sphere down and rebuilds it — the lab page
// relies on this; the live section never changes variant at runtime.
watch(
    () => props.variant.id,
    () => {
        if (!THREE || disposed) return
        stop()
        disposeSceneObjects()
        buildScene()
        sizeStage()
        if (reducedMotion) drawFrame(REDUCED_MOTION_POSE, true)
        else if (inView) start()
    }
)

onMounted(async () => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    THREE = await import('three')
    if (disposed) return // unmounted before the dynamic import resolved

    buildScene()
    sizeStage()
    window.addEventListener('resize', onResize)

    if (reducedMotion) {
        // No motion: one fixed pose, every label forced visible so the concerns
        // stay legible without relying on a rotation that won't run.
        drawFrame(REDUCED_MOTION_POSE, true)
        return
    }

    io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                inView = entry.isIntersecting
                if (inView) start()
                else stop()
            }
        },
        { threshold: 0, rootMargin: '200px 0px' }
    )
    if (stageRef.value) io.observe(stageRef.value)
})

onBeforeUnmount(() => {
    disposed = true
    stop()
    io?.disconnect()
    window.removeEventListener('resize', onResize)
    disposeSceneObjects()
    renderer?.dispose()
    renderer = null
    camera = null
})
</script>

<template>
    <div
        ref="stageRef"
        class="relative mx-auto h-[520px] w-full max-w-[720px] overflow-x-hidden tablet-md:h-[620px] desktop:h-[700px]"
    >
        <canvas ref="glCanvasRef" class="absolute inset-0 h-full w-full" aria-hidden="true" />
        <canvas ref="overlayRef" class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />

        <div
            v-for="(label, i) in (variant.labels === false ? [] : SPHERE_LABELS)"
            :key="label.role + label.question"
            :ref="(el) => (labelEls[i] = el as HTMLElement | null)"
            class="pointer-events-none absolute left-0 top-0 w-[200px] opacity-0 will-change-transform"
        >
            <p class="font-poppins text-[13px] font-medium leading-tight text-Blue/400">{{ label.role }}</p>
            <p class="mt-1 font-franklin text-[12.5px] leading-[1.4] text-Tinted/300">{{ label.question }}</p>
        </div>
    </div>
</template>
