<script setup lang="ts">
// "Live track record" - the EA page's equity chart (Figma 3959:4643).
//
// Hand-drawn in SVG rather than through a chart library: one line, one wash and
// five gridlines do not need 150KB of ApexCharts, and the stack guide's first
// rule is that this page stays light.
//
// HOW IT STAYS RESPONSIVE. The curve is the only thing in the SVG, on a
// stretched viewBox (`preserveAspectRatio="none"`) with a non-scaling stroke.
// Everything with TEXT in it - the gridline labels, the month labels, the end
// tag, the tooltip - is HTML placed by percentage over the same box. Text
// inside a stretched SVG would stretch with it; this way the plot can be any
// width and any of three heights and nothing in it ever distorts.
//
//   - height steps 200 / 240 / 264px (phone / tablet / desktop, the drawn one);
//   - the month axis thins itself on a phone: only every third inner label
//     stays (nine 40px labels do not fit a 250px plot), with the first and
//     last always kept;
//   - the header stacks, and the range switch takes the full width, once the
//     panel is too narrow to hold title and switch on one line.
//
// INTERACTION. The four ranges re-base the curve to the start of their window,
// so "3M" reads as the growth OVER those three months rather than a zoomed
// slice of the all-time number, and the end tag follows. Ranges longer than the
// record are not offered. Hovering - or dragging a finger across - scrubs a
// crosshair with the month and the value at that point; `touch-action: pan-y`
// keeps vertical scrolling the page's.
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
/** Bumped on every range change; keys the curve so its wipe replays. */
const redraw = ref(0)

function selectRange(next: RangeId) {
    if (next === range.value) return
    range.value = next
    redraw.value += 1
    hover.value = null
}

// ---- Time axis, in months since year 0 -------------------------------------
const recordStart = computed(() => props.ea.startYear * 12 + props.ea.startMonth)
const recordEnd = computed(() => recordStart.value + props.ea.monthsTotal)
const windowMonths = computed(() => RANGES.find((option) => option.id === range.value)?.months ?? props.ea.monthsTotal)
const windowStart = computed(() => recordEnd.value - windowMonths.value)

const firstIndex = computed(() => {
    const last = props.ea.series.length - 1
    const share = (windowStart.value - recordStart.value) / props.ea.monthsTotal
    return Math.min(last - 1, Math.max(0, Math.ceil(share * last - 0.0001)))
})

/** The window's points, re-based so the first one is 0%. */
const values = computed(() => {
    const slice = props.ea.series.slice(firstIndex.value)
    const base = 1 + slice[0] / 100
    return slice.map((value) => Math.round(((1 + value / 100) / base - 1) * 10000) / 100)
})

const scale = computed(() => eaAxisScale(Math.min(...values.value), Math.max(...values.value)))

// ---- Geometry ---------------------------------------------------------------
const VIEW_WIDTH = 1000
const VIEW_HEIGHT = 264
const plotted = computed(() =>
    eaPlotPoints(values.value, { width: VIEW_WIDTH, height: VIEW_HEIGHT, min: scale.value.min, max: scale.value.max })
)
const linePath = computed(() => eaLinePath(plotted.value))
const areaPath = computed(() => eaAreaPath(plotted.value, VIEW_HEIGHT))

const percentOf = (point: { x: number; y: number }) => ({
    left: `${(point.x / VIEW_WIDTH) * 100}%`,
    top: `${(point.y / VIEW_HEIGHT) * 100}%`
})
const tickTop = (value: number) => `${((scale.value.max - value) / (scale.value.max - scale.value.min)) * 100}%`

const endPoint = computed(() => plotted.value[plotted.value.length - 1])
const endValue = computed(() => values.value[values.value.length - 1])
/** The tag hangs below-left of the end dot as drawn, and flips above it when
 *  the curve ends in the bottom quarter of the plot. */
const endTagBelow = computed(() => endPoint.value.y / VIEW_HEIGHT < 0.72)

// ---- Month axis --------------------------------------------------------------
const monthLabel = (monthIndex: number, withYear: 'short' | 'long') => {
    const year = Math.floor(monthIndex / 12)
    const name = eaMonthName(locale.value, monthIndex % 12)
    return withYear === 'short' ? `${name} '${String(year).slice(2)}` : `${name} ${year}`
}

const monthTicks = computed(() => {
    const months = windowMonths.value
    // At most nine labels, as drawn for the 26-month record (a label a quarter).
    const step = [1, 2, 3, 6, 12, 24].find((candidate) => months / candidate <= 9) ?? 24
    // The right edge is "now" and carries the current month, as drawn. A
    // regular tick that would repeat that month, or sit too close to it to be
    // read apart, is left out.
    const endLabel = monthLabel(recordEnd.value - 1, 'short')
    const ticks: { key: number; label: string; left: string; edge: 'start' | 'end' | 'middle' }[] = []
    for (let offset = 0; offset < months - step * 0.75; offset += step) {
        const label = monthLabel(Math.round(windowStart.value) + offset, 'short')
        if (label === endLabel) continue
        ticks.push({
            key: offset,
            label,
            left: `${(offset / months) * 100}%`,
            edge: offset === 0 ? 'start' : 'middle'
        })
    }
    ticks.push({ key: months, label: endLabel, left: '100%', edge: 'end' })
    return ticks
})

// ---- Scrubbing ---------------------------------------------------------------
const plot = ref<HTMLElement | null>(null)
const hover = ref<number | null>(null)

