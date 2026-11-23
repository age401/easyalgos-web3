<script setup lang="ts">
// The equity curve on an EA card (Figma "Equity curve", 282x52).
//
// Drawn from the EA's own series rather than shipped as twenty-one exported
// paths: it is data, and it changes every day. The geometry is the drawn one -
// a 2px brand-gradient line whose lowest point sits 3px off the floor and whose
// highest sits 5px off the top, over a Violet wash that fades to nothing.
//
// The box is fluid in width and fixed in height, so the viewBox is stretched
// (`preserveAspectRatio="none"`) and the stroke is pinned with
// `vector-effect`, which keeps it 2px however wide the card is. That rules out
// the usual dash-offset draw-in - a normalised dash misbehaves under a
// non-scaling stroke - so the entrance is a left-to-right clip wipe on the SVG
// box instead (`.xa-wipe`), which reads the same and has no such caveat.
interface Props {
    points: readonly number[]
}
const props = defineProps<Props>()

const WIDTH = 282
const HEIGHT = 52

// useId keeps the two gradients unique per card AND identical between the
// server render and hydration, which a counter or Math.random could not.
const id = useId()

const plotted = computed(() => eaPlotPoints(props.points, { width: WIDTH, height: HEIGHT, top: 5, bottom: 3 }))
const line = computed(() => eaLinePath(plotted.value))
const area = computed(() => eaAreaPath(plotted.value, HEIGHT))
</script>

<template>
    <svg
        class="xa-wipe h-[52px] w-full overflow-visible"
        :viewBox.attr="`0 0 ${WIDTH} ${HEIGHT}`"
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
        <path :d="area" :fill="`url(#${id}-wash)`" />
        <path
            :d="line"
            :stroke="`url(#${id}-line)`"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
        />
    </svg>
</template>
