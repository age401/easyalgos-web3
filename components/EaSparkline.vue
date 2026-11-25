<script setup lang="ts">
// The growth curve on an EA card (Figma "MyFXBook Graph", 4042:3754).
//
// A framed plot in Myfxbook's own colours, because that is where the record
// lives: a 1px Tinted/100 frame that thickens to 6px along the top, a faint
// square grid behind the curve, the curve in Indicators Red, and a small
// "myfxbook.com" label in the corner that links to the EA's record there.
//
// The curve is drawn from the EA's own series rather than shipped as exported
// paths: it is data, and it changes every day. The geometry is the drawn one -
// a 2px line whose lowest point sits 3px off the floor and whose highest sits
// 5px off the top, over a red wash that fades to nothing.
//
// The box is fluid in width and fixed in height, so the viewBox is stretched
// (`preserveAspectRatio="none"`) and the stroke is pinned with
// `vector-effect`, which keeps it 2px however wide the card is. That rules out
// the usual dash-offset draw-in - a normalised dash misbehaves under a
// non-scaling stroke - so the entrance is a left-to-right clip wipe on the SVG
// box instead (`.xa-wipe`), which reads the same and has no such caveat.
//
// The label sits 3px in from the frame's outer edge as drawn, which is 2px
// inside its 1px border. It is a real link and sits above the card's stretched link (z-[1]),
// like the card's tool buttons. Drawn 15px tall, it gets a larger invisible
// hit area so it is not a fingertip-sized miss on a phone.
interface Props {
    points: readonly number[]
    /** The EA's Myfxbook record. */
    href: string
    /** Accessible name for the label link. */
    label: string
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
    <div class="xa-grid relative overflow-hidden rounded-xl border border-t-[6px] border-Tinted/100 pb-[7px] pt-2">
        <svg
            class="xa-wipe block h-[52px] w-full overflow-visible"
            :viewBox.attr="`0 0 ${WIDTH} ${HEIGHT}`"
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

        <a
            :href="href"
            target="_blank"
            rel="noopener"
            :aria-label="label"
            class="absolute bottom-[2px] right-[2px] z-[1] rounded-[4px] rounded-br-lg bg-Tinted/25 px-1 py-0.5 font-franklin text-[8px] font-medium leading-[1.4] text-Tinted/700 transition-colors duration-300 before:absolute before:-inset-x-2 before:-inset-y-3 before:content-[''] hover:bg-Tinted/50 hover:text-Tinted/950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-Blue/600"
        >
            myfxbook.com
        </a>
    </div>
</template>
