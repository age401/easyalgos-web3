import type { Ref } from 'vue'

/** Click-and-pull scrolling for a horizontal scroller.
 *
 *  MOUSE ONLY, deliberately. Touch and trackpad already scroll these natively,
 *  with momentum, rubber-banding and snapping mid-fling that a JS reimplementation
 *  does not match — intercepting them would make the good case worse. A mouse is
 *  the one pointer that gets nothing for free, so it is the one handled here.
 *
 *  Two things must be switched off while the button is down:
 *    - `scroll-snap-type`, or mandatory snapping fights every scrollLeft write and
 *      the row judders instead of tracking the pointer.
 *    - `scroll-behavior: smooth`, which these scrollers set in CSS. Without this
 *      every write ANIMATES toward its target and the row lags behind the cursor.
 *  Both come off together via an `is-dragging` class; dropping it on release lets
 *  mandatory snap re-engage and settle the row on the nearest card, which is the
 *  lock-in a reader expects at the end of a drag.
 *
 *  The class is toggled through classList rather than a reactive binding on
 *  purpose: Vue flushes a ref to the DOM on nextTick, so a bound class would
 *  still have snapping on for the first few pointermove events of every gesture.
 */
export function useDragScroll(el: Ref<HTMLElement | null>) {
    /** Furthest the pointer travelled this gesture, px. Read by the click guard. */
    let travelled = 0
    let startX = 0
    let startScroll = 0
    /** Button is down, but this may still turn out to be a click. */
    let armed = false
    /** Set only once the gesture is definitely a drag. See below. */
    let captured: number | null = null

    /** Past this the gesture counts as a drag: capture engages, the row starts
     *  following the pointer, and the click it ends with is swallowed. Under it
     *  nothing happens at all, so an ordinary click is untouched. */
    const CLICK_SLOP = 6

    function onPointerDown(e: PointerEvent) {
        const node = el.value
        if (!node || e.pointerType !== 'mouse' || e.button !== 0) return
        travelled = 0
        startX = e.clientX
        startScroll = node.scrollLeft
        armed = true
    }

    function onPointerMove(e: PointerEvent) {
        const node = el.value
        if (!node || !armed) return
        const dx = e.clientX - startX
        travelled = Math.max(travelled, Math.abs(dx))

        // Below the slop this does NOTHING — no capture, no scroll, no class.
        // That matters more than it looks: capturing the pointer retargets the
        // click that follows to the capturing element, so capturing eagerly on
        // pointerdown means a card's link never receives its own click and the
        // "Read full review" affordance is simply dead. Capture is therefore
        // deferred until the gesture has proved itself a drag, by which point
        // swallowing the click is what we want anyway.
        if (travelled <= CLICK_SLOP) return

        if (captured === null) {
            captured = e.pointerId
            node.setPointerCapture(e.pointerId)
            // Synchronous, so snapping and smooth scrolling are already off for
            // the very first scrollLeft write below.
            node.classList.add('is-dragging')
        }
        node.scrollLeft = startScroll - dx
    }

    function onPointerUp(e: PointerEvent) {
        const node = el.value
        armed = false
        if (!node || captured === null) return
        if (e.pointerId !== captured) return
        if (node.hasPointerCapture(captured)) node.releasePointerCapture(captured)
        captured = null
        node.classList.remove('is-dragging')
    }

    /** Bind with `@click.capture` so it runs before any link inside the row. */
    function onClickCapture(e: MouseEvent) {
        if (travelled <= CLICK_SLOP) return
        e.preventDefault()
        e.stopPropagation()
    }

    /** Re-base the drag by `delta` px.
     *
     *  A looping strip teleports the scroll by a whole set to fake infinity. If
     *  that happens mid-drag, this arithmetic's `startScroll` refers to a
     *  position that no longer means what it did, and the next pointermove
     *  yanks the row back across the seam. Shifting the baseline by the same
     *  amount makes the teleport invisible to the drag. */
    function shiftBaseline(delta: number) {
        startScroll += delta
    }

    return { onPointerDown, onPointerMove, onPointerUp, onClickCapture, shiftBaseline }
}
