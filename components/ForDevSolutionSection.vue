<script setup lang="ts">
// "module - The Solution" (Figma 3199:8780, restaged in 3237:8038) on the
// EASYALGOS FOR DEVELOPERS page — frame 3191:11677, the route /for-developers.
//
// Not to be confused with the Developer landing page (/developer, frame
// 3157:7222), which is a different page for a different reader: that one sells one
// named developer's EAs to TRADERS ("Get X's Expert Advisors, without paying for
// them"), this one recruits EA DEVELOPERS ("Build Expert Advisors once. Earn
// recurring revenues for life."). They share the topbar, the closing banner and
// the footer, and nothing else — the heroes are unrelated designs. Hence the
// `forDev*` prefix on this page's components and i18n keys, against the `dev*` of
// the other: the two were mixed together once already.
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
//   2. The stage PINS. A tall wrapper around a `position: sticky; height: 100vh`
//      stage carries the globe and the copy up until they are centred in the
//      viewport and then holds them there while the page keeps moving. No JS, no
//      fixed positioning, nothing that can desync.
//   3. FOUR copy groups then arrive and leave in the right-hand column, one at a
//      time, with a gap between each where the globe is alone. The first of them
//      is the module's own heading — 3237:8038 draws it there, in the column,
//      rather than above the stage, so the module introduces itself from inside
//      the composition and the globe is beside the reader from the first frame.
//      See PHRASES for the act table.
//   4. The globe's wave is TRIGGERED, and this is the one thing the scroll does
//      not drive. It fires the instant the stage comes to rest — the moment the
//      first group stops moving under the reader — and then plays out on its own
//      clock. Scrolling back up above the stage re-arms it, so coming down again
//      plays it again; the module is not something the reader gets one shot at.
//      See `armed` and REARM_ABOVE below, and the header of SolutionGlobe.vue for
//      why a wave cannot be a scrub.
//   5. The last group clears before the end, and the globe goes with it, so the
//      stage RELEASES empty: the reader gets their scrolling back, and the page
//      then washes to white over flat dark with nothing on it. The globe's
//      departure is not decoration — see EXIT_FROM in SolutionGlobe.vue for what
//      it is avoiding.
//
// The module is 560vh (a viewport of stage plus 460 of travel, so each group
// owns roughly a viewport of scrolling), and the stage is a full viewport tall.
//
// It pins at EVERY size — Diego's call on 2026-09-25, against the home page's
// problem/solution section, which still stacks below the PINNED_MEDIA line in
// utils/breakpoints.ts. That line (and the `pinned:`/`stacked:` variants built
// from it) therefore means nothing here; this module used to share it and lay
// its groups out as a list on phones. What changes with width is the
// composition, not the behaviour:
//
//   two columns (1024 up)  globe left, copy right — 3237:8038.
//   one column             copy on top, globe under it — the phone frame
//                          3404:13278 (360 wide: 48/20 padding, 40 between the
//                          lead and a 320x177 graphic, i.e. the 1.81 frame).
//
// Only reduced motion unpins it; main.css turns the stage static there and
// shows every group as a list.
import type { PhaseWindow } from '~/composables/usePinnedPhases'

const sectionRef = ref<HTMLElement | null>(null)
const travelRef = ref<HTMLElement | null>(null)

/** Always true now (see the header). Kept as a ref rather than deleted so every
 *  consumer below — the tint, the wave, the loop — still reads one switch, and
 *  a future breakpoint guard is one line. */
const isPinned = ref(true)

/** The act table: when each copy group is on stage, as fractions of the held
 *  stretch. Read it as the running order — it is the only place the timing lives,
 *  and everything downstream is derived from it.
 *
 *  Index 0 is the module heading, which is why it is the longest window: it is an
 *  eyebrow, a four-line statement and a lead against the phrases' one sentence
 *  each. It opens at 0 so the reader arrives with it already on stage and rides it
 *  up into the pin, which is what makes the stage coming to rest read as the
 *  module settling rather than as a jump.
 *
 *  The last closes at 0.94 rather than 1 so the release lands on the globe alone
 *  rather than on a sentence being pulled out from under the reader. The 0.06 gaps
 *  between groups are the width of the `.ea-phase` cross-fade at a normal scroll
 *  speed, so one group has finished leaving as the next begins to arrive. */
