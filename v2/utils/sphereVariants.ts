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

type Vec3 = [number, number, number]

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
    /** Triangle subdivisions before displacement. Only meaningful with noise,
     *  and only allowed when thickness is 0 (subdividing the cap would leave
     *  the extruded side walls without matching vertices). */
    subdiv: number
    edges: boolean
}

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
