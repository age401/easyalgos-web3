<script setup lang="ts">
// The transport control for a one-shot animation, from the Figma component
// "Playback control" (623:3161). Two variants and a hover state on each:
//
//   Paused   a play triangle on the disc.
//   Playing  the two pause bars, with a progress ring around the disc.
//
// The ring is DRAWN rather than transcribed from the export. Figma can only draw
// one position of it — its arc happens to stop at about 64% — and the thing it
// stands for is a value that moves. So it keeps the exported circle exactly (r=15
// on the 32px box, a 2px stroke, white at 80%, starting at twelve o'clock) and
// takes its arc length from `progress` instead of having it baked in.
//
// The triangle is the exported polygon's own path data, rotated a quarter turn the
// way the component rotates it: an equilateral triangle 12 tall on a 13.856 base,
// so after the turn it is 12 wide and 13.856 tall with its apex on the right edge
// of the 16px glyph box. Figma centres it by that bounding box, which sits it a
// touch right of the disc's centre — kept, because that is what the component
// draws and it is what a play triangle wants optically.
interface Props {
    /** Chooses the glyph: the pause bars while running, the triangle at rest. */
    playing?: boolean
    /** 0..1 through the sequence, for the ring. */
    progress?: number
    /** Accessible name. It changes with the state, so the caller owns it. */
    label?: string
}
const props = withDefaults(defineProps<Props>(), { playing: false, progress: 0, label: undefined })

const RADIUS = 15
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** The ring only means anything mid-sequence. At rest there is no position to
 *  report, and at the end a full circle reads as a state — a ring that is always
 *  there — rather than as progress that has run out. */
const ringShown = computed(() => props.progress > 0 && props.progress < 1)
const dash = computed(() => `${Math.max(0, Math.min(1, props.progress)) * CIRCUMFERENCE} ${CIRCUMFERENCE}`)
</script>

<template>
    <button type="button" class="ea-playback" :aria-label="label">
        <svg class="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <!-- Rotated so the arc starts at twelve o'clock and runs clockwise,
                 which is where the exported one starts. -->
            <circle
                v-if="ringShown"
                cx="16"
                cy="16"
                r="15"
                stroke="#fff"
                stroke-opacity="0.8"
                stroke-width="2"
                :stroke-dasharray="dash"
                transform="rotate(-90 16 16)"
            />
            <!-- Two 3x12 bars, at 3 and 10 inside the 16px glyph box, which itself
                 starts at (8, 8). -->
            <template v-if="playing">
                <rect x="11" y="10" width="3" height="12" fill="#fff" fill-opacity="0.8" />
                <rect x="18" y="10" width="3" height="12" fill="#fff" fill-opacity="0.8" />
            </template>
            <path v-else d="M24 16L12 22.9282V9.0718L24 16Z" fill="#fff" fill-opacity="0.8" />
        </svg>
    </button>
</template>