const PHRASES: readonly PhaseWindow[] = [
    [0, 0.22],
    [0.28, 0.46],
    [0.52, 0.7],
    [0.76, 0.94]
]

const { progress, unclamped, reduced } = usePinnedPhases(travelRef, isPinned)

/** How far back above the stage the reader has to go before the wave re-arms, as
 *  a fraction of the held stretch — about a quarter of a viewport at the drawn
 *  proportions.
 *
 *  Not zero, and that is the whole reason this is a band rather than a line. The
 *  wave fires the instant the stage comes to rest, and "at rest" is a single
 *  scroll position: read the reset off the same position and a reader who parks
 *  on it, or whose momentum settles across it, restarts the wave with every pixel
 *  of jitter. Leaving by a quarter of a screen is a decision. */
const REARM_ABOVE = 0.06

/** The moment the wave is waiting for: the stage has stopped moving. And, when it
 *  goes false, the reader has gone back up far enough to deserve it again.
 *
 *  Both ends read `unclamped` rather than `progress`, because `progress` is 0 for
 *  everything at or above the pin and so cannot tell the two apart. Above the
 *  stage it goes negative, in the same units, which is exactly the measurement the
 *  band needs. */
const armed = ref(false)
watch(unclamped, (u) => {
    if (!isPinned.value) return
    if (u > 0) armed.value = true
    else if (u < -REARM_ABOVE) armed.value = false
})

/** How long the front takes to cross, wall time. Long enough that the reader
 *  watches it happen while the heading is on stage, short enough to be over well
 *  before the first phrase arrives — and short enough that replaying it on the way
 *  back down is a flourish rather than a wait.
 *
 *  1764 is 2100 cut 30% and then given 20% of that back, both Diego's calls on
 *  the drawn thing. Note that the globe's trail is measured in fractions of the
 *  crossing rather than in ms, so it stretches and shrinks with this rather than
 *  smearing — see TRAIL_LAG in SolutionGlobe.vue. The ambient breathing is NOT on
 *  this clock and is untouched: it is the field's resting state, not the wave. */
const WAKE_MS = 1764

const { progress: wake } = useTriggeredRun(armed, WAKE_MS)

/** What the globe is given.
 *
 *  Where there is no held stretch — reduced motion — there
 *  is also no moment to trigger on and no scrub to leave on, so the field is
 *  simply lit and staying: the wave resolved, the departure nowhere near. A
 *  graphic parked at its FIRST frame would be a dormant Tinted/900 ghost above
 *  live copy. */
const globeWake = computed(() => (isPinned.value && !reduced.value ? wake.value : 1))
const globeT = computed(() => (isPinned.value && !reduced.value ? progress.value : 0))

/** And the loop the globe is in, which is the one thing here keyed to a GROUP
 *  rather than to the run.
 *
 *  Figma draws the graphic once per group and each state adds to the one before:
 *  lights climbing off the map (3237:11532), a trade card on the end of each climb
 *  (3240:18444), then a profit route home from every card (3240:21900). Each is
 *  the argument its group's copy makes — traders arrive, they trade, you are paid
 *  — so the graphic changes state on exactly the beat the sentence does, and
 *  `phraseState` already answers that question for the copy. Reading the same
 *  answer here is what keeps the two from drifting apart.
 *
 *  The heading gets none of it: the wave is still crossing then, and it is the
 *  only thing that should be.
 *
 *  (`!isPinned` gets the fullest state, since unpinned the groups would simply be
 *  on the page; nothing takes that branch today, see the header.) Reduced motion is the one place the loop is refused outright: a loop with no end
 *  is the exact thing that mode is asking not to be given, and unlike the wave it
 *  has no resolved end state to sit at. */
