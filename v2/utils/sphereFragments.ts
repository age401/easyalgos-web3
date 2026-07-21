import type { Vec3 } from './sphereMath'

export interface SphereFragment {
    seed: Vec3
    vertices: Vec3[]
}

// Spherical Voronoi fracture pattern for the "problem sphere" visual: 16 cells
// baked from a 16-point Fibonacci-sphere seed set (golden-angle spiral -> even
// coverage) via a brute-force convex hull + circumcenter dual. Computed once
// offline — baking it in means the fragmentation costs nothing at runtime,
// only the per-frame rotate + project.
export const SPHERE_FRAGMENTS: SphereFragment[] = [
    { seed: [0, 1, 0], vertices: [[-0.4393, 0.8221, -0.3622], [-0.487, 0.8514, -0.1947], [0.1106, 0.8769, 0.4677], [0.6399, 0.7684, -0.0064], [0.5077, 0.8159, -0.2767]] },
    { seed: [-0.3679, 0.8667, 0.337], vertices: [[-0.7828, 0.4108, 0.4673], [-0.7313, 0.3881, 0.5609], [-0.0497, 0.6691, 0.7415], [0.1106, 0.8769, 0.4677], [-0.487, 0.8514, -0.1947]] },
    { seed: [0.0594, 0.7333, -0.6773], vertices: [[0.351, 0.2609, -0.8993], [0.1297, 0.2021, -0.9707], [-0.5168, 0.5948, -0.6157], [-0.4393, 0.8221, -0.3622], [0.5077, 0.8159, -0.2767]] },
    { seed: [0.4868, 0.6, 0.6349], vertices: [[0.3316, 0.1145, 0.9365], [0.583, 0.0377, 0.8116], [0.8449, 0.5243, 0.1061], [0.6399, 0.7684, -0.0064], [0.1106, 0.8769, 0.4677], [-0.0497, 0.6691, 0.7415]] },
    { seed: [-0.8709, 0.4667, -0.1541], vertices: [[-0.8798, -0.0377, -0.4738], [-0.9713, -0.1145, -0.2085], [-0.7828, 0.4108, 0.4673], [-0.487, 0.8514, -0.1947], [-0.4393, 0.8221, -0.3622], [-0.5168, 0.5948, -0.6157]] },
    { seed: [0.7955, 0.3333, -0.506], vertices: [[0.946, -0.2021, -0.2534], [0.8467, -0.2609, -0.4636], [0.351, 0.2609, -0.8993], [0.5077, 0.8159, -0.2767], [0.6399, 0.7684, -0.0064], [0.8449, 0.5243, 0.1061]] },
    { seed: [-0.2544, 0.2, 0.9462], vertices: [[-0.4623, -0.3881, 0.7973], [-0.3628, -0.4108, 0.8364], [0.3316, 0.1145, 0.9365], [-0.0497, 0.6691, 0.7415], [-0.7313, 0.3881, 0.5609]] },
    { seed: [-0.4599, 0.0667, -0.8855], vertices: [[-0.2138, -0.5243, -0.8242], [-0.8798, -0.0377, -0.4738], [-0.5168, 0.5948, -0.6157], [0.1297, 0.2021, -0.9707]] },
    { seed: [0.9372, -0.0667, 0.3423], vertices: [[0.677, -0.5948, 0.4334], [0.946, -0.2021, -0.2534], [0.8449, 0.5243, 0.1061], [0.583, 0.0377, 0.8116]] },
    { seed: [-0.9057, -0.2, 0.3738], vertices: [[-0.729, -0.6691, 0.1445], [-0.4623, -0.3881, 0.7973], [-0.7313, 0.3881, 0.5609], [-0.7828, 0.4108, 0.4673], [-0.9713, -0.1145, -0.2085]] },
    { seed: [0.3996, -0.3333, -0.8539], vertices: [[0.2091, -0.8159, -0.5391], [-0.0758, -0.7684, -0.6354], [-0.2138, -0.5243, -0.8242], [0.1297, 0.2021, -0.9707], [0.351, 0.2609, -0.8993], [0.8467, -0.2609, -0.4636]] },
    { seed: [0.2647, -0.4667, 0.8439], vertices: [[-0.3628, -0.4108, 0.8364], [0.2557, -0.8514, 0.4579], [0.4157, -0.8221, 0.3891], [0.677, -0.5948, 0.4334], [0.583, 0.0377, 0.8116], [0.3316, 0.1145, 0.9365]] },
    { seed: [-0.6922, -0.6, -0.4011], vertices: [[-0.2138, -0.5243, -0.8242], [-0.0758, -0.7684, -0.6354], [-0.478, -0.8769, -0.0496], [-0.729, -0.6691, 0.1445], [-0.9713, -0.1145, -0.2085], [-0.8798, -0.0377, -0.4738]] },
    { seed: [0.664, -0.7333, -0.146], vertices: [[0.4157, -0.8221, 0.3891], [0.2091, -0.8159, -0.5391], [0.8467, -0.2609, -0.4636], [0.946, -0.2021, -0.2534], [0.677, -0.5948, 0.4334]] },
    { seed: [-0.2869, -0.8667, 0.4081], vertices: [[-0.478, -0.8769, -0.0496], [0.2557, -0.8514, 0.4579], [-0.3628, -0.4108, 0.8364], [-0.4623, -0.3881, 0.7973], [-0.729, -0.6691, 0.1445]] },
    { seed: [0, -1, 0], vertices: [[-0.478, -0.8769, -0.0496], [-0.0758, -0.7684, -0.6354], [0.2091, -0.8159, -0.5391], [0.4157, -0.8221, 0.3891], [0.2557, -0.8514, 0.4579]] },
]

export interface SphereLabel {
    fragmentIndex: number
    role: string
    question: string
    /** Vertical tick length in px, from the sphere surface up to the elbow. */
    tickLength: number
    /** Horizontal run in px from the elbow to the label's left edge — varied
     *  per label so two labels never land in the same screen spot even when
     *  their fragments briefly share an on-screen x during rotation. */
    xOffset: number
}

// Which fragments carry a label, and the trust concern voiced from that seat
// in the ecosystem. Deliberately denser than 3 (Trader repeats with a
// different concern each time) to match the reference composition.
export const SPHERE_LABELS: SphereLabel[] = [
    { fragmentIndex: 0, role: 'Trader', question: 'Can I trust this signal seller?', tickLength: 92, xOffset: 14 },
    { fragmentIndex: 3, role: 'Trader', question: 'Is this backtest even real?', tickLength: 60, xOffset: 74 },
    { fragmentIndex: 8, role: 'Trader', question: 'Why was the demo account reset?', tickLength: 104, xOffset: 38 },
    { fragmentIndex: 6, role: 'Broker', question: 'Will this EA blow up my spread?', tickLength: 72, xOffset: 100 },
    { fragmentIndex: 11, role: 'Developer', question: 'Who’s reselling my strategy now?', tickLength: 54, xOffset: 20 },
    { fragmentIndex: 9, role: 'VPS Server', question: 'Is this server even secure?', tickLength: 86, xOffset: 56 },
]
