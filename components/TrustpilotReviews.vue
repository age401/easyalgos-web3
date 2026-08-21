<script setup lang="ts">
// The Trustpilot review strip. Figma 885:2323 ("Trustpilot"), sitting directly
// under the accolades band.
//
// ------------------------------------------------------------ Navigation ---
// A native snap scroller — endless above `tablet`, finite on mobile — driven
// four ways:
//   touch/trackpad  native, with momentum and snap mid-fling. Untouched.
//   mouse drag      useDragScroll — the one pointer that gets nothing for free.
//   autoplay        one card every 3s, useLoopingCarousel.
//   the bands       jump targets and a position read-out at once.
// Keyboard gets `tabindex="0"` on the region, so arrow keys scroll it.
//
// TABLET AND UP IT LOOPS, and that is what puts the drawing back. Figma places
// the five cards with a symmetric +/-204px bleed, cut off at BOTH edges — a
// composition a finite hand-driven row cannot hold, because at rest it sits at
// scrollLeft 0 with nothing to its left. Repeating the set means there is always
// another card that way, so the strip reads as drawn again. See
// useLoopingCarousel for how the seam is hidden; the short version is that the
// set is rendered three times and the scroll is moved by exactly one set width,
// instantly, whenever it drifts out of the middle copy.
//
// MOBILE IS FINITE: five cards, a real start and a real end. The switch is made
// by hiding the duplicate copies in CSS, not by a media query in script — this
// project's useMediaQuery resolves only after the first client render, so it may
// gate behaviour but never markup. Hiding them is enough on its own: measurement
// ignores unrendered children, so one visible copy leaves no set width to
// teleport across and the loop simply is not there. Nothing has to be kept in
// step with the stylesheet.
//
// Only the MIDDLE copy is exposed to assistive tech; it is also the copy that
// stays visible on mobile. The other two are aria-hidden AND inert — the cards
// carry a real link, and a focusable element inside an aria-hidden subtree is a
// trap: reachable by Tab, invisible to the reader who lands on it.
//
// ---------------------------------------------------------------- Autoplay ---
// 3s a card, as asked. Worth knowing that it is short for prose — the longest
// review here runs to four clamped lines, which is more than three seconds of
// reading — so every way of attending to the strip stops it: hover, keyboard
// focus, and a drag or a band press both restart the countdown rather than
// letting it fire a moment later. It also does not run while off-screen, or the
// loop would be spent before the reader ever arrives, and it does not run at all
// under prefers-reduced-motion.
//
// On mobile, where there is an end to reach, autoplay rewinds to the first review
// rather than stopping dead on the fifth. That rewind is a visible slide back —
// which is the honest read-out of a finite strip, and the reason the loop is
// worth having on the wider breakpoints.
//
// ----------------------------------------------------------------- Layout ---
// MOBILE is one review centred with its neighbours peeking in, from
// `scroll-snap-align: center` plus symmetric padding of exactly half the
// leftover width. TABLET AND UP is the drawn row, aligned to the page gutter.
// Both live in `.ea-reviews` in main.css, along with the single `--ea-review-w`
// the cards read so their width is stated once.
//
// The bands are mobile-only, as asked. Above `tablet` several cards are on
// screen at once, so a control claiming ONE of them is current would describe a
// state the reader cannot see; there the peeking next card is the affordance.
//
// No visible heading: the drawing has none, and the strip reads as a
// continuation of "Numbers tell the best story" above it. The h2 is sr-only
// rather than absent so the section keeps its place in the document outline.
//
// No top padding either — the 192px above the cards is the accolades band's own
// bottom padding, so adding any here would double it.

/** Copies rendered. Three is the minimum for a loop that runs both ways. */
const SETS = 3
/** ms per automatic advance. */
const AUTOPLAY_MS = 3000

const scroller = ref<HTMLElement | null>(null)

const drag = useDragScroll(scroller)
const { position, activeIndex, onScroll, goTo, pause, resume, bump } = useLoopingCarousel(scroller, {
    count: () => TRUSTPILOT_REVIEWS.length,
    sets: SETS,
    intervalMs: AUTOPLAY_MS,
    // Keeps a drag in progress from jumping when the loop teleports under it.
    onTeleport: drag.shiftBaseline
})

/** The rendered track: the set repeated, with only the middle copy live. */
const track = computed(() =>
    Array.from({ length: SETS }, (_, copy) =>
        TRUSTPILOT_REVIEWS.map((review) => ({
            review,
            key: `${review.id}-${copy}`,
            live: copy === 1
        }))
    ).flat()
)

/** A press is both the start of a possible drag and a reason to stop the clock. */
function onPointerDown(event: PointerEvent) {
    drag.onPointerDown(event)
    bump()
}
</script>

<template>
    <section class="bg-white pb-[72px] tablet:pb-[96px] tablet-wide:pb-[128px] desktop:pb-[192px]" aria-labelledby="trustpilot-reviews-heading">
        <h2 id="trustpilot-reviews-heading" class="sr-only">{{ $t('trustpilotReviews.srHeading') }}</h2>

        <!-- mouseenter/leave rather than pointerenter/leave: this is the hover
             pause, and it should not be driven by a touch that is really a swipe.
             click.capture has to run before a card's own link, so a drag that
             ends on "Read full review" does not follow it. -->
        <ul
            ref="scroller"
            v-reveal
            class="ea-reviews"
            role="region"
            tabindex="0"
            :aria-label="$t('trustpilotReviews.srHeading')"
            @scroll.passive="onScroll"
            @pointerdown="onPointerDown"
            @pointermove="drag.onPointerMove"
            @pointerup="drag.onPointerUp"
            @pointercancel="drag.onPointerUp"
            @click.capture="drag.onClickCapture"
            @mouseenter="pause"
            @mouseleave="resume"
            @focusin="pause"
            @focusout="resume"
            @touchstart.passive="bump"
            @wheel.passive="bump"
        >
            <!-- The duplicate copies are hidden below `tablet`, and that CSS is
                 the whole of what makes mobile finite: measurement counts only
                 rendered children, so one visible copy means no teleport, no
                 initial jump into the middle, and a rewind at the end. -->
            <li
                v-for="item in track"
                :key="item.key"
                :class="['shrink-0', { 'hidden tablet:block': !item.live }]"
                :aria-hidden="item.live ? undefined : 'true'"
                :inert="!item.live"
            >
                <TrustpilotReviewCard :review="item.review" />
            </li>
        </ul>

        <!-- Sized to roughly the centred card rather than the full column, so the
             control reads as belonging to the review above it and not to the page. -->
        <div class="ea-container mt-10 flex justify-center tablet:hidden">
            <ScrollPositionBands
                class="max-w-[220px]"
                :count="TRUSTPILOT_REVIEWS.length"
                :position="position"
                :active-index="activeIndex"
                :label-for="(n) => $t('trustpilotReviews.goToReview', { n })"
                @select="goTo"
            />
        </div>
    </section>
</template>
