// The ripple orbit field behind the "EasyAlgos for Developers" hero.
//
// Split from its component the way utils/globeColumns.ts is split from
// SolutionGlobe.vue: this file is what the field LOOKS LIKE at an instant, and
// ForDevHeroField.vue is the canvas, the DPR, the visibility guard and the clock
// that hands it one.
//
// It arrived as a design handoff — "EA Hero — ripple orbit background", with the
// animation already extracted from the prototype into a framework-agnostic
// module — and the numbers below ARE the design rather than an implementation of
// it: thirteen rings, the 46px inner radius, the ~90px falloff sigma, the five
// orbit speeds. They were tuned against this hero's real copy, so moving one is a
// design change, not a tweak. The two knobs meant to be turned are `intensity`
// and `speed`, and their usable ranges are on the options below.
//
// The rings are NEVER deformed, which the handoff was emphatic about — an early
// round of the design warped them as the pulse passed and it was rejected, and a
// second attempt at it here was rejected again. They are perfect circles at every
// instant.
//
// Nothing else is added to them either. Two rounds tried to express the pulse
// with something NEW in the field — a warp, then a wake of shed copies — and both
// were rejected. It is expressed entirely through the ring the pulse is passing:
// as the wave animates outward, the ring it reaches thickens and goes a step up
// its own tint, then settles back as the wave leaves. Nothing appears that was
// not already drawn.

type RGB = [number, number, number]

/** The field's two accents, as a ramp from the innermost ring to the outermost.
 *
 *  The handoff names #5b3df5 -> #a855f7, which are the prototype's stand-ins for
 *  "the CTA gradient's stops" — it was mocked up from a screenshot and had no
 *  access to the tokens. These are the real ones: BLUE/BASE and PINK, the end
 *  stops of BOTH `ea-text` (the gradient on the headline's second line) and the
 *  framed run of `ea-cta` (the Apply now pill). So the field radiates outward
 *  through the same sweep the headline sitting on top of it is painted with, and
 *  the midpoint of the ramp lands within a shade of `ea-text`'s own #5959FF
 *  middle stop. */
const ACCENT_INNER = '#205EFB' // BLUE/BASE
const ACCENT_OUTER = '#B36DFF' // PINK

/** The same two ends, a step DARKER — where the pulse carries a ring while it is
 *  passing through it. Both are the project's own darker step of the tint beside
 *  them rather than a computed shade: the blue is the stop `blue-gradient-hover`
 *  drops to, the violet is EXTRA-PURPLE. Each sits at roughly two thirds the
 *  luminance of its light end, which is a step rather than a jump — a lit ring
 *  has to read as the same ring, weightier, not as a different colour. */
const ACCENT_INNER_DARK = '#0F3FBA' // the dark stop of `blue-gradient-hover`
const ACCENT_OUTER_DARK = '#8B23FE' // EXTRA-PURPLE

/** The radial spokes, and the one part of the field that is not brand: grey, so
 *  the ruling behind the rings reads as structure rather than as more colour.
 *  The handoff's rgb(117,121,140) is not on this project's ramp; Tinted/500 is
 *  the nearest step on it, and at the 0.18 alpha these are drawn at, the two are
 *  indistinguishable over white. */
const INK: RGB = [122, 127, 163] // Tinted/500 #7A7FA3

/** Where the rings and the spokes both start. A hole this size is what keeps the
 *  centre of the composition — which is behind the headline — clear. */
const INNER_R = 46
const RINGS = 13
const SPOKES = 28
/** Vertical centre of the field, as a fraction of the box. Above the middle,
 *  because the copy block is. */
const CENTER_Y = 0.45

/** Seconds between auto-emitted ripples, divided by `speed`. */
const RIPPLE_PERIOD = 3.1
/** Expansion in px/sec, multiplied by `speed`. */
const RIPPLE_SPEED = 180
/** How long a ripple lives, in seconds. Its alpha is the remaining fraction. */
const RIPPLE_LIFE = 4.4
/** Ceiling on live ripples. At the design's period and life there are two in
 *  flight; the cap is for a `speed` turned up, and for the first frame after a
 *  long pause. */
