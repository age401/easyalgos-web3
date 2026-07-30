import type { Ref } from 'vue'

// Scroll progress through a section whose inner stage is `position: sticky`.
//
// The layout does the hard part: a tall section wrapping a 100vh sticky stage
// gives us "scroll until the stage is centred, then hold it there while the page
// keeps moving" without a single JS write to layout. All this composable does is
// report HOW FAR through that held stretch we are, so the content inside the
// stage can be choreographed against it.
//
//   progress 0  -> the stage has just become stuck (cluster reaches centre)
//   progress 1  -> the stage is about to release (section bottom reaches viewport
//                  bottom)
//
// Read-only geometry, once per animation frame, coalesced — never writes layout,
// so it cannot cause a forced reflow. Under prefers-reduced-motion it resolves to
// a fixed mid-value and never listens to scroll at all: main.css unsticks the
// stage in that mode, so there is no held stretch to report on.
export function usePinnedProgress(root: Ref<HTMLElement | null>) {
    const progress = ref(0)
    /** True once the reader has scrolled past the hand-off point — the section's
     *  two text groups swap on this rather than on a raw number, so CSS owns the
     *  easing of the cross-fade. */
    const HANDOFF = 0.46
    const reduced = ref(false)
    let ticking = false

    function measure() {
        ticking = false
        const el = root.value
        if (!el) return
        const rect = el.getBoundingClientRect()
        // Travel available while the stage is stuck: the section's height less the
        // one viewport the stage itself occupies.
        const travel = rect.height - window.innerHeight
        if (travel <= 0) {
            progress.value = 1
            return
        }
        // -rect.top is how far the section's top has passed above the viewport top,
        // which is exactly the distance the stage has been held.
        const raw = -rect.top / travel
        progress.value = raw < 0 ? 0 : raw > 1 ? 1 : raw
    }

    function onScrollOrResize() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    onMounted(() => {
        reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced.value) {
            // Show the piece resolved: past the hand-off, cluster converged.
            progress.value = 1
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

    /** Which text group owns the stage right now. */
    const phase = computed(() => (progress.value >= HANDOFF ? 1 : 0))

    /** State token for a group at `index`, consumed by `.ea-phase[data-state]`. */
    function phaseState(index: number): 'pending' | 'active' | 'past' {
        if (index === phase.value) return 'active'
        return index < phase.value ? 'past' : 'pending'
    }

    /** 0 -> 1 as the cluster draws inward. Starts only once the second text group
     *  has taken the stage, so the collapse reads as the answer to that copy
     *  rather than as something that happened on its own, and finishes before the
     *  section releases so the reader sees the resolved state rather than an empty
     *  stage sliding away. */
    const converge = computed(() => {
        const start = HANDOFF + 0.1
        const end = 0.92
        const t = (progress.value - start) / (end - start)
        return t < 0 ? 0 : t > 1 ? 1 : t
    })

    return { progress, phase, phaseState, converge, reduced }
}
