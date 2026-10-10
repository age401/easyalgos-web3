<script setup lang="ts">
// "section - Recurring Commissions" (35:1739) — the second instance of that
// module on the page, drawn as "7 Reasons why our affiliate program is
// unbeatable": a 320px atom graphic beside the heading and seven ticked perks.
//
// The atom is the file's own artwork, kept as drawn — the seven orbits and the
// EasyAlgos mark at its centre — but inlined rather than an <img>, so its
// twelve dots can MOVE: each one travels along the orbit it is drawn on, from
// the point it is drawn at, while the orbits themselves stay still. The network
// going round the brand, and the same "recurring" figure as the hero's orbit
// riders. A lap takes 9-13s, and each dot carries a soft halo and an
// afterglow: TRAIL ghosts riding the same path a few hundredths of a second
// behind it, smaller and fainter each step, so it reads as a comet.
//
// The motion is SMIL <animateMotion> along each orbit's own path: no script
// per frame, no layout, and the negative `begin` is what starts every dot where
// Figma puts it instead of at the path's origin. Orbits 4/5/6 run at different
// speeds and orbit 5 the other way round, so the three never read as one
// wheel. Reduced motion pauses the document's timeline at 0 — the drawn frame.
//
// From the file: 60px between the columns; perks 40px rows 16 apart, a 32px
// bubble (4px Tinted/600-at-10% ring over a top-lit Tinted/500 wash) with a
// 16px Tinted/600 check, then Roboto 18/165% Tinted/950.
//
// Ours: the graphic sits above the copy, centred, below `tablet-wide`.
import { AFF_ATOM_DOTS, AFF_ATOM_ORBITS, AFF_REASONS } from '~/data/affiliates'

/** Seconds per lap, per heavy orbit, and which way round it goes. */
const LAP: Record<number, { dur: number; reverse: boolean }> = {
    4: { dur: 9, reverse: false },
    5: { dur: 13, reverse: true },
    6: { dur: 11, reverse: false }
}

/** The afterglow: each ghost `lag` seconds behind the dot, at radius `r`. */
const TRAIL = Array.from({ length: 12 }, (_, i) => i + 1).map((k) => ({
    lag: k * 0.035,
    r: 2 - k * 0.09,
    opacity: 0.5 * (1 - k / 13)
}))

/** Where the dot is at t=0: `at` along its orbit, in the direction it runs,
 *  less `lag` seconds for a trail ghost (a later begin = further behind). */
const beginAt = (orbit: number, at: number, lag = 0) => {
    const lap = LAP[orbit]
    const progress = lap.reverse ? 1 - at : at
    return `${(lag - progress * lap.dur).toFixed(3)}s`
}

const atom = ref<SVGSVGElement | null>(null)
onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        atom.value?.pauseAnimations()
        atom.value?.setCurrentTime(0)
    }
})
</script>

<template>
    <section class="bg-white pb-[72px] tablet:pb-[96px] tablet-wide:pb-[128px] desktop:pb-[192px]">
        <div class="ea-container grid items-center gap-10 tablet-wide:grid-cols-[280px_minmax(0,1fr)] tablet-wide:gap-[60px] desktop:grid-cols-[320px_minmax(0,1fr)]">
            <div v-reveal class="relative mx-auto size-[240px] tablet:size-[280px] desktop:size-[320px]" aria-hidden="true">
                <!-- "Layer 2" (41:2251) sits inset 1.25% / 1.46% in the 320 box. -->
                <svg
                    ref="atom"
                    class="absolute inset-[1.25%_1.46%] h-[97.5%] w-[97.08%] overflow-visible"
                    viewBox="0 0 311.655 314"
                    fill="none"
                >
                    <path
                        v-for="(orbit, i) in AFF_ATOM_ORBITS"
                        :key="`o${i}`"
                        :d.attr="orbit.d"
                        :stroke.attr="orbit.stroke"
                        :stroke-width.attr="orbit.width"
                        stroke-miterlimit="10"
                    />
                    <defs>
                        <radialGradient id="aff-atom-glow">
                            <stop offset="0" stop-color="#9D96FF" stop-opacity="0.45" />
                            <stop offset="1" stop-color="#7D73EA" stop-opacity="0" />
                        </radialGradient>
                    </defs>
                    <template v-for="(dot, i) in AFF_ATOM_DOTS" :key="`d${i}`">
                        <!-- The afterglow, faintest (furthest behind) first. -->
                        <circle
                            v-for="ghost in [...TRAIL].reverse()"
                            :key="ghost.lag"
                            :r.attr="ghost.r"
                            fill="#7D73EA"
                            :opacity.attr="ghost.opacity"
                        >
                            <animateMotion
                                :path.attr="AFF_ATOM_ORBITS[dot.orbit].d"
                                :dur.attr="`${LAP[dot.orbit].dur}s`"
                                :begin.attr="beginAt(dot.orbit, dot.at, ghost.lag)"
                                :keyPoints.attr="LAP[dot.orbit].reverse ? '1;0' : '0;1'"
                                keyTimes="0;1"
                                calcMode="linear"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <!-- The dot and its halo. -->
                        <g>
                            <circle r="7" fill="url(#aff-atom-glow)" />
                            <circle r="2" fill="#7D73EA" />
                            <animateMotion
                                :path.attr="AFF_ATOM_ORBITS[dot.orbit].d"
                                :dur.attr="`${LAP[dot.orbit].dur}s`"
                                :begin.attr="beginAt(dot.orbit, dot.at)"
                                :keyPoints.attr="LAP[dot.orbit].reverse ? '1;0' : '0;1'"
                                keyTimes="0;1"
                                calcMode="linear"
                                repeatCount="indefinite"
                            />
                        </g>
                    </template>
                </svg>
                <img src="/img/affiliates/atom-mark.svg" alt="" width="32" height="32" class="absolute inset-[45%] size-[10%]" />
            </div>

            <div class="min-w-0">
                <h2 v-reveal class="ea-h2">
                    {{ $t('affiliates.reasons.titleBefore') }}<span class="ea-grad">{{ $t('affiliates.reasons.titleAccent') }}</span>
                </h2>
                <p v-reveal="90" class="ea-lead--tight mt-6 max-w-[640px]">{{ $t('affiliates.reasons.lead') }}</p>

                <ul class="mt-10 flex flex-col gap-3 tablet:gap-4 tablet-wide:mt-16">
                    <li
                        v-for="(id, i) in AFF_REASONS"
                        :key="id"
                        v-reveal="140 + i * 60"
                        class="flex min-h-10 items-center gap-4"
                    >
                        <span class="grid size-10 shrink-0 place-items-center" aria-hidden="true">
                            <span class="aff-perk-bubble grid size-8 place-items-center rounded-full">
                                <img src="/img/affiliates/icons/check-16.svg" alt="" width="16" height="16" />
                            </span>
                        </span>
                        <span class="font-franklin text-[16px] leading-[1.5] text-Tinted/950 tablet:text-[18px] tablet:leading-[1.65]">
                            {{ $t(`affiliates.reasons.items.${id}`) }}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
