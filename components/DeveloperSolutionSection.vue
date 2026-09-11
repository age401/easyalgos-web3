<script setup lang="ts">
// "module - The Solution" on the developer landing page — Figma 3199:8780.
//
// The same piece of choreography as the home page's problem/solution section, and
// deliberately so: Diego asked for that section's criteria applied here. What that
// means, in order:
//
//   1. The page DARKENS as the module arrives. The section paints nothing of its
//      own past the first frame; `usePageTint` carries the DOCUMENT background
//      between white and Neutral/800, so the dark arrives as a property of the
//      page rather than as a rectangle sliding into view, and it has no hard edge
//      at either end.
//   2. The module opens with its heading, which scrolls in and away like ordinary
//      copy — the reader is told what the module is about before anything is
//      taken from them.
//   3. Then the stage PINS. A tall wrapper around a `position: sticky; height:
//      100vh` stage carries the globe and the phrase up until they are centred in
//      the viewport and then holds them there while the page keeps moving. No JS,
//      no fixed positioning, nothing that can desync.
//   4. During that hold the globe animates continuously while THREE phrase groups
//      arrive and leave, one at a time, with a gap between each where the globe is
//      alone. See PHRASES for the act table.
//   5. The last group clears before the end, and the globe goes with it, so the
//      stage RELEASES empty: the reader gets their scrolling back, and the page
//      then washes to white over flat dark with nothing on it. The globe's
//      departure is not decoration — see EXIT_FROM in SolutionGlobe.vue for what
//      it is avoiding.
//
// The module is 440vh on the pinned layout (a viewport of stage plus 340 of
// travel, so each phrase group owns roughly a viewport of scrolling) and at least
// a viewport tall on every layout.
//
// TWO behaviours, on the same line the home page draws it — see
// utils/breakpoints.ts for why that line is an area rather than a width:
//
//   pinned   what is described above.
//   stacked  nothing is pinned and nothing is taken. The globe sits above the
//            copy, lit and breathing, and the three phrases read as a list. The
//            handover is a scroll flourish that needs several viewports of travel
//            to play; on a phone that travel is exactly what the reader does not
//            want to spend, and three cross-fading phrases they cannot pace
//            themselves is worse than three they can read. The page tint stands
//            down there too (a ramp needs viewports to fade across) and the
//            section paints its own dark instead.
import type { PhaseWindow } from '~/composables/usePinnedPhases'

const sectionRef = ref<HTMLElement | null>(null)
const travelRef = ref<HTMLElement | null>(null)

const isPinned = useMediaQuery(PINNED_MEDIA)

/** The act table: when each phrase group is on stage, as fractions of the held
 *  stretch. Read it as the running order — it is the only place the timing lives,
 *  and everything downstream is derived from it.
 *
 *  The first opens at 0 so the reader arrives with copy already on stage (its own
 *  scroll-reveal plays the entrance, as the module is still climbing). The last
 *  closes at 0.94 rather than 1 so the release lands on the globe alone rather
 *  than on a sentence being pulled out from under the reader. The ~0.08 gaps
 *  between groups are the width of the `.ea-phase` cross-fade at a normal scroll
 *  speed, so one group has finished leaving as the next begins to arrive. */
const PHRASES: readonly PhaseWindow[] = [
    [0, 0.28],
    [0.36, 0.62],
    [0.7, 0.94]
]

const { progress, reduced } = usePinnedPhases(travelRef, isPinned)

/** The frame the globe rests on where nothing is scrubbing it.
 *
 *  NOT the end of its timeline: past 0.94 the field leaves, so that the stage
 *  releases empty and the page's wash back to white has nothing on it to spoil
 *  (see EXIT_FROM in SolutionGlobe.vue — the same instant named from the other
 *  side). Resting there would hand the stacked layout an empty box. This is the
 *  frame where the field is fully lit and has not begun to go. */
const RESOLVED_T = 0.92

/** What the globe is given — the scrub where there is one, the resting frame
 *  where there is not, and there are two of the latter.
 *
 *  On the stacked layout nothing is scrubbing (no sticky stage, so no held
 *  stretch) and a graphic parked at its FIRST frame would be a dormant grey map
 *  above live copy. Under reduced motion the scrub resolves to 1 instead — which
 *  is right for the copy, whose groups are all shown at once there, but for the
 *  field 1 means GONE, since its last act is to leave. Both cases want the frame
 *  where it is simply lit. */
const globeT = computed(() => (isPinned.value && !reduced.value ? progress.value : RESOLVED_T))

function phraseState(index: number) {
    return phaseStateAt(PHRASES[index], progress.value)
}

const { active: tinted } = usePageTint(sectionRef, [23, 23, 23], isPinned) // Neutral/800
</script>

