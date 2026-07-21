<script setup lang="ts">
// The old ecosystem, rendered as a fractured sphere — WebGL variant.
// Background flips to ink via useDarkBand (same triggered, non-scrubbed
// transition as the "Track record" section below). The sphere is a real
// three.js scene: the 16 baked spherical-Voronoi cells (utils/sphereFragments)
// become a flat-shaded faceted polyhedron lit by a directional key light, with
// the fracture edges drawn as depth-tested lines — so back edges are correctly
// occluded by the solid body (no manual back-face culling needed). Six cells
// carry a labelled concern; the labels are real DOM billboards whose screen
// position is projected from the rotating cell each frame and whose opacity
// fades with camera-space depth. three.js is dynamically imported inside
// onMounted so it never enters the server bundle or blocks hydration — the
// heading, copy and every label render server-side as ordinary text.
import type * as THREE_NS from 'three'

const sectionRef = ref<HTMLElement | null>(null)
const { dark } = useDarkBand(sectionRef)

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
let seedVectors: THREE_NS.Vector3[] = []
let overlayCtx: CanvasRenderingContext2D | null = null

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

function buildScene() {
    if (!THREE) return
    const canvas = glCanvasRef.value
    if (!canvas) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
    camera.position.set(0, 0, 6) // real distance is set per-size in sizeStage()
    camera.lookAt(0, 0, 0)

    group = new THREE.Group()
    scene.add(group)

    // Faceted body: fan-triangulate each Voronoi cell from its seed apex.
    // Non-indexed + computeVertexNormals gives per-face normals => flat facets
    // that catch the key light individually, the payoff of going true-3D.
    const positions: number[] = []
    for (const fragment of SPHERE_FRAGMENTS) {
        const s = fragment.seed
        const verts = fragment.vertices
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i]
            const b = verts[(i + 1) % verts.length]
            positions.push(s[0], s[1], s[2], a[0], a[1], a[2], b[0], b[1], b[2])
        }
    }
    const bodyGeom = new THREE.BufferGeometry()
    bodyGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    bodyGeom.computeVertexNormals()

    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x14403c,
        emissive: 0x081a1f,
        emissiveIntensity: 1,
        metalness: 0.12,
        roughness: 0.82,
        flatShading: true,
    })
    const body = new THREE.Mesh(bodyGeom, bodyMat)
    group.add(body)

    // Fracture edges, lifted just off the surface and depth-tested against the
    // body so only front-facing edges show.
    const edgePositions: number[] = []
    const LIFT = 1.004
    for (const fragment of SPHERE_FRAGMENTS) {
        const verts = fragment.vertices
        for (let i = 0; i < verts.length; i++) {
            const a = verts[i]
            const b = verts[(i + 1) % verts.length]
            edgePositions.push(a[0] * LIFT, a[1] * LIFT, a[2] * LIFT, b[0] * LIFT, b[1] * LIFT, b[2] * LIFT)
        }
    }
    const edgeGeom = new THREE.BufferGeometry()
    edgeGeom.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3))
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xcfe6e2, transparent: true, opacity: 0.62 })
    const edges = new THREE.LineSegments(edgeGeom, edgeMat)
    group.add(edges)

    // Lighting: modest ambient keeps shadowed facets legible on black; a bright
    // teal key from the upper-left gives each facet its own value so the
    // fracture reads as faceted volume; a dim cool fill from the lower-right
    // recovers the terminator without flattening it.
    scene.add(new THREE.AmbientLight(0x3a635f, 0.8))
    const key = new THREE.DirectionalLight(0x9defe0, 2.3)
    key.position.set(-3, 3.5, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x2f6a86, 0.65)
    fill.position.set(3, -2, 2)
    scene.add(fill)

    axis = new THREE.Vector3(...ROTATION_AXIS).normalize()
    seedVectors = SPHERE_LABELS.map((label) => {
        const s = SPHERE_FRAGMENTS[label.fragmentIndex].seed
        return new THREE!.Vector3(s[0], s[1], s[2])
    })

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)

    overlayCtx = overlayRef.value?.getContext('2d') ?? null
}

