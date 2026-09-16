import type { GlobeField } from '~/data/solutionGlobe'

// Which cells of the solution globe's field are thrown by the wave: every other
// one down each column of the lattice.
//
// This is geometry rather than motion, which is why it is here and not in
// SolutionGlobe.vue. Two reasons, and the second is the one that matters:
//
//   1. The component's job is the clock-to-pixels step. Where the columns ARE is a
//      fact about the drawn field, on the same footing as the dots' positions.
//   2. Everything at the top level of a `<script setup>` block runs per INSTANCE,
//      and on Nuxt that includes every server render. The search below is ~4ms —
//      fine once per process, wasteful once per request for a result that can
//      never differ, since the field it reads is a frozen export. Hence the cache.
//
// It is derived at runtime rather than baked into data/solutionGlobe.ts because
// that file is generated from an SVG export which is not committed (see
// scripts/extract-globe-dots.py), so a column of parity bits written into it could
// not be regenerated after a design change. This can, from the geometry itself.

/** Hash cell for the neighbour search, comfortably over the field's 4.4px row
 *  pitch (measured median), and the window a link may reach: down by less than a
 *  row and a half, sideways by about half a step — which is the column's lean, not
 *  slack. DROP_MAX under CELL is what lets the search look at two rows of cells. */
const CELL = 8
const DROP_MIN = 0.8
const DROP_MAX = 6.5
const LEAN = 2

let cached: Uint8Array | null = null

/**
 * 1 for a cell the wave throws, 0 for one it leaves at rest, alternating down each
 * column of the lattice. Cached: the field is immutable, so every instance and
 * every render shares one answer.
 *
 * Finding the columns is the whole of the work, because the lattice is a
 * perspective projection and not a grid: a column leans about a pixel of x per
 * row, and neither axis lands on a pitch — the positions come out uniform against
 * every plausible one, which is the projection's curvature showing. So each cell
 * is linked to the nearest cell BELOW it, within a couple of pixels of its own x,
 * and the chains that fall out ARE the columns.
 *
 * Alternating down the column rather than by index is the point. The field comes
 * out of the SVG in close to row order — nine consecutive cells in ten are one
 * step along a row — so every other index would be every other cell ALONG a row,
 * which at this pitch is not a pattern, it is a field of gaps.
 *
 * About 1,900 of the 3,447 cells come back as thrown: a little over half, because
 * a cell with no column to belong to counts as a head and heads are thrown.
 */
export function columnParity(field: GlobeField): Uint8Array {
    if (cached) return cached

    const moves = new Uint8Array(field.count)

    const key = (gx: number, gy: number) => gx * 128 + gy
    const bins = new Map<number, number[]>()
    for (let i = 0; i < field.count; i++) {
        const k = key(Math.floor(field.x[i] / CELL), Math.floor(field.y[i] / CELL))
        const bin = bins.get(k)
        if (bin) bin.push(i)
        else bins.set(k, [i])
    }

    // The cell directly below each one, or -1 where the column ends. Only the row
    // of hash cells at or under this one is searched — DROP_MAX is under CELL, so
    // nothing further down can be in range.
    const below = new Int32Array(field.count).fill(-1)
    for (let i = 0; i < field.count; i++) {
        const x = field.x[i]
        const y = field.y[i]
        const gx = Math.floor(x / CELL)
        const gy = Math.floor(y / CELL)
        let best = -1
        let bestD = Infinity
        for (let a = gx - 1; a <= gx + 1; a++) {
            for (let b = gy; b <= gy + 1; b++) {
                const bin = bins.get(key(a, b))
                if (!bin) continue
                for (const j of bin) {
                    const dx = field.x[j] - x
                    const dy = field.y[j] - y
                    if (dy < DROP_MIN || dy > DROP_MAX || dx > LEAN || dx < -LEAN) continue
                    const d = dx * dx + dy * dy
                    if (d < bestD) {
                        bestD = d
                        best = j
                    }
                }
            }
        }
        below[i] = best
    }

    const linked = new Uint8Array(field.count)
    for (let i = 0; i < field.count; i++) if (below[i] >= 0) linked[below[i]] = 1

    // Heads first — a cell with nothing above it starts its column, and starts it
    // THROWN, so a lone cell somewhere in the Pacific is one that moves rather than
    // one that never does. Two columns can run into the same cell where the map
    // pinches, so `seen` decides it once; the second pass then picks up anything
    // left over by that, which is the only way a cell can go unwalked.
    const seen = new Uint8Array(field.count)
    const walk = (head: number) => {
        let at = head
        let on: 0 | 1 = 1
        while (at >= 0 && !seen[at]) {
            seen[at] = 1
            moves[at] = on
            on = on ? 0 : 1
            at = below[at]
        }
    }
    for (let i = 0; i < field.count; i++) if (!linked[i]) walk(i)
    for (let i = 0; i < field.count; i++) if (!seen[i]) walk(i)

    cached = moves
    return moves
}