<template>
    <!-- `data-dark-page="off"`: the page background here is the TINT's business
         and nobody else's. Left in, `useDarkBand` would write the same custom
         property as a flat dark for as long as this band is behind the header —
         two mechanisms on one property, agreeing only by luck, and the one with
         no ramp is the one that shows when they disagree. The header still
         inverts, which is what `data-dark-band` itself is for. Same arrangement
         as the home page's section, for the same reason. -->
    <section
        ref="sectionRef"
        data-dark-band
        data-dark-page="off"
        class="ea-dark ea-section relative"
        :class="tinted ? 'bg-transparent' : 'bg-Neutral/800'"
    >
        <!-- Module heading — the Figma "Module Heading" component (3109:7069),
             built from the semantic display styles so it follows the scale rather
             than picking sizes: 48/60/-2 at the drawn 1920, stepping down to 28 on
             a phone. The heading and the lead carry `!` on their colour because
             those type tokens bake in their ink (Tinted/950, Tinted/800) via
             @apply, and a plain colour utility is the same specificity — so which
             of the two won would depend on stylesheet order.

             Bottom padding is the drawn 119 (64 inside the heading component plus
             the 55 to the stage), which `.ea-section--tight` already is. -->
        <div class="ea-container ea-section--tight">
            <p v-reveal class="ea-eyebrow ea-eyebrow--invert">{{ $t('devSolution.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-module-heading mt-6 !text-white">
                {{ $t('devSolution.titleLine1') }}
                <span class="ea-grad ea-grad--dark">{{ $t('devSolution.titleAccent') }}</span><br />
                {{ $t('devSolution.titleLine2') }}
            </h2>

            <!-- 640px is the drawn cap, and `max-w-full` under it so the cap never
                 wins on a viewport where the container is already tighter. -->
            <p v-reveal="180" class="ea-module-description mt-6 max-w-[640px] !text-Neutral/200">
                {{ $t('devSolution.lead') }}
            </p>
        </div>

        <!-- The travel. Its height less one viewport IS the held stretch, which is
             what `usePinnedPhases` measures — hence a wrapper of its own rather
             than measuring the section, whose box also contains the heading above
             and the module's own bottom padding.

             `motion-reduce:!h-auto` collapses it: in that mode main.css unpins the
             stage and the composable never attaches a listener, so every viewport
             of this would be empty space the reader scrolls through for nothing.
             `!` to beat the `pinned:` height, which is a size query and still
             applies. -->
        <div ref="travelRef" class="pinned:h-[440vh] motion-reduce:!h-auto">
            <div
                class="ea-pinned__stage flex items-center
                       stacked:!static stacked:!h-auto stacked:min-h-svh stacked:py-12 tablet:stacked:py-[96px]"
            >
                <!-- 760 of globe, 60 of gap, 540 of phrase — the drawn 1360
                     column. One column below 1024, where the phrase would be too
                     narrow to hold a 48px line. -->
                <div
                    class="ea-container grid w-full grid-cols-1 items-center gap-10
                           tablet-wide:grid-cols-[minmax(0,1fr)_540px] tablet-wide:gap-[60px]"
                >
                    <!-- `--globe-frame` is the aspect of the animation frame, and
                         it is the section's call rather than the graphic's. Figma
                         draws it as a 760 square holding a field only 260 tall:
                         the air is the headroom the motion is authored into, so it
                         is kept wherever there is room for it. In one column there
                         is not — a square would push the phrase out of a sticky
                         stage — so it flattens to 760x420 and the field keeps its
                         size and loses only air. 1.81 IS 760/420, written as a
                         number because that is what `aspect-ratio` wants.

                         The last class is the band that is pinned but still one
                         column: a tablet in portrait, or a short desktop window.
                         `!` because a custom variant sorts ahead of the screen
                         variants, so without it the plain `max-w-[760px]` would
                         win on source order and the cap would silently do
                         nothing. -->
                    <SolutionGlobe
                        :t="globeT"
                        class="mx-auto w-full max-w-[760px] [--globe-frame:1.81]
                               tablet-wide:mx-0 tablet-wide:[--globe-frame:1]
                               pinned:max-tablet-wide:!max-w-[min(560px,52svh)]"
                    />

                    <!-- The phrases. All three occupy the SAME grid cell on the
                         pinned layout, so the handover cannot move anything: the
                         row is sized by the tallest and the shorter ones simply
                         have room to spare.

                         On the stacked layout they become a list — the `stacked:`
                         classes on each group take it out of that shared cell and
                         force it visible whatever its state, because there the
                         reader is pacing themselves and all three should read. `!`
                         on each: `.ea-phase[data-state]` in main.css and the
                         `col-start-1`/`row-start-1` utilities are emitted in the
                         same layer as these, so without it the outcome would rest
                         on source order.

                         The accent is a BLOCK, which is how Figma draws it: the
                         statement wraps inside the column and the gradient run
                         then takes a line of its own ("Heading 1" holds the text,
                         then a separate "Line" frame holds "for free"). A line
                         break in the string would do the same thing for one
                         phrase in one language; this does it for any length in
                         any of the four, and the gradient still anchors to the
                         run's own box, which is what `.ea-grad` is for. -->

                    <div class="relative grid stacked:!block stacked:space-y-10 pinned:min-h-[216px]">
                        <div
                            v-for="(window, index) in PHRASES"
                            :key="index"
                            class="ea-phase col-start-1 row-start-1
                                   stacked:!col-auto stacked:!row-auto stacked:!transform-none
                                   stacked:!opacity-100 stacked:!pointer-events-auto"
                            :data-state="phraseState(index)"
                        >
                            <p class="ea-module-heading !text-white">
                                {{ $t(`devSolution.phrase${index + 1}`) }}
                                <span class="ea-grad ea-grad--dark block">{{
                                    $t(`devSolution.phrase${index + 1}Accent`)
                                }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
