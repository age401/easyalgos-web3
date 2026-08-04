import type { Ref } from 'vue'
import { norm } from '~/utils/keyframes'

// Scroll progress through a section whose inner stage is `position: sticky`, and
// the act table the problem/solution choreography is cut from.
//
// The layout does the hard part: a tall section wrapping a 100vh sticky stage
// gives us "scroll until the stage is centred, then hold it there while the page
// keeps moving" without a single JS write to layout. All this composable does is
// report HOW FAR through that held stretch we are, and slice that number into the
// acts the section plays.
//
//   progress 0  -> the stage has just become stuck (cluster reaches centre)
//   progress 1  -> the stage is about to release (section bottom reaches viewport
//                  bottom)
//
// Read-only geometry, once per animation frame, coalesced — never writes layout,
// so it cannot cause a forced reflow. Under prefers-reduced-motion it resolves to
// a fixed end value and never listens to scroll at all: main.css unsticks the
// stage in that mode, so there is no held stretch to report on.

// The whole piece, as fractions of the held stretch. Read it top to bottom — it
// is the running order:
//
//   converge    the cloud draws into its own centre; the violet core forms out of
//               it as it goes
//   problemOut  "The problem" starts to leave halfway through the collapse, so the
//               copy is cleared by the thing it was describing while that thing is
//               still visibly moving
//   starMap     the star map plays, Figma t 0 -> STATION_T (the bloom and the core
//               transition together, the orbiting station, then the white circle)
//   settle      the resolved frame holds for the last stretch before release
//
// The line is NOT in here. It starts exactly as the stage releases and runs on
// ordinary page scroll — see `afterRelease` below.
//
// The section is 380vh tall, so 280vh of travel: a fraction here is 2.8 viewport
// heights of scrolling. Widen an act by widening its slice; everything
// downstream is derived.
//
// It used to be 480vh. The star map no longer holds on a station waiting to start
// its core transition (see StarMap.vue — that move now runs under the bloom), so
// a whole viewport of the old budget was paying for a frame that did not change.
// The acts below are what is left once that is gone, and they come out at roughly
// 0.8 viewports for the collapse and 1.5 for the star map.
const ACT = {
    converge: [0.08, 0.36],
    starMap: [0.36, 0.9]
} as const

/** Progress at which "The problem" starts to lift away — the midpoint of the
 *  collapse, so the copy is already going while the cloud is still visibly
 *  drawing inward rather than waiting for it to finish. */
const PROBLEM_OUT = (ACT.converge[0] + ACT.converge[1]) / 2

/** How far along the Figma timeline the pinned stretch carries: everything up to
 *  and including the white circle. Must match `T_STAGE_3` in StarMap.vue — that
 *  is the same instant named from the other side. The remainder is the line, and
 *  it is paid for out of the section's own exit rather than the held stretch.
 *
 *  It dropped from 0.88 with the retiming, and that is not a slowdown: the moves
 *  kept their authored widths, so a timeline with less dead air in it simply ends
 *  sooner. Against the `starMap` act above this spends ~70vh on the combined
 *  bloom-and-swell, ~48vh holding the orbit, and ~32vh on the white badge. */
const STATION_T = 0.56

/** How much of the post-release travel the line takes to reach full length. It
 *  finishes with a little of the section still to go, so it arrives at the foot
 *  of the section just as the page has washed back to white — which is what makes
 *  a white line on a white page read as melding rather than as vanishing. */
const LINE_RUN = 0.72

/** The solution copy arrives DURING the core transition rather than after it —
 *  just ahead of the logo, which fades in over Figma t 0.13 -> 0.23. The reader
 *  is already reading by the time the mark resolves, and the sentence and the
 *  shape land together instead of taking a turn each.
 *
 *  Exported because `useTimedSequence` hands over at the same point. It is a
 *  position on the star map's timeline, not on the scroll, so it means the same
 *  thing whichever clock is driving. */
export const SOLUTION_IN = 0.1

/** And leaves shortly after the stage releases — as a fraction of the
 *  post-release travel. It has to: the page is washing back to white underneath
 *  it from that moment, and white copy cannot ride that down. It clears early so
 *  the last thing the section does is the line alone. */
const SOLUTION_OUT = 0.12

/**
 * @param root    the section whose held stretch is being reported on
 * @param enabled false on the stacked layout, where there is no sticky stage to
 *                report on and `useTimedSequence` drives instead. Without it this
 *                would keep a scroll listener alive on a phone measuring a
 *                section nobody is scrubbing — cheap per call, but paid on every
 *                frame of every scroll for an answer that is discarded.
 */
export function usePinnedProgress(root: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
    const progress = ref(0)
    /** 0 -> 1 across the travel AFTER the stage unsticks, where the section is
     *  scrolling away normally. Zero for the whole held stretch, because
     *  rect.bottom only drops below a viewport once the stage has released. */
    const afterRelease = ref(0)
    const reduced = ref(false)
    let ticking = false

    function measure() {
        ticking = false
        const el = root.value
        if (!el) return
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        afterRelease.value = norm(vh - rect.bottom, 0, LINE_RUN * vh)
        // Travel available while the stage is stuck: the section's height less the
        // one viewport the stage itself occupies.
        const travel = rect.height - vh
        if (travel <= 0) {
            progress.value = 1
            return
        }
        // -rect.top is how far the section's top has passed above the viewport top,
        // which is exactly the distance the stage has been held.
        progress.value = norm(-rect.top, 0, travel)
    }

    function onScrollOrResize() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    let listening = false
    function detach() {
        if (!listening) return
        listening = false
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
    }

    function attach() {
        if (reduced.value) {
            // Show the piece resolved: solution copy, star map at its last station,
            // line drawn.
            progress.value = 1
            afterRelease.value = 1
            return
        }
        if (!enabled.value) return detach()
        if (listening) return
        listening = true
        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    }

    // The media query behind `enabled` resolves in ITS onMounted, which may land
    // after ours, and a rotation can cross the threshold without a scroll.
    watch(enabled, attach)

    onMounted(() => {
        reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        attach()
    })

    onBeforeUnmount(detach)

    /** 0 -> 1 as the particle cloud draws inward. The problem copy is still on
     *  stage for almost all of it and leaves at the end, so the collapse reads as
     *  the thing that clears the statement away. */
    const converge = computed(() => norm(progress.value, ACT.converge[0], ACT.converge[1]))

    /** Position on the Figma "Star Map Animation" timeline, 0..1.
     *
     *  Piecewise, and the seam is the stage releasing. Everything up to the white
     *  circle is scrubbed against the held stretch; the line then runs on ordinary
     *  page scroll, so the reader gets their scrolling back at the moment the
     *  piece stops asking for it. Both stretches map into the same `t`, so the
     *  keyframe tables in StarMap.vue stay diffable against the Figma payload. */
    const starMapTime = computed(() => {
        if (progress.value < 1) return STATION_T * norm(progress.value, ACT.starMap[0], ACT.starMap[1])
        return STATION_T + (1 - STATION_T) * afterRelease.value
    })

    /** Which copy group owns the stage. -1 is the gap between them, where the star
     *  map is alone; 2 is past the end, where both have said their piece and the
     *  line finishes the section on its own. */
    const phase = computed(() => {
        if (progress.value < PROBLEM_OUT) return 0
        if (afterRelease.value >= SOLUTION_OUT) return 2
        if (starMapTime.value >= SOLUTION_IN) return 1
        return -1
    })

    return { progress, phase, converge, starMapTime, afterRelease, reduced }
}
