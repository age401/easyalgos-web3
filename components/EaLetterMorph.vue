<script setup lang="ts">
// A gradient phrase that turns into the next one LETTER BY LETTER: a row of
// character slots, and every few dozen ms the next slot along flips — its old
// letter rises out of the top of the line while the new phrase's letter at that
// position rises in from below. The phrase morphs left to right, and since each
// slot takes the width of its new letter as it flips, the line re-flows behind
// the wave rather than all at once. Slots whose letter is the same in both
// phrases are left alone.
//
// (`EaLetterCycle` is the other take on this: the whole phrase leaves, then
// the next one arrives.)
//
// LAYOUT. Every phrase is also rendered as invisible plain text, stacked in the
// same grid cell as the live slots, so the box is always as tall as the
// longest phrase and the heading under it never moves. The run is a block, so
// it sits on a line of its own at every width.
//
// WRAPPING. The slots are plain INLINE spans, not inline-blocks. Chrome treats
// every pair of adjacent inline-blocks as a line-break opportunity, so a row
// of inline-block letters splits words anywhere (and a word joiner between
// them does not stop it). Inline letters are just text: the run wraps at its
// spaces like any sentence, whatever mix of old and new letters it holds.
//
// MASK AND MOTION. A slot is clipped with `clip-path` to its own text box, which
// for Poppins is ~1.39em, a hair over the 1.35 line height. Its new letter is
// in flow (that is what sizes the slot) and, being inline, cannot take a
// transform — so it rises on relative `top`, from 1.4em (just under the clip)
// to 0, which moves only its own paint and never re-flows the line. The old
// letter is laid over it absolutely, so it CAN use a transform, and leaves by
// its own height.
//
// GRADIENT. Transformed glyphs fall out of a parent's `background-clip: text`,
// so each glyph carries its own slice of the `ea-text` gradient — sized to the
// line it is on and offset by its position in it — recomputed after every flip
// because the line re-flows as it morphs. The outgoing letter keeps the slice it
// had, so it leaves in the colour it was.
//
// A11Y. Screen readers get the first phrase, once; everything animated is
// aria-hidden. Under prefers-reduced-motion nothing cycles.
interface Props {
    phrases: string[]
    /** Ink-coloured text that closes each phrase. */
    suffix?: string
    /** ms each phrase stays settled before the next one starts. */
    hold?: number
}
const props = withDefaults(defineProps<Props>(), { suffix: '', hold: 2600 })

const STAGGER = 38 // ms between one slot flipping and the next
const RISE = 560 // ms a letter takes to cross its line


type Char = { ch: string; ink: boolean }

/** Each phrase as a padded row of characters, suffix included. */
const rows = computed(() => {
    const raw = props.phrases.map((p) => [
        ...[...p].map((ch) => ({ ch, ink: false })),
        ...[...props.suffix].map((ch) => ({ ch, ink: true }))
    ])
    const width = Math.max(...raw.map((r) => r.length))
    return raw.map((r) => [...r, ...Array.from({ length: width - r.length }, () => ({ ch: '', ink: false }))])
})

type Slot = Char & {
    prev: Char | null
    /** Bumped on every flip; part of the slot's key, so the slot re-mounts and its CSS animation runs. */
    n: number
    bg: string
    prevBg: string
}

const slots = ref<Slot[]>([])
function reset() {
    slots.value = rows.value[0]!.map((c) => ({ ...c, prev: null, n: 0, bg: '', prevBg: '' }))
}
reset()

const root = ref<HTMLElement | null>(null)

let paintQueued = 0
function paintGradient() {
    cancelAnimationFrame(paintQueued)
    paintQueued = 0
    const el = root.value
    if (!el) return
    const cells = [...el.querySelectorAll<HTMLElement>('.ea-morph__slot')]
    const lines = new Map<number, { left: number; right: number; idx: number[] }>()
    cells.forEach((cell, i) => {
        const s = slots.value[i]
        if (!s || s.ink || !s.ch.trim()) return
        const top = cell.offsetTop
        const line = lines.get(top) ?? { left: Infinity, right: -Infinity, idx: [] }
        line.left = Math.min(line.left, cell.offsetLeft)
        line.right = Math.max(line.right, cell.offsetLeft + cell.offsetWidth)
        line.idx.push(i)
        lines.set(top, line)
    })
    lines.forEach(({ left, right, idx }) => {
        for (const i of idx) {
            const bg = `${right - left}px 100%|${left - cells[i]!.offsetLeft}px 0`
            if (slots.value[i]!.bg !== bg) slots.value[i]!.bg = bg
        }
    })
}
function queuePaint() {
    if (!paintQueued) paintQueued = requestAnimationFrame(paintGradient)
}
const bgStyle = (bg: string) => {
    if (!bg) return undefined
    const [size, position] = bg.split('|')
    return { backgroundSize: size, backgroundPosition: position }
}

