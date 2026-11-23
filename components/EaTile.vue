<script setup lang="ts">
// An Expert Advisor in the compact view - Figma "EA Tile" (3915:16463), drawn
// 347x154: a 128px thumbnail beside the name, the ring, growth and drawdown.
//
// The compact view exists to be scanned, so it has to stay scannable when the
// drawn tile no longer fits. It takes three forms, one markup:
//
//   >= 600px viewport, tile >= 300px   the drawn tile.
//   >= 600px viewport, tile <  300px   the same tile around a 96px thumbnail.
//                                      Two-up on a small tablet leaves a 260px
//                                      tile, and 128 of that for the picture
//                                      would leave the name 100px. Keyed to the
//                                      TILE's width via a container query.
//   <  600px viewport                  a ledger ROW: 56px thumbnail, then name,
//                                      developer and the two figures on one
//                                      line, with the ring at the far end. A
//                                      phone shows seven EAs a screen this way
//                                      against two and a half cards, which is
//                                      the point of having a compact view.
//
// The ring is rendered twice (beside the figures on the tile, at the row's end
// on a phone) and one is hidden by breakpoint: it is a different place in the
// reading order, not a restyle, and a grid-area shuffle would leave the DOM
// order wrong for one of the two. The hidden one is `display: none`, so it is
// out of the accessibility tree too.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
    level?: 2 | 3
}
const props = withDefaults(defineProps<Props>(), { level: 3 })

const drawdownTone = computed(() => eaDrawdownTone(props.ea.maxDrawdown))
const TONE_CLASS = { calm: 'text-Tinted/500', elevated: 'text-[#EE7206]', high: 'text-Red/200' } as const
</script>

<template>
    <article
        class="xa-card xa-card--hover xa-tile relative flex h-full items-center gap-3 rounded-2xl p-3 tablet:gap-3.5 tablet:pr-3.5"
    >
        <EaThumb
            :image="ea.image"
            :name="ea.name"
            :size="128"
            class="xa-tile__thumb size-14 rounded-[10px] tablet:size-32"
        />

        <div class="xa-tile__data flex min-w-0 flex-1 flex-col gap-1 tablet:h-32 tablet:justify-between tablet:gap-0">
            <div class="flex min-w-0 flex-col gap-0.5">
                <component
                    :is="`h${level}`"
                    class="truncate font-poppins text-[15px] font-semibold leading-5 text-Tinted/950 tablet:line-clamp-2 tablet:whitespace-normal"
                >
                    <NuxtLink :to="EA_ROUTES.ea(ea.slug)" class="xa-card__link">{{ ea.name }}</NuxtLink>
                </component>
                <p class="truncate font-franklin text-[12px] leading-4 text-Tinted/500">
                    {{ $t('ea.by', { name: ea.developerName }) }}
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <EaScoreRing :score="ea.score" size="sm" class="max-tablet:hidden" />
                <p class="flex items-baseline gap-2 whitespace-nowrap tablet:flex-col tablet:items-start tablet:gap-0.5">
                    <span
                        :class="[
                            'ea-num font-poppins text-[14px] font-semibold leading-5',
                            ea.growth < 0 ? 'text-Red/200' : 'text-Green/200'
                        ]"
                    >
                        {{ eaPercent(ea.growth, { sign: true }) }}
                    </span>
                    <span :class="['ea-num font-franklin text-[11px] font-medium leading-4', TONE_CLASS[drawdownTone]]">
                        {{ $t('ea.card.maxDdValue', { value: eaPercent(ea.maxDrawdown) }) }}
                    </span>
                </p>
            </div>
        </div>

        <EaScoreRing :score="ea.score" size="sm" class="tablet:hidden" />
    </article>
</template>
