<script setup lang="ts">
// The six-pyramid cluster beside each accolades figure, with its spin-up
// entrance. Figma: art 812:5892 ("Accolades-Animation-01"), placed at 812:5814.
//
// ---------------------------------------------------------------- Geometry --
// The six pyramids are all the SAME shape. Each one is a curved triangle whose
// three vertices sit exactly 19.63 from the little circle the designer drew
// inside it — those guides are the PERCEIVED centre of the shape, which on a
// form this asymmetric is nowhere near the bounding-box centre (they differ by
// ~4 units), and using the bbox would make the ring visibly wobble.
//
// Those six perceived centres in turn sit on a 44.5-radius ring around the
// frame centre, 60 degrees apart, and each copy is additionally turned about
// its own centre by (ring index x 60) degrees.
//
// Because the shape has 120-degree symmetry, turning the whole arrangement by
// 60 degrees maps it back onto itself. So the entire cluster is ONE path
// stamped six times through `rotate(i * 60, 64, 64)` — which is also what fixes
// the source art, where Illustrator had left two pyramids off their intended
// angle by 9.65 and 20 degrees.
//
// The path below is pyramid 06 (the one Illustrator got right) re-expressed
// about its own perceived centre, with its two remaining edges regenerated as
// exact 120-degree rotations of the first so all three match to 3 decimals.
//
// The art is drawn on 128 units but shows at 84 of the 128px frame, which is
// the size it occupies in the card. That ratio is one wrapper transform rather
// than baked into the coordinates, so every number here still reads directly
// against the Figma file.
//
// ---------------------------------------------------------------- Animation --
// Two full turns, settling with an ease-out, while the pyramids fade up one
// after another — the last reaching full opacity at the animation's midpoint,
// so the cluster completes itself while the ring is still visibly slowing.
//
// Each pyramid ALSO turns about its own perceived centre, counter to the ring
// and on the ring's own easing curve, so the two decelerate as one system
// rather than at speeds that drift against each other. The tumble is a whole
// number of the shape's 120-degree symmetry steps, which is what lets it land
// back on the drawn orientation exactly.
//
// The timing lives in custom properties on `.ea-accolade-mark` (see main.css)
// so it can be retuned without touching this file.
//
// It plays once, on entry, and never replays — `useRevealOnce` also reports
// visible immediately under prefers-reduced-motion, where the global
// duration collapse in main.css lands it on the final frame with no motion.
const root = ref<HTMLElement | null>(null)
const { visible } = useRevealOnce(root, { threshold: 0.35 })

// Centred on its own perceived centre; circumradius 19.63.
const PYRAMID =
    'M-9.815 -17.003C-0.81 -14.18 12.681 -6.39 19.63 0' +
    'C12.685 6.389 -0.806 14.176 -9.815 17.003' +
    'C-11.875 7.792 -11.874 -7.787 -9.815 -17.003Z'

/** Ring radius 44.5 about the 128-unit frame centre, first stop at 12 o'clock. */
const RING_TOP = 64 - 44.5
</script>

<template>
    <div
        ref="root"
        :class="['ea-accolade-mark', { 'is-playing': visible }]"
    >
        <!-- Decorative: the figure beside it carries the meaning. -->
        <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" focusable="false">
            <g class="ea-accolade-mark__spin">
                <!-- 84/128 — the drawn size of the cluster inside the frame. -->
                <g transform="translate(64 64) scale(0.65625) translate(-64 -64)">
                    <g
                        v-for="i in 6"
                        :key="i"
                        class="ea-accolade-mark__pyramid"
                        :style="{ '--i': i - 1 }"
                    >
                        <!-- Placement and tumble have to be two elements: SVG's
                             `transform` attribute and the CSS `transform`
                             property are the SAME property, so an element
                             carrying the static placement cannot also be
                             animated. The wrapper places the pyramid, which
                             leaves the path's own origin sitting exactly on the
                             perceived centre for the tumble to turn about. -->
                        <g :transform="`rotate(${(i - 1) * 60} 64 64) translate(64 ${RING_TOP})`">
                            <path class="ea-accolade-mark__body" :d="PYRAMID" />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    </div>
</template>
