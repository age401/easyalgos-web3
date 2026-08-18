<script setup lang="ts">
// Text that flickers through random glyphs and settles into place, one
// character at a time. Both accolades figures use it — "7,435" and "Billions".
//
// Each character runs the same three-part arrival, offset from its neighbour so
// the starts overlap rather than queue:
//   1. flicker through random glyphs, the cadence easing out so it slows as it
//      lands (the same deceleration the mark beside it is running),
//   2. lock onto the real glyph at SETTLE_AT of the way through,
//   3. keep brightening to full opacity.
// Locking BEFORE the opacity peaks is the whole trick. Run the flicker to the
// end and the character is at its brightest while still showing a wrong glyph,
// which snaps at the last moment; settling early means every wrong glyph is
// faint and only the right one is ever seen at full strength.
//
// The random pool is derived per character from the settled one — digit for
// digit, upper for upper, lower for lower — so a word keeps its silhouette
// while it resolves, and every locale works without a charset being configured.
// Separators (the thousands comma, spaces) never flicker; they only fade.
//
// LAYOUT. Cells are inline-block with a width locked to their settled glyph, so
// a narrow random glyph landing in a wide cell cannot reflow the line. Words
// are nowrap groups with real spaces between them, so a long translation
// ("Miles de millones") still wraps at spaces and never mid-word. Widths are
// measured after `document.fonts.ready` — measure before Poppins resolves and
// every cell is sized against the fallback face.
//
// GRADIENT TEXT. The figures sit inside a `.ea-grad` paragraph, and that breaks
// per-character opacity in a way worth spelling out: with `background-clip:
// text` the gradient belongs to the PARAGRAPH and is clipped to all the text
// beneath it, so a cell has no paint of its own. Fading the cell composites an
// empty box — the glyph keeps rendering at full strength from the paragraph's
// background, and the whole effect silently does nothing.
//
// So each cell takes over its own slice: the paragraph's gradient, sized to the
// paragraph and offset by the cell's position within it, which reproduces the
// original pixels exactly while making every glyph independently fadeable.
// Measuring both axes means a wrapped line stays correct too. The paragraph is
// only stopped from painting AFTER the cells are painted, so there is never a
// frame with nothing on it. Plain-coloured text needs none of this and skips it.
//
// The settled text is also rendered as a plain string for assistive tech and
// for a no-JS visit; the animated cells are aria-hidden.
interface Props {
    /** The settled text. */
    text: string
    /** ms to hold after the element comes into view before the first character starts. */
    delay?: number
}
const props = withDefaults(defineProps<Props>(), { delay: 0 })

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGIT = '0123456789'

/** Which glyphs a character flickers through, or null if it should not flicker. */
function poolFor(ch: string): string | null {
    if (/[0-9]/.test(ch)) return DIGIT
    if (/\p{Lu}/u.test(ch)) return UPPER
    if (/\p{Ll}/u.test(ch)) return LOWER
    return null
}

const SPREAD = 820 // ms across which the character starts are spread
const SPAN = 820 // ms each character spends arriving
const MAX_STEP = 115 // preferred ms between consecutive starts, before SPREAD caps it
const CYCLES = 12 // glyph changes per character
const SETTLE_AT = 0.7 // fraction of SPAN after which the real glyph is locked

// Split once, consumed twice — the template renders from `words` and the driver
// reads from `flat`. Same source and same order, so cell N in the DOM is entry
// N here.
const words = computed(() => props.text.split(' ').map((word) => [...word]))
const flat = computed(() => words.value.flat().map((ch) => ({ ch, pool: poolFor(ch) })))

const root = ref<HTMLElement | null>(null)
const { visible } = useRevealOnce(root, { threshold: 0.3 })

let cells: HTMLElement[] = []
let raf = 0
// Bumped every time the cells are re-read. A run in flight captures the value
// and stops the moment it no longer matches, which is what makes a locale
// switch safe: the v-for is keyed by index, so Vue REUSES the same spans and
// only swaps their text — a stale frame would otherwise keep writing the old
// word's glyphs into the new word's cells, and go on doing it forever.
let generation = 0
const ready = ref(false)

const reduced = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function collect() {
    cells = [...(root.value?.querySelectorAll<HTMLElement>('.ea-scramble__cell') ?? [])]
    generation++
}

function settleAll() {
    const meta = flat.value
    cells.forEach((el, i) => {
        el.textContent = meta[i]!.ch
        el.style.opacity = '1'
    })
}

// The gradient-text owner above us, if there is one, plus the gradient it had
// before we took it over. Captured once: after the handover its own
// background-image reads as `none`, so it cannot be found again.
let host: HTMLElement | null = null
let hostGradient = ''

function captureHost() {
    let el: HTMLElement | null = root.value?.parentElement ?? null
    while (el) {
        const cs = getComputedStyle(el)
        const clipped = (cs.backgroundClip || cs.webkitBackgroundClip) === 'text'
        if (clipped && cs.backgroundImage !== 'none') {
            host = el
            hostGradient = cs.backgroundImage
            return
        }
        el = el.parentElement
    }
}

function paintCells() {
    if (!host || !hostGradient) return
    const box = host.getBoundingClientRect()
    const size = `${box.width.toFixed(2)}px ${box.height.toFixed(2)}px`
    for (const el of cells) {
        const r = el.getBoundingClientRect()
        el.style.backgroundImage = hostGradient
        el.style.backgroundSize = size
        el.style.backgroundPosition = `${(box.left - r.left).toFixed(2)}px ${(box.top - r.top).toFixed(2)}px`
    }
    // Only now — up to here the paragraph was still covering the cells.
    host.style.backgroundImage = 'none'
}

