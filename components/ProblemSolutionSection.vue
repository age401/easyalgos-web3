<script setup lang="ts">
// "The problem" -> "The solution", on one pinned stage.
//
// The choreography, in one place so it is readable as a whole:
//   1. The section is under four viewports tall and its inner stage is `position:
//      sticky; height: 100vh`. Scrolling therefore carries the cluster up until
//      it is centred in the viewport and then HOLDS it there while the page keeps
//      moving — no JS, no fixed positioning, nothing that can desync.
//   2. During that hold the first text group has already entered (its own
//      scroll-reveal fires as the section arrives).
//   3. The cloud draws into its own centre — a single shader uniform — and a
//      violet core condenses out of it as it goes. Halfway through that collapse
//      the first text group starts to fade, cleared by the thing it was
//      describing while that thing is still visibly moving.
//   4. The star map takes over that core in ONE move: the rings bloom outward
//      while the core simultaneously swells, darkens, and resolves the mark
//      inside itself — the second text group arriving mid-move — and the
//      orbiting dots light up on the frame that lands.
//   5. A last transformation to a white badge, and then the stage RELEASES: the
//      reader gets their scrolling back and the white line grows to the foot of
//      the section on ordinary page scroll, while the page washes back to white
//      underneath it so line and background meet as one colour.
//
// The running order and its scroll budget live in `usePinnedProgress` (see ACT
// there — one table, everything downstream is derived from it). The star map's
// own keyframes live in `StarMap.vue`, transcribed from Figma. This component
// only wires the two together.
//
// The page background is the other moving part: the section paints nothing, and
// `usePageTint` carries the DOCUMENT background between white and the dark as the
// section arrives and leaves. That is why the dark has no hard edge.
//
// The section has TWO behaviours, and which one it plays turns on whether there
// is room for a pinned stage — see utils/breakpoints.ts for where that line is
// drawn and why it is an area rather than a width.
//
//   pinned   what is described above. The reader scrubs the whole piece.
//   stacked  the cluster sits above the copy, and the same piece — collapse, star
//            map, AND the copy handover — plays ONCE on arrival off a clock
//            instead of off the scroll (`useTimedSequence`), stopping on its best
//            frame. Nothing is pinned and no scrolling is taken from the reader.
//            The stage is IDLE until it starts — grains and cards both — so the
//            reader is not given something already in motion to catch up with, and
//            a playback control under the copy hands the piece back afterwards.
//
// Almost all of it is common to the two. The star map cannot tell which one is
// driving `t`, and the copy groups cannot tell what moved `phase`; only the clock
// differs. The single thing the stacked layout drops is the page tint, which needs
// several viewports to fade across and would otherwise leave the page mid-grey
// under white copy for most of the section — so there the section paints its own
// dark, flat, and is a viewport tall at minimum so the piece has room to play in.
const sectionRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)

const isPinned = useMediaQuery(PINNED_MEDIA)
const isStacked = computed(() => !isPinned.value)

const { phase: scrollPhase, converge, starMapTime } = usePinnedProgress(sectionRef, isPinned)
// Armed on the COPY, and on its full arrival: nothing moves until the sentence the
// movement illustrates can actually be read. The cluster is directly above it and
// the section is at least a viewport tall, so by then the stage is on screen too.
const {
    converge: timedConverge,
    starMapTime: timedTime,
    phase: timedPhase,
    playing,
    progress,
    toggle
} = useTimedSequence(copyRef, isStacked)

const clusterConverge = computed(() => (isPinned.value ? converge.value : timedConverge.value))
const mapTime = computed(() => (isPinned.value ? starMapTime.value : timedTime.value))
const phase = computed(() => (isPinned.value ? scrollPhase.value : timedPhase.value))

/** State token for a copy group at `index`, consumed by `.ea-phase[data-state]`.
 *  Lives here rather than in either composable because the two produce the same
 *  `phase` vocabulary and this is where they are merged — one definition, so the
 *  handover cannot mean different things on the two layouts. */
function phaseState(index: number): 'pending' | 'active' | 'past' {
    if (index === phase.value) return 'active'
    // Through the gap both groups are off-stage: the one already read has gone,
    // the one still to come waits below. Any index below the phase has been read
    // — which is what makes the scrolled layout's phase 2 clear them both.
    if (phase.value === -1) return index === 0 ? 'past' : 'pending'
    return index < phase.value ? 'past' : 'pending'
}
const { active: tinted } = usePageTint(sectionRef, [23, 23, 23], isPinned) // Neutral/800

