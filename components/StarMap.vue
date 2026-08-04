<script setup lang="ts">
// The star map: what the section shows once the particle cloud has drawn into
// its own centre.
//
// It is a straight port of the Figma frame "Star Map Animation" (527:899), and
// the timeline below IS that frame's timeline — `t` is Figma's 0..1 loop
// position, so every keyframe table here can be diffed against the
// `get_motion_context` payload without translation. What differs from the
// reference is deliberate, and there are only three such places:
//
//   1. Figma can only express the circles as SCALE, which drags the stroke along
//      with it. Here the radius is the animated quantity and the stroke is
//      pinned at 2 device pixels (`vector-effect`), so a ring reads as the same
//      line whatever size it is.
//   2. The orbiting dots have no motion in the reference — Figma has nowhere to
//      put them. They ride their own wall clock (see ORBIT below) rather than
//      the scroll, so the piece is alive while the reader is holding still.
//   3. The line's length is expressed in `vh` rather than the reference's 600px,
//      because its job is to reach the bottom of the section, and the section is
//      a viewport tall.
//
// `t` is driven by scroll, not by a clock. The reference's easings were authored
// against a constant 4s loop, so they land differently here — that is intended:
// the reader is the clock, and the easings survive as the shape of each move.
import { norm, sampleColorTrack, sampleTrack, type ColorTrack, type Track } from '~/utils/keyframes'

interface Props {
    /** Figma timeline position, 0..1. */
    t: number
    /** The particle cloud's own collapse, 0..1. The violet core is born out of
     *  it — it has no existence before the cloud starts drawing in, so its entry
     *  rides this rather than `t`, which has not started yet. */
    converge: number
}
const props = defineProps<Props>()

// The 760x760 box the whole piece is drawn in — the same box the particle
// cluster occupies, so the two share a centre.
const BOX = 760
const C = BOX / 2

// Ring stroke is held at this many device pixels at every size (see note 1).
const STROKE = 2
// The white line is 4px in the Figma export. At the sizes it actually runs that
// reads as a bar rather than a trace, so it is pinned to the ring weight — one
// number to change if Diego wants the export's weight back.
const LINE_WIDTH = 2

// ---------------------------------------------------------------- keyframes --
// Values and easings come from get_motion_context on 527:899; the station TIMES
// are re-cut, because the reference's stations have been collapsed. What the
// piece plays now is:
//
//   t 0.00 - 0.23   the rings bloom out of the violet core, staggered — AND, over
//                   the same stretch, the core swells 30px -> 164px, turns from
//                   violet to the page's own dark, and the logo resolves inside
//                   it. One dense move rather than two consecutive ones.
//   t 0.18 - 0.26   the dots light up on the frame that move just built
//   t 0.26 - 0.44   hold: Figma "Star Map - Reference 02" (538:1204), dots
//                   orbiting
//   t 0.44 - 0.56   the rings draw in, the core becomes a 60px white badge, the
//                   mark halves — the reference's last transition, unchanged
//   t 0.56 - 1.00   the line grows (and by now the stage has released)
//
// Reference 01 — the small violet core sitting inside full-size rings — is no
// longer a station. It used to be the frame the piece HELD on while waiting to
// start the core transition, and holding there was the single biggest cost in
// the section's runtime. The core's move now runs concurrently with the bloom
// and finishes with it, so the reader arrives at Reference 02 in one beat.
//
// Every keyframe below keeps the WIDTH and easing it was authored with — the
// core transition is still 0.20 of the timeline, the logo fade still 0.10, the
// last transition still 0.12. Only their positions moved. That is what keeps
// these tables diffable against the Figma payload, and it means the shortening
// came out of dead air rather than out of the moves themselves.
//
// Ordered as they are drawn: outermost ring first.

/** Station times. Named because four tracks share them and they are the thing
 *  most likely to be retimed. `usePinnedProgress` has to agree with T_STAGE_3 —
 *  its STATION_T is where the pinned stretch hands over to the line. */
