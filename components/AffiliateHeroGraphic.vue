<script setup lang="ts">
// "Animated Graphic" (18:6044) beside the Affiliates hero — the referral network
// as a live ledger.
//
// The drawing already has every part of the pitch: trades placed by referred
// clients (the pills), the affiliate's referral links (the four REF cards, each
// with its own conversion rate and running figure), and the affiliate's total
// ("EasyAlgos Network · Revenue-share commissions"), over a market trace and two
// orbit rings. What it cannot show standing still is the sentence the headline
// makes — "from EVERY trade" — so that is what moves:
//
//   1. ENTRANCE (once, on mount). The grid fades up, the two orbits and both
//      traces draw themselves in left to right (the same SVG draw-in the home
//      page uses), the core card settles, the REF cards arrive from the edges
//      of the stage, and every figure counts up from zero to the drawn value —
//      the commission total assembling itself out of its parts.
//   2. THE LOOP (forever, after ~2s). Every second or so an open trade fires:
//      it blips, and a commission leaves it as a comet in the colour of the REF
//      card it is credited to. The trade has done its job and CLOSES — the pill
//      folds away — and a moment later a new trade opens in its place on
//      another pair (AFF_PAIRS). The card takes the commission — its figure
//      ticks up, its spark-line tip flares — and passes it on into the core,
//      where the total ticks up by the same amount and the card's border and
//      the halo behind it breathe. Small, constant, compounding, and the book
//      of trades always turning over: the program's actual promise.
//   3. AMBIENT. A dot rides each orbit ring (recurring, literally going round)
//      and a highlight runs along the market trace. Both are CSS.
//
// Mechanics, borrowed from the rest of the codebase rather than invented:
//   - entrance on `.is-loaded`, set in onMounted's rAF (HeroSection / DeveloperHero);
//   - draw-ins as `pathLength="1"` + dashoffset (the solution loop, StarMap);
//   - a rAF clock that ACCUMULATES elapsed time and simply stops when the stage
//     is off screen or the tab is hidden (useTriggeredRun / useTimedSequence), so
//     the queue of scheduled beats freezes with it and resumes in step;
//   - per-frame writes go straight to the DOM (attributes and textContent), never
//     through reactive state — the same rule ParticleCluster and the matrix keep:
//     Vue renders the structure once, the loop only touches paint.
//
// LAYOUTS. The stage comes in three arrangements (AFF_LAYOUTS): `wide` is the
// drawing; `tall` stands the same network on end for a column beside the copy
// that is too narrow for the drawing to read at its scale; `phone` is the
// drawing with its left card brought in off the edge, for the cropped stage
// under the copy. Which one is a question about the space, answered in
// `measure()`; the arrangement is then scaled as one box, so no coordinate is
// restated per breakpoint.
//
// Every dynamic SVG attribute is bound with `.attr` — see HeroBrandLogo for why
// hydration otherwise tries to assign getter-only SVG properties and warns.
//
// Reduced motion: no entrance, no loop, no ambient motion — the drawn frame,
// with the drawn figures, which the server already rendered.
//
// It is decoration with a label, not content: `role="img"` and a sentence
// saying what it shows; every figure on it is illustrative.
import {
    AFF_LAYOUTS,
    AFF_PARTNERS,
    AFF_PAIRS,
    AFF_OPENING_TRADES,
    AFF_CORE_TOTAL,
    AFF_MARKET_TRACE,
    AFF_COMPARED_TRACE
} from '~/data/affiliates'
import type { AffLayout } from '~/data/affiliates'

/* --------------------------------------------------------------- Layout == */

/** Viewport widths, matching the hero's own breakpoints: under `tablet` the
 *  stage is the cropped phone arrangement; from `tablet-wide` the graphic sits
 *  beside the copy. */
const PHONE_MAX = 600
const SIDE_MIN = 1024
/** Beside the copy, a frame narrower than this gets the tall arrangement: below
 *  it the drawn stage would be scaled under ~0.83 and its 10px labels stop
 *  reading. */
