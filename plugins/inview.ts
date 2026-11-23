// `v-inview` - marks an element `.is-in` the first time it enters the viewport.
//
// The sibling of `v-reveal`, and different from it in one deliberate way: this
// directive never HIDES anything. It only ever adds a class. The hidden state
// lives in CSS, on a class that is already in the server-rendered markup
// (`.xa-in`, see the Expert Advisors block in main.css) and is gated behind
// `.js` on <html>.
//
// That matters on the Expert Advisors pages because their animated modules are
// on screen at first paint - the card grid starts 560px down the list page.
// `v-reveal` applies its hidden state in `mounted`, so anything already visible
// would paint, vanish on hydration and then fade back in. With the state in the
// markup, the element is simply never painted until it is revealed, and there is
// nothing for the server and the client to disagree about.
//
// It is also what the draw-in effects hang off: a ring's arc, a sparkline's
// wipe and a ranking bar all key on the nearest `.xa-in.is-in` ancestor, so one
// observer entry starts a whole card.
export default defineNuxtPlugin((nuxtApp) => {
    let observer: IntersectionObserver | null = null

    const reveal = (el: HTMLElement) => {
        el.dataset.xaIn = '1'
        el.classList.add('is-in')
    }

    const ensureObserver = () => {
        if (observer) return observer
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    reveal(entry.target as HTMLElement)
                    observer!.unobserve(entry.target)
                }
            },
            // A lower threshold than v-reveal's 0.14: a 1300px data column would
            // otherwise need 180px on screen before any of it appeared.
            { threshold: 0.05, rootMargin: '0px 0px -6% 0px' }
        )
        return observer
    }

    nuxtApp.vueApp.directive('inview', {
        getSSRProps: () => ({}),
        mounted(el: HTMLElement) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                reveal(el)
                return
            }
            ensureObserver().observe(el)
        },
        // Vue patches `class` as a whole string, so a re-render that touches the
        // element's bound classes would drop one added by hand. Put it back.
        updated(el: HTMLElement) {
            if (el.dataset.xaIn === '1') el.classList.add('is-in')
        },
        unmounted(el: HTMLElement) {
            observer?.unobserve(el)
        }
    })
})
