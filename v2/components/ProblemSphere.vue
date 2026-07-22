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
import type { SphereVariant, ShardGeometry } from '~/utils/sphereVariants'

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

function buildSphere() {
    if (!THREE || !scene) return
    const variant = props.variant
    const cells = SPHERE_CELL_SETS[variant.cells]

    shardData = buildVariantShards(variant, cells)
    const labelIdx = resolveLabelCells(cells)
    labelShards = labelIdx.map((i) => shardData[i])
    animatesShards = variant.drift > 0

    group = new THREE.Group()
    scene.add(group)

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
    scene = null
    group = null
    shardMeshes = []
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

const _v = { tmp: null as THREE_NS.Vector3 | null }
function drawFrame(elapsed: number, forceLabelsVisible = false) {
    if (!THREE || !renderer || !scene || !camera || !group || !axis) return
    const variant = props.variant
    const angle = elapsed * ANGULAR_SPEED
    group.setRotationFromAxisAngle(axis, angle)

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
            v-for="(label, i) in SPHERE_LABELS"
            :key="label.role + label.question"
            :ref="(el) => (labelEls[i] = el as HTMLElement | null)"
            class="pointer-events-none absolute left-0 top-0 w-[200px] opacity-0 will-change-transform"
        >
            <p class="font-poppins text-[13px] font-medium leading-tight text-Blue/400">{{ label.role }}</p>
            <p class="mt-1 font-franklin text-[12.5px] leading-[1.4] text-Tinted/300">{{ label.question }}</p>
        </div>
    </div>
</template>
