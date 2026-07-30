// Dependency-free scroll-reveal directive, registered universally so SSR can
// resolve it.
//   v-reveal            -> fade + rise when scrolled into view
//   v-reveal="120"      -> stagger delay in ms
//   v-reveal="{ delay: 120 }"
//
// The hidden state is applied in `mounted`, NOT via `getSSRProps`.
//
// Emitting the class server-side is tempting — it would hide the element from the
// very first paint — but a directive-only prop cannot be reproduced by the client's
// initial vnode, so Vue reports a hydration mismatch on every revealed element.
// Instead, the sections below the fold hydrate on visibility with a 300px margin
// (see pages/index.vue): the directive therefore runs while the element is still
// off-screen, sets the hidden state there, and the reveal plays normally when the
// reader arrives. The hero does not rely on this at all — its entrance uses the
// `.line-mask` / `.hero-fade` classes, which are in the markup.
//
// Everything stays gated behind `.js` on <html> (set synchronously in
// nuxt.config's head), so with scripting off nothing is ever hidden.
export default defineNuxtPlugin((nuxtApp) => {
    let io: IntersectionObserver | null = null

    const ensureObserver = () => {
        if (io) return io
        io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible')
                        io!.unobserve(entry.target)
                    }
                }
            },
            { threshold: 0.14, rootMargin: '0px 0px -7% 0px' }
        )
        return io
    }

    const resolveDelay = (value: unknown): number => {
        if (typeof value === 'number') return value
        if (value && typeof value === 'object' && 'delay' in (value as Record<string, unknown>)) {
            const delay = (value as { delay?: unknown }).delay
            return typeof delay === 'number' ? delay : 0
        }
        return 0
    }

    nuxtApp.vueApp.directive('reveal', {
        // Nothing on the server: see the note above. Returning {} keeps SSR a no-op
        // rather than throwing on a missing hook.
        getSSRProps: () => ({}),
        mounted(el: HTMLElement, binding) {
            el.classList.add('reveal')
            const delay = resolveDelay(binding.value)
            if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
