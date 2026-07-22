import type { SphereCell } from './sphereFragments'

// Procedural fracture variants for the "old ecosystem" sphere.
//
// Everything here is pure math on the baked Voronoi cells — no three.js import,
// so this module stays dependency-free and auto-importable. It emits plain
// number arrays that the component turns into BufferGeometry, which keeps the
// WebGL layer thin and makes the geometry unit-testable in isolation.
//
// The four knobs are orthogonal, so a variant is just a parameter set:
//   inset     — shrink each shard toward its centre, opening gaps
//   thickness — extrude inward so shards are slabs, not infinitely thin caps
//   explode   — push shards outward along their normal (with per-shard drift)
//   noise     — displace the surface radially for a rocky, irregular skin

export type Vec3 = [number, number, number]

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s]
const unit = (a: Vec3): Vec3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
}

/* ------------------------------------------------------------ noise ---- */
// Deterministic hash-based value noise. Deliberately NOT Math.random(): the
// geometry is rebuilt on every mount and resize, and a shape that reshuffled
// each time would flicker. Same input always yields the same sphere.

function hash3(i: number, j: number, k: number): number {
    let h = (i | 0) * 374761393 + (j | 0) * 668265263 + (k | 0) * 1274126177
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

const fade = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function valueNoise(x: number, y: number, z: number): number {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi)
    const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz)
    const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf)
    const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf)
    const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf)
    const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf)
    return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf)
}

/** Fractal sum, remapped to roughly [-1, 1] so it reads as a displacement. */
function fbm(p: Vec3, freq: number, octaves: number): number {
    let sum = 0
    let amp = 1
    let norm = 0
    let f = freq
    for (let o = 0; o < octaves; o++) {
        sum += valueNoise(p[0] * f, p[1] * f, p[2] * f) * amp
        norm += amp
        amp *= 0.5
        f *= 2.03 // non-integer so octaves don't align into visible banding
    }
    return (sum / (norm || 1)) * 2 - 1
}

/** Stable per-shard pseudo-random in [0,1), derived from its seed direction. */
function shardRandom(seed: Vec3, salt: number): number {
    return hash3(
        Math.round(seed[0] * 1000) + salt,
        Math.round(seed[1] * 1000) - salt,
        Math.round(seed[2] * 1000) + salt * 7
    )
}

/** Slide a point across the sphere's surface by a noise-driven tangential
 *  nudge, turning a straight cell edge into a ragged one.
 *
 *  The offset depends only on the point's position — never on which cell is
 *  asking. That is what lets neighbouring shards share a torn edge exactly:
 *  both sides evaluate the same function at the same coordinates and get the
 *  same answer, so the tessellation never pulls apart. The radial component is
 *  removed so the point wanders along the surface rather than off it. */
function jitterOnSurface(p: Vec3, amp: number, freq: number): Vec3 {
    const d: Vec3 = [
        fbm([p[0] + 11.3, p[1], p[2]], freq, 2) * amp,
        fbm([p[0], p[1] + 27.7, p[2]], freq, 2) * amp,
        fbm([p[0], p[1], p[2] + 41.1], freq, 2) * amp,
    ]
    const radial = d[0] * p[0] + d[1] * p[1] + d[2] * p[2]
    return unit(add(p, [d[0] - p[0] * radial, d[1] - p[1] * radial, d[2] - p[2] * radial]))
}

/* --------------------------------------------------------- variants ---- */

export interface NoiseConfig {
    /** Radial displacement as a fraction of the sphere radius. */
    amp: number
    /** Spatial frequency — higher is bumpier. */
    freq: number
    octaves: number
}

/** Ragged cell borders: each straight edge is walked in `segments` steps whose
 *  points are nudged tangentially, so a shard reads as a torn fragment rather
 *  than a clean n-gon. */
export interface JaggedConfig {
    /** Steps per original cell edge — more means a finer, more broken outline. */
    segments: number
    /** Tangential wander, as a fraction of the sphere radius. */
    amp: number
    /** Spatial frequency of the wander — higher zig-zags more tightly. */
    freq: number
}

export interface LightConfig {
    ambient: number
    key: number
    fill: number
    /** Key-light position; the sphere sits at the origin. */
    keyPos: [number, number, number]
}

