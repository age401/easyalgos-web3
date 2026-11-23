<script setup lang="ts">
// A gradient phrase that cycles through alternatives, letter by letter: the
// current phrase's letters rise out of the top of their line one after another,
// and the next phrase's letters rise into place from below in the same
// staircase. Used for the accent run of the Expert Advisors list heading.
//
// LAYOUT. Every phrase is rendered, stacked in one grid cell, so the box is
// always as tall and as wide as the LONGEST phrase and the heading never
// reflows when the phrase changes. Each layer is a block, which puts the run on
// its own line at every width (it already was from 600px up; on a phone it used
// to wrap mid-phrase after the lead). Words are nowrap groups with real spaces
// between them, so a long translation still wraps at spaces, never mid-word.
//
// MASK. A letter is a cell that clips to its line box, holding a glyph that is
// translated through it. The clip is `clip-path`, not `overflow: hidden`:
// overflow on an inline-block moves its baseline to the bottom edge and every
// letter would drop out of line with the rest of the heading.
//
// GRADIENT. `.ea-grad` clips one gradient to the text of the whole run, but a
// transformed descendant is painted on its own layer and falls out of that
// clip. So every glyph carries its own slice: the gradient sized to the width
// of the line it sits on and offset by the glyph's position in that line, which
// reproduces `.ea-grad` (and its `box-decoration-break: clone`, one full sweep
// per line) pixel for pixel while letting each glyph move on its own. The slice
// travels with the glyph, so a letter keeps its colour as it rises.
//
// The punctuation that follows the run (the English comma) is passed in as
// `suffix` and becomes the last, ink-coloured cell of every phrase, so it
// rides along at the end of whichever phrase is showing.
//
// A11Y. Screen readers get the first phrase, once, as plain text; the animated
// layers are aria-hidden. Under prefers-reduced-motion the cycle never starts.
interface Props {
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** ms each phrase stays settled before the next one rises in. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { suffix: '', hold: 2600 })

const STAGGER = 28 // ms between consecutive letters
const RISE = 620 // ms one letter takes to cross its line
const OVERLAP = 140 // ms the incoming phrase starts after the outgoing one

type Cell = { ch: string; i: number; ink?: boolean }

const layers = computed(() =>
    props.phrases.map((phrase) => {
        let i = 0
        const words: Cell[][] = phrase.split(' ').map((word) => [...word].map((ch) => ({ ch, i: i++ })))
        if (props.suffix) words[words.length - 1]!.push(...[...props.suffix].map((ch) => ({ ch, i: i++, ink: true })))
        return { words, length: i }
    })
)

// 'in' = settled on screen, 'out' = risen out of the top, 'below' = parked
// under the line with no transition, ready to rise.
type State = 'in' | 'out' | 'below'
const states = ref<State[]>(props.phrases.map((_, k) => (k === 0 ? 'in' : 'below')))
let current = 0

const root = ref<HTMLElement | null>(null)

function paintGradient() {
    const el = root.value
    if (!el) return
    el.querySelectorAll<HTMLElement>('.ea-cycle__layer').forEach((layer) => {
        const glyphs = [...layer.querySelectorAll<HTMLElement>('.ea-cycle__cell:not(.is-ink)')]
        const lines = new Map<number, { left: number; right: number; cells: HTMLElement[] }>()
        for (const cell of glyphs) {
            const top = cell.offsetTop
            const line = lines.get(top) ?? { left: Infinity, right: -Infinity, cells: [] }
            line.left = Math.min(line.left, cell.offsetLeft)
            line.right = Math.max(line.right, cell.offsetLeft + cell.offsetWidth)
            line.cells.push(cell)
            lines.set(top, line)
        }
        lines.forEach(({ left, right, cells }) => {
            for (const cell of cells) {
                const glyph = cell.firstElementChild as HTMLElement
                glyph.style.backgroundSize = `${right - left}px 100%`
                glyph.style.backgroundPosition = `${left - cell.offsetLeft}px 0`
            }
        })
    })
}

let timer: ReturnType<typeof setTimeout> | undefined
let onScreen = true
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

