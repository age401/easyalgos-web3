<script setup lang="ts">
// The 32px "included" mark of the /pricing comparison — Figma "Item Bubble"
// (3507:11919), read off the node rather than the design-context export:
//
//   disc    25.6px, centred, a radial wash of #7A7FA3 at 0 -> 20% -> 80% alpha
//           (stops 0 / 55 / 90%). The paint's transform resolves to a circle of
//           18px radius centred at (50%, 29.7%), so the disc is lit from the top.
//   ring    a 2.4px OUTSIDE stroke, #62678F at 10%. A box-shadow spread is the
//           outside stroke exactly and costs no layout.
//   glyph   the 12.8px blue check (icn16-Check, scaled 0.8 in the instance).
//
// The paints live in `.ea-check-bubble` (main.css): a multi-line inline style
// is serialised differently by the server and the client and trips Vue's
// hydration check.
//
// Decorative: the cell around it carries the "Included" text for screen readers.
//
// `small` is the 24px mark of the phone cards (3517:21235), which the file draws
// as the same instance scaled to 0.75 — ring, wash and glyph all shrink with it,
// so it is the 32px mark scaled rather than a second set of numbers.
defineProps<{ small?: boolean }>()
</script>

<template>
    <span :class="['grid shrink-0 place-items-center', small ? 'size-6' : 'size-8']" aria-hidden="true">
        <span
            :class="['ea-check-bubble grid size-[25.6px] place-items-center rounded-full', small && 'scale-75']"
        >
            <img src="/img/icons/pricing-check-bubble.svg" alt="" width="12.8" height="12.8" class="size-[12.8px]" />
        </span>
    </span>
</template>