const TALL_BELOW = 700
/** On a phone the stage fits 760 rather than 844 — giving up the empty grid
 *  margin so the cards stay larger — and never goes under MIN_SCALE, past which
 *  they stop reading as cards. The overflow is centred and cropped. */
const PHONE_FIT = 760
const MIN_SCALE = 0.46

type LayoutName = keyof typeof AFF_LAYOUTS

const layoutName = ref<LayoutName>('wide')
const L = computed<AffLayout>(() => AFF_LAYOUTS[layoutName.value])

const frame = ref<HTMLElement | null>(null)
const scale = ref(1)
const offsetX = ref(0)

function measure() {
    const el = frame.value
    if (!el) return
    const w = el.clientWidth
    const vw = window.innerWidth
    const name: LayoutName = vw < PHONE_MAX ? 'phone' : vw >= SIDE_MIN && w < TALL_BELOW ? 'tall' : 'wide'
    layoutName.value = name
    const box = AFF_LAYOUTS[name]
    const fit = name === 'phone' ? PHONE_FIT : box.width
    const s = Math.min(1, Math.max(MIN_SCALE, w / fit))
    scale.value = s
    // Centred either way: a narrower stage sits in the middle of its column,
    // a wider one is cropped evenly at both sides.
    offsetX.value = (w - box.width * s) / 2
}

/** A trace re-laid for the current arrangement: squeezed horizontally by the
 *  layout's `traceScale` from where the line starts, and centred on the core.
 *  The two paths are absolute M/L/C commands only, so every number pair is a
 *  point. */
function placeTrace(trace: { d: string; x0: number; cy: number }, layout: AffLayout) {
    const s = layout.traceScale
    const ty = layout.core.y - trace.cy
    return trace.d.replace(/([MLC])([^MLC]*)/g, (_, cmd: string, args: string) => {
        const n = args.trim().split(/[\s,]+/).map(Number)
        const out: string[] = []
        for (let i = 0; i + 1 < n.length; i += 2) {
            out.push(`${((n[i] - trace.x0) * s).toFixed(2)} ${(n[i + 1] + ty).toFixed(2)}`)
        }
        return cmd + out.join(' ')
    })
}

const marketD = computed(() => placeTrace(AFF_MARKET_TRACE, L.value))
const comparedD = computed(() => placeTrace(AFF_COMPARED_TRACE, L.value))

/* ----------------------------------------------------------- Formatting == */

const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const money0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const formatMove = (m: number) => `${m < 0 ? '−' : '+'}${Math.abs(m).toFixed(2)}%`

/* ---------------------------------------------------------- DOM handles == */

const partnerEls = ref<HTMLElement[]>([])
const partnerValueEls = ref<HTMLElement[]>([])
const tradeEls = ref<HTMLElement[]>([])
const tradePairEls = ref<HTMLElement[]>([])
const tradeMoveEls = ref<HTMLElement[]>([])
const coreEl = ref<HTMLElement | null>(null)
const coreValueEl = ref<HTMLElement | null>(null)
const haloEl = ref<HTMLElement | null>(null)

/** The comet pool. Six is more than the loop ever has in the air at once (a
 *  beat is ~1s and a commission's two legs take ~1.3s), so a slot is always
 *  free; if one somehow is not, the beat is skipped rather than a comet cut
 *  short. */
const POOL = 6
const cometPaths = ref<SVGPathElement[]>([])
const cometHeads = ref<SVGCircleElement[]>([])

/* ---------------------------------------------------------------- State == */

const loaded = ref(false)
const reducedMotion = ref(false)

/** A figure that can tween. `shown` is what is on screen; a tween eases it
 *  from `from` to `to` over `dur` ms of the loop's own clock. */
interface Counter {
    el: () => HTMLElement | null | undefined
    format: (n: number) => string
    shown: number
    from: number
    to: number
    t0: number
    dur: number
}

const counters: Counter[] = []
const partnerCounters: Counter[] = []
let coreCounter: Counter | null = null

interface Flight {
    slot: number
    len: number
    t0: number
    dur: number
    path: SVGPathElement
    head: SVGCircleElement
    done: () => void
}

let flights: Flight[] = []
const busy = new Array<boolean>(POOL).fill(false)

