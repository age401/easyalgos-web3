<script setup lang="ts">
// A gradient phrase that cycles through alternatives by DECODING into each one:
// the run switches to the next phrase's shape with every letter scrambling
// through random glyphs, and the real letters lock in from left to right.
// After the last one lands the phrase holds, then decodes into the next. The
// first phrase decodes once on load too.
//
// Modelled on Magic UI's HyperText. That one sets uppercase monospace, where a
// random glyph is always the same width as the real one. This heading is
// mixed-case Poppins, so:
//   - the random pool follows the real letter's case (upper for upper, lower
//     for lower), so a word keeps its silhouette while it scrambles; hyphens,
//     spaces and punctuation never scramble.
//   - every letter is a cell locked to the width of its REAL glyph, measured
//     from an invisible copy of the phrase, so a wide random "W" in an "i" cell
//     overlaps its neighbours for a frame instead of shoving the whole line.
//     The phrase takes its final shape the moment it starts decoding, and
//     nothing re-flows while it does.
//
// SMOOTHING. HyperText swaps every glyph on every frame, all in step, which
// strobes. Here each letter runs its own arrival (the same one `ScrambleText`
// uses for the accolades figures):
//   1. it flickers on its own clock, offset from its neighbours, so the run
//      shimmers instead of flashing in unison,
//   2. the flicker slows as the letter nears its lock time, so it settles
//      rather than snaps,
//   3. it is faint while scrambling and brightens as it goes, and locks onto
//      the real glyph BEFORE full strength — so every wrong glyph is seen
//      faint, and only the right one is ever seen at full strength.
//
// GRADIENT. Fading a letter on its own rules out `.ea-grad` on the run: with
// `background-clip: text` the gradient belongs to the run and a cell has no
// paint of its own to fade. So each cell carries its own slice of `ea-text`,
// sized to the line it sits on and offset by its position in that line — read,
// like the widths, off the invisible copy — which reproduces `.ea-grad` (one
// sweep per line) pixel for pixel.
//
// LAYOUT. Each phrase is also set as invisible text, stacked in the same grid
// cell as the live run, so the box is always as tall as the longest phrase and
// the heading never moves. Cells are grouped into nowrap words with real spaces
// between them, so the run wraps at spaces only (Chrome would otherwise break
// between any two inline-blocks), exactly where the invisible copy wraps.
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

const LEAD = 280 // ms every letter scrambles before the first one locks
const SPREAD = 900 // ms from the first letter locking to the last
const SETTLE = 260 // ms a letter takes to brighten to full after it locks
const FAST = 40 // ms between glyph changes at the start of a letter's scramble
const SLOW = 150 // ms between glyph changes just before it locks
const FAINT = 0.3 // opacity of a scrambling glyph at the start
const LOCKED = 0.72 // opacity a letter has when the real glyph locks in

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'

/** Which glyphs a character scrambles through, or null if it never does. */
function poolFor(ch: string): string | null {
    if (/\p{Lu}/u.test(ch)) return UPPER
    if (/\p{Ll}/u.test(ch)) return LOWER
    return null
}
const randomFrom = (pool: string, not?: string) => {
    let ch = not
    while (ch === not) ch = pool[Math.floor(Math.random() * pool.length)]!
    return ch!
}
const easeIn = (t: number) => t * t
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)

const current = ref(0)
const chars = computed(() => [...props.phrases[current.value]!])
/** What each cell shows right now: the real letter, or a random one. */
const shown = ref<string[]>([...chars.value])
/** Each cell's opacity right now. */
const alpha = ref<number[]>(chars.value.map(() => 1))

/** The live run's words, as character indices into the phrase. */
const words = computed(() => {
    const out: number[][] = [[]]
    chars.value.forEach((ch, i) => (ch === ' ' ? out.push([]) : out[out.length - 1]!.push(i)))
    return out
})

// Per phrase, per character: the real glyph's width and its gradient slice,
// read off the invisible copies.
type Cell = { width: string; backgroundSize: string; backgroundPosition: string }
const geometry = ref<Cell[][]>([])
const root = ref<HTMLElement | null>(null)

function measure() {
    const el = root.value
    if (!el) return
    geometry.value = [...el.querySelectorAll<HTMLElement>('.ea-hyper__sizer')].map((sizer) => {
        const spans = [...sizer.querySelectorAll<HTMLElement>('.ea-hyper__char')]
        const boxes = spans.map((s) => ({ ch: s.textContent ?? '', top: s.offsetTop, left: s.offsetLeft, w: s.getBoundingClientRect().width }))
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
const cellStyle = (i: number) => {
    const g = geometry.value[current.value]?.[i]
    const a = alpha.value[i] ?? 1
    return g ? { ...g, opacity: a < 1 ? a.toFixed(3) : undefined } : undefined
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
    const letters = target.map((_, i) => i).filter((i) => pools[i])
    // Lock times run left to right across the LETTERS only, so a space or a
    // hyphen does not leave a pause in the wave.
    const lockAt: number[] = []
    letters.forEach((i, n) => (lockAt[i] = LEAD + (SPREAD * n) / Math.max(letters.length - 1, 1)))
    // Each letter's next glyph change, starting out of step with its neighbours.
    const nextChange = target.map(() => Math.random() * FAST)

    shown.value = target.map((ch, i) => (pools[i] ? randomFrom(pools[i]!, ch) : ch))
    alpha.value = target.map((_, i) => (pools[i] ? FAINT : 1))

    const start = performance.now()
    const end = LEAD + SPREAD + SETTLE
    const frame = (now: number) => {
        const t = now - start
        const glyphs = shown.value.slice()
        const alphas = alpha.value.slice()
        for (const i of letters) {
            const lock = lockAt[i]!
            if (t >= lock) {
                glyphs[i] = target[i]!
                alphas[i] = LOCKED + (1 - LOCKED) * easeOut(Math.min((t - lock) / SETTLE, 1))
                continue
            }
            const p = t / lock
            alphas[i] = FAINT + (LOCKED - FAINT) * easeIn(p)
            if (t >= nextChange[i]!) {
                glyphs[i] = randomFrom(pools[i]!, glyphs[i])
                nextChange[i] = t + FAST + (SLOW - FAST) * easeIn(p)
            }
        }
        shown.value = glyphs
        alpha.value = alphas
        if (t < end) raf = requestAnimationFrame(frame)
        else {
            alpha.value = target.map(() => 1)
            schedule()
        }
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
        alpha.value = chars.value.map(() => 1)
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
            ><template v-for="(word, w) in words" :key="`${current}-${w}`"
                ><span class="whitespace-nowrap"
                    ><span v-for="i in word" :key="i" class="ea-hyper__cell" :style="cellStyle(i)">{{
                        shown[i]
                    }}</span></span
                >{{ w < words.length - 1 ? ' ' : '' }}</template
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
    background-image: theme('backgroundImage.ea-text');
    background-repeat: no-repeat;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
}
@supports not ((background-clip: text) or (-webkit-background-clip: text)) {
    .ea-hyper__cell {
        @apply text-Blue/600;
        -webkit-text-fill-color: currentColor;
    }
}
</style>
