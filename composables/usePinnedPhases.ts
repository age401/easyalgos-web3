import type { Ref } from 'vue'
import { norm } from '~/utils/keyframes'

// Scroll progress through a pinned stage, and the act table a run of copy groups
// is cut from.
//
// Same mechanism as `usePinnedProgress` (the home page's problem/solution piece):
// a tall wrapper around a `position: sticky; height: 100vh` stage gives us "scroll
// until the stage is centred, then hold it there while the page keeps moving"
// without a single JS write to layout, and all this does is report HOW FAR through
// that held stretch the reader is.
//
//   progress 0  -> the stage has just become stuck (it has reached the centre)
//   progress 1  -> the stage is about to release (the wrapper's bottom reaches the
//                  viewport bottom)
//
// What is different, and why this is not that composable with another argument:
// there, the acts are a fixed running order baked into the file — a collapse, a
// star map, two copy groups that hand over once. Here the section is a RUN of
// interchangeable copy groups over one continuous graphic, so the act table is the
// caller's (see DeveloperSolutionSection) and the group count is not knowable
// here. Generalising the home page's table to cover both would have made a proven
// piece of choreography configurable for the sake of one call site. This is the
// piece of it that genuinely is generic: the geometry read, and the cut.
//
// Read-only geometry, once per animation frame, coalesced — never writes layout,
// so it cannot cause a forced reflow. Under prefers-reduced-motion it resolves to
// the end and never listens to scroll at all.

/** One copy group's window on the held stretch: it is on stage from `in` to
 *  `out`, and the space between one group's `out` and the next's `in` is a
 *  deliberate gap where the graphic is alone. */
export type PhaseWindow = readonly [inAt: number, outAt: number]

export type PhaseState = 'pending' | 'active' | 'past'

/** A group's state at a given progress. Derived from the window rather than from
 *  a single "current phase" index, which is what lets the gaps exist: between two
 *  windows every group has left or has yet to arrive, and no index can say that.
 *
 *  Consumed by `.ea-phase[data-state]` in main.css, which owns the easing — so
 *  the handover is three discrete states and one CSS transition, not a number
 *  written to a style every frame. */
export function phaseStateAt(window: PhaseWindow, progress: number): PhaseState {
    if (progress < window[0]) return 'pending'
    if (progress > window[1]) return 'past'
    return 'active'
}

/** Which group owns the stage, or -1 in a gap. Not needed for the copy — that
 *  reads its own window — but it is what a graphic keys off when it should react
 *  to the handover rather than to raw progress. */
export function phaseAt(windows: readonly PhaseWindow[], progress: number): number {
    for (let i = 0; i < windows.length; i++) {
        if (progress >= windows[i][0] && progress <= windows[i][1]) return i
    }
    return -1
}

/**
 * @param travel the tall wrapper whose height less one viewport IS the held
 *               stretch. Deliberately not the section: this section opens with a
 *               heading that scrolls away normally before the stage pins, so the
 *               section's box and the travel are two different distances. The
 *               home page's section has no such heading and could use one element
 *               for both.
 * @param enabled false where there is no sticky stage to report on — the stacked
 *                layout, which unpins the stage in CSS. Without it this would keep
 *                a scroll listener alive on a phone measuring a stage nobody is
 *                scrubbing.
 */
export function usePinnedPhases(travel: Ref<HTMLElement | null>, enabled: Ref<boolean>) {
    const progress = ref(0)
    const reduced = ref(false)
    let ticking = false

    function measure() {
        ticking = false
        const el = travel.value
        if (!el) return
        const rect = el.getBoundingClientRect()
        const held = rect.height - window.innerHeight
        if (held <= 0) {
            // Nothing to hold: a window taller than the wrapper. Resolve rather
            // than divide by zero, so the piece reads as finished instead of
            // frozen at its first frame.
            progress.value = 1
            return
        }
        // -rect.top is how far the wrapper's top has passed above the viewport
        // top, which is exactly the distance the stage has been held.
        progress.value = norm(-rect.top, 0, held)
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
            // Show the piece resolved: every group has said its piece, the
            // graphic is fully lit. main.css unpins the stage in this mode, so
            // there is no held stretch to report on.
            progress.value = 1
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

    return { progress, reduced }
}