function onPointer(event: PointerEvent) {
    if (!plot.value) return
    const box = plot.value.getBoundingClientRect()
    const share = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    hover.value = Math.round(share * (values.value.length - 1))
}

const hoverPoint = computed(() => {
    if (hover.value === null) return null
    const index = hover.value
    const point = plotted.value[index]
    const share = (firstIndex.value + index) / (props.ea.series.length - 1)
    const monthIndex = Math.min(recordEnd.value - 1, Math.floor(recordStart.value + share * props.ea.monthsTotal))
    const across = point.x / VIEW_WIDTH
    return {
        ...percentOf(point),
        value: values.value[index],
        date: monthLabel(monthIndex, 'long'),
        // Keep the tooltip inside the plot at either end.
        align: across < 0.14 ? 'start' : across > 0.86 ? 'end' : 'middle'
    }
})

const ALIGN_CLASS = { start: '-translate-x-2', middle: '-translate-x-1/2', end: '-translate-x-[calc(100%-8px)]' } as const

const summary = computed(() =>
    t('ea.detail.chart.aria', {
        name: props.ea.name,
        growth: eaPercent(endValue.value, { sign: true }),
        from: monthLabel(Math.round(windowStart.value), 'long'),
        to: monthLabel(recordEnd.value - 1, 'long')
    })
)
</script>

<template>
    <section id="track-record" class="xa-panel flex scroll-mt-24 flex-col gap-5">
        <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <div class="flex flex-col gap-1.5">
                <h2 class="xa-title">{{ $t('ea.detail.chart.title') }}</h2>
                <p class="font-franklin text-[12px] font-medium leading-[14px] text-Tinted/500">
                    {{ $t('ea.detail.chart.verified') }}
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

        <!-- Left gutter for the value labels, and room under the plot for the
             month labels: 48 and 36 as drawn, a little tighter on a phone. -->
        <div class="pb-8 pl-10 pt-2 tablet:pl-12">
            <div
                ref="plot"
                class="relative h-[200px] cursor-crosshair touch-pan-y select-none tablet:h-[240px] desktop:h-[264px]"
                role="img"
                :aria-label="summary"
                @pointermove="onPointer"
                @pointerdown="onPointer"
                @pointerleave="hover = null"
                @pointercancel="hover = null"
            >
                <!-- Gridlines -->
                <div v-for="tick in scale.ticks" :key="tick" class="absolute inset-x-0" :style="{ top: tickTop(tick) }">
                    <div :class="['h-px', tick === 0 && scale.min < 0 ? 'bg-Tinted/200' : 'bg-Tinted/50']" />
                    <span class="xa-label absolute right-full top-0 mr-2.5 -translate-y-1/2 whitespace-nowrap !normal-case">
                        {{ eaAxisPercent(tick, scale.step) }}
                    </span>
                </div>

                <!-- The curve. Keyed so a range change re-mounts it and the
                     wipe replays; on first arrival the panel's own reveal
                     drives the same wipe. -->
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
                            <stop stop-color="#5959FF" stop-opacity="0.16" />
                            <stop offset="1" stop-color="#5959FF" stop-opacity="0" />
                        </linearGradient>
                        <linearGradient :id="`${id}-line`" x1="0" y1="0" x2="1" y2="0">
                            <stop stop-color="#205EFB" />
                            <stop offset="0.46" stop-color="#5959FF" />
                            <stop offset="1" stop-color="#B36DFF" />
                        </linearGradient>
                    </defs>
                    <path :d="areaPath" :fill="`url(#${id}-wash)`" />
                    <path
                        :d="linePath"
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
                        class="absolute left-0 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-[#A855F7] bg-white"
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
                        class="absolute left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-Blue/600 bg-white"
                        :style="{ top: hoverPoint.top }"
                    />
                    <div
                        :class="[
                            'absolute left-0 flex -translate-y-[calc(100%+12px)] flex-col gap-0.5 whitespace-nowrap rounded-lg bg-Tinted/900 px-2.5 py-1.5',
                            ALIGN_CLASS[hoverPoint.align]
                        ]"
                        :style="{ top: `max(44px, ${hoverPoint.top})` }"
                    >
                        <span class="xa-label !text-Tinted/300">{{ hoverPoint.date }}</span>
                        <span class="ea-num font-poppins text-[13px] font-semibold leading-4 text-white">
                            {{ eaPercent(hoverPoint.value, { sign: true }) }}
                        </span>
                    </div>
                </div>

                <!-- Month axis -->
                <span
                    v-for="(tick, index) in monthTicks"
                    :key="`${range}-${tick.key}`"
                    :class="[
                        'xa-label absolute top-full mt-[22px] whitespace-nowrap !normal-case',
                        tick.edge === 'middle' ? '-translate-x-1/2' : tick.edge === 'end' ? '-translate-x-full' : '',
                        monthTicks.length > 5 && tick.edge === 'middle' && index % 3 !== 0 ? 'max-tablet:hidden' : ''
                    ]"
                    :style="{ left: tick.left }"
                >
                    {{ tick.label }}
                </span>
            </div>
        </div>

        <footer class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-franklin text-[12px] font-medium text-Tinted/500">
            <p class="flex items-center gap-1.5">
                <span class="xa-live size-1.5 shrink-0 rounded-full bg-Green/100" aria-hidden="true" />
                {{ $t('ea.detail.chart.updated', { stamp: eaPublishStamp(locale, EA_DATA_AS_OF) }) }}
            </p>
            <p>{{ $t('ea.detail.chart.source') }}</p>
        </footer>
    </section>
</template>
