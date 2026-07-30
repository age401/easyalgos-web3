<script setup lang="ts">
// The particle cluster stage, reused from the previous build.
//
// utils/stellarCore.ts is untouched: it is pure math (deterministic golden-angle
// strata, the orbiting-target follow model) and it emits plain number arrays, so
// it ports across unchanged. What changed here is the CLOCK.
//
// Previously the piece ran its own one-shot timeline — turn, brake to a stop,
// hold, implode — and ended on an empty stage. Now:
//   * rotation and the surge run continuously off wall time, so the cloud is
//     always alive while it is on screen;
//   * the implosion is driven by the `converge` prop instead, which the section
//     maps from scroll position. The cluster therefore draws inward exactly as
//     the "all in one place" copy takes the stage, which is the argument the
//     section is making.
// `converge` goes straight into a shader uniform: no geometry is rebuilt and
// nothing is written to the DOM as the reader scrolls, so the whole effect costs
// one uniform write per frame.
//
// three.js is dynamically imported inside onMounted, so it never enters the
// server bundle, never blocks hydration, and is code-split into its own chunk.
import type * as THREE_NS from 'three'
import type { FollowConfig, OrbitConfig, ParticleLayer } from '~/utils/stellarCore'

interface Props {
    /** 0 = intact cloud, 1 = fully drawn into the centre and faded out. */
    converge?: number
    /** Rendered as a single mid-motion frame instead of animating. */
    still?: boolean
}
const props = withDefaults(defineProps<Props>(), { converge: 0, still: false })
const emit = defineEmits<{ (e: 'converged'): void }>()

const stageRef = ref<HTMLElement | null>(null)
const glCanvasRef = ref<HTMLCanvasElement | null>(null)

const ROTATION_AXIS: [number, number, number] = [0.32, 0.88, 0.2]
const CAMERA_FOV = 32
const SPHERE_FILL = 0.62 // cluster diameter as a fraction of the stage's smaller side

// Grains are drawn as shaded points rather than three's PointsMaterial so each
// one can carry its own size and brightness on the GPU — a few thousand
// vertex-colour updates per frame on the CPU would not be free.
const PARTICLE_VERT = `
attribute float aShade;
attribute float aSize;
uniform float uPointScale;
uniform float uDepthFade;
uniform float uLevels;
uniform float uCollapse;
varying float vBright;
void main() {
    // The collapse is a scale toward the model origin. Applied here rather than
    // to the holder's transform because the point size has to shrink with it or
    // the cloud converges into a solid disc of full-size dots instead of a
    // point. Scaling commutes with the holder's rotation, so local space is as
    // good as world space and costs one multiply.
    float shrink = 1.0 - uCollapse;
    vec4 world = modelMatrix * vec4(position * shrink, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    // Perspective size attenuation, in device pixels. Clamped because plenty of
    // GPUs cap gl_PointSize an order of magnitude below what a near, large
    // grain would ask for, and a silent clamp is worse than a deliberate one.
    gl_PointSize = clamp(aSize * shrink * uPointScale / -mv.z, 1.0, 64.0);
    // The camera sits on +z looking at the origin, so world.z is signed depth.
    // Additive points occlude nothing, so dimming the far half is the only
    // thing that makes the cloud read as a volume once it turns.
    float front = smoothstep(-1.25, 1.25, world.z);
    float bright = max(aShade * mix(1.0 - uDepthFade, 1.0, front), 0.0);
    // Snap to the monochrome scale. Quantising *after* the depth term is what
    // makes depth read as a few discrete bands rather than a smooth ramp, which
    // is the whole point of a flat treatment: no value in the piece that isn't
    // on the scale.
    vBright = floor(bright * uLevels + 0.5) / uLevels;
    // The last of the collapse fades out, so the cloud vanishes into the centre
    // instead of ending as a knot of clamped one-pixel dots.
    vBright *= 1.0 - smoothstep(0.86, 1.0, uCollapse);
}
`

const PARTICLE_FRAG = `
uniform vec3 uColor;
uniform float uOpacity;
varying float vBright;
void main() {
    // A flat disc: one value across the whole circle, with just enough of a ramp
    // at the rim to stop small points stair-stepping. No radial falloff — the
    // brightness scale carries what a bloom would.
    float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float alpha = 1.0 - smoothstep(0.82, 1.0, r);
    if (alpha <= 0.0) discard;
    gl_FragColor = vec4(uColor, alpha * uOpacity * vBright);
}
`

