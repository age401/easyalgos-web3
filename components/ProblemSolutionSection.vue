<script setup lang="ts">
// "The problem" -> "The solution", on one pinned stage.
//
// The choreography, in one place so it is readable as a whole:
//   1. The section is nearly five viewports tall and its inner stage is `position:
//      sticky; height: 100vh`. Scrolling therefore carries the cluster up until
//      it is centred in the viewport and then HOLDS it there while the page keeps
//      moving — no JS, no fixed positioning, nothing that can desync.
//   2. During that hold the first text group has already entered (its own
//      scroll-reveal fires as the section arrives).
//   3. The cloud draws into its own centre — a single shader uniform — and a
//      violet core condenses out of it as it goes. With the collapse all but
//      finished the first text group fades out, cleared by the thing it was
//      describing.
//   4. The star map takes over that core: rings bloom out of it and dots orbit
//      them, then the core swells and darkens and the mark resolves inside it,
//      the second text group arriving with it. The rings never move for that —
//      the core does all the work.
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
// Below tablet-wide the stage un-pins (see the CSS overrides at the foot of this
// component's classes and in main.css): the cluster sits above the copy, both
// text groups read in normal flow, the collapse is suppressed so the cloud stays
// whole, and the star map does not play at all. Scroll-jacking a phone is worse
// than the effect is good.
const sectionRef = ref<HTMLElement | null>(null)
const { phaseState, converge, starMapTime } = usePinnedProgress(sectionRef)

// Only the pinned layout has a held stretch to map any of this onto. On the
// stacked layout the cluster simply turns, the star map does not play, and the
// page tint stands down in favour of the section painting its own dark.
const isPinned = useMediaQuery('(min-width: 1024px)')
const clusterConverge = computed(() => (isPinned.value ? converge.value : 0))
const { active: tinted } = usePageTint(sectionRef, [23, 23, 23], isPinned) // Neutral/800

// The chips are "the different places". Collapsing their container toward its own
// centre pulls every one of them inward proportionally — one transform for the
// whole set — and they fade out ahead of the shrink so nobody sees the labels
// scale down. It reads as the scattered ecosystem gathering into the core.
const chipsStyle = computed(() => ({
    transform: `scale(${1 - clusterConverge.value * 0.5})`,
    opacity: String(Math.max(0, 1 - clusterConverge.value * 1.8))
}))

// Positions are percentages of the 760x760 cluster box from the Figma file. The
// two distant roles are drawn smaller, which is what gives the cluster depth —
// so scale is data, not decoration.
const ROLE_CHIPS = [
    { id: 'developer', left: 50.0, top: 28.7, scale: 1, color: 'text-Role/developer', delay: '0s' },
    { id: 'vps', left: 19.9, top: 34.3, scale: 1, color: 'text-Role/vps', delay: '-1.4s' },
    { id: 'trader', left: 31.3, top: 53.3, scale: 1, color: 'text-Role/trader', delay: '-2.6s' },
    { id: 'broker', left: 60.3, top: 69.2, scale: 1, color: 'text-Role/broker', delay: '-3.8s' },
    { id: 'community', left: 68.8, top: 46.2, scale: 0.69, color: 'text-Role/community', delay: '-0.7s' },
    { id: 'analytics', left: 21.1, top: 69.5, scale: 0.56, color: 'text-Role/analytics', delay: '-3.1s' }
] as const

function onConverged() {
    // Hook for the follow-on phase, to be supplied. Intentionally a no-op for now
    // rather than a guess at what should happen next.
}
</script>

<template>
    <section
        ref="sectionRef"
        data-dark-band
        class="ea-dark relative tablet-wide:h-[480vh]"
        :class="tinted ? 'bg-transparent' : 'bg-Neutral/800'"
    >
        <div
            class="ea-pinned__stage flex items-center"
            :class="'max-tablet-wide:!static max-tablet-wide:!h-auto max-tablet-wide:py-[72px] tablet:max-tablet-wide:py-[96px]'"
        >
            <div class="ea-container grid w-full grid-cols-1 items-center gap-10 tablet-wide:grid-cols-[minmax(0,1fr)_540px] tablet-wide:gap-14">
                <!-- Cluster -->
                <div class="relative mx-auto aspect-square w-full max-w-[420px] tablet:max-w-[560px] tablet-wide:max-w-[760px]">
                    <ParticleCluster :converge="clusterConverge" @converged="onConverged">
                        <div
                            class="pointer-events-none absolute inset-0 origin-center will-change-transform"
                            :style="chipsStyle"
                        >
                            <span
                                v-for="chip in ROLE_CHIPS"
                                :key="chip.id"
                                class="ea-chip absolute animate-eaFloat"
                                :style="{
                                    left: `${chip.left}%`,
                                    top: `${chip.top}%`,
                                    transform: `translate(-50%, -50%) scale(${chip.scale})`,
                                    animationDelay: chip.delay
                                }"
                            >
                                <span class="ea-chip__bubble" aria-hidden="true" />
                                <span :class="chip.color">{{ $t(`roles.${chip.id}`) }}</span>
                            </span>
                        </div>
                    </ParticleCluster>

                    <!-- Shares the cluster's box, and therefore its centre: the
                         rings bloom out of exactly the point the cloud collapsed
                         into. Pinned layout only — there is no held stretch to
                         play it against otherwise. -->
                    <StarMap v-if="isPinned" :t="starMapTime" :converge="clusterConverge" />
                </div>

                <!-- Copy. Both groups occupy the same grid cell so the swap has no
                     effect on layout; on the stacked layout they fall back to
                     normal flow and both read in order. -->
                <div class="relative grid tablet-wide:min-h-[280px]">
                    <div
                        class="ea-phase max-tablet-wide:!static tablet-wide:col-start-1 tablet-wide:row-start-1"
                        :data-state="phaseState(0)"
                    >
                        <SectionHeading :eyebrow="$t('problem.eyebrow')" invert>
                            <template #title>
                                {{ $t('problem.titleLine1') }}<br />{{ $t('problem.titleLine2') }}<br />
                                <span class="ea-grad ea-grad--dark">{{ $t('problem.titleAccent') }}</span>.
                            </template>
                        </SectionHeading>
                    </div>

                    <div
                        class="ea-phase max-tablet-wide:!static max-tablet-wide:mt-16 tablet-wide:col-start-1 tablet-wide:row-start-1"
                        :data-state="phaseState(1)"
                    >
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
