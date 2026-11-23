<script setup lang="ts">
// "Monthly performance" - the year-by-month heatmap and its four callouts
// (Figma 3921:16090).
//
// Drawn as a table: a row per year, twelve 54px month cells with the figure in
// each, and the year's total at the end. That is 868px of content, and a cell
// cannot go much under 44px before "+18.50" stops fitting. So the table has
// three forms, chosen by the width of the module itself (`.xa-heat` in
// main.css) - it sits in a 936px column on a wide desktop, a 600px one beside
// the identity card at 1024, and a 280px one on a phone:
//
//   >= 760px   the drawn table: month names across the top, years down the side.
//   520-759px  each year becomes a BLOCK: year and total on one line, then its
//              twelve months in a single row, each cell carrying its own month
//              name since the shared header is gone.
//   <  520px   the same block with the months in two rows of six - Jan to Jun
//              over Jul to Dec, so the halves of the year line up down the page.
//
// Nothing is dropped to make it fit: every month keeps its figure at every
// size. What a phone does get is fewer YEARS at once - an eight-year record is
// eight blocks - so only the latest three show until "Show earlier years".
// On the table form all years always show; a row is only 50px.
//
// Cell colour follows the drawn ramp: green deepening with the gain, red with
// the loss, both as an alpha over white so the figure stays readable on top.
// The two ramps are linear fits to the drawn cells (+1.12 at 11% up to +18.50
// at 54%; -2.04 at 16%, -3.74 at 20%).
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
}
const props = defineProps<Props>()

const { t, locale } = useI18n()

const months = computed(() => Array.from({ length: 12 }, (_, month) => eaMonthName(locale.value, month)))

/** Years beyond this many are collapsed on the block forms. */
const RECENT_YEARS = 3
const expanded = ref(false)
const olderCount = computed(() => Math.max(0, props.ea.years.length - RECENT_YEARS))

function cellStyle(value: number | null) {
    if (value === null) return undefined
    const alpha =
        value >= 0 ? Math.min(0.62, 0.085 + value * 0.0247) : Math.min(0.5, 0.112 + Math.abs(value) * 0.0235)
    return { backgroundColor: value >= 0 ? `rgba(0, 219, 99, ${alpha.toFixed(3)})` : `rgba(255, 21, 25, ${alpha.toFixed(3)})` }
}

const cellLabel = (year: number, month: number, value: number | null) =>
    value === null
        ? t('ea.detail.heatmap.noTrading', { month: eaMonthName(locale.value, month, 'long'), year })
        : `${eaMonthName(locale.value, month, 'long')} ${year}: ${eaPercent(value, { sign: true })}`

const monthYear = (point: { year: number; month: number }) => `${eaMonthName(locale.value, point.month, 'long')} ${point.year}`

const callouts = computed(() => [
    {
        label: t('ea.detail.heatmap.best'),
        value: eaPercent(props.ea.best.value, { sign: true }),
        caption: monthYear(props.ea.best),
        tone: 'text-Green/200'
    },
    {
        label: t('ea.detail.heatmap.worst'),
        value: eaPercent(props.ea.worst.value, { sign: true }),
        caption: monthYear(props.ea.worst),
        tone: props.ea.worst.value < 0 ? 'text-Red/200' : 'text-Tinted/950'
    },
    {
        label: t('ea.detail.heatmap.winRate'),
        value: `${props.ea.winRate}%`,
        caption: t('ea.detail.heatmap.winRateCaption', { profit: props.ea.monthsInProfit, total: props.ea.monthsTotal }),
        tone: 'text-Tinted/950'
    },
    {
        label: t('card.yearsTracked'),
        value: props.ea.startYear === props.ea.endYear ? `${props.ea.endYear}` : `${props.ea.startYear} – ${props.ea.endYear}`,
        caption: t('ea.detail.heatmap.monthsLive', { count: props.ea.monthsTotal }),
        tone: 'text-Tinted/950'
    }
])

