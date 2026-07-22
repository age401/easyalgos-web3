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

/* --------------------------------------------------------- variants ---- */

export interface NoiseConfig {
    /** Radial displacement as a fraction of the sphere radius. */
    amp: number
    /** Spatial frequency — higher is bumpier. */
    freq: number
    octaves: number
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
    /** Outward offset in sphere radii, varied per shard. */
    explode: number
    /** Per-shard tumble amplitude in radians (0 disables the motion). */
    drift: number
    noise: NoiseConfig | null
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
]

export const DEFAULT_VARIANT_ID = 'combination'

export function getVariant(id: string): SphereVariant {
    return SPHERE_VARIANTS.find((v) => v.id === id) ?? SPHERE_VARIANTS[SPHERE_VARIANTS.length - 1]
}

/* -------------------------------------------------------- geometry ---- */

export interface ShardGeometry {
    /** Triangle soup in absolute (sphere-space) coordinates. */
    positions: number[]
    /** Boundary loop as line-segment pairs, absolute coordinates. */
    edges: number[]
    /** Unit direction of this shard's seed — its anchor and explode axis. */
    anchor: Vec3
    /** Per-shard explode distance in sphere radii (already scaled). */
    explode: number
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
        const ring: Vec3[] = cell.v.map((p) =>
            unit(add(centre, mul(sub(p as Vec3, centre), variant.inset)))
        )

        const positions: number[] = []
        const displace = (dir: Vec3, r: number): Vec3 => mul(dir, r * radiusAt(dir, variant))

        // ---- outer face -------------------------------------------------
        if (variant.subdiv > 0 && variant.thickness === 0) {
            const fan: Vec3[][] = ring.map((v, i) => [centre, v, ring[(i + 1) % ring.length]])
            for (const [a, b, c] of subdivide(fan, variant.subdiv)) {
                pushTri(positions, displace(a, 1), displace(b, 1), displace(c, 1))
            }
        } else {
            for (let i = 0; i < ring.length; i++) {
                pushTri(
                    positions,
                    displace(centre, 1),
                    displace(ring[i], 1),
                    displace(ring[(i + 1) % ring.length], 1)
                )
            }
        }

        // ---- inner face + side walls (only when the shard has thickness) --
        if (variant.thickness > 0) {
            const inner = 1 - variant.thickness
            for (let i = 0; i < ring.length; i++) {
                const j = (i + 1) % ring.length
                // Inner face, wound the opposite way so it faces inward.
                pushTri(positions, displace(centre, inner), displace(ring[j], inner), displace(ring[i], inner))
                // Side wall as two triangles bridging outer rim to inner rim.
                pushTri(positions, displace(ring[i], 1), displace(ring[j], 1), displace(ring[j], inner))
                pushTri(positions, displace(ring[i], 1), displace(ring[j], inner), displace(ring[i], inner))
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
            // rather than uniformly inflated.
            explode: variant.explode * (0.55 + shardRandom(centre, 1) * 0.9),
            driftPhase: shardRandom(centre, 2) * Math.PI * 2,
        }
    })
}
