<script setup lang="ts">
// "Risk vs. return" - the developer page's scatter (Figma 3924:16283): every
// EA as a dot at its max drawdown (across) and its monthly gain (up), with the
// low-drawdown, high-return corner shaded.
//
// Axes are derived from the data and rounded to clean steps, so a developer
// whose worst drawdown is 20% does not get a plot scaled for 60%.
//
// THE LABELS are the hard part of making this responsive. The frame places six
// name labels by hand, one of them on the left of its dot because the right
// was taken. A fixed placement cannot survive another developer's EAs, or the
// same six on a narrower plot, so the placement is computed: for each dot, in
// score order, the first of right / left / above / below that stays inside the
// plot and clear of every other dot and every label already placed. It runs
// against the plot's MEASURED size and re-runs when that changes. The server
// (and the first client frame) use the drawn 780x258 - same input, same
// output, so hydration matches - and the measured pass follows on mount.
//
// Below 520px of plot there is no placement that works: six ~130px labels do
// not fit a 260px box at all. So the labels go and each dot carries its RANK
// instead, which is exactly the number beside the same EA in the ranking
// under it - the list becomes the legend, at no extra height. That switch is a
// container query (`.xa-plot` in main.css), not a JS one, so it is right on
// the first paint. It is keyed to the PANEL (600px of it, which is the same
// 520px of plot once the padding and the axis gutter are taken off), so the
// sentence above the plot can change with it and say what the numbers are.
//
// Dots are buttons: hover, focus or tap shows the EA's three figures and a
// link to its page. `active` is shared with the ranking, so pointing at either
// lights up the same EA in both.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    eas: readonly ExpertAdvisor[]
}
const props = defineProps<Props>()
const active = defineModel<string | null>('active', { default: null })

const { t } = useI18n()

// ---- Scales ------------------------------------------------------------------
const xScale = computed(() => eaAxisScale(0, Math.max(...props.eas.map((ea) => ea.maxDrawdown)), 4))
const yScale = computed(() => eaAxisScale(0, Math.max(...props.eas.map((ea) => ea.monthly)), 4))
const xTicks = computed(() => [...xScale.value.ticks].reverse())

/** The shaded corner: drawdown under 25% and monthly gain over 3%. */
const SWEET = { drawdown: 25, monthly: 3 }
const sweetSpot = computed(() => {
    if (xScale.value.max <= SWEET.drawdown || yScale.value.max <= SWEET.monthly) return null
    return {
        width: `${(SWEET.drawdown / xScale.value.max) * 100}%`,
        height: `${((yScale.value.max - SWEET.monthly) / yScale.value.max) * 100}%`
    }
})

const points = computed(() =>
    props.eas.map((ea, index) => ({
        ea,
        rank: index + 1,
        x: ea.maxDrawdown / xScale.value.max,
        y: 1 - ea.monthly / yScale.value.max
    }))
)

// ---- Label placement ---------------------------------------------------------
type Side = 'right' | 'left' | 'top' | 'bottom'
const plot = ref<HTMLElement | null>(null)
const size = ref({ width: 780, height: 258 })
let observer: ResizeObserver | null = null

onMounted(() => {
    if (!plot.value) return
    const measure = () => {
        if (!plot.value) return
        size.value = { width: plot.value.clientWidth, height: plot.value.clientHeight }
    }
    measure()
    observer = new ResizeObserver(measure)
    observer.observe(plot.value)
})
onBeforeUnmount(() => observer?.disconnect())

interface Box {
    left: number
    top: number
    right: number
    bottom: number
}
const overlaps = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

const sides = computed<Side[]>(() => {
    const { width, height } = size.value
    const centres = points.value.map((point) => ({ x: point.x * width, y: point.y * height }))
    // The halo is 28px; a little more keeps a label off its edge.
    const dotBoxes = centres.map((centre) => ({
        left: centre.x - 16,
        top: centre.y - 16,
        right: centre.x + 16,
        bottom: centre.y + 16
    }))
    const placed: Box[] = []

    return points.value.map((point, index) => {
        const centre = centres[index]
        // 12px Poppins Medium runs about 7.1px a character; the score adds ~24.
        const labelWidth = point.ea.name.length * 7.1 + 24
        const candidates: Record<Side, Box> = {
            right: { left: centre.x + 20, top: centre.y - 9, right: centre.x + 20 + labelWidth, bottom: centre.y + 9 },
            left: { left: centre.x - 20 - labelWidth, top: centre.y - 9, right: centre.x - 20, bottom: centre.y + 9 },
            top: { left: centre.x - labelWidth / 2, top: centre.y - 36, right: centre.x + labelWidth / 2, bottom: centre.y - 18 },
            bottom: { left: centre.x - labelWidth / 2, top: centre.y + 18, right: centre.x + labelWidth / 2, bottom: centre.y + 36 }
        }
        const fits = (box: Box) =>
            box.left >= -2 &&
            box.right <= width + 2 &&
            box.top >= -4 &&
            box.bottom <= height + 2 &&
            !placed.some((other) => overlaps(box, other)) &&
            !dotBoxes.some((other, otherIndex) => otherIndex !== index && overlaps(box, other))

        const side = (['right', 'left', 'top', 'bottom'] as Side[]).find((option) => fits(candidates[option])) ?? 'right'
        placed.push(candidates[side])
        return side
    })
})