// The legend's five swatches, as drawn.
const LEGEND = [
    'rgba(255, 21, 25, 0.32)',
    'rgba(255, 21, 25, 0.12)',
    'rgba(0, 219, 99, 0.12)',
    'rgba(0, 219, 99, 0.3)',
    'rgba(0, 219, 99, 0.58)'
]
</script>

<template>
    <section class="xa-panel flex flex-col gap-5">
        <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 class="xa-title">{{ $t('ea.detail.heatmap.title') }}</h2>
            <p class="flex items-center gap-2" aria-hidden="true">
                <span class="xa-label">{{ $t('ea.detail.heatmap.loss') }}</span>
                <span v-for="swatch in LEGEND" :key="swatch" class="h-2.5 w-4 rounded-[3px]" :style="{ backgroundColor: swatch }" />
                <span class="xa-label">{{ $t('ea.detail.heatmap.gain') }}</span>
            </p>
        </header>

        <div class="xa-heat-wrap">
            <div :class="['xa-heat', { 'xa-heat--expanded': expanded }]" role="table" :aria-label="$t('ea.detail.heatmap.title')">
                <!-- Shared month header: the table form only. -->
                <div class="xa-heat__months" role="row">
                    <!-- A real, empty cell over the year column. It has to take up
                         its grid track: an `sr-only` cell is absolutely
                         positioned, which would slide every month one column
                         to the left. -->
                    <span role="columnheader" aria-hidden="true" />
                    <span v-for="month in months" :key="month" role="columnheader" class="xa-label text-center">{{ month }}</span>
                    <span role="columnheader" class="xa-label text-right">{{ $t('ea.detail.heatmap.year') }}</span>
                </div>

                <div
                    v-for="(row, rowIndex) in ea.years"
                    :key="row.year"
                    :class="['xa-heat__year', { 'xa-heat__year--older': rowIndex >= RECENT_YEARS }]"
                    role="row"
                >
                    <span role="rowheader" class="xa-heat__label ea-num">{{ row.year }}</span>

                    <span
                        v-for="(value, month) in row.months"
                        :key="month"
                        role="cell"
                        :class="['xa-heat__cell xa-fade', value === null ? 'xa-heat__cell--empty' : value < 0 ? 'xa-heat__cell--loss' : '']"
                        :style="{ ...cellStyle(value), '--xa-fade-delay': `${(rowIndex * 12 + month) * 14}ms` }"
                        :title="cellLabel(row.year, month, value)"
                        :aria-label="cellLabel(row.year, month, value)"
                    >
                        <span class="xa-heat__month" aria-hidden="true">{{ months[month] }}</span>
                        <span class="ea-num" aria-hidden="true">{{ value === null ? '–' : eaSigned(value) }}</span>
                    </span>

                    <span role="cell" :class="['xa-heat__total ea-num', row.total < 0 ? '!text-Red/200' : '']">
                        {{ eaPercent(row.total, { sign: true }) }}
                    </span>
                </div>

                <button
                    v-if="olderCount > 0"
                    type="button"
                    class="xa-heat__more xa-key"
                    :aria-expanded="expanded"
                    @click="expanded = !expanded"
                >
                    {{ expanded ? $t('ea.detail.heatmap.showLess') : $t('ea.detail.heatmap.showEarlier', { count: olderCount }) }}
                    <EaIcon name="chevronDown" :class="['size-4 transition-transform duration-300', expanded ? 'rotate-180' : '']" />
                </button>
            </div>
        </div>

        <div class="xa-callouts-wrap">
            <dl class="xa-callouts">
                <div
                    v-for="callout in callouts"
                    :key="callout.label"
                    class="flex min-w-0 flex-col gap-1 rounded-xl bg-Tinted/25 px-4 py-3.5"
                >
                    <dt class="xa-label">{{ callout.label }}</dt>
                    <dd :class="['ea-num font-poppins text-[16px] font-semibold leading-[22px]', callout.tone]">
                        {{ callout.value }}
                    </dd>
                    <dd class="font-franklin text-[11px] font-medium leading-[14px] text-Tinted/500">{{ callout.caption }}</dd>
                </div>
            </dl>
        </div>
    </section>
</template>