/** Per-point brightness modulation. Cycles are whole numbers of oscillations
 *  per loop, so every grain returns to its starting brightness on the wrap —
 *  that is what keeps the animation seamless. */
export interface TwinkleConfig {
    /** Modulation depth, 0 (steady) to 1 (full swing). */
    amp: number
    /** Fastest twinkle, in cycles per loop. Each point draws 1..cycles. */
    cycles: number
}

/** One stratum of a particle orb — a band of points between two radii. */
export interface ParticleLayer {
    count: number
    /** Radial band, in sphere radii. rMin 0 fills a volume; rMin ~ rMax is a shell. */
    rMin: number
    rMax: number
    /** Point diameter in world units (the sphere has radius 1). */
    size: number
    opacity: number
    /** Rotation relative to the sphere's own spin — negative counter-rotates.
     *  Layers turning at different rates give the depth parallax that makes the
     *  orb read as a volume instead of a textured ball. Whole numbers keep the
     *  stratum in step with the loop; `-2` is a counter-turn at equal speed. */
    spin: number
    /** Per-point brightness variance, 0 (uniform) to 1 (full range). */
    shade: number
    /** Point the layer clusters around, in sphere radii. Default is the centre.
     *  An off-centre value is what lets a dense core drift through the volume
     *  as the orb turns, instead of sitting on the rotation axis unmoved. */
    center?: Vec3
    /** Radial density exponent for volume layers (`rMin: 0`). `1/3` spreads
     *  points evenly through the volume; higher values pack them toward
     *  `center` and thin out the edge. Ignored for bands. */
    falloff?: number
    /** Per-point size variance, 0 (uniform) to 1 (full range). */
    sizeJitter?: number
    twinkle?: TwinkleConfig | null
}

/** A sphere drawn as layered points instead of fracture plates. */
export interface ParticleConfig {
    layers: ParticleLayer[]
    /** Index of the layer whose points carry constellation links; omit for none. */
    linkLayer?: number
    /** Maximum chord distance between linked points, in sphere radii. */
    linkDistance?: number
    /** Per-point cap so the web stays sparse instead of becoming a mesh. */
    maxLinks?: number
    linkOpacity?: number
    /** Loop period in ms. Every periodic term — twinkle, glow pulse — is a whole
     *  multiple of it, so the piece repeats exactly. Omit to fall back to the
     *  component's default continuous rotation. */
    loopMs?: number
    /** Loops per full revolution. `1` turns once per loop; higher values keep
     *  the spin slow while the loop stays short (the whole piece then repeats
     *  every `loopMs * loopsPerTurn`). */
    loopsPerTurn?: number
    /** How far the back of the cloud dims, 0 (flat) to 1 (black). Additive
     *  points have no occlusion of their own, so this is what supplies depth. */
    depthFade?: number
    /** Soft additive halo at `center`, drawn as a camera-facing sprite. Points
     *  can't make a smooth bloom — a large one would exceed the `gl_PointSize`
     *  ceiling most GPUs enforce — so the core glow is its own object. */
    glow?: { center: Vec3; size: number; opacity: number } | null
}

export const DEFAULT_LIGHT: LightConfig = {
    ambient: 0.8,
    key: 2.3,
    fill: 0.65,
    keyPos: [-3, 3.5, 4],
}