// The cards are "the different places" — see ROLE_CARDS for the geometry and why
// each one is where it is. Collapsing their container toward its own centre pulls
// every one of them inward proportionally — one transform for the whole set — and
// they fade out ahead of the shrink so nobody sees the labels scale down. It reads
// as the scattered ecosystem gathering into the core.
const cardsStyle = computed(() => ({
    transform: `scale(${1 - clusterConverge.value * 0.5})`,
    opacity: String(Math.max(0, 1 - clusterConverge.value * 1.8))
}))

/** Whether the whole stage is holding still: the grains' rotation and the cards'
 *  drift, which are a shader uniform and a CSS animation respectively and so are
 *  stopped in two different places from this one flag.
 *
 *  Only the stacked layout has an idle state to be in. The pinned cluster is alive
 *  from the moment it is on screen because there the reader's own scrolling is the
 *  clock, and a stage that waited for something would be waiting for them. */
const stageIdle = computed(() => isStacked.value && !playing.value)

/** Three states worth naming for a screen reader, since the glyph only draws two:
 *  a control that has run to the end restarts rather than resumes. */
const playLabel = computed(() => {
    if (playing.value) return 'pause'
    return progress.value >= 1 ? 'replay' : 'play'
})

function onConverged() {
    // Hook for the follow-on phase, to be supplied. Intentionally a no-op for now
    // rather than a guess at what should happen next.
}
</script>

