import type { Ref } from 'vue'

/** A scroller's children that are actually rendered.
 *
 *  A `display: none` child reports offsetLeft 0, which would otherwise sit in the
 *  middle of the target list and wreck every measurement built from it. Hiding
 *  part of a row per breakpoint in CSS is exactly how this project is meant to
 *  switch layout, so measurement has to cope with it rather than forbid it. */
export function renderedChildren(node: HTMLElement): HTMLElement[] {
    return (Array.from(node.children) as HTMLElement[]).filter((child) => child.offsetParent !== null)
}

/** Reads a native snap scroller's scroll position as a CONTINUOUS index, and
 *  drives it back. The same job HowItWorksSection does inline; the review strip
 *  needs it too, so it lives here rather than being copied.
 *
 *  The fiddly part is the targets. They come from the children's own offsets
 *  CLAMPED to the scrollable distance, because a row whose cards are wider than
 *  its scroll range has nominal snap points the scroller can never rest at —
 *  jumping to one would have snap immediately drag it back, and the indicator
 *  would then disagree with the view. Measuring off the DOM also means no card
 *  width or gap is restated here, so it stays correct at every breakpoint.
 *
 *  `count` is a getter, not a number, so a v-for that changes length keeps
 *  working without the caller re-invoking the composable. */
export function useSnapScroller(el: Ref<HTMLElement | null>, count: () => number) {
    /** 0..count-1, fractional while the row is mid-drag — an indicator reading
     *  this moves 1:1 with the finger instead of waiting for a snap to settle. */
    const position = ref(0)
    const activeIndex = computed(() => Math.round(position.value))
    const reducedMotion = ref(false)
    let ticking = false

    function snapTargets(node: HTMLElement): number[] {
        const max = Math.max(0, node.scrollWidth - node.clientWidth)
        const children = renderedChildren(node)
        const first = children[0]
        if (!first) return Array.from({ length: count() }, () => 0)
        return children.map((child) => Math.min(Math.max(0, child.offsetLeft - first.offsetLeft), max))
    }

    function measure() {
        ticking = false
        const node = el.value
        if (!node) return
        const max = Math.max(0, node.scrollWidth - node.clientWidth)
        if (max <= 0) {
            position.value = 0
            return
        }
        const x = node.scrollLeft
        const targets = snapTargets(node)

        // Piecewise-linear between reachable positions. A zero-width span means
        // that card is pinned at the end alongside its neighbour, so it is
        // stepped over rather than divided by.
        let p = 0
        for (let i = 0; i < targets.length - 1; i++) {
            const span = targets[i + 1] - targets[i]
            if (span <= 0) {
                if (x >= targets[i + 1]) p = i + 1
                continue
            }
            if (x <= targets[i + 1]) {
                p = i + (x - targets[i]) / span
                break
            }
            p = i + 1
        }
        // At the far end the last card is the one on screen, whatever the
        // arithmetic above concluded from the clamped targets.
        if (x >= max - 1) p = targets.length - 1
        position.value = p
    }

    function onScroll() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    function goTo(index: number) {
        const node = el.value
        if (!node) return
        // 'instant', NOT 'auto'. These scrollers set `scroll-behavior: smooth` in
        // CSS, and per CSSOM 'auto' means "defer to the computed value" — so it
        // would still animate and reduced motion would be quietly ignored.
        node.scrollTo({ left: snapTargets(node)[index] ?? 0, behavior: reducedMotion.value ? 'instant' : 'smooth' })
    }

    // Re-measured on resize, not just on mount: crossing a breakpoint changes the
    // card width, the gap and the scroller's padding all at once, so every snap
    // target moves and a position measured before the change is stale. Observing
    // the element rather than the window also catches a layout shift that has
    // nothing to do with the viewport.
    let ro: ResizeObserver | null = null

    onMounted(() => {
        reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        measure()

        const node = el.value
        if (node && typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => onScroll())
            ro.observe(node)
        }
    })

    onBeforeUnmount(() => {
        ro?.disconnect()
        ro = null
    })

    return { position, activeIndex, onScroll, goTo, measure }
}