export interface SphereVariant {
    id: string
    name: string
    blurb: string
    /** Which baked fracture pattern to use (see sphereFragments). */
    cells: 16 | 32 | 48 | 80
    /** 1 = shards touch; below 1 opens gaps between them. */
    inset: number
    /** 0 = flat cap; above 0 extrudes inward into a solid slab. */
    thickness: number
    /** Outward offset in sphere radii, varied per shard. Always positive. */
    explode: number
    /** Signed radial offset in sphere radii: shards ride out *and* sink in, so
     *  the shell looks broken and re-seated rather than inflated. Needs a
     *  `thickness` comfortably larger than this or neighbours stop overlapping
     *  and you see straight through the shell. */
    radialSpread?: number
    /** Per-shard tumble amplitude in radians (0 disables the motion). */
    drift: number
    noise: NoiseConfig | null
    /** Ragged cell borders. Safe with inset 1 — see jitterOnSurface. */
    jagged?: JaggedConfig | null
    /** Collapse each cap onto one plane so a plate carries a single normal and
     *  reads as a flat broken piece instead of a fanned cone. */
    flatten?: boolean
    /** Radius of an opaque inner sphere. Lets plates stay thin while still
     *  hiding the shell's interior: without it, a thickness big enough to plug
     *  the steps between plates costs enormous overdraw (deep prisms stacked
     *  many layers per pixel). Must sit below the lowest plate underside,
     *  (1 - radialSpread) - thickness, or it pokes through a sunken plate. */
    core?: number | null
    /** Per-variant lighting override; falls back to DEFAULT_LIGHT. */
    light?: LightConfig
    /** When set, the sphere renders as a particle orb and every plate knob
     *  above is inert (cells still picks the label-anchor pattern). */
    particles?: ParticleConfig | null
    /** Draw the six pinned concern labels. Default true; a variant meant to be
     *  read as a standalone piece rather than a diagram turns them off. */
    labels?: boolean
    /** CSS colour the lab seats this variant on. Default is the ink band. */
    backdrop?: string
    /** Triangle subdivisions before displacement. Only meaningful with noise,
     *  and only allowed when thickness is 0 (subdividing the cap would leave
     *  the extruded side walls without matching vertices). */
    subdiv: number
    edges: boolean
}

/** Where the bright knot of `stellar-core` sits. Deliberately almost square to
 *  the component's rotation axis (~[0.33, 0.90, 0.21]): the further off-axis it
 *  is, the wider the arc it sweeps and the stronger the parallax. */
const STELLAR_CORE: Vec3 = [0.3, 0.06, 0.22]
/** The body clusters on the same line but nearer the middle, so the density
 *  gradient runs continuously from the core out rather than sitting in a lump. */
const HALF_STELLAR_CORE: Vec3 = [0.15, 0.03, 0.11]

