<script setup lang="ts">
// The 48px icon bubble the /for-developers cards open with — The Problem
// (3236:13785) and Requirements (3388:12366) draw the same one.
//
// Two paints, both read off the node rather than the design-context export,
// which flattens gradient strokes to their first stop (it reports the ring as a
// solid #F5F6FF, which is how the first build of The Problem lost it):
//
//   fill    a radial wash, Tinted/500-ish #7A7FA3 from 0 to 20% alpha, centred
//           at (12.5, 6) with a 43.6px radius — stops at 67.1% and 88.9%. That
//           is the drawn `radialGradient` matrix resolved to a circle, so it
//           lights the bubble from the top left the way the file does.
//   stroke  2px INSIDE, linear #F5F6FF -> #7A7FA3 top-left to bottom-right. The
//           gradient's 0 and 1 land at 16.7% and 85.4% of the 135deg diagonal.
//
// CSS cannot put a gradient on a rounded border directly, so the ring is the
// border-box layer under a transparent 2px border, with the padding box painted
// white first so the translucent wash sits over white rather than over the ring.
// A padding-box layer is positioned from the padding box, 2px in from the drawn
// frame: the wash centre is (10.5, 4) of a 44px box. It is written in
// percentages of that box — an ellipse with equal % radii on a square is the
// circle — so the same paint scales with the compact size.
//
// `compactIcon` turns on the 32px bubble Requirements draws on a phone (360
// frame): the same 2px ring around a 16px glyph, growing back to 48 from
// `tablet`. The glyph is a separate file, not the 24px one scaled down — Figma
// keeps an instance's stroke weight when it resizes it, so the 16px glyph still
// draws 2px lines, where the 24px file shrunk to 16 would thin them to 1.33.
defineProps<{
    /** Path under /public; decorative, the card's text carries the meaning. */
    icon: string
    /** 16px version of `icon`; setting it makes the bubble 32px below tablet. */
    compactIcon?: string
}>()
</script>

<template>
    <span
        :class="[
            'grid shrink-0 place-items-center rounded-full border-2 border-transparent',
            compactIcon ? 'size-8 tablet:size-12' : 'size-12'
        ]"
        style="
            background:
                radial-gradient(99.09% 99.09% at 23.86% 9.09%, rgb(122 127 163 / 0) 67.1%, rgb(122 127 163 / 0.2) 88.9%) padding-box,
                linear-gradient(#fff, #fff) padding-box,
                linear-gradient(135deg, #f5f6ff 16.7%, #7a7fa3 85.4%) border-box;
        "
    >
        <!-- The picture is its own sized box, so it is the grid item that gets
             centred; `display: contents` on it left the glyph 3px low. -->
        <picture v-if="compactIcon" class="block size-4 tablet:size-6">
            <source media="(min-width: 600px)" :srcset="icon" width="24" height="24" />
            <img :src="compactIcon" alt="" width="16" height="16" loading="lazy" aria-hidden="true" class="block size-full" />
        </picture>
        <img v-else :src="icon" alt="" width="24" height="24" loading="lazy" aria-hidden="true" class="size-6" />
    </span>
</template>
