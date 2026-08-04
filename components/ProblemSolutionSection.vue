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
//
// Almost all of it is common to the two. The star map cannot tell which one is
// driving `t`, and the copy groups cannot tell what moved `phase`; only the clock
// differs. The single thing the stacked layout drops is the page tint, which needs
// several viewports to fade across and would otherwise leave the page mid-grey
// under white copy for most of the section — so there the section paints its own
// dark instead.
const sectionRef = ref<HTMLElement | null>(null)
const clusterRef = ref<HTMLElement | null>(null)

const isPinned = useMediaQuery(PINNED_MEDIA)
const isStacked = computed(() => !isPinned.value)

const { phase: scrollPhase, converge, starMapTime } = usePinnedProgress(sectionRef, isPinned)
// Armed on the cluster rather than the section: the trigger should track the
// thing that animates, not a box that on this layout is mostly copy.
const {
    converge: timedConverge,
    starMapTime: timedTime,
    phase: timedPhase
} = useTimedSequence(clusterRef, isStacked)

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

function onConverged() {
    // Hook for the follow-on phase, to be supplied. Intentionally a no-op for now
    // rather than a guess at what should happen next.
}
</script>

<template>
    <section
        ref="sectionRef"
        data-dark-band
        class="ea-dark relative pinned:h-[380vh]"
        :class="tinted ? 'bg-transparent' : 'bg-Neutral/800'"
    >
        <div
            class="ea-pinned__stage flex items-center"
            :class="'stacked:!static stacked:!h-auto stacked:py-[72px] tablet:stacked:py-[96px]'"
        >
            <div class="ea-container grid w-full grid-cols-1 items-center gap-10 tablet-wide:grid-cols-[minmax(0,1fr)_540px] tablet-wide:gap-14">
                <!-- Cluster.
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
                    ref="clusterRef"
                    class="relative mx-auto aspect-square w-full max-w-[420px] tablet:max-w-[560px] tablet-wide:max-w-[760px] pinned:max-tablet-wide:!max-w-[min(560px,46svh)]"
                >
                    <ParticleCluster :converge="clusterConverge" @converged="onConverged">
                        <div
                            class="pointer-events-none absolute inset-0 origin-center will-change-transform"
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
                                :style="{ left: `${card.left}%`, top: `${card.top}%` }"
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
            </div>
        </div>
    </section>
</template>