export const SPHERE_VARIANTS: SphereVariant[] = [
    {
        id: 'more-shards',
        name: 'More shards',
        blurb: 'Same treatment, five times the fracture density (80 cells).',
        cells: 80, inset: 1, thickness: 0, explode: 0, drift: 0, noise: null, subdiv: 0, edges: true,
    },
    {
        id: 'separation',
        name: 'Real separation',
        blurb: 'Shards inset and extruded into slabs — visible gaps and real thickness.',
        cells: 32, inset: 0.86, thickness: 0.12, explode: 0, drift: 0, noise: null, subdiv: 0, edges: true,
    },
    {
        id: 'exploded-drift',
        name: 'Exploded drift',
        blurb: 'Shards pushed outward and slowly tumbling — actively coming apart.',
        cells: 32, inset: 0.9, thickness: 0.08, explode: 0.18, drift: 0.13, noise: null, subdiv: 0, edges: true,
    },
    {
        id: 'surface-noise',
        name: 'Surface noise',
        blurb: 'Subdivided and displaced by fractal noise — a cracked rock, not a ball.',
        cells: 16, inset: 1, thickness: 0, explode: 0, drift: 0,
        noise: { amp: 0.10, freq: 3.4, octaves: 4 }, subdiv: 3, edges: true,
    },
    {
        id: 'combination',
        name: 'Combination',
        blurb: 'Denser fracture, real slabs, a touch of drift and a rough skin.',
        cells: 48, inset: 0.9, thickness: 0.07, explode: 0.05, drift: 0.05,
        noise: { amp: 0.04, freq: 3.0, octaves: 3 }, subdiv: 0, edges: true,
    },
    {
        id: 'constellation-orb',
        name: 'Constellation orb',
        blurb: 'The sphere as a silver particle field — a constellation web over a slow-turning core of dust.',
        // Plate knobs are inert here; `cells` only picks the label-anchor pattern.
        cells: 32, inset: 1, thickness: 0, explode: 0, drift: 0, noise: null, subdiv: 0, edges: false,
        particles: {
            layers: [
                // Dust shell — the orb's body: fine grains in a slightly thick band.
                { count: 1800, rMin: 0.94, rMax: 1.03, size: 0.012, opacity: 0.6, spin: 0, shade: 0.6 },
                // Stars — sparse bright points that carry the constellation web.
                { count: 140, rMin: 1.0, rMax: 1.02, size: 0.03, opacity: 0.95, spin: 0, shade: 0.35 },
                // Infinity core — a counter-rotating inner cloud.
                { count: 260, rMin: 0, rMax: 0.55, size: 0.016, opacity: 0.5, spin: -0.5, shade: 0.65 },
                // Halo — a faint, slow outer drift for depth.
                { count: 110, rMin: 1.12, rMax: 1.5, size: 0.016, opacity: 0.24, spin: 0.25, shade: 0.5 },
            ],
            linkLayer: 1,
            // Short reach and a low per-star cap keep the web reading as
            // constellations rather than a wireframe globe.
            linkDistance: 0.42,
            maxLinks: 2,
            linkOpacity: 0.26,
        },
    },
    {
        id: 'fractured-shell',
        name: 'Fractured shell',
        blurb: 'Torn-edged plates seated at different depths — no gaps, no strokes, read purely by light.',
        cells: 32,
        inset: 1,           // plates touch; the breaks come from depth, not gaps
        // Plates deep enough that the walls between neighbours read as real
        // steps, over an opaque core that hides the interior the rest of the
        // way. Sizing thickness to span the full step instead (~0.4) would work
        // but stacks many shaded layers per pixel, and fill rate is the scarce
        // resource on mobile GPUs. Core must clear the lowest plate underside,
        // (1 - radialSpread) - thickness = 0.54, or it pokes through.
        thickness: 0.26,
        core: 0.5,
        explode: 0,
        radialSpread: 0.2,  // signed: some plates ride out, others sink in
        drift: 0,
        noise: null,
        jagged: { segments: 5, amp: 0.06, freq: 6 },
        flatten: true,
        subdiv: 0,
        edges: false,       // no stroke: the silhouette comes from lighting alone
        // Harder key from the upper left with the ambient pulled well down, so
        // the lit faces separate sharply from the shadowed ones. With no edge
        // strokes, this contrast is the only thing describing the form.
        light: { ambient: 0.46, key: 4.3, fill: 0.28, keyPos: [-4.5, 4.2, 2.6] },
    },
    {
        id: 'stellar-core',
        name: 'Stellar core',
        blurb: 'Monochrome dust on pure black — a luminous off-centre core drifting through a thinning outer shell.',
        cells: 32, inset: 1, thickness: 0, explode: 0, drift: 0, noise: null, subdiv: 0, edges: false,
        // A piece, not a diagram: no labels, no leader lines, no page colour.
        labels: false,
        backdrop: '#000000',
        particles: {
            loopMs: 8000,
            // Four loops per revolution: the spin stays slow (~11°/s) while
            // every modulation still closes on the 8s loop.
            loopsPerTurn: 4,
            depthFade: 0.66,
            glow: { center: STELLAR_CORE, size: 1.3, opacity: 0.34 },
            layers: [
                // The core: a tight, bright knot held off the rotation axis, so
                // turning the orb walks it from front to back and gives the
                // whole cloud its parallax.
                {
                    count: 300, rMin: 0, rMax: 0.5, falloff: 0.65, center: STELLAR_CORE,
                    size: 0.032, sizeJitter: 0.45, opacity: 1, spin: 0, shade: 0.28,
                    twinkle: { amp: 0.3, cycles: 3 },
                },
                // The body: most of the mass, still leaning toward the core, so
                // density falls off continuously rather than in a step.
                {
                    count: 1200, rMin: 0, rMax: 0.95, falloff: 0.45, center: HALF_STELLAR_CORE,
                    size: 0.023, sizeJitter: 0.5, opacity: 0.8, spin: 0, shade: 0.55,
                    twinkle: { amp: 0.45, cycles: 3 },
                },
                // The edge: a sparse band that lets the silhouette dissolve
                // instead of ending on a rim.
                {
                    count: 240, rMin: 0.85, rMax: 1.3, size: 0.021, sizeJitter: 0.4,
                    opacity: 0.5, spin: 0, shade: 0.6, twinkle: { amp: 0.55, cycles: 2 },
                },
                // Far motes, counter-turning at the same rate (spin -2 nets -1),
                // so the outermost dust reads as detached from the body.
                {
                    count: 130, rMin: 1.18, rMax: 1.45, size: 0.019, sizeJitter: 0.4,
                    opacity: 0.32, spin: -2, shade: 0.6, twinkle: { amp: 0.6, cycles: 1 },
                },
            ],
        },
    },
]