const T_HOLD_1 = 0.03 // the core starts to swell, while the rings are still blooming
const T_STAGE_2 = 0.23 // Reference 02 reached: dark core, logo up, rings at full size
const T_HOLD_2 = 0.44 // Reference 02 breaks
const T_STAGE_3 = 0.56 // the white badge; the line starts here

interface Ring {
    id: string
    /** Radius at scale 1, in box units. */
    radius: number
    stroke: string
    /** Peak alpha of the Tinted/800 radial wash. 0 = no fill. */
    wash: number
    scale: Track
}

const RINGS: Ring[] = [
    {
        id: 'gray-outer',
        radius: 234,
        stroke: '#262626',
        wash: 0,
        scale: {
            times: [0, 0.0603, 0.2132, T_HOLD_2, T_STAGE_3, 1],
            values: [0.05, 0.05, 1, 1, 0.504, 0.504],
            eases: ['linear', [0.5, 0, 0.483, 0.873], 'linear', [0.5, 0, 0.5, 1], 'linear']
        }
    },
    {
        id: 'tinted-outer',
        radius: 160,
        stroke: '#51567A',
        wash: 0.2,
        scale: {
            times: [0, 0.0265, 0.1902, T_HOLD_2, T_STAGE_3, 1],
            values: [0.05, 0.05, 1, 1, 0.412, 0.412],
            eases: ['linear', [0.405, 0, 0.474, 1.257], 'linear', [0.5, 0, 0.5, 1], 'linear']
        }
    },
    {
        id: 'gray-inner',
        radius: 138,
        stroke: '#262626',
        wash: 0.1,
        scale: {
            times: [0, 0.053, 0.2309, T_HOLD_2, T_STAGE_3, 1],
            values: [0.05, 0.05, 1, 1, 0.362, 0.362],
            eases: ['linear', [0.5, 0, 0.414, 1.207], 'linear', [0.5, 0, 0.5, 1], 'linear']
        }
    },
    {
        id: 'tinted-inner',
        radius: 99,
        stroke: '#51567A',
        wash: 0.1,
        scale: {
            times: [0, 0.15, T_HOLD_2, T_STAGE_3, 1],
            values: [0.1, 1, 1, 0.465, 0.465],
            eases: [[0.5, 0, 0.276, 1.629], 'linear', [0.5, 0, 0.5, 1], 'linear']
        }
    }
]

/** The rings start at 5% of their radius, which at full size is still a visible
 *  knot of hairlines sitting exactly where the violet core is. They fade up out
 *  of it instead of being there waiting. */
const RING_IN: Track = {
    times: [0, 0.015, 0.07],
    values: [0, 0, 1],
    eases: ['linear', [0.4, 0, 0.6, 1]]
}

const CENTRE_RADIUS = 15
const CENTRE_SCALE: Track = {
    times: [0, T_HOLD_1, T_STAGE_2, T_HOLD_2, T_STAGE_3, 1],
    values: [1, 1, 5.467, 5.467, 2, 2],
    eases: ['linear', [0, 0, 0.5, 1], 'linear', [0.302, 0, 0.362, 1], 'linear']
}
// Violet core -> the page's own dark (it swells into a hole the mark emerges
// from) -> white, as the badge the line drops out of. The first move now runs
// UNDER the bloom: the rings break outward while the core inflates and darkens
// beneath them, which is the moment the whole section is built around.
const CENTRE_FILL: ColorTrack = {
    times: [0, T_HOLD_1, T_STAGE_2, T_HOLD_2, T_STAGE_3],
    values: ['#AFA3FF', '#AFA3FF', '#171717', '#171717', '#FFFFFF'],
    eases: ['linear', [0.5, 0, 0.5, 1], 'linear', [0.5, 0, 0.5, 1]]
}

/** The core's own arrival, scrubbed against the CLOUD's collapse rather than the
 *  star-map timeline: it condenses out of the grains over the back half of the
 *  implosion, so by the time the cloud is gone there is something left where it
 *  was. Slight overshoot on the scale — it lands rather than eases to a halt. */
