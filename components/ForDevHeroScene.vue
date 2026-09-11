<script setup lang="ts">
// The wireframe cube field behind the "EasyAlgos for Developers" hero.
//
// Figma draws it as a flat PNG (3205:25371) because Figma cannot draw the thing
// it is a still of: twenty cubes on a slow sideways conveyor, authored in 3D
// Jutsu and handed over as a GLB. This plays the real scene.
//
// Why the GLB rather than a video, which was the other option on the table:
//   * 43 KB brotli against several hundred for a 15s 1920-wide loop, and a
//     near-white frame with thin moving edges is a bad case for H.264 — flat
//     areas are cheap but the aliasing on those lines is not.
//   * crisp at any size and any DPR, where a video would need a 2x encode to
//     survive a retina hero and would double again.
//   * the loop is seamless because the scene MAKES it seamless: cubes leaving
//     one side teleport back to the other. A video cut has to land on exactly
//     the right frame or it visibly jumps.
//   * it stays addressable — pointer parallax, or a scroll tie, is a few lines
//     from here rather than a re-render and re-encode.
// The cost is three.js, and that is why none of this is in the critical path
// (see below).
//
// scripts/optimize-glb.py is what makes the file that size: the raw export bakes
// a key on every frame of every channel — 52,920 of them, 1.15 MB — and 89% of
// them sit on the straight line between their neighbours. Decimating those away
// leaves 5,834. Re-run it after any re-export; the raw file should not be
// committed.
//
// NOTHING HERE IS IN THE LCP PATH, which is the whole reason the hero can afford
// a 3D scene at all:
//   * the hero's LCP is its headline, which is server-rendered text;
//   * the section paints the design's own white ground, so the first frame is
//     complete and correct with this component contributing nothing;
//   * three.js and the GLB are fetched only after mount, and the canvas fades in
//     when it is ready. If it never arrives — no WebGL, a failed request, a
//     device that cannot cope — the hero is the drawn composition minus its
//     texture, and every word and control still works.
// So there is deliberately no poster image: the ground under this is white in the
// design, so a raster of a mostly-white field would be bytes spent to hide
// nothing. Ask for one if the cubes should be visible before JS runs.
import type * as THREE_NS from 'three'

interface Props {
    /** Holds the conveyor where it is. */
    paused?: boolean
}
const props = withDefaults(defineProps<Props>(), { paused: false })

const root = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
/** Drives the fade-in. The scene arrives some hundreds of ms after first paint,
 *  and a hard cut to a field of cubes reads as a layout bug; over 900ms it reads
 *  as the page settling. */
const ready = ref(false)

/** Retina matters more than usual here — every edge in the scene is a thin quad
 *  and they stair-step badly at 1x — but the canvas is hero-sized, so this is
 *  also the single biggest fill cost on the page. 2 is the ceiling; past it
 *  there is nothing left to resolve on a 2px line. */
const MAX_DPR = 2

/** The authored camera is ORTHOGRAPHIC — 3D Jutsu composed the scene flat, which
 *  is why the drawn cubes have no perspective convergence. Its xmag/ymag are
 *  31.893 x 13.668, an aspect of 2.333, i.e. exactly the drawn 1920x822 frame.
 *
 *  Only `ymag` is kept on resize and the horizontal half-extent is derived from
 *  the box, which is the ortho equivalent of holding a perspective camera's
 *  vertical fov: every cube stays the size it was drawn and a narrow hero simply
 *  sees fewer of them across, rather than the whole field shrinking to specks on
 *  a phone. */
const YMAG = 13.668339320591517
/** The half-width the FIELD actually occupies — not the camera's.
 *
 *  The authored camera is 31.89 wide, but sampling every cube across the whole
 *  loop (excluding the frames where one is parked off stage for its reset) puts
 *  them in x -21.95 .. 21.85. So a third of the authored frame is empty margin,
 *  and shooting the scene through its own camera leaves the cubes stopping short
 *  of both edges. Framed on the field instead, the outermost cubes run to the
 *  edges of the viewport, which is what this wants to do.
 *
 *  It is also still the ceiling the wrap guard needs: each cube's export note
 *  reads "Zero visibility throughout reset; shrink/reveal entirely outside camera
 *  bounds", and every reset parks the cube 512 units away, so nothing pops into
 *  view inside this box. Showing WIDER than the field is what would expose the
 *  margin; showing wider still would expose the guard.
 *
 *  Re-measure after a re-export if the conveyor's travel changes. */
const FIELD_HALF_W = 21.95

/** Playback rate. 1 is the authored 15s loop. */
const SPEED = 0.5

/** Where the reduced-motion still is taken, as a position on the AUTHORED
 *  timeline — the conveyor spread across the field, rather than t=0 where several
 *  cubes are mid-reset. */
