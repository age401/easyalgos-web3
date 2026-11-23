<script setup lang="ts">
// An Expert Advisor card - Figma "EA Card" (3939:19416), drawn 322x329.
//
// The whole card is one link to the EA page: the name's anchor is stretched
// over the card (`.xa-card__link`), and the two tool buttons sit above that on
// their own stacking level so they stay separate targets. That is one tab stop
// for the card plus two for its tools, rather than a card-sized <a> wrapping
// other links, which is invalid and reads badly in a screen reader.
//
// RESPONSIVE. The card is drawn at one width and is fluid here, between about
// 256px (two-up on a small tablet) and 560px (one-up on a large phone). Three
// things keep it whole across that range:
//   - the name may wrap to a second line instead of truncating, so "Range
//     Breakout EA" survives a 256px card (the drawn single line is unchanged
//     wherever it fits);
//   - the tools row pins to the card's foot, so a row of cards with one- and
//     two-line names still lines its buttons up;
//   - the card is a size container, and below 270px of its own width the tool
//     buttons drop their chevrons (see `.xa-card` in main.css). That is keyed
//     to the CARD, not the viewport, because the same card is 257px at a 600px
//     viewport and 440px at 599.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
    /** Heading level: h3 in a list under a section heading, h2 directly under a page title. */
    level?: 2 | 3
    eager?: boolean
}
const props = withDefaults(defineProps<Props>(), { level: 3, eager: false })

const drawdownTone = computed(() => eaDrawdownTone(props.ea.maxDrawdown))
const TONE_CLASS = { calm: 'text-Tinted/900', elevated: 'text-[#EE7206]', high: 'text-Red/200' } as const

const period = computed(() =>
    props.ea.startYear === props.ea.endYear ? `${props.ea.endYear}` : `${props.ea.startYear} – ${props.ea.endYear}`
)
</script>

<template>
    <article class="xa-card xa-card--hover relative flex h-full flex-col gap-4 rounded-[20px] px-5 pb-4 pt-5">
        <header class="flex items-center gap-3">
            <EaThumb :image="ea.image" :name="ea.name" :size="44" :eager="eager" class="size-11 rounded-lg" />

            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <component
                    :is="`h${level}`"
                    class="line-clamp-2 font-poppins text-[16px] font-semibold leading-[22px] text-Tinted/950"
                >
                    <NuxtLink :to="EA_ROUTES.ea(ea.slug)" class="xa-card__link">{{ ea.name }}</NuxtLink>
                </component>
                <p class="truncate font-franklin text-[12px] leading-4 text-Tinted/500">
                    {{ $t('ea.by', { name: ea.developerName }) }}
                </p>
            </div>

            <EaScoreRing :score="ea.score" size="md" />
        </header>

        <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between gap-3">
                <div class="flex flex-col gap-0.5">
                    <p class="xa-label">{{ $t('ea.card.allTimeGrowth') }}</p>
                    <p
                        :class="[
                            'ea-num font-poppins text-[24px] font-semibold leading-[30px] tracking-[-0.24px]',
                            ea.growth < 0 ? 'text-Red/200' : 'text-Green/200'
                        ]"
                    >
                        {{ eaPercent(ea.growth, { sign: true }) }}
                    </p>
                </div>
                <p class="flex items-center gap-1.5 whitespace-nowrap font-franklin text-[12px] font-medium text-Tinted/500">
                    <span class="xa-live size-1.5 rounded-full bg-Green/100" aria-hidden="true" />
                    {{ $t('ea.card.live', { period }) }}
                </p>
            </div>

            <EaSparkline :points="ea.spark" />
        </div>

        <dl class="grid grid-cols-3 gap-3 rounded-xl bg-Tinted/25 px-3.5 py-3">
            <div class="flex min-w-0 flex-col gap-1">
                <dt class="xa-label truncate">{{ $t('ea.card.monthly') }}</dt>
                <dd class="ea-num font-poppins text-[14px] font-semibold leading-[18px] text-Tinted/900">
                    {{ eaPercent(ea.monthly) }}
                </dd>
            </div>
            <div class="flex min-w-0 flex-col gap-1">
                <dt class="xa-label truncate">{{ $t('ea.card.maxDd') }}</dt>
                <dd :class="['ea-num font-poppins text-[14px] font-semibold leading-[18px]', TONE_CLASS[drawdownTone]]">
                    {{ eaPercent(ea.maxDrawdown) }}
                </dd>
            </div>
            <div class="flex min-w-0 flex-col gap-1">
                <dt class="xa-label truncate">{{ $t('ea.card.inProfit') }}</dt>
                <dd class="ea-num whitespace-nowrap font-poppins text-[14px] font-semibold leading-[18px] text-Tinted/900">
                    {{ ea.monthsInProfit }} / {{ ea.monthsTotal }}
                </dd>
                <!-- 76px as drawn, and no wider: the bar is a proportion, and
                     letting it grow with the card would make the same 21/26
                     look like more on a wider card. -->
                <dd class="h-[3px] w-full max-w-[76px] overflow-hidden rounded-sm bg-Tinted/100" aria-hidden="true">
                    <span
                        class="xa-bar block h-full rounded-sm bg-Green/100"
                        :style="{ width: `${(ea.monthsInProfit / ea.monthsTotal) * 100}%` }"
                    />
                </dd>
            </div>
        </dl>

        <div class="relative z-[1] mt-auto flex gap-3">
            <a :href="EA_ROUTES.algoscoreEa(ea.slug)" class="xa-key xa-key--tool min-w-0 flex-1">
                <EaIcon name="algoscore" class="size-4" />
                <span class="truncate px-0.5">{{ $t('ea.card.algoscore') }}</span>
                <EaIcon name="chevronRight" class="xa-card__chevron size-4" />
            </a>
            <NuxtLink :to="`${EA_ROUTES.ea(ea.slug)}#track-record`" class="xa-key xa-key--tool min-w-0 flex-1">
                <span class="truncate px-0.5">{{ $t('ea.card.trackRecord') }}</span>
                <EaIcon name="chevronRight" class="xa-card__chevron size-4" />
            </NuxtLink>
        </div>
    </article>
</template>