let current = 0
let timers: ReturnType<typeof setTimeout>[] = []
let onScreen = true
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

function clearTimers() {
    timers.forEach(clearTimeout)
    timers = []
}
function later(fn: () => void, ms: number) {
    timers.push(setTimeout(fn, ms))
}

function advance() {
    clearTimers()
    if (!onScreen || document.hidden) return later(advance, props.hold)
    const next = (current + 1) % rows.value.length
    const target = rows.value[next]!
    current = next
    let at = 0
    target.forEach((c, i) => {
        const slot = slots.value[i]!
        if (slot.ch === c.ch && slot.ink === c.ink) return
        // Trailing padding on both sides: nothing to see, so no time spent.
        const delay = at
        if (slot.ch || c.ch) at += STAGGER
        later(() => {
            const s = slots.value[i]!
            slots.value[i] = { ...c, prev: { ch: s.ch, ink: s.ink }, n: s.n + 1, bg: s.bg, prevBg: s.bg }
            queuePaint()
        }, delay)
    })
    later(advance, at + RISE + props.hold)
}

onMounted(() => {
    paintGradient()
    document.fonts?.ready.then(paintGradient)
    resizeObserver = new ResizeObserver(queuePaint)
    if (root.value) resizeObserver.observe(root.value)

    if (rows.value.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    intersectionObserver = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting
    })
    if (root.value) intersectionObserver.observe(root.value)
    later(advance, props.hold)
})

// A locale switch swaps every phrase: start over from the first one.
watch(rows, async () => {
    const running = timers.length > 0
    clearTimers()
    current = 0
    reset()
    await nextTick()
    paintGradient()
    if (running) later(advance, props.hold)
})

onBeforeUnmount(() => {
    clearTimers()
    cancelAnimationFrame(paintQueued)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
})
</script>

<template>
    <span ref="root" class="ea-morph" :style="{ '--rise': `${RISE}ms` }">
        <span class="sr-only">{{ phrases[0] }}{{ suffix }}</span>
        <span v-for="(phrase, k) in phrases" :key="`s${k}`" class="ea-morph__sizer" aria-hidden="true"
            >{{ phrase }}{{ suffix }}</span
        >
        <span class="ea-morph__live" aria-hidden="true"
            ><template v-for="(s, i) in slots" :key="`${i}-${s.n}`"
                ><span :class="['ea-morph__slot', { 'is-flipping': s.n > 0 }]"
                    ><span
                        v-if="s.prev && s.n > 0"
                        :class="['ea-morph__glyph', 'is-old', { 'is-ink': s.prev.ink }]"
                        :style="bgStyle(s.prevBg)"
                        >{{ s.prev.ch }}</span
                    ><span :class="['ea-morph__glyph', 'is-new', { 'is-ink': s.ink }]" :style="bgStyle(s.bg)">{{
                        s.ch
                    }}</span></span
                ></template
            ></span
        >
    </span>
</template>

<style scoped>
.ea-morph {
    position: relative;
    display: grid;
}
.ea-morph__sizer,
.ea-morph__live {
    grid-area: 1 / 1;
    display: block;
}
.ea-morph__sizer {
    visibility: hidden;
}
.ea-morph__slot {
    position: relative;
    /* Clip to the text box vertically; leave room either side so a wide
       outgoing letter in a narrow new slot is not shaved off. */
    clip-path: inset(0 -0.6em);
}
.ea-morph__glyph {
    position: relative;
    background-image: theme('backgroundImage.ea-text');
    -webkit-background-clip: text;
    background-clip: text;
    background-repeat: no-repeat;
    color: transparent;
    -webkit-text-fill-color: transparent;
}
.ea-morph__glyph.is-old {
    position: absolute;
    white-space: pre;
    left: 0;
    top: 0;
}
.is-ink {
    background-image: none;
    color: inherit;
    -webkit-text-fill-color: currentColor;
}
.is-flipping .is-new {
    animation: ea-morph-in var(--rise) cubic-bezier(0.22, 1, 0.36, 1) 40ms both;
}
.is-flipping .is-old {
    animation: ea-morph-out var(--rise) cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes ea-morph-in {
    from {
        top: 1.4em;
    }
    to {
        top: 0;
    }
}
@keyframes ea-morph-out {
    from {
        transform: none;
    }
    to {
        transform: translateY(-102%);
    }
}
@supports not ((background-clip: text) or (-webkit-background-clip: text)) {
    .ea-morph__glyph {
        @apply text-Blue/600;
        -webkit-text-fill-color: currentColor;
    }
}
</style>
