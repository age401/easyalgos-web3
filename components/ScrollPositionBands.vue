<script setup lang="ts">
// The position control drawn for "How it works", generalised over band count so
// the review strip can use the same one. HowItWorksSection still carries its own
// four-band copy inline; it is identical in behaviour, and worth folding into
// this component next time that section is touched.
//
// The travelling fill is ONE element sliding over the track, not N bars taking
// turns being dark — a colour swap reads as a blink where the design reads as
// movement. Its transform is driven straight from the scroller's fractional
// position, so a drag moves it 1:1 and a jump rides the smooth scroll. There is
// deliberately no CSS transition on it: with one, it would lag behind both. That
// also means reduced motion needs no special case — the jump stops animating, so
// the fill stops travelling and simply lands.
const props = withDefaults(
    defineProps<{
        count: number
        /** Fractional scroll position, 0..count-1. */
        position: number
        /** Which band reads as current. Usually round(position). */
        activeIndex: number
        /** aria-label for band n, 1-based — the caller owns the wording. */
        labelFor: (n: number) => string
        /** Gap between bands, px. The fill's geometry is derived from it. */
        gap?: number
    }>(),
    { gap: 10 }
)

const emit = defineEmits<{ select: [index: number] }>()

// One band is (track - all the gaps) / count, and one STEP is band + gap. The
// translate is expressed as a percentage of the fill's own width, which is
// exactly one band — so `100% + gap` per step resolves correctly at any width
// without JS measuring anything.
const fillWidth = computed(() => `calc((100% - ${(props.count - 1) * props.gap}px) / ${props.count})`)
const step = computed(() => `calc(var(--p) * (100% + ${props.gap}px))`)
</script>

<template>
    <!-- The 10px of vertical padding is hit area for a 4px control, cancelled by
         the matching negative margin so it never shows up in the section's
         rhythm. -->
    <div class="relative -my-[10px] flex w-full py-[10px]" :style="{ gap: `${gap}px` }">
        <button
            v-for="n in count"
            :key="n"
            type="button"
            class="relative h-1 flex-1 rounded-[1px] bg-Tinted/50 before:absolute before:inset-x-0 before:-inset-y-[10px] before:content-['']"
            :aria-label="labelFor(n)"
            :aria-current="n - 1 === activeIndex ? 'true' : undefined"
            @click="emit('select', n - 1)"
        />
        <!-- inset-y-[10px] reproduces the track's own 4px height inside the
             padded hit area. -->
        <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-y-[10px] left-0 rounded-[1px] bg-Tinted/200 will-change-transform"
            :style="{ width: fillWidth, '--p': position, transform: `translateX(${step})` }"
        />
    </div>
</template>
