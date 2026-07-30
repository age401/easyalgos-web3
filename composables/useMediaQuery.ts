// Reactive matchMedia. Two lines of native API rather than a dependency.
//
// Starts `false` on the server and on first client render, then resolves in
// onMounted — so it must only ever gate BEHAVIOUR (whether a scroll effect runs),
// never layout, or the markup would differ between server and client render.
// Layout responds to breakpoints in CSS, where it belongs.
export function useMediaQuery(query: string) {
    const matches = ref(false)
    let list: MediaQueryList | null = null
    const onChange = (event: MediaQueryListEvent) => {
        matches.value = event.matches
    }

    onMounted(() => {
        list = window.matchMedia(query)
        matches.value = list.matches
        list.addEventListener('change', onChange)
    })

    onBeforeUnmount(() => list?.removeEventListener('change', onChange))

    return matches
}
