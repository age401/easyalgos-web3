<script setup lang="ts">
// "Live track record" - the EA page's growth and equity chart (Figma 3959:4643).
//
// Hand-drawn in SVG rather than through a chart library: two lines, one wash
// and a background grid do not need 150KB of ApexCharts, and the stack guide's
// first rule is that this page stays light.
//
// WHAT IT SHOWS. Two series from the EA's Myfxbook record, in Myfxbook's own
// colours: Growth (the red curve with the wash under it) and Equity (orange),
// which is growth less whatever is open, so it runs at or below growth. A
// 9-step value axis on the left, nine dates under the plot, a legend and the
// "verified by Myfxbook" line at the foot.
//
// HOW IT STAYS RESPONSIVE. The lines are the only thing in the SVG, on a
// stretched viewBox (`preserveAspectRatio="none"`) with a non-scaling stroke.
// Everything with TEXT in it - the value labels, the dates, the end tag, the
// tooltip - is HTML placed by percentage over the same box. Text inside a
// stretched SVG would stretch with it; this way the plot can be any width and
// any of three heights and nothing in it ever distorts.
//
//   - height steps 200 / 240 / 264px (phone / tablet / desktop, the drawn one);
//   - the date axis thins with the plot's own width (`.xa-track` is a size
//     container): nine dates, then five, then three, always keeping both ends;
//   - the header stacks, and the range switch takes the full width, once the
//     panel is too narrow to hold title and switch on one line; the legend and
//     the verification line stack the same way at the foot.
//
// INTERACTION. The four ranges re-base both lines to the start of their window
// (equity against growth's base, so the gap between them survives), so "3M"
// reads as the growth OVER those three months rather than a zoomed slice of
// the all-time number, and the end tag follows. Ranges longer than the record
// are not offered. Hovering - or dragging a finger across - scrubs a crosshair
// with the date and both values at that point; `touch-action: pan-y` keeps
// vertical scrolling the page's.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
}
const props = defineProps<Props>()

const { t, locale } = useI18n()
const id = useId()

type RangeId = '3m' | '6m' | '1y' | 'all'
const RANGES: { id: RangeId; months: number | null }[] = [
    { id: '3m', months: 3 },
    { id: '6m', months: 6 },
    { id: '1y', months: 12 },
    { id: 'all', months: null }
]
const ranges = computed(() => RANGES.filter((option) => option.months === null || option.months < props.ea.monthsTotal))
const range = ref<RangeId>('all')
/** Bumped on every range change; keys the lines so their wipe replays. */
const redraw = ref(0)

function selectRange(next: RangeId) {
    if (next === range.value) return
    range.value = next
    redraw.value += 1
    hover.value = null
}

// ---- Time axis ----------------------------------------------------------------
// The series are evenly spaced from the first day of the record's first month
// to the publish, so every point has a date.
const recordStartTime = computed(() => Date.UTC(props.ea.startYear, props.ea.startMonth, 1))
const recordEndTime = Date.parse(EA_DATA_AS_OF)
const windowMonths = computed(() => RANGES.find((option) => option.id === range.value)?.months ?? props.ea.monthsTotal)

const firstIndex = computed(() => {
    const last = props.ea.series.length - 1
    const share = (props.ea.monthsTotal - windowMonths.value) / props.ea.monthsTotal
    return Math.min(last - 1, Math.max(0, Math.ceil(share * last - 0.0001)))
})

/** The date of point `index` of the full series. */
const timeAt = (index: number) =>
    recordStartTime.value + (index / (props.ea.series.length - 1)) * (recordEndTime - recordStartTime.value)

// ---- Values ---------------------------------------------------------------------
/** Both windows, re-based so growth's first point is 0%. */
const base = computed(() => 1 + props.ea.series[firstIndex.value] / 100)
const rebase = (value: number) => Math.round(((1 + value / 100) / base.value - 1) * 10000) / 100
const growth = computed(() => props.ea.series.slice(firstIndex.value).map(rebase))
const equity = computed(() => props.ea.equity.slice(firstIndex.value).map(rebase))

// Nine labels as drawn (0-400% in 50s), so the axis asks for eight intervals.
const scale = computed(() =>
    eaAxisScale(Math.min(...growth.value, ...equity.value), Math.max(...growth.value, ...equity.value), 8)
)