/** Floor on the fit-to-width scale, so a pathological string shrinks to
 *  something still readable rather than to nothing. */
const MIN_FIT = 0.55

// Shrink the figure until its widest WORD fits the column. The word is the unit
// that matters: the phrase can still wrap at its spaces, but nothing can rescue
// a single word that is wider than the space it has. See the note on
// .ea-scramble in main.css for why this exists at all.
function fitToWidth() {
    const el = root.value
    const host = el?.parentElement
    if (!el || !host) return
    el.style.removeProperty('--ea-scramble-fit') // measure unscaled
    const avail = host.getBoundingClientRect().width
    if (!avail) return
    let widest = 0
    for (const w of el.querySelectorAll<HTMLElement>('.ea-scramble__word')) {
        widest = Math.max(widest, w.getBoundingClientRect().width)
    }
    if (widest > avail) {
        el.style.setProperty('--ea-scramble-fit', String(Math.max(MIN_FIT, avail / widest)))
    }
}

// Clear every width, then read every width, then write every width — three
// passes rather than one, so the reads cannot interleave with the writes and
// force a layout per cell. Order matters throughout: the fit changes the type
// size, so widths are only meaningful after it, and the gradient slices are cut
// last of all because they depend on where the locked widths put each cell.
async function measure() {
    if (!cells.length) return
    try {
        await document.fonts?.ready
    } catch {
        /* no Font Loading API: measure against whatever is resolved now */
    }
    for (const el of cells) el.style.width = ''
    fitToWidth()
    const widths = cells.map((el) => el.getBoundingClientRect().width)
    cells.forEach((el, i) => {
        el.style.width = `${widths[i]!.toFixed(2)}px`
    })
    paintCells()
}

function run() {
    // Snapshot everything this run belongs to — the cells, their metadata and
    // the generation that produced both — so the loop can never read one text's
    // cells against another's glyph table.
    const gen = generation
    const els = cells
    const n = els.length
    if (!n) return
    const meta = flat.value
    // Consecutive starts sit MAX_STEP apart until there are enough characters
    // that they would outrun SPREAD, after which they compress to fit it.
    const step = n > 1 ? Math.min(MAX_STEP, SPREAD / (n - 1)) : 0
    const ticks = new Array<number>(n).fill(-1)
    let t0 = 0

    const frame = (now: number) => {
        // Superseded by a newer text: stop without touching anything.
        if (gen !== generation) {
            raf = 0
            return
        }
        if (!t0) t0 = now
        const t = now - t0 - props.delay
        let running = false

        for (let i = 0; i < n; i++) {
            const el = els[i]
            if (!el || !meta[i]) break
            const p = (t - i * step) / SPAN

            if (p >= 1) {
                if (ticks[i] !== CYCLES) {
                    ticks[i] = CYCLES
                    el.textContent = meta[i]!.ch
                }
                el.style.opacity = '1'
                continue
            }

            running = true
            if (p <= 0) {
                el.style.opacity = '0'
                continue
            }

            const pool = meta[i]!.pool
            if (pool && p < SETTLE_AT) {
                const e = 1 - (1 - p / SETTLE_AT) ** 2
                const tick = Math.floor(e * CYCLES)
                if (tick !== ticks[i]) {
                    ticks[i] = tick
                    el.textContent = pool[(Math.random() * pool.length) | 0]!
                }
            } else if (ticks[i] !== CYCLES) {
                ticks[i] = CYCLES
                el.textContent = meta[i]!.ch
            }
            el.style.opacity = String(p)
        }

        raf = running ? requestAnimationFrame(frame) : 0
    }

    raf = requestAnimationFrame(frame)
}

onMounted(async () => {
    collect()
    captureHost()
    // Settle first under reduced motion so the text is never withheld while the
    // fonts resolve; measuring afterwards only swaps which element paints it.
    if (reduced()) settleAll()
    await measure()
    if (!reduced()) ready.value = true
})

watchEffect(() => {
    if (ready.value && visible.value && !raf) run()
})

// Font sizes are responsive, so a breakpoint change invalidates every locked
// width. Re-measure on resize; if the entrance has already finished, put the
// settled glyphs straight back rather than replaying it.
let resizeTimer: ReturnType<typeof setTimeout> | undefined
function onResize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(async () => {
        await measure()
        if (!raf && visible.value) settleAll()
    }, 150)
}
onMounted(() => window.addEventListener('resize', onResize, { passive: true }))

onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    clearTimeout(resizeTimer)
    window.removeEventListener('resize', onResize)
    // Hand the gradient back, or the paragraph is left blank for whatever
    // replaces us.
    if (host && hostGradient) host.style.backgroundImage = ''
})

// A locale switch replaces the text under the cells. Stop any run in flight
// first — its entrance belongs to text that no longer exists — then re-measure
// and settle, since the entrance has already been spent either way.
watch(
    () => props.text,
    async () => {
        cancelAnimationFrame(raf)
        raf = 0
        await nextTick()
        collect()
        await measure()
        settleAll()
    }
)
</script>

<template>
    <span ref="root" class="ea-scramble">
        <span class="sr-only">{{ text }}</span>
        <span aria-hidden="true">
            <template v-for="(word, w) in words" :key="w">
                <!-- An interpolated space, not template whitespace, which Vue
                     would condense away between elements. -->
                <template v-if="w">{{ ' ' }}</template>
                <span class="ea-scramble__word">
                    <span v-for="(ch, c) in word" :key="c" class="ea-scramble__cell">{{ ch }}</span>
                </span>
            </template>
        </span>
    </span>
</template>
