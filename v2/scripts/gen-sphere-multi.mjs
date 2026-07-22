// Authoring-time generator for utils/sphereFragments.ts.
//
//   npm run gen:sphere
//
// Produces spherical Voronoi fracture patterns at several cell counts:
// Fibonacci (golden-angle) seeds for even coverage -> brute-force convex hull
// -> circumcenter dual -> ordered cell polygons. The hull is O(n^3) triples but
// runs in well under a second at these sizes, and baking the result means the
// app pays nothing at runtime for the fragmentation.
//
// Re-run this only to change the cell counts or the seed distribution; the
// output is committed and the app never computes it.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SIZES = [16, 32, 48, 80]
const OUT = fileURLToPath(new URL('../utils/sphereFragments.ts', import.meta.url))

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const len = (a) => Math.sqrt(dot(a, a))
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s]

function fibonacciSphere(n) {
    const pts = []
    const phi = Math.PI * (3 - Math.sqrt(5)) // golden angle
    for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2
        const radius = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = phi * i
        pts.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius])
    }
    return pts
}

function buildCells(N) {
    const seeds = fibonacciSphere(N)
    const EPS = 1e-9
    const faces = []

    // A triple is a hull face when every other point lies on one side of it.
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            for (let k = j + 1; k < N; k++) {
                const a = seeds[i], b = seeds[j], c = seeds[k]
                let n = cross(sub(b, a), sub(c, a))
                if (len(n) < EPS) continue
                let pos = 0, neg = 0
                for (let p = 0; p < N; p++) {
                    if (p === i || p === j || p === k) continue
                    const d = dot(n, sub(seeds[p], a))
                    if (d > EPS) pos++
                    else if (d < -EPS) neg++
                    if (pos && neg) break
                }
                if (pos && neg) continue
                const centroid = scale(add(add(a, b), c), 1 / 3)
                if (dot(n, centroid) < 0) n = scale(n, -1) // orient outward
                faces.push({ verts: [i, j, k], normal: norm(n) })
            }
        }
    }

    // The dual vertex of a hull face is that face's outward normal: the point
    // on the sphere equidistant (in dot-product terms) from its three seeds.
    const dualVerts = faces.map((f) => f.normal)

    const tangentBasis = (s) => {
        const ref = Math.abs(s[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
        const u = norm(cross(ref, s))
        return [u, cross(s, u)]
    }

    return seeds.map((s, si) => {
        const pts = []
        faces.forEach((f, fi) => { if (f.verts.includes(si)) pts.push(dualVerts[fi]) })
        // Order the cell's corners counter-clockwise as seen from outside.
        const [u, v] = tangentBasis(s)
        pts.sort((p1, p2) => Math.atan2(dot(p1, v), dot(p1, u)) - Math.atan2(dot(p2, v), dot(p2, u)))
        return { seed: s, vertices: pts }
    })
}

const r = (n) => Math.round(n * 10000) / 10000
const fmtVec = (v) => `[${v.map(r).join(',')}]`
const fmtCell = (c) => `{s:${fmtVec(c.seed)},v:[${c.vertices.map(fmtVec).join(',')}]}`

let body = `// GENERATED FILE — produced by scripts/gen-sphere-multi.mjs. Do not hand-edit.
//
// Spherical Voronoi fracture patterns at several cell counts. Seeds come from a
// Fibonacci (golden-angle) spiral for even coverage; cells are the dual of the
// seeds' convex hull. Baked at authoring time so the fragmentation costs
// nothing at runtime — only the per-frame rotate + project.
//
// Compact keys (s = seed, v = vertices) keep the payload small; SphereCell
// below is the shape consumers use.

/** A single fracture cell: its seed point and its ordered boundary vertices,
 *  all unit vectors on the sphere. */
export interface SphereCell {
    /** Cell centre on the unit sphere — the label anchor and fan apex. */
    s: [number, number, number]
    /** Boundary vertices, ordered counter-clockwise seen from outside. */
    v: [number, number, number][]
}

`

const stats = []
for (const N of SIZES) {
    const cells = buildCells(N)
    const avg = (cells.reduce((s, c) => s + c.vertices.length, 0) / cells.length).toFixed(2)
    stats.push(`${N} cells (avg ${avg} verts/cell)`)
    body += `export const SPHERE_CELLS_${N}: SphereCell[] = [\n`
    body += cells.map((c) => '    ' + fmtCell(c)).join(',\n')
    body += `,\n]\n\n`
}

body += `/** Every baked pattern, keyed by cell count. */
export const SPHERE_CELL_SETS: Record<number, SphereCell[]> = {
${SIZES.map((n) => `    ${n}: SPHERE_CELLS_${n},`).join('\n')}
}

/** Cell counts available to variants. */
export const SPHERE_CELL_COUNTS = [${SIZES.join(', ')}] as const
`

writeFileSync(OUT, body, 'utf8')
console.log('wrote', OUT)
console.log(stats.join('\n'))
