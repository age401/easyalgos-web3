import type { Ref } from 'vue'

export interface LoopingCarouselOptions {
    /** How many REAL items exist, i.e. the length of one copy. */
    count: () => number
    /** Copies rendered. Three is the minimum for a loop that runs BOTH ways: the
     *  middle copy is live and the outer two are the runway it teleports across.
     *  Two would only work forwards — you cannot scroll left of zero. */
    sets?: number
    /** ms between automatic advances. 0 disables autoplay entirely. */
    intervalMs?: number
    /** Told how far a teleport moved the scroll, so a drag in progress can
     *  re-base itself. Wire this to useDragScroll's `shiftBaseline`. */
    onTeleport?: (delta: number) => void
}

/** How long after the last scroll event the row counts as settled. Long enough
 *  that a momentum fling is over, short enough to be invisible. */
const SETTLE_MS = 140

/**
 * An endless snap scroller.
 *
 * The illusion is the standard one, and there is no way around it with native
 * scrolling: render the set three times, live in the middle copy, and when the
 * scroll drifts out of that copy, silently move it back by exactly one set
 * width. Because the content repeats with that exact period, the pixels the
 * reader is looking at do not change — nor does snap alignment — so the jump
 * cannot be seen. It is only ever done INSTANTLY; animating it would slide five
 * cards past the reader.
 *
 * WHY ON SETTLE, rather than on crossing a threshold mid-scroll: a teleport
 * during a smooth programmatic scroll aborts that animation and lands short.
 * Waiting until the row is at rest lets autoplay and band jumps finish first.
 * With mandatory snapping a touch fling arrests within a card or two, so a whole
 * set of runway either side is far more than one gesture can spend.
 *
 * A drag is the exception: it drives scrollLeft directly, so teleporting under it
 * is safe provided it re-bases — hence `onTeleport`.
 *
 * THE LOOP IS OPTIONAL, and it is switched off by hiding the duplicate copies in
 * CSS rather than by any flag here. Measurement counts only rendered children, so
 * one visible copy means no set width, which means no teleport and no initial
 * jump, and autoplay rewinds at the end instead of running on. That keeps the
 * decision where this project keeps layout decisions, and it means there is no
 * media query in here that could disagree with the stylesheet.
 */