const RIPPLE_MAX = 8
/** The first emission. Not 0: the field should be drawn and settled before the
 *  first pulse crosses it. */
const FIRST_RIPPLE = 0.6
/** Denominator of the ripple's Gaussian falloff, exp(-d² / this) — sigma ≈ 90px.
 *  This is the mechanism that makes the pulse read at all: it is what a ring and
 *  a node each ask "how close is the ripple to me", so a node flares exactly as
 *  the pulse reaches its orbit. */
const FALLOFF = 8100

/** ---- What the pulse does to the ring it is passing ----
 *
 *  All three of these ride the same `g`, the ripple's proximity to that ring, so
 *  weight, tint and alpha arrive and leave together as one event.
 */
/** Peak line width ADDED as the wave crosses, in px, over the 1px a ring rests
 *  at. The handoff's own figure was 1.1, which is a ring you can tell has been
 *  touched; this is one you can watch travelling. */
const PULSE_WIDTH = 2.4
/** How far up the dark end of its own tint the pulse carries a ring, 0..1 —
 *  see ACCENT_INNER_DARK. Short of 1 on purpose: even at the crest a ring keeps
 *  a little of the colour it rests at. */
const PULSE_DARKEN = 0.85

/** The orbiting nodes: `rf` radius as a fraction of the field radius, `sp`
 *  angular speed in rad/s (its sign is the direction), `a0` starting angle.
 *  Five, at speeds with no common factor, so the pattern never repeats. */
const ORBITERS = [
    { rf: 0.26, sp: 0.24, a0: 0.5 },
    { rf: 0.44, sp: -0.16, a0: 2.1 },
    { rf: 0.62, sp: 0.11, a0: 4.0 },
    { rf: 0.82, sp: -0.075, a0: 5.6 },
    { rf: 0.35, sp: 0.19, a0: 3.2 }
] as const

export interface RippleFieldOptions {
    /** Global alpha multiplier. 0.9 is the design; usable range 0.3–1.8. */
    intensity?: number
    /** Global time multiplier. 1 is the design; usable range 0.3–2.2. */
    speed?: number
    /** Innermost ring. Defaults to BLUE/BASE — see ACCENT_INNER. */
    accentInner?: string
    /** Outermost ring, the nodes and the chords. Defaults to PINK. */
    accentOuter?: string
    /** Where the pulse carries the innermost ring. Defaults to the dark stop of
     *  `blue-gradient-hover`. */
    accentInnerDark?: string
    /** Where the pulse carries the outermost ring. Defaults to EXTRA-PURPLE. */
    accentOuterDark?: string
}

