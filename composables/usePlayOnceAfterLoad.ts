// Fires `play` once, `delayMs` after the page has fully loaded (or immediately
// scheduled on mount if `load` already fired). Never re-fires — for one-shot
// entrance animations that must not replay or loop. Respects
// prefers-reduced-motion via the global CSS override in main.css, which
// collapses animation-duration so the triggered animation still resolves to
// its end state almost instantly.
export function usePlayOnceAfterLoad(delayMs = 1200) {
    const play = ref(false)
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function schedule() {
        timeoutId = setTimeout(() => (play.value = true), delayMs)
    }

    onMounted(() => {
        if (document.readyState === 'complete') {
            schedule()
        } else {
            window.addEventListener('load', schedule, { once: true })
        }
    })

    onBeforeUnmount(() => {
        window.removeEventListener('load', schedule)
        if (timeoutId) clearTimeout(timeoutId)
    })

    return { play }
}
