// Inverts the fixed header while a dark section sits behind it.
//
// Sections opt in by marking themselves `data-dark-band` — nothing else. This
// composable is called once, by the header, and toggles `.is-dark-band` on
// html/body; main.css does the rest (wordmark cross-fade, link colour, switch
// chrome).
//
// A SECOND class rides along: `.is-dark-page`, which carries the page background
// so an overscroll bounce past a dark band never flashes white. It is separate
// because the two are not the same question. A band is behind the header whenever
// its box is; it owns the PAGE only if the page has nothing better to show there.
// A band opts out with `data-dark-page="off"` — see the problem/solution section,
// which paints its own dark and is followed by two sections that paint nothing.
// Left in, its dark would carry across those two and then snap back to white.
//
// Driven by scroll/resize + rAF rather than IntersectionObserver: on a flung
// scroll the browser can coalesce or delay IO callbacks by several frames, so the
// "no longer intersecting" entry can arrive long after the band has left the
// header — leaving it stuck inverted. Recomputing from live geometry each frame
// keeps the flag honest at any scroll velocity, and it is only ever a handful of
// getBoundingClientRect reads on elements we already hold.
export function useDarkBand(headerHeight = 76) {
    const dark = ref(false)
    /** Whether that same band also owns the page background. */
    const darkPage = ref(false)
    let bands: HTMLElement[] = []
    let ticking = false

    function collect() {
        bands = Array.from(document.querySelectorAll<HTMLElement>('[data-dark-band]'))
    }

    function measure() {
        ticking = false
        // Trigger on the header's own strip: the band counts as "behind the
        // header" once it crosses the middle of that strip, so the swap lands as
        // the section edge passes under the wordmark rather than before or after.
        const line = headerHeight * 0.5
        let next = false
        let nextPage = false
        for (const band of bands) {
            // A band whose colour is scroll-interpolated (see usePageTint) marks
            // itself "off" while it is mid-fade: geometry alone would keep the
            // header inverted over a background that has already washed out to
            // near-white on the way out. The two tests AND together — on the way
            // IN geometry is the later gate, on the way out the fade is.
            if (band.dataset.darkBand === 'off') continue
            const rect = band.getBoundingClientRect()
            if (rect.top <= line && rect.bottom > line) {
                next = true
                nextPage = band.dataset.darkPage !== 'off'
                break
            }
        }
        if (next !== dark.value) dark.value = next
        if (nextPage !== darkPage.value) darkPage.value = nextPage
    }

    function onScrollOrResize() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    watch(dark, (value) => {
        document.documentElement.classList.toggle('is-dark-band', value)
        document.body.classList.toggle('is-dark-band', value)
    })

    watch(darkPage, (value) => {
        document.documentElement.classList.toggle('is-dark-page', value)
    })

    onMounted(() => {
        collect()
        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        document.documentElement.classList.remove('is-dark-band', 'is-dark-page')
        document.body.classList.remove('is-dark-band')
    })

    return { dark }
}
