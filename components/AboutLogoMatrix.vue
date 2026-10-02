<script setup lang="ts">
// The matrix on the About Us page — Figma "Image" (3138:9174) in "module Team
// Photo", a 648x480 card holding "img About Us" (3149:9567): 192 rounded
// squares on a 38px pitch, 16 across and 12 down, with a low-res EasyAlgos mark
// (3550:12058) set into the middle of it as filled diamonds.
//
// Drawn as data on a canvas rather than as 192 SVG nodes because every cell
// animates on its own. The vocabulary is Figma's two sheets of states:
//
//   Animation Base Shapes (3550:12068)   a 2px-stroked square in INK or PALE,
//                                        upright or turned 45deg — the field.
//   Animation Logo Shapes (3550:12071)   the same square turned 45deg, filled
//                                        DARK or LIGHT with no stroke — the mark.
//
// The choreography, which all lives in `directCells`:
//
//   1. The field starts exactly as Figma draws it, except under the mark: the
//      40 cells the logo will occupy start as field cells too, dealt from the
//      same mix of poses as the rest of the drawn field.
//   2. Cells then drift between the four base states in waves — a dozen or so
//      cells across the field turning together on each beat (see DRIFT_BEAT).
//      Every change is a turn (45deg to change shape, 90deg to keep it) with its
//      stroke colour, timed and eased exactly as Diego's motion sample
//      (3554:13950): see FIELD_EASE. Forever.
//   3. The mark then forms in place. Its cells shift into it one at a time, on
//      the same turn as the field (and the same dip), with the fill coming in
//      as they turn. The three chevrons form in order (front, middle, back),
//      and within each one the next cell to shift is always the one furthest
//      from those already shifted, so the shape fills in across its whole area
//      rather than growing outwards from a point.
//
// Click the card to replay it from the top (a tuning aid; harmless to keep).

const COLS = 16
const ROWS = 12
const W = 648
const H = 480
const PITCH = 38
/** Centre of the top-left cell. */
const X0 = 38
const Y0 = 31
const SIZE = 20
const RADIUS = 4.94
const STROKE = 2

const INK = hex('#9DAFC6')
const PALE = hex('#E0E6EE')
const DARK = hex('#667A96')
const LIGHT = hex('#8BA6C6')

/** Figma's settled frame, read cell by cell off 3149:9567.
 *    o  INK square     -  PALE square
 *    x  INK diamond    /  PALE diamond
 *    A  front chevron (DARK)   B  middle (LIGHT)   C  back (DARK)
 *  The field letters are used as each cell's "home" pose, which the drift
 *  favours, so the card at rest resembles the drawing without ever being it. */
const ART = [
    'o--oooooo-oxoxoo',
    'oxoo-oxooo/oooo-',
    'o-o-oooAAAAAoooo',
    'xooooBBBBBBAx-xo',
    'o-oxooBBBBBAoooo',
    'xoxoCCCCCBBAooo-',
    'oooo-CCoCBBAo-xo',
    'o-o-oxoCCBBoo/oo',
    '-ooxo-oCCoBoooox',
    'oxoooxooCoooo-oo',
    'ooooo-oooooo-oox',
    'x-oxooxoo-oooo-o'
]

// ------------------------------------------------------------------ timing --
/** The field drifts in WAVES, like the motion sample, where the cells turn
 *  together on one beat:
 *    DRIFT_FROM    ms before the first wave
 *    DRIFT_BEAT    ms from one wave to the next (a random value in the range)
 *    DRIFT_COUNT   cells turned by each wave (a random value in the range),
 *                  scattered over the whole field
 *    DRIFT_JITTER  ms of spread inside a wave; 0 is perfectly simultaneous
 *  A turn takes FIELD_MS (500), so a beat shorter than that overlaps waves. */
const DRIFT_FROM = 500
const DRIFT_BEAT: [number, number] = [700, 1300]
const DRIFT_COUNT: [number, number] = [12, 30]
const DRIFT_JITTER = 40
/** How likely a drifting cell is to go back to its drawn pose rather than a
 *  random one, and the odds of each random one (o, -, x, /). */
