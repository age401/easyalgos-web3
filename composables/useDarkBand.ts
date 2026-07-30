// Inverts the fixed header while a dark section sits behind it.
//
// Sections opt in by marking themselves `data-dark-band` — nothing else. This
// composable is called once, by the header, and toggles `.is-dark-band` on
// html/body; main.css does the rest (wordmark cross-fade, link colour, switch
// chrome). The class also carries the page background, so an overscroll bounce
// past a dark band never flashes white.
//
// Driven by scroll/resize + rAF rather than IntersectionObserver: on a flung
// scroll the browser can coalesce or delay IO callbacks by several frames, so the
// "no longer intersecting" entry can arrive long after the band has left the
// header — leaving it stuck inverted. Recomputing from live geometry each frame
// keeps the flag honest at any scroll velocity, and it is only ever a handful of
// getBoundingClientRect reads on elements we already hold.
export function useDarkBand(headerHeight = 76) {
    const dark = ref(false)
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
        for (const band of bands) {
            const rect = band.getBoundingClientRect()
            if (rect.top <= line && rect.bottom > line) {
                next = true
                break
            }
        }
        if (next !== dark.value) dark.value = next
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

    onMounted(() => {
        collect()
        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        document.documentElement.classList.remove('is-dark-band')
        document.body.classList.remove('is-dark-band')
    })

    return { dark }
}