export const DEFAULT_VARIANT_ID = 'fractured-shell'

export function getVariant(id: string): SphereVariant {
    return SPHERE_VARIANTS.find((v) => v.id === id) ?? SPHERE_VARIANTS[SPHERE_VARIANTS.length - 1]
}

/* -------------------------------------------------------- geometry ---- */

export interface ShardGeometry {
    /** Triangle soup in absolute (sphere-space) coordinates. */
    positions: number[]
    /** Boundary loop as line-segment pairs, absolute coordinates. */
    edges: number[]
    /** Unit direction of this shard's seed — its anchor and displacement axis. */
    anchor: Vec3
    /** Signed radial displacement in sphere radii (explode + radialSpread). */
    radialOffset: number
    /** Phase offset so shards don't tumble in lockstep. */
    driftPhase: number
}

/** Radial scale at a given direction — 1 unless the variant adds noise. */
function radiusAt(dir: Vec3, variant: SphereVariant): number {
    if (!variant.noise) return 1
    return 1 + fbm(dir, variant.noise.freq, variant.noise.octaves) * variant.noise.amp
}

/** Split a triangle into 4 (midpoints projected back to the sphere), n times. */
function subdivide(tris: Vec3[][], n: number): Vec3[][] {
    let out = tris
    for (let pass = 0; pass < n; pass++) {
        const next: Vec3[][] = []
        for (const [a, b, c] of out) {
            const ab = unit(add(a, b))
            const bc = unit(add(b, c))
            const ca = unit(add(c, a))
            next.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca])
        }
        out = next
    }
    return out
}

function pushTri(target: number[], a: Vec3, b: Vec3, c: Vec3) {
    target.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2])
}