const DRIFT_HOME = 0.35
const DRIFT_ODDS = [0.45, 0.25, 0.18, 0.12]

/** The mark: when it starts forming, the time between one cell shifting into it
 *  and the next, and the extra pause between one chevron and the next. With 9,
 *  18 and 13 cells that is about 3.3s from the first cell to the last. */
const LOGO_FROM = 1300
const LOGO_STEP = 70
const LOGO_PART_GAP = 250
/** The chevrons, in the order they form: front (top-right), middle, back. */
const PARTS = [
    { key: 'A', ink: DARK },
    { key: 'B', ink: LIGHT },
    { key: 'C', ink: DARK }
]

// ------------------------------------------------------------------ physics --
/** A field cell changing pose, as Diego's motion sample draws it (3554:13950):
 *  rotation and stroke colour together, over 500ms (the first 0.625 of an 800ms
 *  loop), on cubic-bezier(0.431, -0.544, 0.517, 1.594). That curve winds back
 *  before it goes and overshoots before it lands. The colour is clamped to its
 *  two ends, so only the turn over- and under-shoots. The scale dips beneath
 *  it on its own easing: see FIELD_DIP. */
const FIELD_MS = 500
const FIELD_EASE = cubicBezier(0.431, -0.544, 0.517, 1.594)
/** How many of the shifts that land on a PALE stroke also take a PALE fill,
 *  as a share (0..1). The fill comes in with the turn, on its curve (clamped);
 *  it fades out — smoothstep over the same FIELD_MS — when the cell turns back
 *  to an INK stroke. A shift from one PALE pose to the other keeps whatever
 *  fill the cell had. */
const PALE_FILL = 0.5
/** The sample's scale during a turn (updated 3554:13950): down to FIELD_DIP by
 *  half way, on motion.dev's easeIn, and back to 1 as the turn lands, on its
 *  easeOut — times [0, 0.3125, 0.625] of the sample's 800ms loop, i.e. 0, 250
 *  and 500ms. */
const FIELD_DIP = 0.75
const EASE_IN = cubicBezier(0.42, 0, 1, 1)
const EASE_OUT = cubicBezier(0, 0, 0.58, 1)
const fieldScale = (u: number) =>
    u < 0.5 ? 1 - (1 - FIELD_DIP) * EASE_IN(u * 2) : FIELD_DIP + (1 - FIELD_DIP) * EASE_OUT(u * 2 - 1)
// ------------------------------------------------------------------- model --
type Rgb = [number, number, number]

interface Cell {
    x: number
    y: number
    /** Grid coordinates. */
    i: number
    j: number
    /** Drawn pose, as letters of ART. */
    home: string
    /** Which chevron owns the cell in the finished mark, if any. */
    part: string | null
    /** Current field pose. */
    pose: string
    /** The cell's target angle. It accumulates (every shift is a turn: 45 to
     *  change shape, 90 to keep it), so only its value mod 90 says square (0)
     *  or diamond (45). */
    fRot: number
    // targets
    tRot: number
    tFill: number
    tPale: number
    /** The field's own PALE fill: 0 or 1, and the live value below. */
    tBg: number
    /** A turn in progress: when it started, and where everything started from. */
    tween: { t0: number; rot0: number; pale0: number; bg0: number; fill0: number } | null
    // live values
    rot: number
    /** The mark's fill (0..1), in `ink`. */
    fill: number
    pale: number
    bg: number
    /** The turn's scale dip. */
    fScale: number
    ink: Rgb
    /** True once the cell has shifted into the mark; the field leaves it alone. */
    settled: boolean
}

