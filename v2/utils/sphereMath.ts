// Minimal 3D math for the "problem sphere" visual — no dependency, just the
// handful of vector ops a rotate + weak-perspective-project pipeline needs.
export type Vec3 = [number, number, number]

export function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function norm(a: Vec3): Vec3 {
    const l = Math.hypot(a[0], a[1], a[2]) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
}

// Rodrigues' rotation formula: rotate `v` by `angle` radians around unit `axis`.
export function rotateAxisAngle(v: Vec3, axis: Vec3, angle: number): Vec3 {
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const d = dot(axis, v)
    const c = cross(axis, v)
    return [
        v[0] * cosA + c[0] * sinA + axis[0] * d * (1 - cosA),
        v[1] * cosA + c[1] * sinA + axis[1] * d * (1 - cosA),
        v[2] * cosA + c[2] * sinA + axis[2] * d * (1 - cosA),
    ]
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
}

export interface Projected {
    x: number
    y: number
    z: number
    scale: number
}

// Weak perspective projection: camera sits `camDist` sphere-radii out on +z,
// looking at the origin. Front vertices (z > 0) project slightly larger.
export function project(v: Vec3, cx: number, cy: number, radiusPx: number, camDist: number): Projected {
    const s = camDist / (camDist - v[2])
    return { x: cx + v[0] * radiusPx * s, y: cy - v[1] * radiusPx * s, z: v[2], scale: s }
}
