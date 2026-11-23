<script setup lang="ts">
// A gradient phrase that cycles through alternatives with a cascading roll,
// after the "CascadeText" hover effect: every letter is a little reel, and the
// reels turn one after another from left to right. The current phrase's
// letters slide up and out of their line while the next phrase's letters push
// in from below, the two moving together with the same delay and easing, so
// each new letter looks like it shoves the old one out of the top. Then it
// holds, and rolls again. There is no roll on load: the first paint already
// shows the heading.
//
// LAYOUT. The component renders the WHOLE heading (lead, run, tail) because
// the phrases do not all set on the same number of lines: the desktop column
// runs from 545px to 760px as the stat tiles beside it settle, and the
// translations are longer still. So:
//   - one invisible copy of the full heading per phrase is stacked in a grid
//     cell with the live heading, making the box as tall as the TALLEST
//     version. That is plain CSS, so it is right from the server-rendered
//     first paint and the page under the heading never moves.
//   - in the live heading, every phrase's run is rendered, but only the one
//     showing is in flow; the others sit absolutely over it, parked below
//     their lines. A shorter phrase leaves the slack BELOW the heading, never
//     as a blank line inside it; only the tail moves, by a line, at the
//     instant the roll starts.
//
// LETTERS. Every letter is a cell locked to the width of its glyph, read off
// the invisible copy, and clipped to its line with `clip-path` (not
// `overflow`, which would move its baseline). The glyph inside is what rolls.
// Words are nowrap groups — in the live runs AND in the copies, whose letters
// are boxes too — so both wrap at spaces only and always on the same lines.
// The suffix (the English comma) is an ink-coloured cell that rolls last.
//
// GRADIENT. A transformed glyph falls out of a parent's `background-clip:
// text`, so each glyph carries its own slice of `ea-text`, sized to its line
// and offset by its position in it, which reproduces `.ea-grad` (one sweep per
// line). The slice travels with the glyph, so a letter keeps its colour as it
// rolls.
//
// A11Y. Screen readers get the heading with its first phrase, once; the copies
// and the live heading are aria-hidden. Under prefers-reduced-motion nothing
// rolls or cycles.
interface Props {
    /** Heading text before the run, on its own line(s). */
    lead?: string
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** Heading text after the run, on its own line(s). */
    tail?: string
    /** ms each phrase stays settled before the next one rolls in. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { lead: '', suffix: '', tail: '', hold: 2600 })

const STAGGER = 24 // ms between one letter starting to roll and the next
const ROLL = 480 // ms one letter takes to roll

type Box = { i: number; ch: string; ink: boolean; order: number }
type Run = { words: Box[][]; suffix: Box[]; length: number }

/** A phrase as word groups of letters, plus the suffix, each tagged with its roll order. */
const runs = computed<Run[]>(() =>
    props.phrases.map((phrase) => {
        const chars = [...phrase]
        const words: Box[][] = [[]]
        let order = 0
        chars.forEach((ch, i) => {
            if (ch === ' ') words.push([])
            else words[words.length - 1]!.push({ i, ch, ink: false, order: order++ })
        })
        const suffix = [...props.suffix].map((ch, j) => ({ i: chars.length + j, ch, ink: true, order: order++ }))
        return { words, suffix, length: order }
    })
)

// 'in' = showing, 'out' = rolled out of the top, 'below' = parked under the line.
type State = 'in' | 'out' | 'below'
const initialStates = () => props.phrases.map((_, k): State => (k === 0 ? 'in' : 'below'))
const states = ref<State[]>(initialStates())
let current = 0

// Per phrase, per character index: the glyph's width and its gradient slice.
type Geometry = { width: string; backgroundSize?: string; backgroundPosition?: string }
const geometry = ref<Geometry[][]>([])
const root = ref<HTMLElement | null>(null)

function measure() {
    const el = root.value
    if (!el) return
    geometry.value = [...el.querySelectorAll<HTMLElement>('.ea-cascade__copy')].map((copy) => {
        const boxes = [...copy.querySelectorAll<HTMLElement>('.ea-cascade__char')].map((s) => ({
            i: Number(s.dataset.i),
            ink: s.dataset.ink === '1',
            top: s.offsetTop,
            left: s.offsetLeft,
            w: s.getBoundingClientRect().width
        }))
        const lines = new Map<number, { left: number; right: number }>()
        for (const b of boxes) {
            if (b.ink) continue
            const line = lines.get(b.top) ?? { left: Infinity, right: -Infinity }
            line.left = Math.min(line.left, b.left)
            line.right = Math.max(line.right, b.left + b.w)
            lines.set(b.top, line)
        }
        const cells: Geometry[] = []
        for (const b of boxes) {
            const line = lines.get(b.top)
            cells[b.i] =
                b.ink || !line
                    ? { width: `${b.w}px` }
                    : {
                          width: `${b.w}px`,
                          backgroundSize: `${line.right - line.left}px 100%`,
                          backgroundPosition: `${line.left - b.left}px 0`
                      }
        }
        return cells
    })
}
const cellStyle = (k: number, box: Box) => ({
    width: geometry.value[k]?.[box.i]?.width,
    '--order': box.order
})
const glyphStyle = (k: number, box: Box) => {
    const g = geometry.value[k]?.[box.i]
    return g?.backgroundSize ? { backgroundSize: g.backgroundSize, backgroundPosition: g.backgroundPosition } : undefined
}

let timer: ReturnType<typeof setTimeout> | undefined
let parkTimer: ReturnType<typeof setTimeout> | undefined
let onScreen = true
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

function schedule(ms = props.hold) {
    clearTimeout(timer)
    if (props.phrases.length < 2) return
    timer = setTimeout(roll, ms)
}

function roll() {
    // Off screen or in a background tab: wait, rather than cycle unseen.
    if (!onScreen || document.hidden) return schedule()
    const from = current
    const to = (current + 1) % props.phrases.length
    states.value[from] = 'out'
    states.value[to] = 'in'
    current = to
    const span = (k: number) => ROLL + STAGGER * (runs.value[k]!.length - 1)
    // Park the old phrase back under its line once it has fully left.
    clearTimeout(parkTimer)
    parkTimer = setTimeout(() => {
        if (states.value[from] === 'out') states.value[from] = 'below'
    }, span(from) + 50)
    schedule(Math.max(span(from), span(to)) + props.hold)
}

onMounted(() => {
    measure()
    document.fonts?.ready.then(measure)
    resizeObserver = new ResizeObserver(measure)
    if (root.value) resizeObserver.observe(root.value)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    intersectionObserver = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting
    })
    if (root.value) intersectionObserver.observe(root.value)
    schedule()
})