const CORE_IN_SCALE: Track = {
    times: [0, 0.4, 1],
    values: [0, 0, 1],
    eases: ['linear', [0.34, 0, 0.28, 1.42]]
}
const CORE_IN_OPACITY: Track = {
    times: [0, 0.4, 0.85, 1],
    values: [0, 0, 1, 1],
    eases: ['linear', [0.4, 0, 0.5, 1], 'linear']
}

// Still keyed to the core: the mark resolves over the last 0.10 of the core's
// darkening, so it reads as emerging from the hole rather than being placed on
// top of a shape that already finished moving.
const LOGO_OPACITY: Track = {
    times: [0, T_STAGE_2 - 0.1, T_STAGE_2, 1],
    values: [0, 0, 1, 1],
    eases: ['linear', [0.5, 0, 0.5, 1], 'linear']
}
const LOGO_SCALE: Track = {
    times: [0, T_HOLD_2, T_STAGE_3, 1],
    values: [1, 1, 0.5, 0.5],
    eases: ['linear', [0.207, 0, 0.216, 1], 'linear']
}

const LINE_OPACITY: Track = {
    times: [0, T_STAGE_3 - 0.0002, T_STAGE_3, 1],
    values: [0, 0, 1, 1],
    eases: ['linear', [0.5, 0, 0.5, 1], 'linear']
}

// ------------------------------------------------------------------- orbits --
// Positions are the resting angles of the twelve "Bubble" nodes in the Figma
// reference frame (536:2550), recovered from their coordinates — so the moment
// the dots stop they are exactly where the designer drew them.
//
// Speed: every ring runs at the same LINEAR speed, so its angular rate is
// v/radius. That is what "in synchrony, each at a different speed" resolves to
// without picking three arbitrary numbers — the dots read as one field being
// carried around rather than three independent carousels.
const ORBIT_SPEED = 1500 // box-units * deg per second

interface DotRing {
    ring: string
    size: number
    angles: number[]
}
const DOT_RINGS: DotRing[] = [
    { ring: 'tinted-inner', size: 8, angles: [42.1, 214.7, 341.0] },
    { ring: 'tinted-outer', size: 8, angles: [61.0, 186.9, 227.8, 358.6] },
    { ring: 'gray-outer', size: 6, angles: [61.1, 174.6, 217.3, 291.4, 354.6] }
]

// Not in the reference — Figma has nowhere to put dot motion, and both reference
// frames simply draw them at rest. They come up as the bloom-and-swell lands, so
// the resolved frame is complete at the moment the dots are there to be seen —
// which is the beat Diego asked the core transition to be ready for. They then
// hold right through the station (which is why 538:1204 still shows them) and
// leave only when the rings finally do move, since a dot orbiting a radius that
// is sliding underneath it reads as an error.
const DOT_OPACITY: Track = {
    times: [0, 0.18, 0.26, T_HOLD_2, T_STAGE_3 - 0.04, 1],
    values: [0, 0, 1, 1, 0, 0],
    eases: ['linear', [0.33, 0, 0.67, 1], 'linear', [0.33, 0, 0.67, 1], 'linear']
}

// ---------------------------------------------------------------- rendering --
const spinMs = ref(0)
const dotOpacity = computed(() => sampleTrack(DOT_OPACITY, props.t))
const ringOpacity = computed(() => sampleTrack(RING_IN, props.t))

const ringRadius = computed(() => {
    const out: Record<string, number> = {}
    for (const ring of RINGS) out[ring.id] = ring.radius * sampleTrack(ring.scale, props.t)
    return out
})