const SIDE_CLASS: Record<Side, string> = {
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    top: 'bottom-full left-1/2 mb-1 -translate-x-1/2',
    bottom: 'left-1/2 top-full mt-1 -translate-x-1/2'
}

// ---- Interaction ---------------------------------------------------------------
/** A tap pins the card open; hover and focus only preview it. */
const pinned = ref<string | null>(null)
function toggle(slug: string) {
    pinned.value = pinned.value === slug ? null : slug
    active.value = pinned.value
}
function preview(slug: string | null) {
    active.value = slug ?? pinned.value
}

const legend = computed(() => {
    const seen = new Map<string, string>()
    for (const ea of props.eas) seen.set(ea.band.id, ea.band.bar)
    return [...seen.entries()].map(([id, colour]) => ({ id, colour }))
})

const pointLabel = (ea: ExpertAdvisor) =>
    t('ea.dev.plot.point', {
        name: ea.name,
        score: ea.score,
        monthly: eaPercent(ea.monthly),
        drawdown: eaPercent(ea.maxDrawdown)
    })
</script>

<template>
    <section class="xa-panel xa-plotpanel flex h-full flex-col gap-5">
        <header class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div class="flex min-w-0 flex-col gap-1.5">
                <h2 class="xa-title">{{ $t('ea.dev.plot.title') }}</h2>
                <p class="font-franklin text-[13px] leading-[18px] text-Tinted/500">
                    <span class="xa-plot__lead-full">{{ $t('ea.dev.plot.lead') }}</span>
                    <span class="xa-plot__lead-numbered">{{ $t('ea.dev.plot.leadNumbered') }}</span>
                </p>
            </div>
            <ul class="flex items-center gap-3.5 pt-1.5">
                <li v-for="item in legend" :key="item.id" class="flex items-center gap-1.5">
                    <span class="size-2 rounded-full" :style="{ backgroundColor: item.colour }" aria-hidden="true" />
                    <span class="xa-label">{{ $t(`ea.band.${item.id}`) }}</span>
                </li>
            </ul>
        </header>

        <!-- 44px gutter for the gain labels, 34px under the plot for the
             drawdown labels and the axis caption: the drawn insets. -->
        <div class="xa-plot-wrap flex min-h-[292px] flex-1 flex-col pb-[34px] pl-9 pr-2 pt-2 tablet:pl-11">
            <div ref="plot" class="xa-plot relative min-h-[240px] flex-1" @mouseleave="preview(null)">
                <div
                    v-if="sweetSpot"
                    class="xa-fade absolute left-0 top-0 rounded-lg bg-[rgba(0,219,99,0.07)]"
                    :style="{ ...sweetSpot, '--xa-fade-delay': '500ms' }"
                    aria-hidden="true"
                >
                    <span class="xa-label xa-plot__sweet-full absolute left-2.5 top-2 whitespace-nowrap !text-Green/200">
                        {{ $t('ea.dev.plot.sweetSpot') }}
                    </span>
                    <span class="xa-label xa-plot__sweet-short absolute left-2 top-1.5 whitespace-nowrap !text-Green/200">
                        {{ $t('ea.dev.plot.sweetSpotShort') }}
                    </span>
                </div>

                <!-- Gain gridlines -->
                <div
                    v-for="tick in yScale.ticks"
                    :key="`y${tick}`"
                    class="absolute inset-x-0"
                    :style="{ top: `${(1 - tick / yScale.max) * 100}%` }"
                    aria-hidden="true"
                >
                    <div class="h-px bg-Tinted/50" />
                    <span class="xa-label absolute right-full top-0 mr-2.5 -translate-y-1/2 whitespace-nowrap">
                        {{ eaAxisPercent(tick, yScale.step) }}
                    </span>
                </div>

                <!-- Drawdown labels -->
                <span
                    v-for="(tick, index) in xTicks"
                    :key="`x${tick}`"
                    :class="[
                        'xa-label absolute top-full mt-2 whitespace-nowrap',
                        index === 0 ? '' : index === xTicks.length - 1 ? '-translate-x-full' : '-translate-x-1/2'
                    ]"
                    :style="{ left: `${(tick / xScale.max) * 100}%` }"
                    aria-hidden="true"
                >
                    {{ eaAxisPercent(tick, xScale.step) }}
                </span>

                <span class="xa-label absolute right-0 top-2 whitespace-nowrap" aria-hidden="true">
                    &uarr; {{ $t('ea.dev.plot.yAxis') }}
                </span>
                <span class="xa-label absolute right-0 top-full mt-6 whitespace-nowrap" aria-hidden="true">
                    {{ $t('ea.dev.plot.xAxis') }} &rarr;
                </span>

                <!-- Dots -->
                <div
                    v-for="(point, index) in points"
                    :key="point.ea.slug"
                    :class="['xa-plot__point absolute', active === point.ea.slug ? 'z-20' : 'z-10']"
                    :style="{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, '--xa-pop-delay': `${300 + index * 90}ms` }"
                    @mouseenter="preview(point.ea.slug)"
                >
                    <button
                        type="button"
                        :class="['xa-plot__dot xa-pop', { 'is-active': active === point.ea.slug }]"
                        :style="{ '--xa-dot': point.ea.band.bar }"
                        :aria-label="pointLabel(point.ea)"
                        :aria-expanded="active === point.ea.slug"
                        @click="toggle(point.ea.slug)"
                        @focus="preview(point.ea.slug)"
                        @blur="preview(null)"
                    >
                        <span class="xa-plot__num ea-num" aria-hidden="true">{{ point.rank }}</span>
                    </button>

                    <NuxtLink
                        :to="EA_ROUTES.ea(point.ea.slug)"
                        tabindex="-1"
                        :class="[
                            'xa-plot__label xa-fade absolute flex items-center gap-1.5 whitespace-nowrap font-poppins leading-4',
                            SIDE_CLASS[sides[index]]
                        ]"
                        :style="{ '--xa-fade-delay': `${500 + index * 90}ms` }"
                    >
                        <span class="text-[12px] font-medium text-Tinted/950">{{ point.ea.name }}</span>
                        <span class="ea-num text-[11px] font-semibold text-Tinted/500">{{ point.ea.score }}</span>
                    </NuxtLink>

                    <!-- Detail card -->
                    <Transition name="fade">
                        <div
                            v-if="active === point.ea.slug"
                            :class="[
                                'absolute z-30 w-[188px] rounded-xl bg-Tinted/900 p-3 shadow-[0_16px_32px_-8px_rgba(28,24,51,0.4)]',
                                point.y < 0.42 ? 'top-full mt-4' : 'bottom-full mb-4',
                                point.x < 0.22 ? 'left-0 -translate-x-4' : point.x > 0.78 ? 'right-0 translate-x-4' : 'left-1/2 -translate-x-1/2'
                            ]"
                        >
                            <p class="flex items-center justify-between gap-2">
                                <span class="truncate font-poppins text-[13px] font-semibold leading-[18px] text-white">{{ point.ea.name }}</span>
                                <span
                                    class="ea-num shrink-0 rounded-full px-1.5 py-0.5 font-poppins text-[11px] font-semibold leading-4 text-Tinted/950"
                                    :style="{ backgroundColor: point.ea.band.bar }"
                                >
                                    {{ point.ea.score }}
                                </span>
                            </p>
                            <dl class="mt-2 grid grid-cols-2 gap-2">
                                <div class="flex flex-col gap-0.5">
                                    <dt class="xa-label !text-Tinted/300">{{ $t('ea.card.monthly') }}</dt>
                                    <dd class="ea-num font-poppins text-[13px] font-semibold leading-[18px] text-white">{{ eaPercent(point.ea.monthly) }}</dd>
                                </div>
                                <div class="flex flex-col gap-0.5">
                                    <dt class="xa-label !text-Tinted/300">{{ $t('ea.card.maxDd') }}</dt>
                                    <dd class="ea-num font-poppins text-[13px] font-semibold leading-[18px] text-white">{{ eaPercent(point.ea.maxDrawdown) }}</dd>
                                </div>
                            </dl>
                            <NuxtLink :to="EA_ROUTES.ea(point.ea.slug)" class="xa-link mt-2.5 !text-[12px] text-Violet/300 hover:text-white">
                                {{ $t('ea.dev.plot.view') }}
                                <EaIcon name="arrowRight" class="size-3.5" />
                            </NuxtLink>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </section>
</template>