let THREE: typeof THREE_NS | null = null
let renderer: THREE_NS.WebGLRenderer | null = null
let scene: THREE_NS.Scene | null = null
let camera: THREE_NS.PerspectiveCamera | null = null
let group: THREE_NS.Group | null = null
let axis: THREE_NS.Vector3 | null = null

// Each stratum turns about its own axis relative to the cluster's spin, and may
// additionally chase the invisible orbiting target.
interface Stratum {
    holder: THREE_NS.Group
    axis: THREE_NS.Vector3
    spin: number
    follow: FollowConfig | null
}
let strata: Stratum[] = []
// Every grain material, so the per-frame collapse and the per-resize point
// scale can be pushed to all of them at once.
let particleMaterials: THREE_NS.ShaderMaterial[] = []
let pointScale = 1

let rafId = 0
let lastTimestamp = 0
// Motion time accumulates only while the stage is on screen, so scrolling away
// and back resumes the rotation instead of snapping it to a new phase.
let motionMs = 0
let stageW = 0
let stageH = 0
let io: IntersectionObserver | null = null
let inView = false
let reducedMotion = false
let disposed = false
let announced = false

/** A first-order lag's steady-state response to one sinusoidal component of the
 *  target's surge: same frequency, amplitude cut by 1/sqrt(1 + (wT)^2) and phase
 *  pulled back by atan(wT).
 *
 *  Solved in closed form rather than integrated — a simulated follower would
 *  still be settling when the surge period wraps. It also means the harmonic is
 *  attenuated and delayed more than the fundamental for free, which is why one
 *  `lag` number per stratum is enough to give each its own velocity curve
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

function makeParticleMaterial(layer: ParticleLayer) {
    const material = new THREE!.ShaderMaterial({
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        uniforms: {
            uColor: { value: new THREE!.Color(STELLAR_CORE.color) },
            uOpacity: { value: layer.opacity },
            uDepthFade: { value: STELLAR_CORE.depthFade },
            uLevels: { value: STELLAR_CORE.levels },
            uCollapse: { value: 0 },
            uPointScale: { value: pointScale }
        },
        transparent: true,
        blending: THREE!.AdditiveBlending,
        // Additive glows shouldn't occlude each other; depth writes off also
        // spares the sort artifacts of thousands of blended points.
        depthWrite: false
    })
    particleMaterials.push(material)
    return material
}

function buildScene() {
    if (!THREE) return
    const canvas = glCanvasRef.value
    if (!canvas) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    camera.position.set(0, 0, 6) // real distance is set per-size in sizeStage()
    camera.lookAt(0, 0, 0)

    // No lights: the grains carry their own brightness through a ShaderMaterial
    // and are untouched by the scene's lighting.
    axis = new THREE.Vector3(...ROTATION_AXIS).normalize()
    group = new THREE.Group()
    scene.add(group)

    const orbitAxis = new THREE.Vector3(...STELLAR_CORE.orbit.axis).normalize()

    buildParticleOrb(STELLAR_CORE).forEach((layerGeometry, layerIndex) => {
        const layer = STELLAR_CORE.layers[layerIndex]
        const geometry = new THREE!.BufferGeometry()
        geometry.setAttribute('position', new THREE!.Float32BufferAttribute(layerGeometry.positions, 3))
        geometry.setAttribute('aShade', new THREE!.Float32BufferAttribute(layerGeometry.shades, 1))
        geometry.setAttribute('aSize', new THREE!.Float32BufferAttribute(layerGeometry.sizes, 1))

        const holder = new THREE!.Group()
        holder.add(new THREE!.Points(geometry, makeParticleMaterial(layer)))
        group!.add(holder)

        // A follower turns about the orbit axis, so its surge carries it around
        // the target's own plane rather than just modulating the global spin.
        const follow = layer.follow ?? null
        let stratumAxis = axis!
        if (layer.axis) stratumAxis = new THREE!.Vector3(...layer.axis).normalize()
        else if (follow) stratumAxis = orbitAxis
        strata.push({ holder, axis: stratumAxis, spin: layer.spin, follow })
    })

    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        // Transparent clear, so the section's own background shows through.
        renderer.setClearColor(0x000000, 0)
    }
}

function disposeSceneObjects() {
    scene?.traverse((obj) => {
        const mesh = obj as THREE_NS.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
    })
    scene = null
    group = null
    strata = []
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
    // cluster from overflowing a narrow (mobile) stage.
    const vFov = (CAMERA_FOV * Math.PI) / 180
    camera.position.z = stageH / (Math.tan(vFov / 2) * SPHERE_FILL * Math.min(stageW, stageH))
    camera.updateProjectionMatrix()

    // Device pixels per world unit at unit depth — the shader divides it by the
    // point's view depth to get gl_PointSize, so a grain's `size` stays a real
    // world diameter and its pixel size tracks the cluster across viewports.
    pointScale = 0.5 * stageH * dpr * camera.projectionMatrix.elements[5]
    for (const material of particleMaterials) material.uniforms.uPointScale.value = pointScale
}

let resizeTicking = false
function onResize() {
    if (resizeTicking) return
    resizeTicking = true
    requestAnimationFrame(() => {
        resizeTicking = false
        sizeStage()
        if (!inView || reducedMotion || props.still) drawFrame()
    })
}

function drawFrame() {
    if (!THREE || !renderer || !scene || !camera || !group || !axis) return
    const { orbit, loopMs, loopsPerTurn } = STELLAR_CORE

    const loop = (motionMs % loopMs) / loopMs
    const angle = (motionMs / (loopMs * loopsPerTurn)) * Math.PI * 2
    group.setRotationFromAxisAngle(axis, angle)

    // Each stratum adds its own steady rotation on top of the group's spin, and
    // a following stratum adds the lagged surge of the invisible target. Strata
    // only ever *rotate* — nothing translates them, so the cloud turns about a
    // centre pinned to the middle of the stage no matter what any one stratum is
    // doing.
    for (const stratum of strata) {
        const surge = stratum.follow ? followSurge(orbit, stratum.follow, loop) : 0
        stratum.holder.setRotationFromAxisAngle(stratum.axis, angle * stratum.spin + surge)
    }

    const collapse = Math.min(1, Math.max(0, props.converge))
    for (const material of particleMaterials) material.uniforms.uCollapse.value = collapse

    renderer.render(scene, camera)
}

function loop(timestamp: number) {
    // Advance on the real frame delta rather than a fixed step, and clamp it: a
    // background tab can hand back a multi-second gap on return, which would
    // otherwise snap the cluster forward a full revolution.
    const delta = lastTimestamp ? Math.min(timestamp - lastTimestamp, 64) : 16
    lastTimestamp = timestamp
    motionMs += delta
    drawFrame()
    if (inView && !reducedMotion && !disposed) rafId = requestAnimationFrame(loop)
}

function start() {
    if (rafId || reducedMotion || disposed || props.still) return
    lastTimestamp = 0
    rafId = requestAnimationFrame(loop)
}

function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    lastTimestamp = 0
}

// The convergence is scroll-driven, so it can change while the rAF loop is
// parked (reduced motion, or a `still` stage). Redraw on demand in that case;
// while the loop is running it already picks the value up each frame.
watch(
    () => props.converge,
    (value) => {
        if (!rafId) drawFrame()
        if (!announced && value >= 0.999) {
            announced = true
            emit('converged')
        }
        if (announced && value < 0.9) announced = false
    }
)

onMounted(async () => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    THREE = await import('three')
    if (disposed) return // unmounted before the dynamic import resolved

    buildScene()
    sizeStage()
    window.addEventListener('resize', onResize)

    if (reducedMotion || props.still) {
        // One frame from mid-rotation: enough to read as a volume, no motion.
        motionMs = STELLAR_CORE.loopMs * 0.5
        drawFrame()
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
    <div ref="stageRef" class="relative h-full w-full">
        <canvas ref="glCanvasRef" class="absolute inset-0 h-full w-full" aria-hidden="true" />
        <!-- The role chips sit in this slot so they scale and centre with the
             cluster rather than being positioned against the section. -->
        <slot />
    </div>
</template>
