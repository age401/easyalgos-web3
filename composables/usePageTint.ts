import type { Ref } from 'vue'
import { norm } from '~/utils/keyframes'

// Carries the PAGE background from white to a section's dark and back, in step
// with the scroll.
//
// The alternative — painting the dark on the section box — gives you two hard
// edges that snap past at scroll speed, and an overscroll bounce that flashes
// white. Here the section itself is transparent and the document background is
// what moves, so the darkening arrives as a property of the page rather than as a
// rectangle sliding into view, and it carries on through whatever sits either
// side of the section (which is why the two sections below it paint nothing).
//
// Written as a single custom property on <html>, which main.css reads for both
// html and body. That keeps this to one string write per frame and zero layout
// writes; `.is-dark-band` (the other dark sections, which do own their colour)
// sets the same property, so the two mechanisms compose instead of fighting —
// the inline value wins while this section is on screen and is removed the moment
// it is not.
const PAGE = [255, 255, 255] as const

/** How far the section's leading edge must climb before the fade starts at all,
 *  in viewports. Without it the page begins darkening the instant that edge
 *  crosses the viewport bottom — which is while the hero is still most of the
 *  screen, so the tint reads as something happening to the hero rather than as
 *  the next section arriving. Holding off until the section owns the lower half
 *  of the screen keeps the hero clean. */
const ENTER_DELAY = 0.5

/** How much of a viewport the fade then takes. Together with the delay the page
 *  is fully dark once the section covers the lower 90% of the screen — still
 *  before any of its white copy has climbed high enough to be read against a
 *  light background, which is the constraint that matters. */
const ENTER_RAMP = 0.4

/** On the way out, how much of a viewport the wash back to white takes. */
const EXIT_RAMP = 1

/** And how far ahead of the section's own departure that wash finishes, in
 *  viewports — measured on the trailing edge, so the page is white again with
 *  this much of the section still to scroll. The line finishing into an
 *  already-white page is what makes a white line read as melding rather than as
 *  vanishing, so it wants to land early rather than exactly on the boundary. */
const EXIT_LEAD = 0.5

/**
 * @param root    the section whose arrival and departure drive the fade
 * @param tint    the colour to reach, as sRGB channels
 * @param enabled false where there is no scroll choreography to serve — the
 *                stacked layout. A ramp needs a section several viewports tall to
 *                have anywhere to fade ACROSS; on a stacked layout the section is
 *                barely a viewport, so a fade would leave the page mid-grey under
 *                white copy for most of it. There, the section paints its own
 *                dark and this stands down entirely.
 */
export function usePageTint(
    root: Ref<HTMLElement | null>,
    tint: readonly [number, number, number],
    enabled: Ref<boolean>
) {
    /** True while this composable owns the page background. The section keys its
     *  own `bg-*` off it, so both the server-rendered frame and the stacked
     *  layout stay correct: the section is dark until this takes over, and
     *  transparent after. */
    const active = ref(false)
    let ticking = false
    let enterDelay = ENTER_DELAY
    let enterRamp = ENTER_RAMP
    let exitRamp = EXIT_RAMP
    let exitLead = EXIT_LEAD
    let lastWritten = -1
    let darkFlag: boolean | null = null

    function writeVar(value: number) {
        // Quantised: below a 1/255 step there is nothing to see, and skipping the
        // write keeps a stationary reader off the style-recalc path entirely.
        const q = Math.round(value * 255) / 255
        if (q === lastWritten) return
        lastWritten = q

        const style = document.documentElement.style
        if (q <= 0) {
            // Hand the page back, so a following dark band's `.is-dark-band` rule
            // is free to take it.
            style.removeProperty('--ea-page-bg')
            return
        }
        const mix = PAGE.map((c, i) => Math.round(c + (tint[i] - c) * q))
        style.setProperty('--ea-page-bg', `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`)
    }

    /** Tell the header whether this still counts as a dark band. Past the halfway
     *  point of the fade the page is lighter than the header's white chrome
     *  expects, so it has to cross back before the section has actually left.
     *  Only written on the crossing, not every frame. */
    function setBand(isDark: boolean) {
        if (!root.value || isDark === darkFlag) return
        darkFlag = isDark
        root.value.dataset.darkBand = isDark ? '' : 'off'
    }

    function measure() {
        ticking = false
        const el = root.value
        if (!el) return

        if (!enabled.value) {
            // Stood down: the section is an ordinary self-coloured dark band again.
            active.value = false
            setBand(true)
            writeVar(0)
            return
        }
        active.value = true

        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight
        // The fade tracks the leading edge coming up the screen, then the trailing
        // edge leaving it, and holds full dark for everything between. Each end
        // carries an offset as well as a ramp — the entry so the hero is clear of
        // the screen before the page starts to move, the exit so the wash back to
        // white completes ahead of the section's own departure.
        const q = Math.min(
            norm(vh - rect.top, enterDelay * vh, (enterDelay + enterRamp) * vh),
            norm(rect.bottom - exitLead * vh, 0, exitRamp * vh)
        )
        setBand(q >= 0.5)
        writeVar(q)
    }

    function onScrollOrResize() {
        if (ticking) return
        ticking = true
        requestAnimationFrame(measure)
    }

    // The media query behind `enabled` resolves in ITS onMounted, which may land
    // after ours, and a breakpoint can be crossed without a scroll.
    watch(enabled, onScrollOrResize)

    onMounted(() => {
        // Reduced motion still needs the dark — it is what makes the copy legible
        // — it just should not be a gradient the reader scrubs. A ramp of one
        // pixel is a hard swap without a second code path. The offsets go too:
        // they exist to pace a gradient, and keeping the exit one would hand the
        // page back to white while the copy was still on it.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            enterRamp = 1 / window.innerHeight
            exitRamp = enterRamp
            enterDelay = 0
            exitLead = 0
        }

        measure()
        window.addEventListener('scroll', onScrollOrResize, { passive: true })
        window.addEventListener('resize', onScrollOrResize)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', onScrollOrResize)
        window.removeEventListener('resize', onScrollOrResize)
        document.documentElement.style.removeProperty('--ea-page-bg')
    })

    return { active }
}
