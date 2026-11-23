<script setup lang="ts">
// A gradient phrase that cycles through alternatives by scrambling OUT of one
// and IN to the next, after Motion's "Scramble text" example:
//   1. out — the current phrase dissolves into flickering symbols from its last
//      letter back to its first,
//   2. for a beat the whole run is symbols,
//   3. in — the run takes the next phrase's shape and its real letters land
//      left to right out of the noise.
// Then it holds, and goes again. The first phrase scrambles in once on load.
//
// The noise is symbols and block shapes, not letters, so the scrambling reads
// as noise rather than as wrong words. Hyphens, spaces and punctuation never
// scramble, so the words keep their outline throughout.
//
// LAYOUT. Every letter is a cell locked to the width of its REAL glyph, read
// off an invisible copy of each phrase, so a wide symbol overlaps its
// neighbours for a frame instead of shoving the line. The run only changes
// shape once, at the turn from out to in. The invisible copies are stacked in
// the same grid cell as the live run, so the box is always as tall as the
// longest phrase and the heading never moves. Cells are grouped into nowrap
// words with real spaces between them, so the run wraps at spaces only
// (Chrome would otherwise break between any two inline-blocks), exactly where
// the invisible copy wraps.
//
// GRADIENT. Each cell carries its own slice of `ea-text`, sized to its line and
// offset by its position in it (read off the same invisible copy), which
// reproduces `.ea-grad` — one sweep per line — so symbols take the gradient
// colour of the letter they stand in for.
//
// A11Y. Screen readers get the first phrase, once; the live run is
// aria-hidden. Under prefers-reduced-motion nothing scrambles or cycles.
interface Props {
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** ms each phrase stays settled before it scrambles out. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { suffix: '', hold: 2600 })

const OUT = 380 // ms for the old phrase to dissolve, last letter to first
const GAP = 120 // ms the run is all symbols between out and in
const IN = 760 // ms for the new phrase to land, first letter to last
const FLICKER = 55 // ms between symbol changes

const NOISE = '▓▒░█▀▄■□▪▫◆◇◈◊○●‡†?!#%&*+=<>[]{}|/\\^_~'

const scrambles = (ch: string) => /\p{L}|\p{N}/u.test(ch)
const randomNoise = () => NOISE[Math.floor(Math.random() * NOISE.length)]!

const current = ref(0)
const chars = computed(() => [...props.phrases[current.value]!])
/** What each cell shows right now: the real letter, or a symbol. */
const shown = ref<string[]>([...chars.value])

/** The live run's words, as character indices into the phrase. */
const words = computed(() => {
    const out: number[][] = [[]]
    chars.value.forEach((ch, i) => (ch === ' ' ? out.push([]) : out[out.length - 1]!.push(i)))
    return out
})

// Per phrase, per character: the real glyph's width and its gradient slice.
type Cell = { width: string; backgroundSize: string; backgroundPosition: string }
const geometry = ref<Cell[][]>([])
const root = ref<HTMLElement | null>(null)

function measure() {
    const el = root.value
    if (!el) return
    geometry.value = [...el.querySelectorAll<HTMLElement>('.ea-scramble-swap__sizer')].map((sizer) => {
        const spans = [...sizer.querySelectorAll<HTMLElement>('.ea-scramble-swap__char')]
        const boxes = spans.map((s) => ({
            ch: s.textContent ?? '',
            top: s.offsetTop,
            left: s.offsetLeft,
            w: s.getBoundingClientRect().width
        }))
        const lines = new Map<number, { left: number; right: number }>()
        for (const b of boxes) {
            if (b.ch === ' ') continue
            const line = lines.get(b.top) ?? { left: Infinity, right: -Infinity }
            line.left = Math.min(line.left, b.left)
            line.right = Math.max(line.right, b.left + b.w)
            lines.set(b.top, line)
        }
        return boxes.map((b) => {
            const line = lines.get(b.top) ?? { left: b.left, right: b.left + b.w }
            return {
                width: `${b.w}px`,
                backgroundSize: `${line.right - line.left}px 100%`,
                backgroundPosition: `${line.left - b.left}px 0`
            }
        })
    })
}
const cellStyle = (i: number) => geometry.value[current.value]?.[i]

let raf = 0
let timer: ReturnType<typeof setTimeout> | undefined
let onScreen = true
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

/**
 * Run one scramble across `text`, frame by frame, until `done`.
 * `noisy(i, t)` says whether character i shows noise at time t.
 */