export function useLoopingCarousel(el: Ref<HTMLElement | null>, opts: LoopingCarouselOptions) {
    const sets = opts.sets ?? 3
    const intervalMs = opts.intervalMs ?? 0

    // Measurement runs over ALL rendered items, real and duplicated.
    const { position: rawPosition, onScroll: measureScroll, measure } = useSnapScroller(el, () => opts.count() * sets)

    const count = computed(() => Math.max(1, opts.count()))

    /** Fractional position within ONE copy, 0..count-1. Wrapping is what lets a
     *  five-band indicator describe a fifteen-item track. The read-out does step
     *  back to zero as the loop comes round, which is what a looping indicator
     *  should do. */
    const position = computed(() => ((rawPosition.value % count.value) + count.value) % count.value)
    const activeIndex = computed(() => Math.round(position.value) % count.value)

    /** Offsets of every rendered item, UNCLAMPED — unlike the scroller's own
     *  targets, which clamp to the scrollable distance. Clamping is right for a
     *  finite row, where the tail cards genuinely cannot be reached. Here the
     *  live window sits in the middle copy where every target is reachable, and
     *  clamping would collapse the outer runway into a pile of equal values. */
    function itemOffsets(node: HTMLElement): number[] {
        const children = renderedChildren(node)
        const first = children[0]
        if (!first) return []
        return children.map((child) => child.offsetLeft - first.offsetLeft)
    }

    /** Width of one copy, which is the loop's exact period. Taken as the distance
     *  from item 0 to item `count`; both are interior items, so neither is
     *  affected by the last child having no trailing gap. */
    function setWidth(node: HTMLElement): number {
        return itemOffsets(node)[opts.count()] ?? 0
    }

    /** Whether the strip is currently endless.
     *
     *  Derived from the geometry, not from a media query or a flag: if only one
     *  copy is RENDERED then there is no second copy to teleport across, so
     *  `setWidth` is 0 and looping is off. That is what lets the breakpoint switch
     *  live entirely in CSS — hide the duplicate copies and the loop turns itself
     *  off, with nothing here to keep in step. */
    function isLooping(node: HTMLElement): boolean {
        return setWidth(node) > 0
    }

    function jumpTo(node: HTMLElement, left: number) {
        const previous = node.style.scrollBehavior
        node.style.scrollBehavior = 'auto'
        // Forced reflow, deliberately: the style above must be in effect before
        // the write below, and browsers recalculate style lazily. Without this the
        // write can still be governed by the stylesheet's `scroll-behavior:
        // smooth`, and the seam becomes a visible slide.
        void node.offsetWidth
        node.scrollLeft = left
        node.style.scrollBehavior = previous
    }

    /** Bring the scroll back inside the middle copy, if it has left it. */
    function normalize() {
        const node = el.value
        if (!node) return
        const set = setWidth(node)
        if (set <= 0) return

        const from = node.scrollLeft
        let to = from
        while (to < set * 0.5) to += set
        while (to >= set * 1.5) to -= set
        if (Math.abs(to - from) < 0.5) return

        jumpTo(node, to)
        opts.onTeleport?.(to - from)
        measure()
    }

    let settleTimer: ReturnType<typeof setTimeout> | null = null

    function onScroll() {
        measureScroll()
        if (settleTimer) clearTimeout(settleTimer)
        settleTimer = setTimeout(() => {
            settleTimer = null
            normalize()
        }, SETTLE_MS)
    }

    // ------------------------------------------------------------- autoplay --
    const paused = ref(false)
    const inView = ref(false)
    let timer: ReturnType<typeof setInterval> | null = null
    let reducedMotion = false

    /** Autoplay runs only when it is wanted, visible and unattended. Off-screen it
     *  would spend the loop while nobody is watching, so the reader arrives
     *  mid-strip at a card they never chose. */
    function shouldRun() {
        return intervalMs > 0 && !reducedMotion && inView.value && !paused.value
    }

    function stop() {
        if (!timer) return
        clearInterval(timer)
        timer = null
    }

    function restart() {
        stop()
        if (shouldRun()) timer = setInterval(step, intervalMs)
    }

    function step() {
        const node = el.value
        if (!node) return
        // Derived from the LIVE scroll position, NOT from the measured index.
        //
        // Taking `round(position) + 1` looks equivalent and is not: the
        // measurement is rAF-throttled, so if it lags by a frame that expression
        // names the offset the row is already sitting at. Scrolling somewhere you
        // already are fires no scroll event, so the measurement never refreshes,
        // so the next tick computes the same no-op — autoplay stalls for good, and
        // only an unrelated interaction ever knocks it out of it. Asking for the
        // first offset genuinely ahead of here is self-correcting and cannot
        // no-op. Offsets are ascending, so `find` gives the nearest one.
        const offsets = itemOffsets(node)
        const from = node.scrollLeft
        const to = offsets.find((offset) => offset > from + 1)
        if (to !== undefined) {
            node.scrollTo({ left: to, behavior: 'smooth' })
            return
        }
        // Nothing ahead. A LOOPING strip should never be here, because normalize
        // keeps the live window mid-track — so if it somehow is, leave it for the
        // next settle rather than yanking it to the start.
        if (isLooping(node)) return
        // A FINITE strip does reach its last card, and rewinds. The alternative is
        // a carousel that quietly stops for good after five cards, which reads as
        // broken rather than as finished.
        node.scrollTo({ left: offsets[0] ?? 0, behavior: 'smooth' })
    }

    /** Restart the countdown. Called on every manual interaction, so the strip
     *  never yanks itself onward a moment after the reader moved it by hand. */
    function bump() {
        if (shouldRun()) restart()
    }

    function pause() {
        paused.value = true
        stop()
    }

    function resume() {
        paused.value = false
        restart()
    }

    /** Jump to a REAL index, via whichever copy of it is nearest — so band 1 does
     *  not scroll a whole set backwards to reach copy-index 0. */
    function goTo(index: number) {
        const node = el.value
        if (!node) return
        const offsets = itemOffsets(node)
        const current = Math.round(rawPosition.value)
        let best = -1
        for (let s = 0; s < sets; s++) {
            const candidate = s * opts.count() + index
            if (offsets[candidate] === undefined) continue
            if (best < 0 || Math.abs(candidate - current) < Math.abs(best - current)) best = candidate
        }
        if (best < 0) return
        node.scrollTo({ left: offsets[best], behavior: reducedMotion ? 'instant' : 'smooth' })
        bump()
    }

    let io: IntersectionObserver | null = null
    let ro: ResizeObserver | null = null
    let resizeTimer: ReturnType<typeof setTimeout> | null = null

    onMounted(() => {
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        // Deferred a frame: one copy cannot be measured until the strip is laid
        // out, and on a freshly hydrated page it is not yet.
        requestAnimationFrame(() => {
            const node = el.value
            if (!node) return
            const set = setWidth(node)
            if (set > 0) jumpTo(node, set)
            measure()
        })

        const node = el.value
        if (!node) return

        if (typeof IntersectionObserver !== 'undefined') {
            io = new IntersectionObserver(
                (entries) => {
                    for (const entry of entries) inView.value = entry.isIntersecting
                    restart()
                },
                { threshold: 0.2 }
            )
            io.observe(node)
        }

        // A breakpoint change moves every offset at once, so the live window has
        // to be re-established against the new geometry.
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => {
                if (resizeTimer) clearTimeout(resizeTimer)
                resizeTimer = setTimeout(normalize, SETTLE_MS)
            })
            ro.observe(node)
        }
    })

    onBeforeUnmount(() => {
        stop()
        io?.disconnect()
        ro?.disconnect()
        if (settleTimer) clearTimeout(settleTimer)
        if (resizeTimer) clearTimeout(resizeTimer)
    })

    return { position, activeIndex, onScroll, goTo, pause, resume, bump }
}
