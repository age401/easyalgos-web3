import type { Ref } from 'vue'

// Toggles `dark` true while the band sits in the central strip of the viewport,
// so the section background can transition white -> dark on scroll-in and back to
// white on scroll-away. Also exposes the same flag to drive the chart draw-in.
// The page background (html/body, via `.is-dark-band` in main.css) mirrors the
// same flag so the whole page — not just the section box — shifts with it.
//
// Driven by scroll/resize + rAF rather than IntersectionObserver: on a fast
// (flung) scroll the browser can coalesce or delay IO callbacks by several
// frames, so the target can be scrolled well past the trigger strip before
// the "not intersecting" entry ever arrives, leaving the page stuck dark.
// Recomputing from live geometry on every animation frame keeps `dark` in
// sync with the actual scroll position, no matter how fast it moves.
export function useDarkBand(el: Ref<HTMLElement | null>) {
    const dark = ref(false)
    let ticking = false

    function measure() {
        ticking = false
        const target = el.value
        if (!target) return
        const rect = target.getBoundingClientRect()
        const vh = window.innerHeight
        // Central ~32% strip of the viewport.
        const stripTop = vh * 0.34
        const stripBottom = vh * 0.66
        dark.value = rect.top < stripBottom && rect.bottom > stripTop
    }

    function onScrollOrResize() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    watch(dark, (value) => {
        document.documentElement.classList.toggle('is-dark-band', value)
        document.body.classList.toggle('is-dark-band', value)
        document.getElementById('__nuxt')?.classList.toggle('is-dark-band', value)
    })

    onMounted(() => {
        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        document.documentElement.classList.remove('is-dark-band')
        document.body.classList.remove('is-dark-band')
        document.getElementById('__nuxt')?.classList.remove('is-dark-band')
    })

    return { dark }
}
