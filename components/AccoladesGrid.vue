<script setup lang="ts">
// The mark beside the second accolades figure. Figma: 824:5946
// ("Accolades-Animation-02").
//
// ---------------------------------------------------------------- Geometry --
// A 5x5 grid of 12px rounded squares on an 18px pitch, with the four corners
// cut — 21 squares, which is what gives the block its chamfered silhouette.
// Corner radius is 12/7, straight off the drawn path.
//
// The grid spans 84 units inside the 128 frame, so unlike the pyramid mark it
// needs no scale wrapper: it is already drawn at the size it shows, and the two
// marks come out visually the same size beside their figures.
//
// Figma has the whole grid half a unit left of the frame centre (its columns
// sit at 27.5..99.5 against rows at 28..100). That is Illustrator drift, so the
// grid below is generated from the pitch about a true centre and the halves
// disappear.
//
// ---------------------------------------------------------------- Animation --
// Every square starts stacked on the centre. The ring around the middle shoots
// out to its slot first, then the outer ring — Chebyshev distance from the
// centre cell, so ring 0 is the single middle square, ring 1 the eight around
// it, ring 2 the remaining twelve.
//
// While a ring is still waiting its squares sit piled on the centre at
// --ea-grid-op0 each, and twenty-one of those stacked read as one solid square
// — which is the point: the block looks whole, then bursts apart.
//
// Travel and fade are two animations on the same element rather than one, so
// the opacity can finish well before the movement does (roughly 0.42s against
// 1s). A square is therefore at full strength while it is still travelling,
// which reads as it arriving rather than materialising.
const PITCH = 18
const SIZE = 12
const RADIUS = 12 / 7
const C = 64

/** The drawn grid, with each square's offset back to the centre it starts on. */
const SQUARES = (() => {
    const out: { x: number; y: number; dx: number; dy: number; ring: number }[] = []
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const ox = col - 2
            const oy = row - 2
            if (Math.abs(ox) === 2 && Math.abs(oy) === 2) continue // cut corners
            const cx = C + PITCH * ox
            const cy = C + PITCH * oy
            out.push({
                x: cx - SIZE / 2,
                y: cy - SIZE / 2,
                dx: C - cx,
                dy: C - cy,
                ring: Math.max(Math.abs(ox), Math.abs(oy))
            })
        }
    }
    return out
})()

const root = ref<HTMLElement | null>(null)
const { visible } = useRevealOnce(root, { threshold: 0.35 })
</script>

<template>
    <div ref="root" :class="['ea-accolade-grid', { 'is-playing': visible }]">
        <!-- Decorative: the figure beside it carries the meaning. -->
        <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" focusable="false">
            <rect
                v-for="(s, i) in SQUARES"
                :key="i"
                class="ea-accolade-grid__cell"
                :x="s.x"
                :y="s.y"
                :width="SIZE"
                :height="SIZE"
                :rx="RADIUS"
                :style="{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--ring': s.ring }"
            />
        </svg>
    </div>
</template>
