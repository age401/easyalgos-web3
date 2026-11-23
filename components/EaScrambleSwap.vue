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
// LAYOUT. The component renders the WHOLE heading (lead, run, tail) because
// the phrases do not all set on the same number of lines. No choice of copy
// fixes that: the desktop column runs from 545px to 760px as the stat tiles
// beside it settle, and the translations are longer still. So:
//   - one invisible copy of the full heading per phrase is stacked in a grid
//     cell with the live heading, making the box as tall as the TALLEST
//     version. That is plain CSS, so it is right from the server-rendered
//     first paint and the page under the heading never moves.
//   - the live heading flows normally from the top of that box. A shorter
//     phrase leaves the slack BELOW the heading, never as a blank line inside
//     it; only the tail moves, by a line, at the instant the phrase changes.
// Reserving space around the run alone (the first version) put that slack
// between the run and the tail, which read as an empty line in the heading.
//
// Every letter is a cell locked to the width of its REAL glyph, read off the
// invisible copy, so a wide symbol overlaps its neighbours for a frame
// instead of shoving the line. Words are nowrap groups, in the live run AND
// in the copies, with real spaces between them, so both wrap at spaces only
// and always on the same lines (Chrome would otherwise break between any two
// inline-blocks, and plain text would break after a hyphen).
//
// GRADIENT. Each cell carries its own slice of `ea-text`, sized to its line and
// offset by its position in it (read off the same invisible copy), which
// reproduces `.ea-grad` — one sweep per line — so symbols take the gradient
// colour of the letter they stand in for.
//
// A11Y. Screen readers get the heading with its first phrase, once; the copies
// and the live heading are aria-hidden. Under prefers-reduced-motion nothing scrambles or cycles.
interface Props {
    /** Heading text before the run, on its own line(s). */
    lead?: string
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** Heading text after the run, on its own line(s). */
    tail?: string
    /** ms each phrase stays settled before it scrambles out. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { lead: '', suffix: '', tail: '', hold: 2600 })

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

/** A phrase's words, as character indices into it. */
function wordsOf(text: string[]) {
    const out: number[][] = [[]]
    text.forEach((ch, i) => (ch === ' ' ? out.push([]) : out[out.length - 1]!.push(i)))
    return out
}
const words = computed(() => wordsOf(chars.value))
const copies = computed(() => props.phrases.map((p) => ({ chars: [...p], words: wordsOf([...p]) })))

// Per phrase, per character: the real glyph's width and its gradient slice.
type Cell = { width: string; backgroundSize: string; backgroundPosition: string }
const geometry = ref<Cell[][]>([])
const root = ref<HTMLElement | null>(null)

function measure() {
    const el = root.value
    if (!el) return
    geometry.value = [...el.querySelectorAll<HTMLElement>('.ea-scramble-swap__copy')].map((sizer) => {
        // Spaces are text between the word groups, not letters, so each letter
        // carries its index in the phrase and the geometry is keyed by it —
        // the same index the live cells look themselves up by.
        const boxes = [...sizer.querySelectorAll<HTMLElement>('.ea-scramble-swap__char')].map((s) => ({
            i: Number(s.dataset.i),
            top: s.offsetTop,
            left: s.offsetLeft,
            w: s.getBoundingClientRect().width
        }))
        const lines = new Map<number, { left: number; right: number }>()
        for (const b of boxes) {
            const line = lines.get(b.top) ?? { left: Infinity, right: -Infinity }
            line.left = Math.min(line.left, b.left)
            line.right = Math.max(line.right, b.left + b.w)
            lines.set(b.top, line)
        }
        const cells: Cell[] = []
        for (const b of boxes) {
            const line = lines.get(b.top)!
            cells[b.i] = {
                width: `${b.w}px`,
                backgroundSize: `${line.right - line.left}px 100%`,
                backgroundPosition: `${line.left - b.left}px 0`
            }
        }
        return cells
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
        <span class="sr-only">{{ lead }} {{ phrases[0] }}{{ suffix }} {{ tail }}</span>
        <span
            v-for="(copy, k) in copies"
            :key="k"
            class="ea-scramble-swap__layer ea-scramble-swap__copy"
            aria-hidden="true"
            >{{ lead }}
            <span class="ea-scramble-swap__run"
                ><template v-for="(word, w) in copy.words" :key="w"
                    ><span class="whitespace-nowrap"
                        ><span v-for="i in word" :key="i" class="ea-scramble-swap__char" :data-i="i">{{
                            copy.chars[i]
                        }}</span></span
                    >{{ w < copy.words.length - 1 ? ' ' : '' }}</template
                >{{ suffix }}</span
            >
            {{ tail }}</span
        >
        <span class="ea-scramble-swap__layer" aria-hidden="true"
            >{{ lead }}
            <span class="ea-scramble-swap__run"
                ><template v-for="(word, w) in words" :key="`${current}-${w}`"
                    ><span class="whitespace-nowrap"
                        ><span v-for="i in word" :key="i" class="ea-scramble-swap__cell" :style="cellStyle(i)">{{
                            shown[i]
                        }}</span></span
                    >{{ w < words.length - 1 ? ' ' : '' }}</template
                >{{ suffix }}</span
            >
            {{ tail }}</span
        >
    </span>
</template>

<style scoped>
.ea-scramble-swap {
    display: grid;
}
.ea-scramble-swap__layer {
    grid-area: 1 / 1;
    display: block;
}
.ea-scramble-swap__copy {
    visibility: hidden;
}
.ea-scramble-swap__run {
    display: block;
}
/* The copies' letters are boxes like the live cells, not running text. Running
   text is kerned across letters and the live cells cannot be, so the two
   differ by a few px a line — enough for a copy to wrap where the live run
   does not, which reserves a line the heading never uses. */
.ea-scramble-swap__char {
    display: inline-block;
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