/** Each pill's trade: what it shows, and whether it can fire. A closed pill is
 *  hidden while its replacement is being "opened". */
const book = AFF_OPENING_TRADES.map((t) => ({ pair: t.pair as string, move: t.move as number, open: true }))

/** Beats scheduled on the loop's clock — never setTimeout, so a paused stage
 *  pauses its queue too instead of firing a backlog on return. */
let tasks: { at: number; fn: () => void }[] = []

let clock = 0
let last = 0
let raf = 0
let running = false
let onScreen = false
let nextBeat = 0
let lastTrade = -1

const LIVE_FROM = 2000
const LEG_TRADE_MS = 520
const LEG_CORE_MS = 760
const TAIL = 64
/** A fired trade closes once its commission is on the way… */
const CLOSE_AFTER = 360
/** …and a new one opens in its place after this long (plus some jitter). */
const REOPEN_AFTER = 1100
/** And may not fire again until it has finished arriving. */
const SETTLE = 600

function at(delay: number, fn: () => void) {
    tasks.push({ at: clock + delay, fn })
}

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)
const easeOut = (u: number) => 1 - Math.pow(1 - u, 3)

function tween(c: Counter, to: number, dur: number) {
    c.from = c.shown
    c.to = to
    c.t0 = clock
    c.dur = dur
}

/** Flash a class on for `ms` of loop time. Re-adding restarts the CSS
 *  animation, which is what lets two credits in quick succession both read. */
function pulse(el: Element | null | undefined, cls: string, ms: number) {
    if (!el) return
    el.classList.remove(cls)
    // Force a style flush so the removal and re-add are two different frames
    // as far as the animation is concerned.
    void (el as HTMLElement).offsetWidth
    el.classList.add(cls)
    at(ms, () => el.classList.remove(cls))
}

/* --------------------------------------------------------------- Trades == */

/** A new trade: a pair no other pill is showing, a move of a few tenths of a
 *  percent either way. */
function newTrade(slot: number) {
    const taken = new Set(book.map((t) => t.pair))
    const free = AFF_PAIRS.filter((p) => !taken.has(p))
    const pair = free[Math.floor(Math.random() * free.length)] ?? AFF_PAIRS[0]
    const move = Math.round((Math.random() < 0.72 ? 1 : -1) * (0.04 + Math.random() * 1.2) * 100) / 100
    book[slot].pair = pair
    book[slot].move = move
    const pairEl = tradePairEls.value[slot]
    const moveEl = tradeMoveEls.value[slot]
    if (pairEl) pairEl.textContent = pair
    if (moveEl) {
        moveEl.textContent = formatMove(move)
        moveEl.classList.toggle('is-down', move < 0)
    }
}

function closeAndReopen(slot: number) {
    const el = tradeEls.value[slot]
    if (!el) return
    book[slot].open = false
    at(CLOSE_AFTER, () => {
        el.classList.remove('is-firing')
        el.classList.add('is-closed')
    })
    at(CLOSE_AFTER + REOPEN_AFTER + Math.random() * 900, () => {
        newTrade(slot)
        el.classList.remove('is-closed')
        at(SETTLE, () => (book[slot].open = true))
    })
}

/* --------------------------------------------------------------- Routes == */

function centreOf(el: HTMLElement) {
    return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }
}

/** A gentle arc between two points: a quadratic whose control point sits off
 *  the chord by a fixed fraction of its length, on a side that alternates so
 *  neighbouring routes do not lie on top of each other. Both ends are hidden
 *  under cards, so only the stretch between them is ever seen — the comet
 *  appears out of one card and disappears into the next. */