const globeLoop = computed(() => {
    if (reduced.value) return 'off'
    if (!isPinned.value) return 'payouts'
    if (phraseState(1) === 'active') return 'lights'
    if (phraseState(2) === 'active') return 'trades'
    if (phraseState(3) === 'active') return 'payouts'
    return 'off'
})

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
         as the home page's section, for the same reason.

         No `ea-section` here, and that is deliberate rather than an omission.
         That class is the site's standard 72-192px of top and bottom air, and it
         is air a module like this cannot use: the stage is centred in a viewport
         it fills, so on the pinned layout the padding only pushed the pin down
         the page by that much (and made the section's box and the travel's two
         different distances for no gain). `min-h-svh` in its place is the floor the module
         needs whatever the layout: a viewport, never less. `svh` rather than `vh`
         so a phone's collapsing URL bar cannot make it briefly overflow. -->
    <section
        ref="sectionRef"
        data-dark-band
        data-dark-page="off"
        class="ea-dark relative min-h-svh"
        :class="tinted ? 'bg-transparent' : 'bg-Neutral/800'"
    >
        <!-- The travel. Its height less one viewport IS the held stretch, which is
             what `usePinnedPhases` measures — and with the heading now inside the
             stage AND no section padding around it, the section's box and the
             travel are the same distance: the pin begins exactly where the module
             begins. The two stay separate elements because they answer different
             questions — this one owns the scroll budget, the section owns the
             dark band and the `min-h-svh` floor — and because the height each
             wants differs under reduced motion.

             `motion-reduce:!h-auto` collapses it: in that mode main.css unpins the
             stage and the composable never attaches a listener, so every viewport
             of this would be empty space the reader scrolls through for nothing.
             `!` so it beats the plain height whatever the stylesheet order. -->
        <div ref="travelRef" class="h-[560vh] motion-reduce:!h-auto">
            <div
                class="ea-pinned__stage flex items-center py-12 tablet-wide:py-0"
            >
                <!-- py-12 is the phone frame's 48 top and bottom; it keeps the copy
                     off the header and the globe off the fold on a short screen.
                     The two-column stage centres in its viewport with room to
                     spare, so it needs none. -->
                <!-- 760 of globe, 60 of gap, 540 of copy — the drawn 1360 column.
                     One column below 1024, where the copy would be too narrow to
                     hold a 48px line. -->
                <div
                    class="ea-container grid w-full grid-cols-1 items-center gap-10
                           tablet-wide:grid-cols-[minmax(0,1fr)_540px] tablet-wide:gap-[60px]"
                >
                    <!-- `--globe-frame` is the aspect of the animation frame, and
                         it is the section's call rather than the graphic's. Figma
                         draws it as a 760 square holding a field only 260 tall:
                         the air is the headroom the motion is authored into, so it
                         is kept wherever there is room for it. In one column there
                         is not — a square would push the copy out of a sticky
                         stage — so it flattens to 760x420 and the field keeps its
                         size and loses only air. 1.81 IS 760/420, written as a
                         number because that is what `aspect-ratio` wants.

                         `order-2` below tablet-wide puts the globe UNDER the copy, as
                         the phone frame 3404:13278 draws it: the module opens on its
                         heading rather than on an unexplained dot map. Every
                         single-column width follows the phone frame — the tablet
                         band used to keep the globe on top, but it has no frame of
                         its own and two orders a few pixels apart read as a bug.

                         The `max-tablet-wide:` cap sizes the globe by viewport
                         HEIGHT in one column, so heading + globe always fit the
                         sticky stage. `!` because the max-* variant sorts ahead of
                         the plain `max-w-[760px]`, which would otherwise win on
                         source order.

                         On a phone (the `max-tablet:` group) the MAP, not just its
                         box, runs out to 8px off each screen edge — Diego's call,
                         it read too small inside the 320 column the phone frame
                         gives it. Two layers of side air go: the page's 20px
                         gutters, and the frame's own. The field is 654.67 of the
                         drawn 760 (0.8614), with the rest as air either side, so
                         the box is sized to (column + 2x12px) / 0.8614 and that
                         air overhangs the screen, where the page's overflow-x-clip
                         cuts it. About 30% larger than the column-width map.
                         The item is wider than its grid track and
                         `justify-self-center` centres it (a grid centres an
                         overflowing item), so the copy above keeps its gutters.
                         The height cap loosens to 60svh there: on a 640-tall phone
                         it binds first and keeps heading + globe inside the stage. -->
                    <SolutionGlobe
                        :wake="globeWake"
                        :t="globeT"
                        :loop="globeLoop"
                        class="order-2 mx-auto w-full max-w-[760px] [--globe-frame:1.81]
                               tablet-wide:order-1 tablet-wide:mx-0 tablet-wide:[--globe-frame:1]
                               max-tablet-wide:!max-w-[min(560px,52svh)]
                               max-tablet:!mx-0 max-tablet:w-[calc((100%+24px)/0.8614)] max-tablet:justify-self-center
                               max-tablet:!max-w-[min(calc((100%+24px)/0.8614),60svh)]"
                    />

                    <!-- The copy. All four groups occupy the SAME grid cell, so the
                         handover cannot move anything: the row is sized by the
                         tallest — the heading — and the shorter ones simply have
                         room to spare. That is also what keeps the globe still
                         under the copy on a phone. Under reduced motion main.css
                         gives each group a row of its own and shows them all. -->
                    <div class="relative order-1 grid tablet-wide:order-2 tablet-wide:min-h-[424px]">
                        <!-- Group 1 of 4: the module heading — the Figma "Intro"
                             frame (3237:11519), which is the "Module Heading"
                             component (3109:7069) restaged into the column. Built
                             from the semantic display styles so it follows the
                             scale rather than picking sizes: 48/60/-2 at the drawn
                             1920, stepping down to 28 on a phone. The heading and
                             the lead carry `!` on their colour because those type
                             tokens bake in their ink (Tinted/950, Tinted/800) via
                             @apply, and a plain colour utility is the same
                             specificity — so which of the two won would depend on
                             stylesheet order.

                             No `v-reveal` here, unlike when this block sat above
                             the stage: its entrance is the phase cross-fade now,
                             and two mechanisms writing opacity and transform on one
                             element is one too many. -->
                        <div
                            class="ea-phase col-start-1 row-start-1"
                            :data-state="phraseState(0)"
                        >
                            <p class="ea-eyebrow ea-eyebrow--invert">{{ $t('forDevSolution.eyebrow') }}</p>

                            <h2 class="ea-module-heading mt-6 !text-white">
                                {{ $t('forDevSolution.titleLine1') }}
                                <span class="ea-grad ea-grad--dark">{{
                                    $t('forDevSolution.titleAccent')
                                }}</span
                                ><br class="hidden tablet-wide:inline" />
                                {{ $t('forDevSolution.titleLine2') }}
                            </h2>

                            <!-- 640px is the drawn cap, and `max-w-full` under it
                                 so the cap never wins on a viewport where the
                                 column is already tighter. -->
                            <p class="ea-module-description mt-6 max-w-[640px] !text-Neutral/200">
                                {{ $t('forDevSolution.lead') }}
                            </p>
                        </div>

                        <!-- Groups 2-4: the phrases (Figma 3237:11532, 3240:18444,
                             3240:21900 — a heading, its accent line and a lead).

                             The accent is a BLOCK, which is how Figma draws it: the
                             statement wraps inside the column and the gradient run
                             then takes a line of its own ("Heading 1" holds the
                             text, then a separate "Line" frame holds "for free"). A
                             line break in the string would do the same thing for
                             one phrase in one language; this does it for any length
                             in any of the four, and the gradient still anchors to
                             the run's own box, which is what `.ea-grad` is for.

                             The lead under it is the same element as the module
                             heading's, down to the 24px above it (Figma puts that
                             gap on the heading block as padding rather than on the
                             lead as a margin; `mt-6` is the same 24 and matches
                             what group 1 already does). Same type token, so all
                             four groups speak in the same two voices. -->
                        <div
                            v-for="n in 3"
                            :key="n"
                            class="ea-phase col-start-1 row-start-1"
                            :data-state="phraseState(n)"
                        >
                            <p class="ea-module-heading !text-white">
                                {{ $t(`forDevSolution.phrase${n}`) }}
                                <span class="ea-grad ea-grad--dark block">{{
                                    $t(`forDevSolution.phrase${n}Accent`)
                                }}</span>
                            </p>

                            <p class="ea-module-description mt-6 max-w-[640px] !text-Neutral/200">
                                {{ $t(`forDevSolution.phrase${n}Lead`) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