<template>
    <!-- `overflow-x: clip` for the stacked cluster, which is deliberately wider
         than the viewport (see below) and would otherwise give the page a
         horizontal scrollbar. `clip` and not `hidden`: hidden makes the element a
         scroll container in the other axis too, which would break the pinned
         layout's sticky stage. -->
    <section
        ref="sectionRef"
        data-dark-band
        class="ea-dark relative pinned:h-[380vh] stacked:overflow-x-clip"
        :class="tinted ? 'bg-transparent' : 'bg-Neutral/800'"
    >
        <!-- A viewport-tall floor on the stacked layout, so the piece always plays
             on a full screen of its own dark rather than in a band the reader can
             see both edges of at once. -->
        <div
            class="ea-pinned__stage flex items-center"
            :class="'stacked:!static stacked:!h-auto stacked:min-h-svh stacked:py-12 tablet:stacked:py-[96px]'"
        >
            <div class="ea-container grid w-full grid-cols-1 items-center gap-10 tablet-wide:grid-cols-[minmax(0,1fr)_540px] tablet-wide:gap-14">
                <!-- Cluster.
                     On a phone the box is drawn 440 square against a 360 screen —
                     Figma 622:2242 — so it runs 40px past each edge and the outer
                     grains are clipped. That is the point: the cloud reads as
                     bigger than the screen rather than as an object sitting inside
                     a margin. `min()` against the viewport keeps the drawn 440 on
                     the drawn 360 and stops widening once there is no more edge to
                     spill over, so a 430pt phone gets the same square rather than a
                     proportionally bigger one. Above `tablet` the composition has
                     room and goes back to fitting the column.

                     Centred with left/translate rather than `mx-auto`, which is
                     what an over-wide box needs: auto margins on an item that does
                     not fit resolve to zero, so the whole 80px of overflow would go
                     off the right-hand edge instead of 40 off each.

                     The last class is for the band that is pinned but still one
                     column — a tablet in portrait, or a short desktop window.
                     There the cluster and the copy have to share ONE viewport
                     rather than sitting side by side, so the square has to be
                     capped against the height as well as the width or it pushes
                     the copy out of the sticky stage. `min()` keeps whichever is
                     the real constraint: 46svh on a 700px-tall window, the flat
                     560px on a tall iPad.
                     `!` because a custom variant sorts ahead of the screen
                     variants, so without it the plain `tablet:` width below wins
                     on source order and the cap silently does nothing. -->
                <div
                    class="relative left-1/2 aspect-square w-[min(440px,calc(100vw+80px))] max-w-none -translate-x-1/2 tablet:left-auto tablet:mx-auto tablet:w-full tablet:max-w-[560px] tablet:translate-x-0 tablet-wide:max-w-[760px] pinned:max-tablet-wide:!max-w-[min(560px,46svh)]"
                >
                    <ParticleCluster
                        :converge="clusterConverge"
                        :paused="stageIdle"
                        @converged="onConverged"
                    >
                        <!-- `--ea-card-spread` pushes every card away from the
                             centre by a common factor (see `.ea-card-anchor`). The
                             stacked box grew but the cards did not, so without it
                             they take up proportionally more of it than they do in
                             the drawn composition and read as clustered.
                             Only 1.06, because the two widest cards — Community and
                             VPS Provider — are also the outermost pair, and much
                             past this their LABELS cross the screen edge. A clipped
                             grain reads as the cloud being bigger than the screen; a
                             clipped word just reads as broken. Most of the extra air
                             comes from the box being 440 rather than 320 wide in the
                             first place, which spreads the same percentages by 37%
                             on its own; this is the last of it. -->
                        <div
                            class="pointer-events-none absolute inset-0 origin-center will-change-transform stacked:[--ea-card-spread:1.06]"
                            :class="{ 'ea-cards--idle': stageIdle }"
                            :style="cardsStyle"
                        >
                            <!-- Two elements per card, and they cannot be one: the
                                 outer anchors the card to its point, the inner
                                 drifts. An animated transform beats an inline one,
                                 so a single element would lose its centring the
                                 moment the drift started — which is exactly what
                                 used to happen. -->
                            <span
                                v-for="card in ROLE_CARDS"
                                :key="card.id"
                                class="ea-card-anchor"
                                :style="{ '--ea-card-x': card.left, '--ea-card-y': card.top }"
                            >
                                <!-- motion-safe, not the global reduced-motion
                                     override: that clamps a running animation to
                                     its first keyframe, which here would park every
                                     card at the 3 o'clock point of its circle,
                                     8.75px off its mark. Not applying it at all
                                     leaves them exactly where Figma puts them. -->
                                <span
                                    class="ea-chip motion-safe:animate-eaOrbit"
                                    :style="{ animationDelay: card.delay }"
                                >
                                    <span class="ea-chip__bubble">
                                        <svg
                                            class="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="1.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path v-for="(d, i) in card.icon" :key="i" :d="d" />
                                        </svg>
                                    </span>
                                    <span :class="card.color">{{ $t(`roles.${card.id}`) }}</span>
                                </span>
                            </span>
                        </div>
                    </ParticleCluster>

                    <!-- Shares the cluster's box, and therefore its centre: the
                         rings bloom out of exactly the point the cloud collapsed
                         into. Plays on both layouts — `mapTime` is the scroll on
                         one and a clock on the other, and this cannot tell. -->
                    <StarMap :t="mapTime" :converge="clusterConverge" />
                </div>

                <!-- Copy. Both groups occupy the same grid cell so the swap has no
                     effect on layout; on the stacked layout they fall back to
                     normal flow and both read in order. -->
                <!-- Both groups share ONE grid cell on both layouts, so the swap
                     never moves anything: the row is sized by the taller of the
                     two and the shorter one simply has room to spare. The stacked
                     layout used to read them in sequence instead; it now plays the
                     same handover, driven by the timed sequence rather than by
                     scroll. -->
                <div ref="copyRef">
                    <div class="relative grid pinned:min-h-[280px]">
                        <div class="ea-phase col-start-1 row-start-1" :data-state="phaseState(0)">
                            <SectionHeading :eyebrow="$t('problem.eyebrow')" invert>
                                <template #title>
                                    {{ $t('problem.titleLine1') }}<br />{{ $t('problem.titleLine2') }}<br />
                                    <span class="ea-grad ea-grad--dark">{{ $t('problem.titleAccent') }}</span>.
                                </template>
                            </SectionHeading>
                        </div>

                        <div class="ea-phase col-start-1 row-start-1" :data-state="phaseState(1)">
                            <SectionHeading :eyebrow="$t('solution.eyebrow')" invert>
                                <template #title>
                                    {{ $t('solution.titleLine1') }}<br />
                                    <span class="ea-grad ea-grad--dark">{{ $t('solution.titleAccent') }}</span>.
                                </template>
                            </SectionHeading>
                        </div>
                    </div>

                    <!-- Below BOTH groups rather than inside the first one, where
                         Figma draws it: the groups cross-fade, and a control that
                         left with the problem copy would be gone at exactly the
                         moment there is something to replay. 24px under the heading,
                         which is the drawn gap.
                         Hidden on the pinned layout — `hidden`, not `v-if`, so the
                         markup does not depend on a media query that resolves a
                         frame after hydration — because there the reader's own
                         scrolling is the transport and a second one would fight it.
                         `display: none` also takes it out of the tab order, so the
                         control cannot be reached where it would do nothing. -->
                    <div class="mt-6 pinned:hidden">
                        <PlaybackControl
                            :playing="playing"
                            :progress="progress"
                            :label="$t(`problem.${playLabel}`)"
                            @click="toggle"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