function run(text: string[], noisy: (i: number, t: number) => boolean, duration: number, done: () => void) {
    cancelAnimationFrame(raf)
    const start = performance.now()
    let lastFlicker = -Infinity
    const frame = (now: number) => {
        const t = now - start
        const flicker = t - lastFlicker >= FLICKER
        if (flicker) lastFlicker = t
        shown.value = text.map((ch, i) => {
            if (!scrambles(ch) || !noisy(i, t)) return ch
            // Keep the symbol already showing between flickers.
            const prev = shown.value[i]
            return flicker || !prev || prev === ch ? randomNoise() : prev
        })
        if (t < duration) raf = requestAnimationFrame(frame)
        else done()
    }
    raf = requestAnimationFrame(frame)
}

/** Positions of the characters that scramble, in reading order. */
const lettersOf = (text: string[]) => text.map((_, i) => i).filter((i) => scrambles(text[i]!))

function scrambleIn(k: number, then: () => void) {
    current.value = k
    const text = [...props.phrases[k]!]
    const letters = lettersOf(text)
    const landAt: number[] = []
    letters.forEach((i, n) => (landAt[i] = GAP + (IN * (n + 1)) / letters.length))
    run(text, (i, t) => t < landAt[i]!, GAP + IN, () => {
        shown.value = text
        then()
    })
}

function scrambleOut(then: () => void) {
    const text = [...props.phrases[current.value]!]
    const letters = lettersOf(text)
    const goAt: number[] = []
    letters.forEach((i, n) => (goAt[i] = (OUT * (letters.length - 1 - n)) / letters.length))
    run(text, (i, t) => t >= goAt[i]!, OUT, then)
}

function schedule() {
    clearTimeout(timer)
    if (props.phrases.length < 2) return
    timer = setTimeout(() => {
        // Off screen or in a background tab: wait, rather than cycle unseen.
        if (!onScreen || document.hidden) return schedule()
        scrambleOut(() => scrambleIn((current.value + 1) % props.phrases.length, schedule))
    }, props.hold)
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
    measure()
    document.fonts?.ready.then(measure)
    resizeObserver = new ResizeObserver(measure)
    if (root.value) resizeObserver.observe(root.value)
    if (reduced()) return
    intersectionObserver = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting
    })
    if (root.value) intersectionObserver.observe(root.value)
    scrambleIn(0, schedule)
})

// A locale switch swaps every phrase: settle on the first and start over.
watch(
    () => props.phrases.join('\n'),
    async () => {
        cancelAnimationFrame(raf)
        clearTimeout(timer)
        current.value = 0
        shown.value = [...chars.value]
        await nextTick()
        measure()
        if (!reduced()) schedule()
    }
)

onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    clearTimeout(timer)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
})
</script>

<template>
    <span ref="root" class="ea-scramble-swap">
        <span class="sr-only">{{ phrases[0] }}{{ suffix }}</span>
        <span v-for="(phrase, k) in phrases" :key="k" class="ea-scramble-swap__sizer" aria-hidden="true"
            ><span v-for="(ch, i) in [...phrase]" :key="i" class="ea-scramble-swap__char">{{ ch }}</span
            >{{ suffix }}</span
        >
        <span class="ea-scramble-swap__live" aria-hidden="true"
            ><template v-for="(word, w) in words" :key="`${current}-${w}`"
                ><span class="whitespace-nowrap"
                    ><span v-for="i in word" :key="i" class="ea-scramble-swap__cell" :style="cellStyle(i)">{{
                        shown[i]
                    }}</span></span
                >{{ w < words.length - 1 ? ' ' : '' }}</template
            >{{ suffix }}</span
        >
    </span>
</template>

<style scoped>
.ea-scramble-swap {
    display: grid;
}
.ea-scramble-swap__sizer,
.ea-scramble-swap__live {
    grid-area: 1 / 1;
    display: block;
}
.ea-scramble-swap__sizer {
    visibility: hidden;
}
.ea-scramble-swap__cell {
    display: inline-block;
    text-align: center;
    background-image: theme('backgroundImage.ea-text');
    background-repeat: no-repeat;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
}
@supports not ((background-clip: text) or (-webkit-background-clip: text)) {
    .ea-scramble-swap__cell {
        @apply text-Blue/600;
        -webkit-text-fill-color: currentColor;
    }
}
</style>