const POSE_T = 4

/** The cube outlines, overriding the export's own `MAT_fine_silver_outline`.
 *
 *  That material is Tinted/100 (#E4E6F0) — the artist was already on the site's
 *  ramp — which at hero scale is so close to the white ground that the field
 *  barely reads. This is two steps down the same ramp. To nudge it, move it one
 *  step rather than picking a colour: Tinted/200 #C9CCDD is lighter, Tinted/500
 *  #7A7FA3 is much heavier. The white faces (`MAT_paper_white`) are left alone —
 *  they are the ground showing through, not ink. */
const OUTLINE_MATERIAL = 'MAT_fine_silver_outline'
const OUTLINE_INK = 0xaeb2c9 // Tinted/300
/** And a FLOOR on it, for the other end. The cubes sit roughly ten units apart
 *  along the conveyor, so holding the drawn vertical extent on a portrait hero
 *  would leave about nineteen units of field on screen — one cube, adrift. Below
 *  this aspect the box is fitted by width instead: the cubes get smaller and more
 *  of the band shows, which on a phone is what this is anyway, fine texture rather
 *  than a composition. */
const MIN_HALF_W = 16

/** Below this box aspect the scene is not loaded at all.
 *
 *  On a portrait hero the copy and the white ellipse that lifts it off the field
 *  fill the box, so the cubes only ever peek out at the edges — and three.js plus
 *  the model is not a fair price for a decoration nobody can see. The hero's own
 *  white ground is the design's ground, so skipping this leaves the composition
 *  correct rather than incomplete.
 *
 *  Keyed on the BOX, not on a breakpoint: the question is whether there is room
 *  for the field, and a short landscape window fails it for the same reason a
 *  phone does. Re-checked on resize, so a rotation into landscape loads it. */
const MIN_ASPECT = 1.2

let THREE: typeof THREE_NS | null = null
let renderer: THREE_NS.WebGLRenderer | null = null
let scene: THREE_NS.Scene | null = null
let camera: THREE_NS.OrthographicCamera | null = null
let mixer: THREE_NS.AnimationMixer | null = null
let rafId = 0
let lastFrame = 0
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let onScreen = false
let reduced = false
let disposed = false

/** Whether the box is worth a 3D scene — see MIN_ASPECT. */
function eligible() {
    const rect = root.value?.getBoundingClientRect()
    return !!rect && rect.width > 0 && rect.height > 0 && rect.width / rect.height >= MIN_ASPECT
}

function resize() {
    const box = root.value
    // Not booted yet: this is also the hook that starts it, since a resize is how
    // a box that was too narrow at mount becomes wide enough.
    if (!renderer) return void maybeBoot()
    if (!box || !camera) return
    const rect = box.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    renderer.setPixelRatio(Math.min(MAX_DPR, window.devicePixelRatio || 1))
    renderer.setSize(rect.width, rect.height, false)
    const aspect = rect.width / rect.height
    // Fit by height in the middle of the range, and by width at both ends — past
    // FIELD_HALF_W because there is no more field to show, below MIN_HALF_W
    // because what is left is too little of it. Uniform either way: no axis is
    // ever stretched independently, so the cubes stay cubes.
    const halfW = Math.min(Math.max(YMAG * aspect, MIN_HALF_W), FIELD_HALF_W)
    const halfH = halfW / aspect
    camera.top = halfH
    camera.bottom = -halfH
    camera.right = halfW
    camera.left = -halfW
    camera.updateProjectionMatrix()
    render()
}

function render() {
    if (renderer && scene && camera) renderer.render(scene, camera)
}

function frame(now: number) {
    // Clamped: a backgrounded tab hands back a multi-second gap on return, which
    // would fling the conveyor forward instead of continuing it.
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.064) : 0
    lastFrame = now
    mixer?.update(delta)
    render()
    rafId = requestAnimationFrame(frame)
}

function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    lastFrame = 0
}

function sync() {
    if (disposed || reduced || !mixer) return
    if (onScreen && !props.paused) {
        if (!rafId) rafId = requestAnimationFrame(frame)
    } else {
        stop()
    }
}

let booting = false

/** Boot once, and only when the box earns it. Idempotent: the ResizeObserver
 *  calls this on every resize until it takes. */
function maybeBoot() {
    if (booting || disposed || !eligible()) return
    booting = true
    void boot()
}