const dots = computed(() => {
    const seconds = spinMs.value / 1000
    const out: { key: string; cx: number; cy: number; r: number; halo: number; grad: string }[] = []
    for (const group of DOT_RINGS) {
        const base = RINGS.find((r) => r.id === group.ring)!
        // The rate comes from the RESTING radius, not the animated one, so a
        // ring that is still growing doesn't spin its dots up as it goes.
        const rate = ORBIT_SPEED / base.radius
        const radius = ringRadius.value[group.ring]
        group.angles.forEach((angle, i) => {
            const rad = ((angle + rate * seconds) * Math.PI) / 180
            out.push({
                key: `${group.ring}-${i}`,
                cx: C + Math.cos(rad) * radius,
                cy: C + Math.sin(rad) * radius,
                r: group.size / 2,
                halo: group.size / 2 + 4,
                grad: group.size === 8 ? 'eaDotLight' : 'eaDotDark'
            })
        })
    }
    return out
})

// Two factors, and they belong to different clocks: the arrival is scrubbed
// against the cloud's collapse, the stations against the star-map timeline. They
// never overlap — the entry is finished before `t` leaves zero — so multiplying
// them is exact rather than an approximation.
const centreRadius = computed(
    () => CENTRE_RADIUS * sampleTrack(CORE_IN_SCALE, props.converge) * sampleTrack(CENTRE_SCALE, props.t)
)
const centreOpacity = computed(() => sampleTrack(CORE_IN_OPACITY, props.converge))
const centreFill = computed(() => sampleColorTrack(CENTRE_FILL, props.t))

// The logo's frame is 48px centred on the box; its glyph sits fractionally left
// of and below that centre (Figma 527:1097).
const LOGO_W = 41.221
const LOGO_H = 41.386
const logoTransform = computed(() => `translate(${C} ${C}) scale(${sampleTrack(LOGO_SCALE, props.t)})`)
const logoOpacity = computed(() => sampleTrack(LOGO_OPACITY, props.t))

// The line leaves the 760 box entirely — its job is to reach the foot of the
// section, and the stage is a viewport tall with the box centred in it, so half
// a viewport is exactly that distance. Rendered as a DOM element rather than
// inside the SVG for the same reason: nothing should clip it to the box. It is
// drawn BEFORE the svg so the rings and the badge sit over it.
const lineStyle = computed(() => {
    const grow = norm(props.t, T_STAGE_3, 1)
    return {
        opacity: String(sampleTrack(LINE_OPACITY, props.t)),
        width: `${LINE_WIDTH}px`,
        marginLeft: `${-LINE_WIDTH / 2}px`,
        height: `calc(10px + ${grow} * (50vh - 10px))`
    }
})

// The orbit clock runs only when the dots are BOTH called for by the timeline and
// actually on screen. Two conditions, because either alone leaves a hole:
// the timeline takes the dots to zero as the rings draw in, which covers a reader
// who scrolls past on the pinned layout — but the stacked layout stops the piece
// mid-hold, with the dots at full opacity, and then the reader scrolls away and
// leaves a rAF turning twelve circles nobody can see for as long as the page is
// open. On a phone that is a battery cost with no upside.
const stage = ref<HTMLElement | null>(null)
let rafId = 0
let last = 0
let reduced = false
let onScreen = true
let io: IntersectionObserver | null = null

function tick(now: number) {
    const delta = last ? Math.min(now - last, 64) : 16
    last = now
    spinMs.value += delta
    rafId = requestAnimationFrame(tick)
}

function stop() {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
    last = 0
}

function sync() {
    if (reduced) return stop()
    if (dotOpacity.value > 0 && onScreen) {
        if (!rafId) rafId = requestAnimationFrame(tick)
    } else stop()
}

watch(dotOpacity, sync, { immediate: true })

/** Attach the visibility gate to the stage element.
 *
 *  Driven off a watch rather than done once in onMounted, because everything in
 *  this component lives inside `<ClientOnly>` — its slot is not rendered until
 *  after mount, so at onMounted the template ref is still null and observing it
 *  there silently does nothing. The symptom is subtle enough to be worth naming:
 *  no error, no visual difference, just an orbit that never stops turning. */
function observeStage(el: HTMLElement | null) {
    io?.disconnect()
    io = null
    if (!el || reduced) return
    io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) onScreen = entry.isIntersecting
            sync()
        },
        { rootMargin: '200px 0px' }
    )
    io.observe(el)
}