const cells: Cell[] = []
for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
        const ch = ART[j][i]
        const part = 'ABC'.includes(ch) ? ch : null
        cells.push({
            x: X0 + i * PITCH,
            y: Y0 + j * PITCH,
            i,
            j,
            home: part ? '' : ch,
            part,
            pose: 'o',
            fRot: 0,
            tRot: 0,
            tFill: 0,
            tPale: 0,
            tBg: 0,
            tween: null,
            rot: 0,
            fill: 0,
            pale: 0,
            bg: 0,
            fScale: 1,
            ink: DARK,
            settled: false
        })
    }
}
/** Poses for the cells under the mark, which Figma never draws as field: dealt
 *  in proportion to the drawn field's own mix (108 o, 22 -, 20 x, 2 /), from a
 *  fixed seed so the opening frame is the same on every load. */
{
    const field = cells.filter((c) => !c.part)
    const pool = field.map((c) => c.home)
    let seed = 0x5eed
    const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
    for (const c of cells) if (c.part) c.home = pool[(rand() * pool.length) | 0]
}

const parts = PARTS.map((p) => ({ ...p, cells: cells.filter((c) => c.part === p.key) }))

// -------------------------------------------------------------- direction --
let clock = 0
let nextDrift = DRIFT_FROM

const isDiamond = (pose: string) => pose === 'x' || pose === '/'
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const turnBy = (fromDiamond: boolean, toDiamond: boolean) =>
    (fromDiamond !== toDiamond ? 45 : 90) * (Math.random() < 0.5 ? 1 : -1)

/** Moves a field cell to a new pose. */
function poseTargets(c: Cell, pose: string) {
    c.fRot += turnBy(isDiamond(c.pose), isDiamond(pose))
    const wasPale = c.tPale === 1
    c.pose = pose
    c.tPale = pose === '-' || pose === '/' ? 1 : 0
    if (!c.tPale) c.tBg = 0
    else if (!wasPale) c.tBg = Math.random() < PALE_FILL ? 1 : 0
    tweenTo(c)
}

/** Shifts a cell into the mark: the same turn as the field, to a diamond, with
 *  the chevron's fill coming in on it and any PALE field fill fading out. */
function joinMark(c: Cell, ink: Rgb) {
    c.fRot += turnBy(isDiamond(c.pose), true)
    c.settled = true
    c.ink = ink
    c.tFill = 1
    c.tBg = 0
    tweenTo(c)
}

/** Starts the sample's 500ms turn, from wherever the cell is. */
function tweenTo(c: Cell) {
    c.tRot = c.fRot
    c.tween = { t0: clock, rot0: c.rot, pale0: c.pale, bg0: c.bg, fill0: c.fill }
}

/** A pose for a drifting cell — never the one it already has, so every
 *  drift is a visible change. */
function pickPose(c: Cell) {
    if (c.home !== c.pose && Math.random() < DRIFT_HOME) return c.home
    for (;;) {
        let r = Math.random()
        let next = 'o'
        for (let n = 0; n < 4; n++)
            if ((r -= DRIFT_ODDS[n]) < 0) {
                next = 'o-x/'[n]
                break
            }
        if (next !== c.pose) return next
    }
}

/** The order a chevron's cells shift in: each next cell is the one furthest from
 *  every cell already chosen (farthest-point sampling, from a random first
 *  cell), so consecutive shifts land well apart and the whole shape fills at
 *  once. Re-dealt on every run. */
function spreadOrder(group: Cell[]) {
    const left = [...group]
    const order = left.splice((Math.random() * left.length) | 0, 1)
    const gap = (a: Cell, b: Cell) => Math.hypot(a.i - b.i, a.j - b.j)
    while (left.length) {
        let best = 0
        let bestD = -1
        left.forEach((c, n) => {
            // A hair of noise so equal distances resolve differently each run.
            const d = Math.min(...order.map((o) => gap(c, o))) + Math.random() * 0.01
            if (d > bestD) [best, bestD] = [n, d]
        })
        order.push(left.splice(best, 1)[0])
    }
    return order
}

/** The mark's schedule for this run: [time, cell, ink], in time order. */
let plan: [number, Cell, Rgb][] = []
function planMark() {
    plan = []
    let t = LOGO_FROM
    for (const p of parts) {
        for (const c of spreadOrder(p.cells)) {
            plan.push([t, c, p.ink])
            t += LOGO_STEP
        }
        t += LOGO_PART_GAP - LOGO_STEP
    }
}

