<script setup lang="ts">
// The AlgoScore ring.
//
// Two drawings share it. The small one (40px on a compact tile, 44 on a card
// and in the KPI strip) is a 3.96px arc with flat ends on a Tinted/50 track.
// The large one (96px, the EA page's identity card) is an 8px arc with round
// ends on the band's own tint, with the band word under the figure.
//
// Both are one <circle> with `pathLength="100"`, so the score IS the dash
// length: no trigonometry, and the arc can be drawn in by transitioning
// `stroke-dashoffset` (see .xa-ring__arc in main.css - it keys on the nearest
// revealed `.xa-in`, so the ring sweeps as its card arrives).
//
// The figure is real text over the SVG, not <text> inside it, so it takes the
// page's font rendering and can count up.
interface Props {
    score: number
    size?: 'sm' | 'md' | 'lg'
    /** Count the figure up as the ring draws. Reserved for the one large ring a
     *  page has; twelve cards counting at once is noise. */
    animateNumber?: boolean
}
const props = withDefaults(defineProps<Props>(), { size: 'md', animateNumber: false })

const band = computed(() => eaScoreBand(props.score))
const large = computed(() => props.size === 'lg')

// Drawn geometry. The radius is the ring's outer edge less half the stroke.
const geometry = computed(() =>
    large.value ? { box: 96, radius: 42, stroke: 8 } : { box: 44, radius: 20.02, stroke: 3.96 }
)

const BOX_CLASS = { sm: 'size-10', md: 'size-11', lg: 'size-24' } as const
const NUMBER_CLASS = { sm: 'text-[14px]', md: 'text-[15px]', lg: 'text-[24px] leading-6' } as const
</script>

<template>
    <span
        :class="['relative block shrink-0', BOX_CLASS[size]]"
        role="img"
        :aria-label="$t('ea.score.label', { score, band: $t(`ea.band.${band.id}`) })"
    >
        <svg
            class="size-full -rotate-90"
            :viewBox.attr="`0 0 ${geometry.box} ${geometry.box}`"
            fill="none"
            aria-hidden="true"
        >
            <circle
                :cx.attr="geometry.box / 2"
                :cy.attr="geometry.box / 2"
                :r.attr="geometry.radius"
                :stroke="large ? band.tint : '#F0F1F7'"
                :stroke-width="geometry.stroke"
            />
            <circle
                class="xa-ring__arc"
                :cx.attr="geometry.box / 2"
                :cy.attr="geometry.box / 2"
                :r.attr="geometry.radius"
                :stroke="large ? band.ring : band.bar"
                :stroke-width="geometry.stroke"
                :stroke-linecap="large ? 'round' : 'butt'"
                pathLength="100"
                :style="{ '--xa-score': score }"
            />
        </svg>

        <span
            class="absolute inset-0 flex flex-col items-center justify-center gap-0.5 font-poppins font-semibold"
            aria-hidden="true"
        >
            <span :class="['ea-num text-Tinted/900', NUMBER_CLASS[size]]">
                <EaCount v-if="animateNumber" :value="score" :duration="1400" />
                <template v-else>{{ score }}</template>
            </span>
            <span v-if="large" class="text-[10px] uppercase leading-[10px]" :style="{ color: band.text }">
                {{ $t(`ea.band.${band.id}`) }}
            </span>
        </span>
    </span>
</template>
