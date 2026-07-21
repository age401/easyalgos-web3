import type { Ref } from 'vue'

// Fires `visible = true` once when `el` enters the viewport, then stops
// observing — never re-fires, never reverts. For one-shot entrance
// animations (e.g. the solutions cards sliding in) that shouldn't replay on
// scroll-back. Starts already visible under prefers-reduced-motion.
export function useRevealOnce(el: Ref<HTMLElement | null>, options: IntersectionObserverInit = {}) {
    const visible = ref(false)
    let io: IntersectionObserver | null = null

    onMounted(() => {
        const target = el.value
        if (!target) return

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            visible.value = true
            return
        }

        io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        visible.value = true
                        io?.disconnect()
                    }
                }
            },
            { threshold: 0.2, rootMargin: '0px 0px -10% 0px', ...options }
        )
        io.observe(target)
    })

    onBeforeUnmount(() => io?.disconnect())

    return { visible }
}