/** Build every shard for a variant, in absolute sphere-space coordinates. */
export function buildVariantShards(variant: SphereVariant, cells: SphereCell[]): ShardGeometry[] {
    return cells.map((cell) => {
        const centre = unit(cell.s as Vec3)

        // Inset pulls each boundary vertex toward the shard's own centre,
        // which is what opens the gaps between neighbouring shards.
        const corners: Vec3[] = cell.v.map((p) =>
            unit(add(centre, mul(sub(p as Vec3, centre), variant.inset)))
        )

        // Ragged borders: walk each straight edge in steps and let every point
        // wander tangentially. Corners are jittered too — they're shared by
        // three cells, and since the nudge is position-derived all three agree
        // on where the torn corner landed.
        const jag = variant.jagged
        let ring: Vec3[] = corners
        if (jag) {
            ring = []
            for (let i = 0; i < corners.length; i++) {
                const a = corners[i]
                const b = corners[(i + 1) % corners.length]
                for (let k = 0; k < jag.segments; k++) {
                    const t = k / jag.segments
                    ring.push(jitterOnSurface(unit(add(mul(a, 1 - t), mul(b, t))), jag.amp, jag.freq))
                }
            }
        }

        const positions: number[] = []
        const displace = (dir: Vec3, r: number): Vec3 => mul(dir, r * radiusAt(dir, variant))

        // Flat plates: collapse the cap onto a single plane perpendicular to
        // the cell's own axis. Fanning a *curved* cap from its centre gives
        // every triangle a slightly different normal, which flat-shades into a
        // radiating star — the plate reads as a cone rather than a broken piece
        // of shell. Flattening gives the whole plate one normal, so each plate
        // takes a single clean value from the key light and neighbours separate
        // by tone alone. Only the component along `centre` changes, so plates
        // keep their tangential footprint and still tile without gaps.
        const flat = variant.flatten === true
        const dotc = (p: Vec3) => p[0] * centre[0] + p[1] * centre[1] + p[2] * centre[2]
        const plane = flat ? ring.reduce((s, p) => s + dotc(p), 0) / ring.length : 0
        const onPlate = (p: Vec3): Vec3 => add(p, mul(centre, plane - dotc(p)))

        const outerRing: Vec3[] = flat ? ring.map(onPlate) : ring.map((p) => displace(p, 1))
        const outerApex: Vec3 = flat ? mul(centre, plane) : displace(centre, 1)

        // Thickness extrudes along the plate's own normal when flat (a true
        // prism) and radially otherwise.
        const sink = (p: Vec3): Vec3 => sub(p, mul(centre, variant.thickness))
        const innerRing: Vec3[] = flat
            ? outerRing.map(sink)
            : ring.map((p) => displace(p, 1 - variant.thickness))
        const innerApex: Vec3 = flat ? sink(outerApex) : displace(centre, 1 - variant.thickness)

        // ---- outer face -------------------------------------------------
        if (!flat && variant.subdiv > 0 && variant.thickness === 0) {
            const fan: Vec3[][] = ring.map((v, i) => [centre, v, ring[(i + 1) % ring.length]])
            for (const [a, b, c] of subdivide(fan, variant.subdiv)) {
                pushTri(positions, displace(a, 1), displace(b, 1), displace(c, 1))
            }
        } else {
            for (let i = 0; i < outerRing.length; i++) {
                pushTri(positions, outerApex, outerRing[i], outerRing[(i + 1) % outerRing.length])
            }
        }

        // ---- inner face + side walls (only when the shard has thickness) --
        if (variant.thickness > 0) {
            for (let i = 0; i < outerRing.length; i++) {
                const j = (i + 1) % outerRing.length
                // Inner face, wound the opposite way so it faces inward.
                pushTri(positions, innerApex, innerRing[j], innerRing[i])
                // Side wall as two triangles bridging outer rim to inner rim.
                pushTri(positions, outerRing[i], outerRing[j], innerRing[j])
                pushTri(positions, outerRing[i], innerRing[j], innerRing[i])
            }
        }

        // ---- fracture edge loop, lifted just clear of the surface --------
        // The loop is walked in the same number of steps the face was
        // subdivided into. A straight chord between two ring corners would sink
        // beneath a subdivided-and-displaced face (which bulges outward between
        // them) and the line would disappear — so the edge has to follow the
        // same surface the face does.
        const edges: number[] = []
        if (variant.edges) {
            const LIFT = variant.noise ? 1.008 : 1.004
            const steps = variant.subdiv > 0 ? 2 ** variant.subdiv : 1
            for (let i = 0; i < ring.length; i++) {
                const from = ring[i]
                const to = ring[(i + 1) % ring.length]
                for (let k = 0; k < steps; k++) {
                    const p0 = unit(add(mul(from, 1 - k / steps), mul(to, k / steps)))
                    const p1 = unit(add(mul(from, 1 - (k + 1) / steps), mul(to, (k + 1) / steps)))
                    const a = displace(p0, LIFT)
                    const b = displace(p1, LIFT)
                    edges.push(a[0], a[1], a[2], b[0], b[1], b[2])
                }
            }
        }

        return {
            positions,
            edges,
            anchor: centre,
            // Vary the throw per shard so an exploded sphere looks scattered
            // rather than uniformly inflated; radialSpread adds a signed term
            // so plates can also sink below the original surface.
            radialOffset:
                variant.explode * (0.55 + shardRandom(centre, 1) * 0.9) +
                (variant.radialSpread ?? 0) * (shardRandom(centre, 3) * 2 - 1),
            driftPhase: shardRandom(centre, 2) * Math.PI * 2,
        }
    })
}

/* -------------------------------------------------- particle orb ------ */

export interface ParticleLayerGeometry {
    /** Flat xyz triples, absolute sphere-space coordinates. */
    positions: number[]
    /** Per-point brightness in [1 - shade, 1], same order as positions. */
    shades: number[]
    /** Per-point diameter in world units. */
    sizes: number[]
    /** Per-point twinkle: whole cycles per loop (0 = steady) and a start phase
     *  in radians, so grains don't pulse in unison. */
    rates: number[]
    phases: number[]
}

export interface ParticleOrbGeometry {
    layers: ParticleLayerGeometry[]
    /** Constellation web as line-segment pairs, absolute coordinates. */
    links: number[]
}

