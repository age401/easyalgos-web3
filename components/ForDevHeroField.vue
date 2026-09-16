<script setup lang="ts">
// The ripple orbit field behind the "EasyAlgos for Developers" hero.
//
// A field of concentric rings radiating from behind the headline, with ripples
// pulsing outward on a slow cadence and five nodes tracking round the rings —
// "algorithmic precision" as texture rather than as an illustration of anything.
// It is decoration and nothing else: no content, no interaction, no cursor
// reaction, and it must never compete with the headline or cost it contrast.
//
// This component is the canvas, the DPR, the clock and the visibility guard.
// WHAT IT DRAWS is utils/rippleField.ts, which is the design handoff's own
// module ported across — see the notes at the top of it for which numbers are the
// design and which two are the knobs.
//
// Two layers of the composition are NOT here: the radial legibility fade and the
// vertical edge fade that go over the top of this. They live in ForDevHero
// alongside the copy they protect, because they have to be the hero's own ground
// colour or the fade bands — see the comment on them there.
//
// Nothing here is in the LCP path. The hero's LCP is its server-rendered
// headline, the section paints the design's white ground on its own, and this
// contributes nothing to the first frame: canvas 2D, no request, no dependency.
// If it never runs the hero is the drawn composition minus its texture and every
// word and control still works.
import { createRippleField } from '~/utils/rippleField'

interface Props {
    /** Global alpha multiplier. 0.9 is the design; usable range 0.3–1.8. */
    intensity?: number
    /** Global time multiplier. 1 is the design; usable range 0.3–2.2. */
    speed?: number
}
const props = defineProps<Props>()

const root = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
/** Drives the fade-in. Not an entrance — the design has none, the field is simply
 *  always running — but the first frame lands at hydration, some way after the
 *  hero has painted, and a hard cut from white to a full field reads as a bug.
 *  Same 900ms treatment the cube scene used for the same seam. */
const ready = ref(false)

/** Capped at 2: past that there is nothing left to resolve on a 1px ring, and
 *  this canvas is hero-sized, so it is the largest fill on the page. */
const MAX_DPR = 2

/** Where the reduced-motion still is taken, in seconds on the field's own clock.
 *  Later than the handoff's 1.2, which catches the wave before it has reached
 *  anything. At 3s it is halfway out and the ring it is crossing is at its
 *  heaviest and darkest — the one frame that shows what the field does. */
const STILL_T = 3
/** And a frame drawn BEFORE it, early enough to have emitted that pulse.
 *  A single draw at STILL_T would emit its first ripple at STILL_T — a ripple of
 *  radius zero, which is the field before anything has happened. The clock has to
 *  be stepped for the still to contain a wave at all, and two steps is all it
 *  takes: one to start the pulse, one to catch it mid-field. */
const STILL_SEED = 0.7

const draw = createRippleField({ intensity: props.intensity, speed: props.speed })

let ctx: CanvasRenderingContext2D | null = null
let cssWidth = 0
let cssHeight = 0
let rafId = 0
let t0 = 0
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let onScreen = false
let reduced = false

/** One frame, in CSS pixels. The context is cleared here rather than in the field
 *  so the field never has to know about the transform it is drawing under. */
function paint(t: number) {
    if (!ctx || cssWidth <= 0 || cssHeight <= 0) return
    ctx.clearRect(0, 0, cssWidth, cssHeight)
    draw(ctx, cssWidth, cssHeight, t)
    ready.value = true
}

/** The single frame reduced motion gets. Idempotent: the seed only emits a pulse
 *  the first time through, so a resize repaints the same still rather than
 *  starting the field over. */
function paintStill() {
    paint(STILL_SEED)
    paint(STILL_T)
}

function frame(now: number) {
    // One clock, read straight off wall time: the field is endless rather than a
    // loop, so there is nothing for a paused stretch to desynchronise. Coming
    // back after a scroll away, the orbits are where they would have been and the
    // ripples start again — which is the right answer for something nobody was
    // watching.
    paint((now - t0) / 1000)
    rafId = requestAnimationFrame(frame)
}

function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
}

/** Run only while the hero can be seen. The hidden-tab half of that is free:
 *  requestAnimationFrame does not fire in a backgrounded tab, which is also why
 *  there is no `visibilitychange` listener here. */
function sync() {
    if (reduced) return
    if (onScreen) {
        if (!rafId) rafId = requestAnimationFrame(frame)
    } else {
        stop()
    }
}

function resize() {
    const el = canvasRef.value
    const box = root.value
    if (!el || !box) return
    const rect = box.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1)
    cssWidth = rect.width
    cssHeight = rect.height
    el.width = Math.round(cssWidth * dpr)
    el.height = Math.round(cssHeight * dpr)
    ctx = el.getContext('2d')
    // One transform, so everything downstream works in CSS pixels.
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    // Measured by the box rather than polled off the canvas every frame — which
    // is what the handoff's module does, and is a forced layout per frame this
    // codebase already has a ResizeObserver to avoid. The observer also catches
    // the container-driven resizes that were the reason the module polled.
    if (reduced) paintStill()
}

onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resize()

    ro = new ResizeObserver(resize)
    ro.observe(root.value!)

    if (reduced) {
        // One frame, held. `resize` has already painted it; this is only the
        // case where the box was measurable but the observer has yet to fire.
        paintStill()
        return
    }

    t0 = performance.now()
    io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) onScreen = entry.isIntersecting
            sync()
        },
        { rootMargin: '200px 0px' }
    )
    io.observe(root.value!)
})

onBeforeUnmount(() => {
    stop()
    io?.disconnect()
    ro?.disconnect()
    io = ro = null
    ctx = null
})
</script>

<template>
    <!-- Decoration, and there is nothing in it to describe in words: hidden from
         assistive tech outright, and untouchable by the pointer so it cannot get
         between the reader and the CTAs sitting over it. -->
    <div
        ref="root"
        class="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-[900ms] ease-smooth"
        :class="ready ? 'opacity-100' : 'opacity-0'"
        aria-hidden="true"
    >
        <canvas ref="canvasRef" class="block h-full w-full" />
    </div>
</template>