function hexToRgb(hex: string): RGB {
    const h = hex.replace('#', '')
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * One field, with its own ripple emission. Returns the draw function.
 *
 * That function is the whole of the per-frame work. It expects a context already
 * cleared and scaled to CSS pixels; `w`/`h` are the box in CSS pixels and `t` is
 * seconds since the field was first drawn.
 *
 * The emission state lives in this closure rather than in the component
 * precisely because it changes sixty times a second: nothing here is reactive,
 * and nothing here should be.
 */
export function createRippleField(options: RippleFieldOptions = {}) {
    const I = options.intensity ?? 0.9
    const S = options.speed ?? 1
    const inner = hexToRgb(options.accentInner ?? ACCENT_INNER)
    const outer = hexToRgb(options.accentOuter ?? ACCENT_OUTER)
    const innerDark = hexToRgb(options.accentInnerDark ?? ACCENT_INNER_DARK)
    const outerDark = hexToRgb(options.accentOuterDark ?? ACCENT_OUTER_DARK)

    const lerp = (from: RGB, to: RGB, f: number): RGB => [
        from[0] + (to[0] - from[0]) * f,
        from[1] + (to[1] - from[1]) * f,
        from[2] + (to[2] - from[2]) * f
    ]
    const css = (c: RGB, a: number) =>
        `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`

    /** The accent ramp. f = 0 is the innermost ring, f = 1 the outermost. */
    const mix = (f: number, a: number) => css(lerp(inner, outer, f), a)

    /** A RING's colour: `f` places it on that same ramp, and `d` is how far the
     *  pulse has carried it up the dark end of its own tint. Two ramps rather
     *  than a darkening filter, so both ends stay on colours the project already
     *  uses — a computed shade of #B36DFF goes grey long before it goes dark. */
    const ringInk = (f: number, d: number, a: number) =>
        css(lerp(lerp(inner, outer, f), lerp(innerDark, outerDark, f), d), a)
    const ink = (a: number) => `rgba(${INK[0]},${INK[1]},${INK[2]},${a})`

    /** Emission times of the live ripples. */
    let ripples: number[] = []
    let nextRipple = FIRST_RIPPLE

    return function drawRippleField(
        ctx: CanvasRenderingContext2D,
        w: number,
        h: number,
        t: number
    ) {
        const cx = w / 2
        const cy = h * CENTER_Y
        // The field's outer radius, past the corners of the box on purpose: the
        // outermost rings are meant to leave the frame rather than close inside
        // it, which is what stops the composition reading as a target.
        const maxR = Math.hypot(w * 0.6, h * 0.72)

        // One emission per period, on a clock that is only ever read forwards.
        // After a long pause — the hero off screen, or the tab hidden — `t`
        // arrives far ahead, every live ripple has already expired, and exactly
        // one new one is emitted. The field resumes rather than firing a backlog.
        if (t > nextRipple) {
            ripples.push(t)
            nextRipple = t + RIPPLE_PERIOD / S
        }
        ripples = ripples.filter((born) => t - born < RIPPLE_LIFE).slice(-RIPPLE_MAX)
        const live = ripples.map((born) => ({
            r: (t - born) * RIPPLE_SPEED * S,
            life: Math.max(0, 1 - (t - born) / RIPPLE_LIFE)
        }))

        /** How lit a thing at radius `r` is by the ripples passing it. */
        const glowAt = (r: number) => {
            let g = 0
            for (const ripple of live) {
                const d = r - ripple.r
                g += Math.exp(-(d * d) / FALLOFF) * ripple.life
            }
            return Math.min(1, g)
        }

        const gap = maxR / RINGS


        // 1. Centre bloom — a slow breath under everything else, so the middle of
        //    the field is never flat. Its period is fixed rather than scaled by
        //    `speed`: it is the ambient one, and it should not chase the ripples.
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.8)
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5)
        bloom.addColorStop(0, mix(0.55, (0.1 + 0.05 * pulse) * I))
        bloom.addColorStop(1, mix(0.55, 0))
        ctx.fillStyle = bloom
        ctx.fillRect(0, 0, w, h)

        // 2. Radial spokes — grey hairlines fading out as they go, on a rotation
        //    slow enough (0.018 rad/s) that they are never caught moving.
        //    Alternate spokes stop short, which gives the ruling a rhythm instead
        //    of a solid fan.
        ctx.lineWidth = 1
        for (let i = 0; i < SPOKES; i++) {
            const a = (i / SPOKES) * Math.PI * 2 + t * 0.018 * S
            const r1 = maxR * (i % 2 ? 0.52 : 0.92)
            const x0 = cx + Math.cos(a) * INNER_R
            const y0 = cy + Math.sin(a) * INNER_R
            const x1 = cx + Math.cos(a) * r1
            const y1 = cy + Math.sin(a) * r1
            const spoke = ctx.createLinearGradient(x0, y0, x1, y1)
            spoke.addColorStop(0, ink(0.2 * I))
            spoke.addColorStop(1, ink(0))
            ctx.strokeStyle = spoke
            ctx.beginPath()
            ctx.moveTo(x0, y0)
            ctx.lineTo(x1, y1)
            ctx.stroke()
        }

        // 3. Concentric rings — perfect circles, always. The ramp runs blue at the
        //    centre to violet at the rim, and the base alpha falls off with the
        //    index so the outer rings sit back. `+ 0.45 * g` is the ripple passing
        //    through, and the pulse is the WHOLE of what `g` does here: heavier by
        //    PULSE_WIDTH, a step up the dark end of its own tint by PULSE_DARKEN,
        //    and the alpha lift the handoff already had. Nothing is drawn that is
        //    not one of these thirteen circles.
        for (let i = 0; i < RINGS; i++) {
            const r = INNER_R + i * gap
            const g = glowAt(r)
            const tint = i / (RINGS - 1)
            const fade = 1 - i / (RINGS + 3)
            ctx.lineWidth = 1 + PULSE_WIDTH * g
            ctx.strokeStyle = ringInk(tint, PULSE_DARKEN * g, (0.16 * fade + 0.45 * g) * I)
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, Math.PI * 2)
            ctx.stroke()
        }

        // 4. The ripples' own leading edges. Squared life, so a ripple is bright
        //    while it is still near the centre and has dissolved by the rim.
        for (const ripple of live) {
            ctx.lineWidth = 1.8 * ripple.life + 0.3
            ctx.strokeStyle = mix(0.65, 0.3 * ripple.life * ripple.life * I)
            ctx.beginPath()
            ctx.arc(cx, cy, ripple.r, 0, Math.PI * 2)
            ctx.stroke()
        }

        // 5. The orbiting nodes, and the chords between them.
        const pts = ORBITERS.map((n) => {
            const r = maxR * 0.86 * n.rf
            const a = n.a0 + t * n.sp * S
            return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a, r, g: glowAt(r), sp: n.sp }
        })

        // Chords first, so they pass UNDER the nodes they join. They appear and
        // dissolve on their own as the orbits drift past each other; the squared
        // closeness is what keeps them from reading as a permanent web.
        ctx.lineWidth = 1
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
                const k = Math.max(0, 1 - d / (w * 0.26))
                if (k <= 0.02) continue
                ctx.strokeStyle = mix(0.8, 0.26 * k * k * I)
                ctx.beginPath()
                ctx.moveTo(pts[i].x, pts[i].y)
                ctx.lineTo(pts[j].x, pts[j].y)
                ctx.stroke()
            }
        }

        for (const pt of pts) {
            const dir = pt.sp > 0 ? 1 : -1
            // A 0.5-rad arc trailing the node, fading backwards — the direction of
            // travel, drawn rather than left to be inferred from one frame.
            const sweep = 0.5
            const tail = ctx.createLinearGradient(
                pt.x,
                pt.y,
                cx + Math.cos(pt.a - dir * sweep) * pt.r,
                cy + Math.sin(pt.a - dir * sweep) * pt.r
            )
            tail.addColorStop(0, mix(0.9, (0.5 + 0.4 * pt.g) * I))
            tail.addColorStop(1, mix(0.9, 0))
            ctx.lineWidth = 1.7
            ctx.strokeStyle = tail
            ctx.beginPath()
            ctx.arc(cx, cy, pt.r, pt.a - dir * sweep, pt.a, dir < 0)
            ctx.stroke()

            const rad = 22 + 26 * pt.g
            const halo = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rad)
            halo.addColorStop(0, mix(0.9, (0.2 + 0.3 * pt.g) * I))
            halo.addColorStop(1, mix(0.9, 0))
            ctx.fillStyle = halo
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2)
            ctx.fill()

            // The core, and the one alpha in the field `intensity` does not touch:
            // turning the field down should dim the structure around the nodes,
            // not the nodes themselves, or there is nothing left to look at.
            ctx.fillStyle = mix(0.95, 0.95)
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, 2.5 + 2.4 * pt.g, 0, Math.PI * 2)
            ctx.fill()
        }
    }
}