/** Golden-angle spiral direction i of n — even coverage with no clustering at
 *  the poles, and deterministic, so the orb never reshuffles between mounts.
 *  `salt` de-phases the spiral so separate layers don't stack their points. */
function spiralDirection(i: number, n: number, salt: number): Vec3 {
    const golden = Math.PI * (3 - Math.sqrt(5))
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i + salt * 2.399
    return [Math.cos(theta) * ring, y, Math.sin(theta) * ring]
}

/** Build every layer of a particle orb, plus the constellation links.
 *  Pure math on deterministic sequences — same config, same orb. */
export function buildParticleOrb(config: ParticleConfig): ParticleOrbGeometry {
    const layers: ParticleLayerGeometry[] = config.layers.map((layer, layerIndex) => {
        const positions: number[] = []
        const shades: number[] = []
        const sizes: number[] = []
        const rates: number[] = []
        const phases: number[] = []
        const [cx, cy, cz] = layer.center ?? [0, 0, 0]
        // 1/3 is the exponent that fills a volume evenly; anything larger draws
        // radii shorter and so packs the layer in toward its centre.
        const falloff = layer.falloff ?? 1 / 3
        const sizeJitter = layer.sizeJitter ?? 0
        const cycles = layer.twinkle?.cycles ?? 0
        for (let i = 0; i < layer.count; i++) {
            const direction = spiralDirection(i, layer.count, layerIndex + 1)
            // Nudge the direction so the spiral's lattice regularity dissolves
            // into something that reads as scattered rather than woven.
            const jittered = unit([
                direction[0] + (hash3(i, layerIndex, 11) - 0.5) * 0.22,
                direction[1] + (hash3(i, layerIndex, 23) - 0.5) * 0.22,
                direction[2] + (hash3(i, layerIndex, 37) - 0.5) * 0.22,
            ])
            // Volume layers (rMin 0) distribute by the falloff exponent; bands
            // spread linearly through their thickness.
            const u = hash3(i, layerIndex, 53)
            const radius = layer.rMin === 0
                ? layer.rMax * Math.pow(u, falloff)
                : layer.rMin + (layer.rMax - layer.rMin) * u
            positions.push(
                cx + jittered[0] * radius,
                cy + jittered[1] * radius,
                cz + jittered[2] * radius
            )
            shades.push(1 - layer.shade * hash3(i, layerIndex, 71))
            sizes.push(layer.size * (1 + (hash3(i, layerIndex, 89) - 0.5) * 2 * sizeJitter))
            // Whole cycles only — a fractional rate would jump at the wrap.
            rates.push(cycles ? 1 + Math.floor(hash3(i, layerIndex, 97) * cycles) : 0)
            phases.push(hash3(i, layerIndex, 103) * Math.PI * 2)
        }
        return { positions, shades, sizes, rates, phases }
    })

    // Constellation web: join star pairs closer than linkDistance, capped per
    // point so dense patches stay a web instead of collapsing into a mesh.
    const links: number[] = []
    const linkLayer = config.linkLayer ?? -1
    if (linkLayer >= 0 && linkLayer < layers.length) {
        const stars = layers[linkLayer].positions
        const starCount = stars.length / 3
        const linkCounts = new Array<number>(starCount).fill(0)
        const linkDistance = config.linkDistance ?? 0
        const maxLinks = config.maxLinks ?? 0
        const maxDistanceSq = linkDistance * linkDistance
        for (let a = 0; a < starCount; a++) {
            for (let b = a + 1; b < starCount; b++) {
                if (linkCounts[a] >= maxLinks) break
                if (linkCounts[b] >= maxLinks) continue
                const dx = stars[a * 3] - stars[b * 3]
                const dy = stars[a * 3 + 1] - stars[b * 3 + 1]
                const dz = stars[a * 3 + 2] - stars[b * 3 + 2]
                if (dx * dx + dy * dy + dz * dz > maxDistanceSq) continue
                links.push(
                    stars[a * 3], stars[a * 3 + 1], stars[a * 3 + 2],
                    stars[b * 3], stars[b * 3 + 1], stars[b * 3 + 2]
                )
                linkCounts[a]++
                linkCounts[b]++
            }
        }
    }

    return { layers, links }
}
