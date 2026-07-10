// Dependency-free scroll-reveal directive, registered universally so SSR can
// resolve it. All DOM/observer work happens in `mounted`, which only runs on
// the client; `getSSRProps` returns nothing so server render is a no-op.
//   v-reveal            -> fade + rise when scrolled into view
//   v-reveal="120"      -> stagger delay in ms
//   v-reveal="{ delay: 120 }"
export default defineNuxtPlugin((nuxtApp) => {
    let io: IntersectionObserver | null = null

    const ensureObserver = () => {
        if (io) return io
        io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-visible')
                        io!.unobserve(e.target)
                    }
                }
            },
            { threshold: 0.14, rootMargin: '0px 0px -7% 0px' }
        )
        return io
    }

    const resolveDelay = (value: unknown): number => {
        if (typeof value === 'number') return value
        if (value && typeof value === 'object' && 'delay' in (value as any)) {
            const d = (value as any).delay
            return typeof d === 'number' ? d : 0
        }
        return 0
    }

    nuxtApp.vueApp.directive('reveal', {
        getSSRProps: () => ({}),
        mounted(el: HTMLElement, binding) {
            el.classList.add('reveal')
            const delay = resolveDelay(binding.value)
            if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (reduce) {
                el.classList.add('is-visible')
                return
            }
            ensureObserver().observe(el)
        },
        unmounted(el: HTMLElement) {
            io?.unobserve(el)
        }
    })
})