/** Drift changes waiting for their moment within a wave: [time, cell]. */
let pending: [number, Cell][] = []

const canDrift = (c: Cell) => !c.settled && !c.tween
const between = (r: [number, number]) => r[0] + Math.random() * (r[1] - r[0])

/** The whole animation: decides, every frame, what each cell is trying to be. */
function directCells() {
    // Drift: on each beat, a wave of cells picked from the whole field (only
    // ones free to move) all start their turn together, give or take the jitter.
    if (clock >= nextDrift) {
        nextDrift = clock + between(DRIFT_BEAT)
        const free = cells.filter(canDrift)
        const count = Math.min(free.length, Math.round(between(DRIFT_COUNT)))
        for (let m = 0; m < count; m++) {
            const k = m + ((Math.random() * (free.length - m)) | 0)
            ;[free[m], free[k]] = [free[k], free[m]]
            pending.push([clock + Math.random() * DRIFT_JITTER, free[m]])
        }
    }
    if (pending.length) {
        pending = pending.filter(([when, c]) => {
            if (when > clock) return true
            if (canDrift(c)) poseTargets(c, pickPose(c))
            return false
        })
    }

    // The mark: every cell whose moment has come shifts into it.
    while (plan.length && plan[0][0] <= clock) {
        const [, c, ink] = plan.shift()!
        joinMark(c, ink)
    }
}

function integrate() {
    for (const c of cells) {
        if (!c.tween) continue
        const u = Math.min(1, (clock - c.tween.t0) / FIELD_MS)
        const e = FIELD_EASE(u)
        const ce = Math.min(1, Math.max(0, e))
        c.rot = c.tween.rot0 + (c.tRot - c.tween.rot0) * e
        c.pale = c.tween.pale0 + (c.tPale - c.tween.pale0) * ce
        c.fill = c.tween.fill0 + (c.tFill - c.tween.fill0) * ce
        // In on the turn's own curve; out as a fade.
        const g = c.tBg > c.tween.bg0 ? ce : smooth(u)
        c.bg = c.tween.bg0 + (c.tBg - c.tween.bg0) * g
        c.fScale = fieldScale(u)
        if (u >= 1) c.tween = null
    }
}

// ------------------------------------------------------------------ render --
const root = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let cssW = 0
let raf = 0
let last = 0
let onScreen = false
let started = false
let reduced = false
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

function draw() {
    if (!ctx) return
    const k = cssW / W
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    const dpr = ctx.canvas.width / cssW
    ctx.lineWidth = STROKE
    for (const c of cells) {
        const a = (c.rot * Math.PI) / 180
        const sc = c.fScale * k * dpr
        const cos = Math.cos(a) * sc
        const sin = Math.sin(a) * sc
        ctx.setTransform(cos, sin, -sin, cos, c.x * k * dpr, c.y * k * dpr)
        ctx.beginPath()
        ctx.roundRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, RADIUS)
        const f = Math.min(1, Math.max(0, c.fill))
        if (c.bg > 0.004 && f < 0.996) {
            ctx.fillStyle = rgba(PALE, c.bg)
            ctx.fill()
        }
        if (f > 0.004) {
            ctx.fillStyle = rgba(c.ink, f)
            ctx.fill()
        }
        if (f < 0.996) {
            ctx.strokeStyle = rgba(mix(INK, PALE, c.pale), 1 - f)
            ctx.stroke()
        }
    }
}

function frame(now: number) {
    raf = 0
    const dt = Math.min(50, now - (last || now))
    last = now
    clock += dt
    directCells()
    integrate()
    draw()
    if (onScreen && started) raf = requestAnimationFrame(frame)
}

function sync() {
    const run = onScreen && started && !reduced
    if (run && !raf) {
        last = 0
        raf = requestAnimationFrame(frame)
    } else if (!run && raf) {
        cancelAnimationFrame(raf)
        raf = 0
    }
}

