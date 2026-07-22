import type { SphereCell } from './sphereFragments'

export interface SphereLabel {
    role: string
    question: string
    /** Roughly where on the sphere this concern should sit. Resolved to the
     *  nearest actual cell at build time, so the same label set works for any
     *  fracture density (16 cells or 80). */
    direction: [number, number, number]
    /** Vertical tick length in px, from the shard surface up to the elbow. */
    tickLength: number
    /** Horizontal run in px from the elbow to the label's left edge — varied
     *  per label so two labels never land in the same screen spot even when
     *  their shards briefly share an on-screen x during rotation. */
    xOffset: number
}

// The trust concern voiced from each seat in the ecosystem. Deliberately
// denser than three roles (Trader recurs with a different worry each time) to
// match the reference composition. Directions are spread right around the
// sphere so labels cycle in and out as it turns, rather than all crowding one
// hemisphere.
export const SPHERE_LABELS: SphereLabel[] = [
    { role: 'Trader', question: 'Can I trust this signal seller?', direction: [0.10, 0.85, 0.50], tickLength: 92, xOffset: 14 },
    { role: 'Trader', question: 'Is this backtest even real?', direction: [0.85, 0.20, -0.45], tickLength: 60, xOffset: 74 },
    { role: 'Trader', question: 'Why was the demo account reset?', direction: [-0.80, 0.35, 0.45], tickLength: 104, xOffset: 38 },
    { role: 'Broker', question: 'Will this EA blow up my spread?', direction: [0.45, -0.35, 0.82], tickLength: 72, xOffset: 100 },
    { role: 'Developer', question: 'Who’s reselling my strategy now?', direction: [-0.40, -0.70, -0.55], tickLength: 54, xOffset: 20 },
    { role: 'VPS Server', question: 'Is this server even secure?', direction: [0.15, -0.90, 0.40], tickLength: 86, xOffset: 56 },
]

/** Map each label to a distinct cell — the one whose seed points closest to the
 *  label's target direction. Greedy with a taken-set so two labels can never
 *  land on the same shard when the fracture is coarse. */
export function resolveLabelCells(cells: SphereCell[]): number[] {
    const taken = new Set<number>()
    return SPHERE_LABELS.map((label) => {
        const [dx, dy, dz] = label.direction
        const inv = 1 / (Math.hypot(dx, dy, dz) || 1)
        let best = -1
        let bestDot = -Infinity
        for (let i = 0; i < cells.length; i++) {
            if (taken.has(i)) continue
            const s = cells[i].s
            const d = (s[0] * dx + s[1] * dy + s[2] * dz) * inv
            if (d > bestDot) {
                bestDot = d
                best = i
            }
        }
        if (best >= 0) taken.add(best)
        return best
    })
}