function sizeStage() {
    const stage = stageRef.value
    if (!stage || !renderer || !camera) return

    const rect = stage.getBoundingClientRect()
    stageW = rect.width
    stageH = rect.height

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(stageW, stageH, false)
    camera.aspect = stageW / stageH

    // Distance the camera so the unit sphere's projected diameter is a fixed
    // fraction of the stage's smaller side — regardless of aspect. This is the
    // 3D analogue of the canvas variant's `radiusPx = min(w,h) * k`, and is
    // what keeps the sphere from overflowing a narrow (mobile) stage.
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

const _tmp = { v: null as THREE_NS.Vector3 | null }
function drawFrame(elapsed: number, forceLabelsVisible = false) {
    if (!THREE || !renderer || !scene || !camera || !group || !axis) return
    const angle = elapsed * ANGULAR_SPEED
    group.setRotationFromAxisAngle(axis, angle)
    renderer.render(scene, camera)

    if (!overlayCtx) return
    overlayCtx.clearRect(0, 0, stageW, stageH)
    if (!_tmp.v) _tmp.v = new THREE.Vector3()

    SPHERE_LABELS.forEach((label, i) => {
        const el = labelEls[i]
        if (!el) return

        // Rotate this cell's seed into world space, project to screen.
        const world = _tmp.v!.copy(seedVectors[i]).applyQuaternion(group!.quaternion)
        const depth = world.z // >0 == facing the camera (camera sits on +z)
        const ndc = world.clone().project(camera!)
        const anchorX = (ndc.x * 0.5 + 0.5) * stageW
        const anchorY = (-ndc.y * 0.5 + 0.5) * stageH

        const opacity = forceLabelsVisible ? 1 : smoothstep(LABEL_FADE_START, LABEL_FADE_END, depth)
        const tickTopY = anchorY - label.tickLength
        const elbowX = anchorX + label.xOffset
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

onMounted(async () => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    THREE = await import('three')
    if (disposed) return // unmounted before the dynamic import resolved

    buildScene()
    sizeStage()
    window.addEventListener('resize', onResize)

    if (reducedMotion) {
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

    // three.js holds GPU resources that GC won't reclaim — dispose explicitly.
    scene?.traverse((obj) => {
        const mesh = obj as THREE_NS.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose?.()
    })
    renderer?.dispose()
    renderer = null
    scene = null
    camera = null
    group = null
})
</script>

<template>
    <section
        id="ecosystem"
        ref="sectionRef"
        :class="['relative transition-colors duration-[1300ms] ease-smooth', dark ? 'bg-Ink/950' : 'bg-white']"
    >
        <div
            class="eal-container py-24 transition-opacity duration-700 ease-smooth tablet-md:py-32"
            :class="dark ? 'opacity-100' : 'opacity-0'"
        >
            <div class="max-w-[640px]">
                <p class="eal-eyebrow eal-eyebrow--invert">The old ecosystem</p>
                <h2 class="eal-h2 mt-6 !text-white">
                    Every seat at the table<br />
                    doubts the next one.
                </h2>
                <p class="mt-6 max-w-[34rem] font-franklin text-[17px] leading-[1.667] text-Tinted/200">
                    Traders doubt sellers. Brokers doubt strategies. Developers doubt each other,
                    and infrastructure doubts uptime. The forex ecosystem runs on unverified
                    claims &mdash; the exact problem EasyAlgos was built to settle.
                </p>
            </div>

            <div
                ref="stageRef"
                class="relative mx-auto mt-20 h-[520px] w-full max-w-[720px] overflow-x-hidden tablet-md:mt-24 tablet-md:h-[620px] desktop:h-[700px]"
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
        </div>
    </section>
</template>