watch(stage, observeStage)

onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return stop()
    observeStage(stage.value)
})

onBeforeUnmount(() => {
    io?.disconnect()
    io = null
    stop()
})
</script>

<template>
    <!-- Client-only: this is a dozen v-for'd SVG primitives with bound geometry,
         and those hydrate badly (SVGAnimatedLength props are read-only). It is
         decoration that only means anything once the reader is scrolling, so
         there is nothing to render on the server. -->
    <ClientOnly>
        <div ref="stage" class="pointer-events-none absolute inset-0" aria-hidden="true">
            <div class="ea-starmap__line" :style="lineStyle" />

            <svg :viewBox="`0 0 ${BOX} ${BOX}`" class="absolute inset-0 h-full w-full">
                <defs>
                    <!-- The rings' inner wash: Tinted/800, clear at the centre and
                         at its faintest against the stroke. -->
                    <radialGradient id="eaRingWash">
                        <stop offset="0" stop-color="#433E68" stop-opacity="0" />
                        <stop offset="1" stop-color="#433E68" stop-opacity="1" />
                    </radialGradient>
                    <!-- Dot vignettes, transcribed from the Bubble nodes: an
                         off-centre darkening that gives each dot a lit top. -->
                    <radialGradient id="eaDotLight" cx="0.5" cy="0.297" r="0.703">
                        <stop offset="0" stop-color="rgb(120,124,154)" stop-opacity="0" />
                        <stop offset="0.55" stop-color="rgb(55,63,120)" stop-opacity="0.2" />
                        <stop offset="0.9" stop-color="rgb(68,77,141)" stop-opacity="0.8" />
                    </radialGradient>
                    <radialGradient id="eaDotDark" cx="0.5" cy="0.297" r="0.703">
                        <stop offset="0" stop-color="rgb(120,124,154)" stop-opacity="0" />
                        <stop offset="0.55" stop-color="rgb(73,76,104)" stop-opacity="0.2" />
                        <stop offset="0.9" stop-color="rgb(65,67,86)" stop-opacity="0.8" />
                    </radialGradient>
                </defs>

                <g v-for="ring in RINGS" :key="ring.id" :opacity="ringOpacity">
                    <circle
                        v-if="ring.wash > 0"
                        :cx="C"
                        :cy="C"
                        :r="ringRadius[ring.id]"
                        fill="url(#eaRingWash)"
                        :fill-opacity="ring.wash"
                    />
                    <circle
                        :cx="C"
                        :cy="C"
                        :r="ringRadius[ring.id]"
                        fill="none"
                        :stroke="ring.stroke"
                        :stroke-width="STROKE"
                        vector-effect="non-scaling-stroke"
                    />
                </g>

                <g v-if="dotOpacity > 0" :opacity="dotOpacity">
                    <g v-for="dot in dots" :key="dot.key">
                        <circle :cx="dot.cx" :cy="dot.cy" :r="dot.halo" fill="rgba(98,103,143,0.1)" />
                        <circle
                            :cx="dot.cx"
                            :cy="dot.cy"
                            :r="dot.r"
                            :fill="dot.grad === 'eaDotLight' ? '#C5CDD5' : '#5D646B'"
                        />
                        <circle :cx="dot.cx" :cy="dot.cy" :r="dot.r" :fill="`url(#${dot.grad})`" />
                    </g>
                </g>

                <circle :cx="C" :cy="C" :r="centreRadius" :fill="centreFill" :opacity="centreOpacity" />

                <g :transform="logoTransform" :opacity="logoOpacity">
                    <image
                        href="/img/logo-mark.svg"
                        :x="-1.39 - LOGO_W / 2"
                        :y="2.69 - LOGO_H / 2"
                        :width="LOGO_W"
                        :height="LOGO_H"
                    />
                </g>
            </svg>
        </div>
    </ClientOnly>
</template>