/** Puts a cell at rest in its home pose, as Figma draws it (diamonds at +45). */
function restAtHome(c: Cell) {
    c.pose = c.home
    c.fRot = c.tRot = c.rot = isDiamond(c.home) ? 45 : 0
    c.tPale = c.pale = c.home === '-' || c.home === '/' ? 1 : 0
    c.tBg = c.bg = 0
    c.tFill = c.fill = 0
    c.fScale = 1
    c.tween = null
    c.settled = false
}

/** The opening frame: Figma's field everywhere, the mark not yet formed. */
function reset() {
    clock = 0
    nextDrift = DRIFT_FROM
    pending = []
    for (const c of cells) restAtHome(c)
    planMark()
}
reset()

/** The finished picture, for reduced motion: Figma's frame as drawn. */
function settleStill() {
    reset()
    plan = []
    for (const p of parts)
        for (const c of p.cells) {
            Object.assign(c, { rot: 45, tRot: 45, fRot: 45, fill: 1, tFill: 1, settled: true })
            c.ink = p.ink
        }
    draw()
}

function replay() {
    if (reduced) return
    reset()
    started = true
    sync()
}

function resize() {
    const el = canvasRef.value
    if (!el || !root.value) return
    const rect = root.value.getBoundingClientRect()
    if (rect.width <= 0) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cssW = rect.width
    el.width = Math.round(rect.width * dpr)
    el.height = Math.round(rect.height * dpr)
    ctx = el.getContext('2d')
    draw()
}

onMounted(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resize()
    ro = new ResizeObserver(resize)
    ro.observe(root.value!)
    if (reduced) {
        settleStill()
        return
    }
    draw()
    io = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                onScreen = e.isIntersecting
                // The run starts the first time the card is properly in view,
                // so the reader sees the mark arrive rather than its aftermath.
                if (e.intersectionRatio >= 0.4) started = true
            }
            sync()
        },
        { threshold: [0, 0.4] }
    )
    io.observe(root.value!)
})

onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    io?.disconnect()
    ro?.disconnect()
    io = ro = null
    ctx = null
})

// ------------------------------------------------------------------ easing --
/** CSS cubic-bezier(x1, y1, x2, y2) as a function of progress: x is solved by
 *  Newton's method with a bisection fallback, then y is read off. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1
    const bx = 3 * (x2 - x1) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = 3 * (y2 - y1) - cy
    const ay = 1 - cy - by
    const sx = (t: number) => ((ax * t + bx) * t + cx) * t
    const sy = (t: number) => ((ay * t + by) * t + cy) * t
    const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx
    return (x: number) => {
        if (x <= 0) return 0
        if (x >= 1) return 1
        let t = x
        for (let n = 0; n < 8; n++) {
            const e = sx(t) - x
            if (Math.abs(e) < 1e-6) return sy(t)
            const d = dx(t)
            if (Math.abs(d) < 1e-6) break
            t -= e / d
        }
        let lo = 0
        let hi = 1
        t = x
        for (let n = 0; n < 30; n++) {
            if (sx(t) < x) lo = t
            else hi = t
            t = (lo + hi) / 2
        }
        return sy(t)
    }
}

// ------------------------------------------------------------------ colour --
function hex(h: string): Rgb {
    const n = parseInt(h.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(a: Rgb, b: Rgb, t: number): Rgb {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}
function rgba(c: Rgb, a: number) {
    return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`
}
</script>

<template>
    <!-- 648x480 as drawn, scaling with its column. The noise sits OVER the
         cells at 30%, as in Figma, and is 560 tall from 40px above the card. -->
    <div
        ref="root"
        class="relative aspect-[648/480] w-full cursor-pointer overflow-hidden rounded-3xl bg-white"
        aria-hidden="true"
        @click="replay"
    >
        <canvas ref="canvasRef" class="block h-full w-full" />
        <div class="ea-matrix-noise pointer-events-none absolute inset-x-0 top-[-8.333%] h-[116.667%] opacity-30" />
    </div>
</template>

<style scoped>
.ea-matrix-noise {
    background-image: image-set(
        url('/img/about/background-noise-648.webp') type('image/webp'),
        url('/img/about/background-noise-648.png') type('image/png')
    );
    background-size: 100% 100%;
}
</style>
