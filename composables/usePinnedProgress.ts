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
//   problemOut  "The problem" starts to leave with the collapse all but finished,
//               so the copy is cleared by the thing it was describing
//   starMap     the star map plays, Figma t 0 -> 0.88 (bloom, orbit, the combined
//               station, then the white circle)
//   settle      the resolved frame holds for the last stretch before release
//
// The line is NOT in here. It starts exactly as the stage releases and runs on
// ordinary page scroll — see `afterRelease` below.
//
// The section is 480vh tall, so 380vh of travel: a fraction here is 3.8 viewport
// heights of scrolling. Widen an act by widening its slice; everything
// downstream is derived.
const ACT = {
    converge: [0.08, 0.34],
    starMap: [0.34, 0.94]
} as const

/** Progress at which "The problem" starts to lift away — 85% of the way through
 *  the collapse. */
const PROBLEM_OUT = 0.3

/** How far along the Figma timeline the pinned stretch carries: everything up to
 *  and including the white circle. The remaining 0.12 is the line, and it is paid
 *  for out of the section's own exit rather than the held stretch. */
const STATION_T = 0.88

/** How much of the post-release travel the line takes to reach full length. It
 *  finishes with a little of the section still to go, so it arrives at the foot
 *  of the section just as the page has washed back to white — which is what makes
 *  a white line on a white page read as melding rather than as vanishing. */
const LINE_RUN = 0.72

/** The solution copy arrives just ahead of the logo (which fades in over Figma t
 *  0.56 -> 0.66), so the reader is already reading when the mark resolves. */
const SOLUTION_IN = 0.54

/** And leaves shortly after the stage releases — as a fraction of the
 *  post-release travel. It has to: the page is washing back to white underneath
 *  it from that moment, and white copy cannot ride that down. It clears early so
 *  the last thing the section does is the line alone. */
const SOLUTION_OUT = 0.12

export function usePinnedProgress(root: Ref<HTMLElement | null>) {
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

    onMounted(() => {
        reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced.value) {
            // Show the piece resolved: solution copy, star map at its last station,
            // line drawn.
            progress.value = 1
            afterRelease.value = 1
            return
        }
        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
    })

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

    /** State token for a group at `index`, consumed by `.ea-phase[data-state]`. */
    function phaseState(index: number): 'pending' | 'active' | 'past' {
        if (index === phase.value) return 'active'
        // Through the gap both groups are off-stage: the one already read has
        // gone, the one still to come waits below. Any index below the phase has
        // been read — which is what makes phase 2 clear them both.
        if (phase.value === -1) return index === 0 ? 'past' : 'pending'
        return index < phase.value ? 'past' : 'pending'
    }

    return { progress, phase, phaseState, converge, starMapTime, afterRelease, reduced }
}