// A locale switch swaps every phrase: settle on the first and start over.
watch(
    () => props.phrases.join('\n') + props.suffix,
    async () => {
        const running = timer !== undefined
        clearTimeout(timer)
        clearTimeout(parkTimer)
        current = 0
        states.value = initialStates()
        await nextTick()
        measure()
        if (running) schedule()
    }
)

onBeforeUnmount(() => {
    clearTimeout(timer)
    clearTimeout(parkTimer)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
})
</script>

<template>
    <span ref="root" class="ea-cascade" :style="{ '--roll': `${ROLL}ms`, '--stagger': `${STAGGER}ms` }">
        <span class="sr-only">{{ lead }} {{ phrases[0] }}{{ suffix }} {{ tail }}</span>
        <span v-for="(run, k) in runs" :key="`c${k}`" class="ea-cascade__layer ea-cascade__copy" aria-hidden="true"
            >{{ lead }}
            <span class="ea-cascade__run"
                ><template v-for="(word, w) in run.words" :key="w"
                    ><span class="whitespace-nowrap"
                        ><span
                            v-for="box in word"
                            :key="box.i"
                            class="ea-cascade__char"
                            :data-i="box.i"
                            >{{ box.ch }}</span
                        ><template v-if="w === run.words.length - 1"
                            ><span
                                v-for="box in run.suffix"
                                :key="box.i"
                                class="ea-cascade__char"
                                :data-i="box.i"
                                data-ink="1"
                                >{{ box.ch }}</span
                            ></template
                        ></span
                    >{{ w < run.words.length - 1 ? ' ' : '' }}</template
                ></span
            >
            {{ tail }}</span
        >
        <span class="ea-cascade__layer" aria-hidden="true"
            >{{ lead }}
            <span class="ea-cascade__stack"
                ><span v-for="(run, k) in runs" :key="`r${k}`" :class="['ea-cascade__run', `is-${states[k]}`]"
                    ><template v-for="(word, w) in run.words" :key="w"
                        ><span class="whitespace-nowrap"
                            ><span
                                v-for="box in word"
                                :key="box.i"
                                class="ea-cascade__cell"
                                :style="cellStyle(k, box)"
                                ><span class="ea-cascade__glyph" :style="glyphStyle(k, box)">{{ box.ch }}</span></span
                            ><template v-if="w === run.words.length - 1"
                                ><span
                                    v-for="box in run.suffix"
                                    :key="box.i"
                                    class="ea-cascade__cell is-ink"
                                    :style="cellStyle(k, box)"
                                    ><span class="ea-cascade__glyph">{{ box.ch }}</span></span
                                ></template
                            ></span
                        >{{ w < run.words.length - 1 ? ' ' : '' }}</template
                    ></span
                ></span
            >
            {{ tail }}</span
        >
    </span>
</template>

<style scoped>
.ea-cascade {
    display: grid;
}
.ea-cascade__layer {
    grid-area: 1 / 1;
    display: block;
}
.ea-cascade__copy {
    visibility: hidden;
}
.ea-cascade__run,
.ea-cascade__stack {
    display: block;
}
.ea-cascade__stack {
    position: relative;
}
/* Only the phrase showing is in flow; the rest lie over it, out of the way. */
.ea-cascade__stack > .ea-cascade__run:not(.is-in) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}
/* The copies' letters are boxes like the live cells, not running text: running
   text is kerned across letters and the cells cannot be, and a few px a line
   is enough for a copy to wrap where the live run does not. */
.ea-cascade__char,
.ea-cascade__cell {
    display: inline-block;
}
.ea-cascade__cell {
    /* Clip to the line, with a hair of bleed so no descender is shaved at
       rest, and room either side for glyph overhang. */
    clip-path: inset(-0.06em -0.2em);
}
.ea-cascade__glyph {
    display: inline-block;
    background-image: theme('backgroundImage.ea-text');
    background-repeat: no-repeat;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    transition: transform var(--roll) cubic-bezier(0.65, 0, 0.25, 1);
    transition-delay: calc(var(--order) * var(--stagger));
}
.is-ink .ea-cascade__glyph {
    background-image: none;
    color: inherit;
    -webkit-text-fill-color: currentColor;
}
.is-in .ea-cascade__glyph {
    transform: translateY(0);
}
.is-out .ea-cascade__glyph {
    transform: translateY(-100%);
}
.is-below .ea-cascade__glyph {
    transform: translateY(100%);
    transition: none;
}
@supports not ((background-clip: text) or (-webkit-background-clip: text)) {
    .ea-cascade__glyph {
        @apply text-Blue/600;
        -webkit-text-fill-color: currentColor;
    }
}
</style>