function schedule() {
    clearTimeout(timer)
    timer = setTimeout(advance, props.hold)
}

function advance() {
    // Off screen or in a background tab: try again later instead of cycling
    // unseen, so the visitor never comes back to a swap already half done.
    if (!onScreen || document.hidden) return schedule()
    const from = current
    const to = (current + 1) % props.phrases.length
    states.value[from] = 'out'
    states.value[to] = 'in'
    current = to
    const exit = RISE + STAGGER * (layers.value[from]!.length - 1)
    const enter = OVERLAP + RISE + STAGGER * (layers.value[to]!.length - 1)
    // Park the old phrase back under the line once it has fully left.
    setTimeout(() => {
        if (states.value[from] === 'out') states.value[from] = 'below'
    }, exit + 50)
    timer = setTimeout(advance, Math.max(exit, enter) + props.hold)
}

onMounted(() => {
    paintGradient()
    document.fonts?.ready.then(paintGradient)
    resizeObserver = new ResizeObserver(paintGradient)
    if (root.value) resizeObserver.observe(root.value)

    if (props.phrases.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    intersectionObserver = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting
    })
    if (root.value) intersectionObserver.observe(root.value)
    schedule()
})

// A locale switch swaps every phrase: start over from the first one.
watch(
    () => props.phrases.join('\n') + props.suffix,
    async () => {
        current = 0
        states.value = props.phrases.map((_, k) => (k === 0 ? 'in' : 'below'))
        await nextTick()
        paintGradient()
        if (timer) schedule()
    }
)

onBeforeUnmount(() => {
    clearTimeout(timer)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
})
</script>

<template>
    <span ref="root" class="ea-cycle" :style="{ '--rise': `${RISE}ms`, '--stagger': `${STAGGER}ms` }">
        <span class="sr-only">{{ phrases[0] }}{{ suffix }}</span>
        <span
            v-for="(layer, k) in layers"
            :key="k"
            :class="['ea-cycle__layer', `is-${states[k]}`]"
            :style="{ '--cycle-delay': states[k] === 'in' ? `${OVERLAP}ms` : '0ms' }"
            aria-hidden="true"
        >
            <template v-for="(word, w) in layer.words" :key="w">
                <span class="whitespace-nowrap"
                    ><span
                        v-for="cell in word"
                        :key="cell.i"
                        :class="['ea-cycle__cell', { 'is-ink': cell.ink }]"
                        :style="{ '--i': cell.i }"
                        ><span class="ea-cycle__glyph">{{ cell.ch }}</span></span
                    ></span
                >{{ w < layer.words.length - 1 ? ' ' : '' }}
            </template>
        </span>
    </span>
</template>

<style scoped>
.ea-cycle {
    position: relative;
    display: grid;
}
.ea-cycle__layer {
    grid-area: 1 / 1;
    display: block;
}
.ea-cycle__cell {
    display: inline-block;
    /* Clip to the line box vertically, but leave room either side for glyph
       overhang so nothing is shaved off horizontally. */
    clip-path: inset(0 -0.2em);
}
.ea-cycle__glyph {
    display: inline-block;
    background-image: theme('backgroundImage.ea-text');
    -webkit-background-clip: text;
    background-clip: text;
    background-repeat: no-repeat;
    color: transparent;
    -webkit-text-fill-color: transparent;
    transition: transform var(--rise) cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--cycle-delay, 0ms) + var(--i) * var(--stagger));
    will-change: transform;
}
.is-ink .ea-cycle__glyph {
    background-image: none;
    color: inherit;
    -webkit-text-fill-color: currentColor;
}
.is-in .ea-cycle__glyph {
    transform: translateY(0);
}
.is-out .ea-cycle__glyph {
    transform: translateY(-105%);
}
.is-below .ea-cycle__glyph {
    transform: translateY(105%);
    transition: none;
}
@supports not ((background-clip: text) or (-webkit-background-clip: text)) {
    .ea-cycle__glyph {
        @apply text-Blue/600;
        -webkit-text-fill-color: currentColor;
    }
}
</style>