// ---- Geometry -------------------------------------------------------------------
// The value labels are drawn justified top to bottom, so the first and last
// sit 6px inside the plot rather than overhanging it. The lines use the same
// inset, which keeps every label level with its value.
const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 264
const INSET = 6
const box = computed(() => ({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    top: INSET,
    bottom: INSET,
    min: scale.value.min,
    max: scale.value.max
}))
const growthPoints = computed(() => eaPlotPoints(growth.value, box.value))
const equityPoints = computed(() => eaPlotPoints(equity.value, box.value))
const growthPath = computed(() => eaLinePath(growthPoints.value))
const equityPath = computed(() => eaLinePath(equityPoints.value))
const areaPath = computed(() => eaAreaPath(growthPoints.value, VIEW_HEIGHT))

const percentOf = (point: { x: number; y: number }) => ({
    left: `${(point.x / VIEW_WIDTH) * 100}%`,
    top: `${(point.y / VIEW_HEIGHT) * 100}%`
})
const valueTop = (value: number) => {
    const share = (scale.value.max - value) / (scale.value.max - scale.value.min)
    return `${((INSET + share * (VIEW_HEIGHT - INSET * 2)) / VIEW_HEIGHT) * 100}%`
}

const endPoint = computed(() => growthPoints.value[growthPoints.value.length - 1])
const endValue = computed(() => growth.value[growth.value.length - 1])
/** The tag hangs below-left of the end dot as drawn, and flips above it when
 *  the curve ends in the bottom quarter of the plot. */
const endTagBelow = computed(() => endPoint.value.y / VIEW_HEIGHT < 0.72)

// ---- Date axis ------------------------------------------------------------------
const shortDate = computed(
    () => new Intl.DateTimeFormat(locale.value, { year: '2-digit', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
)
const longDate = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeZone: 'UTC' }))

const DATE_COUNT = 9
const dateTicks = computed(() => {
    const from = timeAt(firstIndex.value)
    return Array.from({ length: DATE_COUNT }, (_, index) => {
        const share = index / (DATE_COUNT - 1)
        return {
            key: index,
            label: shortDate.value.format(from + share * (recordEndTime - from)),
            left: `${share * 100}%`,
            edge: index === 0 ? 'start' : index === DATE_COUNT - 1 ? 'end' : 'middle',
            // Nine, then 0/2/4/6/8, then 0/4/8 as the plot narrows.
            thin: index % 2 === 1 ? 'xa-track__date--odd' : index % 4 === 2 ? 'xa-track__date--half' : ''
        }
    })
})

// ---- Scrubbing ------------------------------------------------------------------
const plot = ref<HTMLElement | null>(null)
const hover = ref<number | null>(null)

function onPointer(event: PointerEvent) {
    if (!plot.value) return
    const rect = plot.value.getBoundingClientRect()
    const share = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    hover.value = Math.round(share * (growth.value.length - 1))
}

const hoverPoint = computed(() => {
    if (hover.value === null) return null
    const index = hover.value
    const point = growthPoints.value[index]
    const across = point.x / VIEW_WIDTH
    return {
        left: percentOf(point).left,
        growthTop: percentOf(point).top,
        equityTop: percentOf(equityPoints.value[index]).top,
        growth: growth.value[index],
        equity: equity.value[index],
        date: longDate.value.format(timeAt(firstIndex.value + index)),
        // Keep the tooltip inside the plot at either end.
        align: across < 0.14 ? 'start' : across > 0.86 ? 'end' : 'middle'
    }
})

const ALIGN_CLASS = { start: '-translate-x-2', middle: '-translate-x-1/2', end: '-translate-x-[calc(100%-8px)]' } as const

const summary = computed(() =>
    t('ea.detail.chart.aria', {
        name: props.ea.name,
        growth: eaPercent(endValue.value, { sign: true }),
        from: longDate.value.format(timeAt(firstIndex.value)),
        to: longDate.value.format(recordEndTime)
    })
)
</script>