function arc(a: { x: number; y: number }, b: { x: number; y: number }, bend: number) {
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${(mx - dy * bend).toFixed(1)} ${(my + dx * bend).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

function fly(d: string, color: string, dur: number, done: () => void): boolean {
    const slot = busy.indexOf(false)
    if (slot < 0) return false
    const path = cometPaths.value[slot]
    const head = cometHeads.value[slot]
    if (!path || !head) return false
    busy[slot] = true
    path.setAttribute('d', d)
    path.style.stroke = color
    head.style.fill = color
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${TAIL} ${len + TAIL}`
    path.style.strokeDashoffset = `${TAIL}`
    path.style.opacity = '1'
    head.style.opacity = '1'
    flights.push({ slot, len, t0: clock, dur, path, head, done })
    return true
}

/* ----------------------------------------------------------------- Beat == */

function beat() {
    // Any open trade but the last one to fire, so the eye is never asked to
    // watch the same pill twice in a row.
    const open = book.map((t, i) => (t.open && i !== lastTrade ? i : -1)).filter((i) => i >= 0)
    if (!open.length) return
    const i = open[Math.floor(Math.random() * open.length)]
    lastTrade = i

    const trade = L.value.trades[i]
    const p = AFF_PARTNERS.findIndex((x) => x.id === trade.to)
    const partner = AFF_PARTNERS[p]
    const tradeEl = tradeEls.value[i]
    const partnerEl = partnerEls.value[p]
    const core = coreEl.value
    if (!tradeEl || !partnerEl || !core) return

    // A commission is a few dollars: the point is that it is EVERY trade, not
    // that any one of them is large.
    const amount = Math.round((3 + Math.random() * 16) * 100) / 100

    const from = centreOf(tradeEl)
    const via = centreOf(partnerEl)
    const to = centreOf(core)
    const bend = i % 2 ? 0.16 : -0.16

    if (!fly(arc(from, via, bend), partner.color, LEG_TRADE_MS, () => {
        const pc = partnerCounters[p]
        tween(pc, pc.to + amount, 520)
        pulse(partnerEl, 'is-credited', 1000)
        at(140, () => {
            fly(arc(via, to, -bend), partner.color, LEG_CORE_MS, () => {
                if (coreCounter) tween(coreCounter, coreCounter.to + amount, 620)
                pulse(core, 'is-credited', 1100)
                pulse(haloEl.value, 'is-credited', 1400)
            })
        })
    })) return

    tradeEl.classList.add('is-firing')
    closeAndReopen(i)
}

/* ---------------------------------------------------------------- Clock == */

function frameTick(now: number) {
    raf = 0
    if (!running) return
    const delta = last ? Math.min(now - last, 64) : 0
    last = now
    clock += delta

    // Due beats, in order. Collected first: a task may schedule another.
    if (tasks.length) {
        const due = tasks.filter((t) => t.at <= clock)
        if (due.length) {
            tasks = tasks.filter((t) => t.at > clock)
            due.sort((a, b) => a.at - b.at).forEach((t) => t.fn())
        }
    }

    if (clock >= LIVE_FROM && clock >= nextBeat) {
        beat()
        nextBeat = clock + 750 + Math.random() * 650
    }

    // Comets.
    if (flights.length) {
        const landed: Flight[] = []
        for (const f of flights) {
            const u = Math.min(1, (clock - f.t0) / f.dur)
            const e = easeInOut(u)
            f.path.style.strokeDashoffset = `${TAIL - e * (f.len + TAIL)}`
            const pt = f.path.getPointAtLength(e * f.len)
            f.head.setAttribute('cx', pt.x.toFixed(1))
            f.head.setAttribute('cy', pt.y.toFixed(1))
            if (u >= 1) landed.push(f)
        }
        if (landed.length) {
            flights = flights.filter((f) => !landed.includes(f))
            for (const f of landed) {
                f.path.style.opacity = '0'
                f.head.style.opacity = '0'
                busy[f.slot] = false
                f.done()
            }
        }
    }

    // Figures.
    for (const c of counters) {
        if (c.shown === c.to || clock < c.t0) continue
        const u = c.dur > 0 ? Math.min(1, (clock - c.t0) / c.dur) : 1
        c.shown = u >= 1 ? c.to : c.from + (c.to - c.from) * easeOut(u)
        const el = c.el()
        if (el) el.textContent = c.format(c.shown)
    }

    raf = requestAnimationFrame(frameTick)
}

function setRunning(next: boolean) {
    if (reducedMotion.value) next = false
    if (next === running) return
    running = next
    if (running) {
        last = 0
        raf = requestAnimationFrame(frameTick)
    } else if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
    }
}

function syncRunning() {
    setRunning(onScreen && document.visibilityState === 'visible')
}

/* ------------------------------------------------------------ Lifecycle == */

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

onMounted(() => {
    measure()
    ro = new ResizeObserver(measure)
    if (frame.value) ro.observe(frame.value)

    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Counters start where the server left them — the drawn figures — and the
    // entrance rewinds them to zero only when it is actually going to play.
    AFF_PARTNERS.forEach((p, i) => {
        const c: Counter = {
            el: () => partnerValueEls.value[i],
            format: (n) => money0.format(n),
            shown: p.value,
            from: p.value,
            to: p.value,
            t0: 0,
            dur: 0
        }
        partnerCounters.push(c)
        counters.push(c)
    })
    coreCounter = {
        el: () => coreValueEl.value,
        format: (n) => money2.format(n),
        shown: AFF_CORE_TOTAL,
        from: AFF_CORE_TOTAL,
        to: AFF_CORE_TOTAL,
        t0: 0,
        dur: 0
    }
    counters.push(coreCounter)

    if (reducedMotion.value) {
        loaded.value = true
        return
    }

    // The count-up from zero, on the same beats as the cards' entrance in
    // main.css (.aff-g-partner delays) so each figure starts as its card lands.
    partnerCounters.forEach((c, i) => {
        c.shown = 0
        c.from = 0
        c.t0 = 700 + i * 110
        c.dur = 1300
    })
    coreCounter.shown = 0
    coreCounter.from = 0
    coreCounter.t0 = 520
    coreCounter.dur = 1700
    for (const c of counters) {
        const el = c.el()
        if (el) el.textContent = c.format(0)
    }
    nextBeat = LIVE_FROM
    // The pills' entrance is staggered with a transition-delay; once it has
    // played, that delay would also hold back every close and reopen.
    at(LIVE_FROM, () => tradeEls.value.forEach((el) => el?.style.setProperty('--d', '0ms')))

    requestAnimationFrame(() => (loaded.value = true))

    io = new IntersectionObserver(
        (entries) => {
            onScreen = entries[0]?.isIntersecting ?? false
            syncRunning()
        },
        { threshold: 0 }
    )
    if (frame.value) io.observe(frame.value)
    document.addEventListener('visibilitychange', syncRunning)
})

onBeforeUnmount(() => {
    ro?.disconnect()
    io?.disconnect()
    document.removeEventListener('visibilitychange', syncRunning)
    setRunning(false)
})

/** The drawn figure, server-side: what a no-JS or reduced-motion reader sees. */
const partnerFigure = (v: number) => money0.format(v)
const coreFigure = money2.format(AFF_CORE_TOTAL)

/** Where a REF card sits, and which way it arrives from: straight out from the
 *  core, so the cluster reads as assembling around it. */
function partnerStyle(id: string, i: number, color: string) {
    const pos = L.value.partners[id]
    const dx = pos.x + 111 - L.value.core.x
    const dy = pos.y + 41 - L.value.core.y
    const n = Math.hypot(dx, dy) || 1
    return {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        '--c': color,
        '--d': `${700 + i * 110}ms`,
        '--from-x': `${((dx / n) * 28).toFixed(1)}px`,
        '--from-y': `${((dy / n) * 28).toFixed(1)}px`
    }
}
</script>

<template>
    <div
        ref="frame"
        :class="['aff-graphic', `aff-graphic--${layoutName}`, { 'is-loaded': loaded }]"
        :style="{ height: `${L.height * scale}px` }"
        role="img"
        :aria-label="$t('affiliates.hero.graphicLabel')"
    >
        <div
            class="aff-graphic__stage"
            :style="{
                width: `${L.width}px`,
                height: `${L.height}px`,
                transform: `translate3d(${offsetX}px, 0, 0) scale(${scale})`,
                '--core-x': `${L.core.x}px`,
                '--core-y': `${L.core.y}px`
            }"
            aria-hidden="true"
        >
            <!-- Grid (21:1380): the file's two exported line sets where the box
                 is the drawn one, a CSS pattern of the same pitch and ink where
                 it is not (stretched, the exports would thin their verticals). -->
            <template v-if="L.drawnGrid">
                <img src="/img/affiliates/hero/grid-horizontal.svg" alt="" width="844" height="668" class="aff-g-grid" />
                <img src="/img/affiliates/hero/grid-vertical.svg" alt="" width="844" height="668" class="aff-g-grid" />
            </template>
            <span v-else class="aff-g-grid aff-g-grid--pattern" />

            <svg class="aff-g-lines" :viewBox.attr="`0 0 ${L.width} ${L.height}`" fill="none">
                <defs>
                    <linearGradient id="aff-market" x1="0" y1="0" :x2.attr="L.width" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#2864FF" stop-opacity="0" />
                        <stop offset="0.2" stop-color="#2864FF" />
                        <stop offset="0.5" stop-color="#9D5CFF" />
                        <stop offset="0.8" stop-color="#F068D8" />
                        <stop offset="1" stop-color="#F068D8" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="aff-compared" :x1.attr="L.width" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#8390A9" stop-opacity="0" />
                        <stop offset="0.3" stop-color="#8390A9" />
                        <stop offset="0.7" stop-color="#8390A9" />
                        <stop offset="1" stop-color="#8390A9" stop-opacity="0" />
                    </linearGradient>
                    <!-- The trace's own glow: Figma's 14px-blur drop shadow in
                         #2864FF at 32%, which is part of its export box. -->
                    <filter id="aff-trace-glow" x="-10%" y="-60%" width="120%" height="220%">
                        <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#2864FF" flood-opacity="0.32" />
                    </filter>
                    <linearGradient id="aff-glint" x1="0" y1="0" :x2.attr="L.width" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FFFFFF" stop-opacity="0" />
                        <stop offset="0.25" stop-color="#FFFFFF" stop-opacity="0.9" />
                        <stop offset="0.75" stop-color="#FFFFFF" stop-opacity="0.9" />
                        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
                    </linearGradient>
                </defs>

                <!-- Recurring orbits (21:1345 / 21:1346), each with a rider. -->
                <circle class="aff-g-draw aff-g-orbit-a" :cx.attr="L.core.x" :cy.attr="L.core.y" r="145.5" stroke="#131821" pathLength="1" />
                <circle class="aff-g-draw aff-g-orbit-b" :cx.attr="L.core.x" :cy.attr="L.core.y" r="214" stroke="#171D27" stroke-width="2" pathLength="1" />
                <g class="aff-g-rider aff-g-rider--a">
                    <circle :cx.attr="L.core.x" :cy.attr="L.core.y - 145.5" r="2.5" fill="#2864FF" />
                </g>
                <g class="aff-g-rider aff-g-rider--b">
                    <circle :cx.attr="L.core.x" :cy.attr="L.core.y + 214" r="3" fill="#9D5CFF" />
                </g>

                <!-- Market trace (21:1338) and the compared trend (21:1343). -->
                <path
                    class="aff-g-draw aff-g-market"
                    :d.attr="marketD"
                    stroke="url(#aff-market)"
                    stroke-width="2"
                    pathLength="1"
                    filter="url(#aff-trace-glow)"
                />
                <path class="aff-g-glint" :d.attr="marketD" stroke="url(#aff-glint)" stroke-width="2" pathLength="1" />
                <path
                    class="aff-g-draw aff-g-compared"
                    :d.attr="comparedD"
                    stroke="url(#aff-compared)"
                    stroke-width="2"
                    pathLength="1"
                />
            </svg>

            <!-- Small trades (21:1441). -->
            <div
                v-for="(trade, i) in L.trades"
                :key="`t${i}`"
                :ref="(el) => { if (el) tradeEls[i] = el as HTMLElement }"
                class="aff-g-trade"
                :style="{ left: `${trade.x}px`, top: `${trade.y}px`, '--d': `${1150 + i * 90}ms` }"
            >
                <span class="aff-g-trade__bubble" />
                <span :ref="(el) => { if (el) tradePairEls[i] = el as HTMLElement }" class="aff-g-trade__pair">{{ AFF_OPENING_TRADES[i].pair }}</span>
                <span
                    :ref="(el) => { if (el) tradeMoveEls[i] = el as HTMLElement }"
                    :class="['aff-g-trade__move', { 'is-down': AFF_OPENING_TRADES[i].move < 0 }]"
                >{{ formatMove(AFF_OPENING_TRADES[i].move) }}</span>
            </div>

            <!-- Commissions in flight. Under every card, so each comet leaves one
                 and disappears into the next. -->
            <svg class="aff-g-comets" :viewBox.attr="`0 0 ${L.width} ${L.height}`" fill="none">
                <defs>
                    <filter id="aff-comet-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <g v-for="n in POOL" :key="`c${n}`" filter="url(#aff-comet-glow)">
                    <path
                        :ref="(el) => { if (el) cometPaths[n - 1] = el as SVGPathElement }"
                        class="aff-g-comet"
                        stroke-width="2.5"
                        stroke-linecap="round"
                    />
                    <circle
                        :ref="(el) => { if (el) cometHeads[n - 1] = el as SVGCircleElement }"
                        class="aff-g-comet__head"
                        r="3.5"
                        cx="-20"
                        cy="-20"
                    />
                </g>
            </svg>

            <!-- Partner nodes. The file stacks green UNDER the core and the other
                 three over it; that order is kept with z-index (see
                 .aff-g-partner--under) so the overlaps match the drawing. -->
            <div
                v-for="(p, i) in AFF_PARTNERS"
                :key="p.id"
                :ref="(el) => { if (el) partnerEls[i] = el as HTMLElement }"
                :class="['aff-g-partner', { 'aff-g-partner--under': p.id === 'green' }]"
                :style="partnerStyle(p.id, i, p.color)"
            >
                <span class="aff-g-partner__edge" />
                <span class="aff-g-partner__head">
                    <span class="aff-g-partner__id"><i class="aff-g-partner__dot" />{{ $t('affiliates.hero.ref', { id: p.ref }) }}</span>
                    <span class="aff-g-partner__cvr">{{ $t('affiliates.hero.cvr', { n: p.cvr }) }}</span>
                </span>
                <span class="aff-g-partner__row">
                    <span :ref="(el) => { if (el) partnerValueEls[i] = el as HTMLElement }" class="aff-g-partner__value ea-num">{{ partnerFigure(p.value) }}</span>
                    <svg class="aff-g-spark" width="62" height="30" viewBox="0 0 62 30" fill="none">
                        <path class="aff-g-spark__line" :d.attr="p.spark" :stroke.attr="p.color" stroke-width="1.5" pathLength="1" />
                        <circle class="aff-g-spark__tip" :cx.attr="p.tip[0]" :cy.attr="p.tip[1]" r="2.5" :fill.attr="p.color" />
                    </svg>
                </span>
            </div>

            <!-- Revenue core (18:6045). -->
            <div ref="coreEl" class="aff-g-core">
                <span class="aff-g-core__head">
                    <span class="aff-g-core__id">
                        <img class="aff-g-core__mark" src="/img/affiliates/hero/core-mark.svg" alt="" width="28" height="28" />
                        {{ $t('affiliates.hero.network') }}
                    </span>
                    <i class="aff-g-live" />
                </span>
                <span class="aff-g-core__payout">
                    <span class="aff-g-core__label">{{ $t('affiliates.hero.commissions') }}</span>
                    <span ref="coreValueEl" class="aff-g-core__value ea-num">{{ coreFigure }}</span>
                </span>
                <span class="aff-g-core__foot">
                    <span>{{ $t('affiliates.hero.last30') }}</span>
                    <span class="aff-g-core__up">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M2.667 2L4 .667 5.333 2M4 .667v6.666" stroke="#69E6B4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        18.4%
                    </span>
                </span>
            </div>

            <!-- Network halo (21:1347) and the ambient spectrum (21:1377), over
                 everything as drawn — both are faint washes, centred on the core. -->
            <img ref="haloEl" src="/img/affiliates/hero/network-halo.svg" alt="" width="600" height="600" class="aff-g-halo" />
            <span class="aff-g-ambient" />
        </div>
    </div>
</template>
