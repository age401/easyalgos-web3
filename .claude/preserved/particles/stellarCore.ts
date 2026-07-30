// "Stellar core" — a monochrome particle cluster that turns, brakes and implodes.
//
// Everything here is pure math: no three.js import, so this module stays
// dependency-free and auto-importable. It emits plain number arrays that
// StellarCore.vue turns into BufferGeometry, which keeps the WebGL layer thin
// and makes the geometry testable in isolation.

export type Vec3 = [number, number, number]

const unit = (a: Vec3): Vec3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
}

/** Deterministic hash. Deliberately NOT Math.random(): the cloud is rebuilt on
 *  every mount, and one that reshuffled each time would flicker between page
 *  loads. Same input always yields the same cluster. */
function hash3(i: number, j: number, k: number): number {
    let h = (i | 0) * 374761393 + (j | 0) * 668265263 + (k | 0) * 1274126177
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

/* ------------------------------------------------------------- config ---- */

/** The invisible object the inner strata chase. It runs around its orbit plane
 *  at a rate that swells and ebbs rather than holding constant; that surge —
 *  not the target itself, which is never drawn — is what the followers respond
 *  to, and it is the whole reason the inner clouds don't read as gears. */
export interface OrbitConfig {
    /** Normal of the orbit plane. Followers turn about this axis instead of the
     *  cluster's own, so a surge cuts *across* the global rotation rather than
     *  just speeding it up and slowing it down. */
    axis: Vec3
    /** Peak angular lead over a constant rate, in radians. */
    surge: number
    /** Sprints per loop. */
    cycles: number
    /** Second-harmonic content, as a fraction of `surge`. A pure sine swells and
     *  ebbs symmetrically; the harmonic skews it into a quicker dart and a
     *  longer glide — the hummingbird shape, without the abrupt stop. */
    skew: number
}

/** How one stratum responds to the orbiting target. */
export interface FollowConfig {
    /** Share of the target's surge this stratum takes on. */
    gain: number
    /** Response lag, in loops, as a first-order lag. It delays the surge and
     *  softens it — and it cuts the harmonic much harder than the fundamental,
     *  so two strata differing only here end up on visibly different velocity
     *  curves rather than the same curve at two amplitudes. */
    lag: number
}

/** The one-shot timeline: the cluster turns, brakes to a dead stop, holds, then
 *  rushes into its own centre and vanishes. */
export interface SequenceConfig {
    /** Full-speed playback before anything starts slowing. */
    playMs: number
    /** Deceleration to a standstill. Every rate in the piece rides the same
     *  clock, so they all arrive at rest together. */
    brakeMs: number
    /** Dead still, so the stop registers before the collapse answers it. */
    holdMs: number
    /** The rush to the centre. */
    collapseMs: number
}

/** Strays seeded past a stratum's container sphere, so its boundary reads as a
 *  tendency rather than a wall. */
export interface OutlierConfig {
    count: number
    /** Furthest stray, as a multiple of `rMax`. */
    reach: number
}

/** One population of grains — a band of points between two radii. */
export interface ParticleLayer {
    count: number
    /** Radial band, in cluster radii. rMin 0 fills a volume; rMin ~ rMax is a
     *  shell. This is the stratum's invisible container sphere. */
    rMin: number
    rMax: number
    /** Point diameter in world units (the cluster has radius 1). */
    size: number
    opacity: number
    /** Rotation relative to the cluster's own spin — negative counter-rotates.
     *  Strata turning at different rates give the depth parallax that makes the
     *  cloud read as a volume instead of a textured ball. */
    spin: number
    /** Per-point brightness variance, 0 (uniform) to 1 (full range). */
    shade: number
    /** Radial density exponent for volume layers (`rMin: 0`). `1/3` spreads
     *  points evenly through the volume; higher values pack them toward the
     *  centre and thin out the edge. Ignored for bands. */
    falloff?: number
    /** Per-point size variance, 0 (uniform) to 1 (full range). */
    sizeJitter?: number
    /** How strongly grain size tracks distance across the stratum's own band:
     *  `0.6` makes rim grains 1.6x and inner grains 0.4x. Negative inverts it.
     *  Independent of `count`, so a stratum can be dense-but-fine in the middle
     *  and sparse-but-coarse at its boundary. */
    edgeSize?: number
    /** The same gradient applied to brightness. Positive lights the boundary;
     *  negative lets an outer stratum dissolve instead of ending on a rim. */
    edgeBright?: number
    outliers?: OutlierConfig | null
    /** Rotation axis for this stratum's own spin. Defaults to the orbit axis
     *  when it follows, and to the cluster's spin axis otherwise. */
    axis?: Vec3
    /** Chase the orbiting target on top of the steady `spin`. */
    follow?: FollowConfig | null
}

export interface ParticleConfig {
    layers: ParticleLayer[]
    /** Grain colour. White, so the brightness scale resolves to neutral greys. */
    color: number
    /** Quantise every grain's brightness onto this many discrete steps, turning
     *  a continuous ramp into a monochrome scale. Applied *after* the depth
     *  term, so depth arrives as a few bands rather than a smooth falloff —
     *  which is what lets a flat-filled grain still carry volume. */
    levels: number
    /** How far the back of the cloud dims, 0 (flat) to 1 (black). Additive
     *  points have no occlusion of their own, so this is what supplies depth. */
    depthFade: number
    /** Period of the surge, in ms. */
    loopMs: number
    /** Loops per full revolution — what lets the spin stay slow while the surge
     *  period stays short. */
    loopsPerTurn: number
    sequence: SequenceConfig
    orbit: OrbitConfig
}

/** Normal of the plane the invisible target orbits on, well off the cluster's
 *  own spin axis so a surge cuts across the rotation rather than along it. */
const ORBIT_AXIS: Vec3 = [0.62, -0.28, 0.73]
/** The outer field ignores the target and drifts about its own axis instead —
 *  a different direction from everything else, which is what separates it. */
const DRIFT_AXIS: Vec3 = [0.86, -0.22, 0.46]

export const STELLAR_CORE: ParticleConfig = {
    // The whole piece is over in ~6.8s, so the surge period is sized to fit two
    // sprints inside the 5s of playback.
    loopMs: 5000,
    loopsPerTurn: 4, // 20s per revolution: ~90 degrees before it stops
    sequence: { playMs: 5000, brakeMs: 850, holdMs: 320, collapseMs: 620 },
    // Flat discs on a five-step scale: every grain is one of five greys, so
    // there is no gradient anywhere in the piece.
    levels: 5,
    color: 0xffffff,
    depthFade: 0.66,
    orbit: {
        axis: ORBIT_AXIS,
        // Sized against the steady rate so the fastest stratum never reverses:
        // it coasts down to ~0.12 rad/s and then runs at ~0.91, a 7.7x swing.
        // Past ~0.16 it starts running backwards between sprints, which reads
        // as a wobble rather than a chase.
        surge: 0.13,
        cycles: 2,
        skew: 0.4,
    },
    layers: [
        // 1. The core. A small container sphere with grains growing and
        //    brightening toward its boundary, so the knot reads as a lit shell
        //    of dust rather than a solid dot and the boundary is legible without
        //    ever drawing it. Reacts to the target hardest and soonest. Every
        //    stratum shares one centre, which is what pins the cloud to the
        //    middle of the stage while it turns.
        {
            count: 320, rMin: 0, rMax: 0.44, falloff: 0.42,
            size: 0.024, sizeJitter: 0.4, edgeSize: 0.62, edgeBright: 0.42,
            opacity: 0.62, spin: 0.25, shade: 0.3,
            outliers: { count: 7, reach: 1.9 },
            follow: { gain: 1, lag: 0.03 },
        },
        // 2. The second band: most of the mass, a gap clear of the core so the
        //    two densities read as separate populations. Wide size and
        //    brightness variance, and it takes the same surge at a fraction of
        //    the gain and four times the lag — visibly trailing the core rather
        //    than mirroring it.
        {
            count: 700, rMin: 0.46, rMax: 0.9,
            size: 0.017, sizeJitter: 0.62, edgeSize: 0.22, edgeBright: -0.18,
            opacity: 0.5, spin: 0.12, shade: 0.62,
            outliers: { count: 10, reach: 1.45 },
            follow: { gain: 0.62, lag: 0.13 },
        },
        // 3. The outer field: sparser, finer and dimmer toward its own boundary
        //    so the silhouette dissolves. Deaf to the target — one slow steady
        //    drift about its own axis, which is what makes the inner two look
        //    like they're reacting to something.
        {
            count: 520, rMin: 0.95, rMax: 1.32,
            size: 0.014, sizeJitter: 0.45, edgeSize: -0.3, edgeBright: -0.34,
            opacity: 0.34, spin: -0.6, shade: 0.62,
            outliers: { count: 14, reach: 1.55 },
            axis: DRIFT_AXIS,
        },
    ],
}

/* ----------------------------------------------------------- geometry ---- */

export interface ParticleLayerGeometry {
    /** Flat xyz triples, absolute cluster-space coordinates. */
    positions: number[]
    /** Per-point brightness, same order as positions. */
    shades: number[]
    /** Per-point diameter in world units. */
    sizes: number[]
}

/** Golden-angle spiral direction i of n — even coverage with no clustering at
 *  the poles, and deterministic, so the cluster never reshuffles between mounts.
 *  `salt` de-phases the spiral so separate strata don't stack their points. */
function spiralDirection(i: number, n: number, salt: number): Vec3 {
    const golden = Math.PI * (3 - Math.sqrt(5))
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0
    const ring = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i + salt * 2.399
    return [Math.cos(theta) * ring, y, Math.sin(theta) * ring]
}

/** Build every stratum of the cluster. Pure math on deterministic sequences —
 *  same config, same cloud. */
export function buildParticleOrb(config: ParticleConfig): ParticleLayerGeometry[] {
    return config.layers.map((layer, layerIndex) => {
        const positions: number[] = []
        const shades: number[] = []
        const sizes: number[] = []
        // 1/3 is the exponent that fills a volume evenly; anything larger draws
        // radii shorter and so packs the stratum in toward its centre.
        const falloff = layer.falloff ?? 1 / 3
        const sizeJitter = layer.sizeJitter ?? 0
        const edgeSize = layer.edgeSize ?? 0
        const edgeBright = layer.edgeBright ?? 0
        const span = layer.rMax - layer.rMin

        // Which points escape the container sphere. Spread across the spiral
        // index rather than taken off the end of it: spiralDirection walks y
        // monotonically from pole to pole, so a contiguous tail would drop every
        // stray in the same hemisphere.
        const strays = new Set<number>()
        if (layer.outliers && layer.outliers.count > 0) {
            for (let k = 0; k < layer.outliers.count; k++) {
                strays.add(Math.min(layer.count - 1, Math.round(((k + 0.5) * layer.count) / layer.outliers.count)))
            }
        }

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
            let radius = layer.rMin === 0
                ? layer.rMax * Math.pow(u, falloff)
                : layer.rMin + span * u
            // Position across the stratum's own band, read before any stray push
            // so a stray keeps the look of the boundary it escaped from rather
            // than extrapolating the gradient off the end of it.
            const t = span > 0 ? Math.min(1, Math.max(0, (radius - layer.rMin) / span)) : 1
            if (strays.has(i)) {
                radius = layer.rMax * (1 + (layer.outliers!.reach - 1) * hash3(i, layerIndex, 131))
            }
            positions.push(
                jittered[0] * radius,
                jittered[1] * radius,
                jittered[2] * radius
            )
            // The gradients run 1-edge at the middle to 1+edge at the boundary,
            // so a stratum can be fine and dim where it is dense and coarse and
            // bright where it thins out — or the reverse.
            shades.push((1 - layer.shade * hash3(i, layerIndex, 71)) * (1 - edgeBright + 2 * edgeBright * t))
            sizes.push(
                layer.size *
                    (1 - edgeSize + 2 * edgeSize * t) *
                    (1 + (hash3(i, layerIndex, 89) - 0.5) * 2 * sizeJitter)
            )
        }
        return { positions, shades, sizes }
    })
}
