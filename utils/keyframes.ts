// A keyframe track evaluator, shaped to consume Figma's motion export verbatim.
//
// `get_motion_context` hands back exactly three parallel arrays per animated
// property — times (fractions of the timeline), values, and one easing per
// segment. Keeping that shape rather than normalising it into something prettier
// is deliberate: a track in this file can be diffed against the Figma payload
// line for line, so re-exporting the reference after a design tweak is a paste
// rather than a translation.
//
// Note that in this build the "time" fed to these tracks is SCROLL position, not
// wall time. The easings were authored against a constant clock, so they read
// differently here — which is the point: the reader is the clock.

export type Ease = 'linear' | readonly [number, number, number, number]

export interface Track {
    readonly times: readonly number[]
    readonly values: readonly number[]
    readonly eases: readonly Ease[]
}

export interface ColorTrack {
    readonly times: readonly number[]
    readonly values: readonly string[]
    readonly eases: readonly Ease[]
}

/** Solve a CSS-style cubic-bezier(p1x,p1y,p2x,p2y) for y at a given x.
 *
 *  Newton-Raphson with a bisection fallback, the same approach browsers use.
 *  Written out rather than approximated because several of the bloom segments
 *  overshoot (p2y up to 1.63) — a lerp or a generic ease would flatten exactly
 *  the snap that gives the circles their character. */
function bezierEase(p1x: number, p1y: number, p2x: number, p2y: number, x: number) {
    if (x <= 0) return 0
    if (x >= 1) return 1

    const cx = 3 * p1x
    const bx = 3 * (p2x - p1x) - cx
    const ax = 1 - cx - bx
    const cy = 3 * p1y
    const by = 3 * (p2y - p1y) - cy
    const ay = 1 - cy - by

    const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u
    const slopeX = (u: number) => (3 * ax * u + 2 * bx) * u + cx

    let u = x
    for (let i = 0; i < 8; i++) {
        const dx = sampleX(u) - x
        if (Math.abs(dx) < 1e-6) break
        const d = slopeX(u)
        if (Math.abs(d) < 1e-6) break
        u -= dx / d
    }
    // Newton can wander off a near-flat stretch of the curve; clamp back onto
    // [0,1] by bisection rather than trusting a runaway root.
    if (u < 0 || u > 1) {
        let lo = 0
        let hi = 1
        u = x
        for (let i = 0; i < 20; i++) {
            const value = sampleX(u)
            if (Math.abs(value - x) < 1e-6) break
            if (value > x) hi = u
            else lo = u
            u = (lo + hi) / 2
        }
    }
    return ((ay * u + by) * u + cy) * u
}

function applyEase(ease: Ease | undefined, u: number) {
    if (!ease || ease === 'linear') return u
    return bezierEase(ease[0], ease[1], ease[2], ease[3], u)
}

/** Index of the segment containing `t`, plus its eased 0..1 position. Returns
 *  -1 for a `t` outside the track, which both samplers read as "hold the end". */
function locate(times: readonly number[], eases: readonly Ease[], t: number) {
    if (t <= times[0]) return { index: -1, u: 0, at: 0 }
    const last = times.length - 1
    if (t >= times[last]) return { index: -1, u: 0, at: last }

    let i = last - 1
    while (i > 0 && times[i] > t) i--

    const span = times[i + 1] - times[i]
    // Figma emits zero-length segments (e.g. 0.3749 -> 0.375) to pin a value
    // immediately before a transition. Dividing by that span is a NaN.
    const u = span > 0 ? (t - times[i]) / span : 1
    return { index: i, u: applyEase(eases[i], u), at: -1 }
}

export function sampleTrack(track: Track, t: number): number {
    const { index, u, at } = locate(track.times, track.eases, t)
    if (index < 0) return track.values[at]
    const from = track.values[index]
    return from + (track.values[index + 1] - from) * u
}

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Same evaluator over hex colours, interpolated per sRGB channel — which is
 *  what Figma previews, so a mid-transition frame matches the reference. */
export function sampleColorTrack(track: ColorTrack, t: number): string {
    const { index, u, at } = locate(track.times, track.eases, t)
    if (index < 0) return track.values[at]
    const from = hexToRgb(track.values[index])
    const to = hexToRgb(track.values[index + 1])
    const mix = from.map((c, i) => Math.round(c + (to[i] - c) * u))
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`
}

/** Clamped 0..1 position of `value` within [from, to]. The one piece of maths
 *  every scroll-driven stretch in the section needs. */
export function norm(value: number, from: number, to: number) {
    const t = (value - from) / (to - from)
    return t < 0 ? 0 : t > 1 ? 1 : t
}