async function boot() {
    const canvas = canvasRef.value
    const box = root.value
    if (!canvas || !box) return

    // Both dynamic, so neither reaches the server bundle or the entry chunk.
    // nuxt.config's manualChunks already corrals everything under
    // node_modules/three — the loader included — into one `three` chunk.
    const [three, loaders] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js')
    ])
    if (disposed) return
    THREE = three

    try {
        renderer = new three.WebGLRenderer({
            canvas,
            // The page's white shows through: the scene is grey outlines and
            // white faces authored against it, so it has no background of its own.
            alpha: true,
            // On by default this would be a wasteful buffer for a scene that is
            // never read back or screenshotted.
            preserveDrawingBuffer: false,
            antialias: true,
            powerPreference: 'low-power'
        })
    } catch {
        // No WebGL. The hero is already complete without this.
        return
    }
    renderer.setClearAlpha(0)

    const gltf = await new loaders.GLTFLoader().loadAsync('/models/for-dev-hero.glb')
    if (disposed) return renderer.dispose()

    scene = gltf.scene
    // The authored camera, so the framing is the one the scene was composed
    // through rather than a guess — it sits in the scene graph, so the renderer
    // keeps its world matrix current along with everything else. Everything in
    // the file is unlit (KHR_materials_unlit), so the two lights that came with
    // it are ignored and there is no lighting setup to get wrong.
    const authored = gltf.cameras?.[0] as THREE_NS.OrthographicCamera | undefined
    if (authored?.isOrthographicCamera) {
        camera = authored
    } else {
        // A re-export that switches the camera to perspective would land here.
        // Rather than silently reframe the scene, reproduce the authored ortho
        // box at the authored distance and carry on.
        camera = new three.OrthographicCamera(-YMAG, YMAG, YMAG, -YMAG, 0.1, 1000)
        camera.position.set(0, 0, 40)
        scene.add(camera)
    }

    // The outlines, before anything is drawn with them. Materials are shared
    // across the twenty cubes, so this is a handful of objects, not 3,447 —
    // but guard against the name changing in a re-export rather than silently
    // recolouring nothing.
    let repainted = 0
    scene.traverse((node) => {
        const mesh = node as THREE_NS.Mesh
        if (!mesh.isMesh) return
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            const lit = material as THREE_NS.MeshBasicMaterial
            if (lit?.name !== OUTLINE_MATERIAL || !lit.color) continue
            lit.color.setHex(OUTLINE_INK) // setHex reads sRGB and converts, so this is the token value
            repainted++
        }
    })
    if (!repainted && import.meta.dev) {
        console.warn(`[ForDevHeroScene] no material named ${OUTLINE_MATERIAL} — outlines left as exported`)
    }

    // 58 clips, one per animated node — the exporter splits them rather than
    // emitting one timeline — so they all have to run together for the scene to
    // be the scene.
    mixer = new three.AnimationMixer(scene)
    for (const clip of gltf.animations) mixer.clipAction(clip).play()

    resize()

    if (reduced) {
        // Still show the composition, just not the conveyor. Seeking here rather
        // than after the rate is applied, so POSE_T stays a position on the
        // authored timeline and does not move when SPEED changes.
        mixer.update(POSE_T)
        render()
    }
    mixer.timeScale = SPEED

    ready.value = true
    sync()
}

watch(() => props.paused, sync)

onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    ro = new ResizeObserver(resize)
    ro.observe(root.value!)

    io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) onScreen = entry.isIntersecting
            sync()
        },
        { rootMargin: '200px 0px' }
    )
    io.observe(root.value!)

    // After paint, and off the interaction path: `requestIdleCallback` where it
    // exists so the fetch cannot land in the middle of the reader's first scroll,
    // with a timeout so it still happens promptly on a busy page.
    if ('requestIdleCallback' in window) window.requestIdleCallback(maybeBoot, { timeout: 1200 })
    else setTimeout(maybeBoot, 200)
})

onBeforeUnmount(() => {
    disposed = true
    stop()
    io?.disconnect()
    ro?.disconnect()
    io = ro = null
    mixer?.stopAllAction()
    mixer = null
    // Walk the scene rather than trusting the loader's own bookkeeping: geometries
    // and materials are not reference-counted, and a hero left mounted across
    // client-side navigations would otherwise leak both.
    scene?.traverse((node) => {
        const mesh = node as THREE_NS.Mesh
        if (!mesh.isMesh) return
        mesh.geometry?.dispose()
        const material = mesh.material
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else material?.dispose()
    })
    scene = null
    camera = null
    renderer?.dispose()
    renderer = null
    THREE = null
})
</script>

<template>
    <!-- Decoration, and nothing in it is described in words elsewhere because
         there is nothing to describe: it is texture. Hidden outright. -->
    <div
        ref="root"
        class="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-[900ms] ease-smooth"
        :class="ready ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
    >
        <canvas ref="canvasRef" class="block h-full w-full" />
    </div>
</template>
