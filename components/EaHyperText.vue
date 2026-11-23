<script setup lang="ts">
// A gradient phrase that cycles through alternatives by DECODING into each one:
// the run switches to the next phrase's shape with every letter scrambling
// through random glyphs, and the real letters lock in from left to right.
// After the last one lands the phrase holds, then decodes into the next. The
// first phrase decodes once on load too.
//
// Modelled on Magic UI's HyperText. That one sets uppercase monospace, where a
// random glyph is always the same width as the real one. This heading is
// mixed-case Poppins, so two things change:
//   - the random pool follows the real letter's case (upper for upper, lower
//     for lower), so a word keeps its silhouette while it scrambles; hyphens,
//     spaces and punctuation never scramble.
//   - every letter is a cell locked to the width of its REAL glyph, measured
//     from an invisible copy of the phrase, so a wide random "W" in an "i" cell
//     overlaps its neighbours for a frame instead of shoving the whole line.
//     The phrase therefore takes its final shape the moment it starts
//     decoding, and nothing re-flows while it does.
//
// Nothing moves or fades, so the cells need no gradient of their own: the run
// is an ordinary `.ea-grad` span (one blue-to-violet sweep per line), and the
// cells are inline-blocks inside it, painted through its text clip.
//
// LAYOUT. Each phrase is also set as invisible text, stacked in the same grid
// cell as the live run, so the box is always as tall as the longest phrase and
// the heading never moves. That copy is also what the cell widths are read
// from. Cells are grouped into nowrap words with real spaces between them, so
// the run wraps at spaces only (Chrome would otherwise break between any two
// inline-blocks).
//
// A11Y. Screen readers get the first phrase, once; the live run is
// aria-hidden. Under prefers-reduced-motion nothing scrambles or cycles.
interface Props {
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** ms each phrase stays settled before the next one decodes. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { suffix: '', hold: 2600 })

const DURATION = 900 // ms from the first letter locking to the last
const FLICKER = 45 // ms between random glyph changes

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'

/** Which glyphs a character scrambles through, or null if it never does. */
function poolFor(ch: string): string | null {
    if (/\p{Lu}/u.test(ch)) return UPPER
    if (/\p{Ll}/u.test(ch)) return LOWER
    return null
}
const randomFrom = (pool: string) => pool[Math.floor(Math.random() * pool.length)]!

const current = ref(0)
const chars = computed(() => [...props.phrases[current.value]!])
/** What each cell shows right now: the real letter, or a random one. */
const shown = ref<string[]>([...chars.value])

/** The live run's words, as character indices into the phrase. */
const words = computed(() => {
    const out: number[][] = [[]]
    chars.value.forEach((ch, i) => (ch === ' ' ? out.push([]) : out[out.length - 1]!.push(i)))
    return out
})

// Width of every real glyph in every phrase, read off the invisible copies.
const widths = ref<number[][]>([])
const root = ref<HTMLElement | null>(null)
function measure() {
    const el = root.value
    if (!el) return
    widths.value = [...el.querySelectorAll<HTMLElement>('.ea-hyper__sizer')].map((sizer) =>
        [...sizer.querySelectorAll<HTMLElement>('.ea-hyper__char')].map((c) => c.getBoundingClientRect().width)
    )
}
const cellStyle = (i: number) => {
    const w = widths.value[current.value]?.[i]
    return w ? { width: `${w}px` } : undefined
}

let raf = 0
let timer: ReturnType<typeof setTimeout> | undefined
let onScreen = true
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

function decode(k: number) {
    cancelAnimationFrame(raf)
    current.value = k
    const target = [...props.phrases[k]!]
    const pools = target.map(poolFor)
    const scrambled = () => target.map((ch, i) => (pools[i] ? randomFrom(pools[i]!) : ch))
    shown.value = scrambled()

    const start = performance.now()
    let lastFlicker = start
    const frame = (now: number) => {
        const progress = Math.min((now - start) / DURATION, 1)
        const locked = progress * target.length
        const flicker = now - lastFlicker >= FLICKER
        if (flicker) lastFlicker = now
        let changed = false
        const next = shown.value.map((ch, i) => {
            if (i < locked || !pools[i]) {
                if (ch !== target[i]) changed = true
                return target[i]!
            }
            if (!flicker) return ch
            changed = true
            return randomFrom(pools[i]!)
        })
        if (changed) shown.value = next
        if (progress < 1) raf = requestAnimationFrame(frame)
        else schedule()
    }
    raf = requestAnimationFrame(frame)
}

function schedule() {
    clearTimeout(timer)
    if (props.phrases.length < 2) return
    timer = setTimeout(() => {
        // Off screen or in a background tab: wait, rather than cycle unseen.
        if (!onScreen || document.hidden) return schedule()
        decode((current.value + 1) % props.phrases.length)
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
    decode(0)
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
    <span ref="root" class="ea-hyper">
        <span class="sr-only">{{ phrases[0] }}{{ suffix }}</span>
        <span v-for="(phrase, k) in phrases" :key="k" class="ea-hyper__sizer" aria-hidden="true"
            ><span v-for="(ch, i) in [...phrase]" :key="i" class="ea-hyper__char">{{ ch }}</span
            >{{ suffix }}</span
        >
        <span class="ea-hyper__live" aria-hidden="true"
            ><span class="ea-grad"
                ><template v-for="(word, w) in words" :key="`${current}-${w}`"
                    ><span class="whitespace-nowrap"
                        ><span v-for="i in word" :key="i" class="ea-hyper__cell" :style="cellStyle(i)">{{
                            shown[i]
                        }}</span></span
                    >{{ w < words.length - 1 ? ' ' : '' }}</template
                ></span
            >{{ suffix }}</span
        >
    </span>
</template>

<style scoped>
.ea-hyper {
    display: grid;
}
.ea-hyper__sizer,
.ea-hyper__live {
    grid-area: 1 / 1;
    display: block;
}
.ea-hyper__sizer {
    visibility: hidden;
}
.ea-hyper__cell {
    display: inline-block;
    text-align: center;
}
</style>