<template>
    <section id="track-record" class="xa-panel flex scroll-mt-24 flex-col gap-5">
        <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div class="flex flex-col gap-1.5">
                <h2 class="xa-title">{{ $t('ea.detail.chart.title') }}</h2>
                <p class="flex items-center gap-1.5 font-franklin text-[12px] font-medium leading-[14px] text-Tinted/500">
                    <span class="xa-live size-1.5 shrink-0 rounded-full bg-Green/100" aria-hidden="true" />
                    {{ $t('ea.detail.chart.updated', { stamp: eaPublishStamp(locale, EA_DATA_AS_OF) }) }}
                </p>
            </div>

            <div
                class="flex gap-0.5 rounded-full bg-Tinted/25 p-1 max-[479px]:w-full"
                role="group"
                :aria-label="$t('ea.detail.chart.range')"
            >
                <button
                    v-for="option in ranges"
                    :key="option.id"
                    type="button"
                    :aria-pressed="range === option.id"
                    :class="[
                        'rounded-full border px-3.5 py-1.5 font-poppins text-[12px] font-medium leading-4 transition-colors duration-300',
                        'max-[479px]:flex-1',
                        range === option.id
                            ? 'border-Tinted/100 bg-white text-Tinted/950'
                            : 'border-transparent text-Tinted/500 hover:text-Tinted/900'
                    ]"
                    @click="selectRange(option.id)"
                >
                    {{ $t(`ea.detail.chart.ranges.${option.id}`) }}
                </button>
            </div>
        </header>

        <!-- A 40px value column and an 8px gutter on the left, and 16px + a
             label's height under the plot for the dates, as drawn. -->
        <div class="xa-track pb-7 pl-12">
            <div
                ref="plot"
                class="xa-grid relative h-[200px] cursor-crosshair touch-pan-y select-none [--xa-grid-cell:57px] tablet:h-[240px] desktop:h-[264px]"
                role="img"
                :aria-label="summary"
                @pointermove="onPointer"
                @pointerdown="onPointer"
                @pointerleave="hover = null"
                @pointercancel="hover = null"
            >
                <!-- Value axis. A zero line only when the window dips below it. -->
                <div v-for="tick in scale.ticks" :key="tick" class="absolute inset-x-0" :style="{ top: valueTop(tick) }">
                    <div v-if="tick === 0 && scale.min < 0" class="h-px bg-Tinted/200" />
                    <span
                        class="xa-label absolute right-full top-0 mr-2 w-10 -translate-y-1/2 whitespace-nowrap text-right !normal-case"
                    >
                        {{ eaAxisPercent(tick, scale.step) }}
                    </span>
                </div>

                <!-- The lines. Keyed so a range change re-mounts them and the
                     wipe replays; on first arrival the panel's own reveal
                     drives the same wipe. Equity is drawn under growth. -->
                <svg
                    :key="redraw"
                    :class="['absolute inset-0 size-full overflow-visible', redraw ? 'xa-redraw' : 'xa-wipe']"
                    :viewBox.attr="`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient :id="`${id}-wash`" x1="0" y1="0" x2="0" y2="1">
                            <stop stop-color="#FF4D50" stop-opacity="0.08" />
                            <stop offset="1" stop-color="#FF4D50" stop-opacity="0" />
                        </linearGradient>
                        <linearGradient :id="`${id}-line`" x1="0" y1="0" x2="1" y2="0">
                            <stop stop-color="#FF4D50" />
                            <stop offset="1" stop-color="#FF1519" />
                        </linearGradient>
                    </defs>
                    <path :d="areaPath" :fill="`url(#${id}-wash)`" />
                    <path
                        :d="equityPath"
                        stroke="#FFAA40"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                    />
                    <path
                        :d="growthPath"
                        :stroke="`url(#${id}-line)`"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        vector-effect="non-scaling-stroke"
                    />
                </svg>

                <!-- End marker and its value tag -->
                <div
                    class="xa-fade pointer-events-none absolute"
                    :style="{ ...percentOf(endPoint), '--xa-fade-delay': '1100ms' }"
                >
                    <span class="xa-chart__ping absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    <span
                        class="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-Indicators/Red-Poor-100 bg-white"
                    />
                    <span
                        :class="[
                            'ea-num absolute right-3 whitespace-nowrap rounded-lg bg-Tinted/900 px-2.5 py-[5px] font-poppins text-[12px] font-semibold leading-4 text-white',
                            'transition-opacity duration-300',
                            endTagBelow ? 'top-3.5' : 'bottom-3.5',
                            hoverPoint ? 'opacity-0' : 'opacity-100'
                        ]"
                    >
                        {{ eaPercent(endValue, { sign: true }) }}
                    </span>
                </div>

                <!-- Crosshair -->
                <div v-if="hoverPoint" class="pointer-events-none absolute inset-y-0" :style="{ left: hoverPoint.left }">
                    <div class="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-Tinted/300" />
                    <span
                        class="absolute left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-Indicators/Orange-Fair-50 bg-white"
                        :style="{ top: hoverPoint.equityTop }"
                    />
                    <span
                        class="absolute left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-Indicators/Red-Poor-100 bg-white"
                        :style="{ top: hoverPoint.growthTop }"
                    />
                    <div
                        :class="[
                            'absolute left-0 flex -translate-y-[calc(100%+12px)] flex-col gap-1 whitespace-nowrap rounded-lg bg-Tinted/900 px-2.5 py-1.5',
                            ALIGN_CLASS[hoverPoint.align]
                        ]"
                        :style="{ top: `max(64px, ${hoverPoint.growthTop})` }"
                    >
                        <span class="xa-label !normal-case !text-Tinted/300">{{ hoverPoint.date }}</span>
                        <span class="flex items-center gap-1.5">
                            <span class="size-1.5 rounded-full bg-Indicators/Red-Poor-100" aria-hidden="true" />
                            <span class="xa-label !text-Tinted/300">{{ $t('ea.detail.chart.growth') }}</span>
                            <span class="ea-num ml-auto pl-3 font-poppins text-[13px] font-semibold leading-4 text-white">
                                {{ eaPercent(hoverPoint.growth, { sign: true }) }}
                            </span>
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="size-1.5 rounded-full bg-Indicators/Orange-Fair-50" aria-hidden="true" />
                            <span class="xa-label !text-Tinted/300">{{ $t('ea.detail.chart.equity') }}</span>
                            <span class="ea-num ml-auto pl-3 font-poppins text-[13px] font-semibold leading-4 text-white">
                                {{ eaPercent(hoverPoint.equity, { sign: true }) }}
                            </span>
                        </span>
                    </div>
                </div>

                <!-- Date axis -->
                <span
                    v-for="tick in dateTicks"
                    :key="`${range}-${tick.key}`"
                    :class="[
                        'xa-label absolute top-full mt-4 whitespace-nowrap !normal-case',
                        tick.edge === 'middle' ? '-translate-x-1/2' : tick.edge === 'end' ? '-translate-x-full' : '',
                        tick.thin
                    ]"
                    :style="{ left: tick.left }"
                >
                    {{ tick.label }}
                </span>
            </div>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-franklin text-[12px] font-medium text-Tinted/500">
            <ul class="flex items-center gap-6">
                <li class="flex items-center gap-1.5">
                    <span class="size-1.5 shrink-0 rounded-full bg-Indicators/Red-Poor-100" aria-hidden="true" />
                    {{ $t('ea.detail.chart.growth') }}
                </li>
                <li class="flex items-center gap-1.5">
                    <span class="size-1.5 shrink-0 rounded-full bg-Indicators/Orange-Fair-50" aria-hidden="true" />
                    {{ $t('ea.detail.chart.equity') }}
                </li>
            </ul>
            <p class="flex items-center gap-1.5">
                <img src="/img/icons/shield-check-16.svg" alt="" width="16" height="16" class="size-4 shrink-0" />
                {{ $t('ea.detail.chart.verifiedBy') }}
                <a
                    :href="EA_ROUTES.myfxbook(ea)"
                    target="_blank"
                    rel="noopener"
                    class="shrink-0 rounded-sm transition-opacity duration-300 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-Blue/600"
                >
                    <img
                        src="/img/brands/myfxbook-verified.svg"
                        :alt="$t('ea.detail.chart.myfxbook')"
                        width="62"
                        height="16"
                        class="block h-4 w-[62px]"
                    />
                </a>
            </p>
        </footer>
    </section>
</template>
