<script setup lang="ts">
// A Trustpilot star row. The glyph and the fill rule are lifted verbatim from
// TrustpilotBar — same 17x16 path, same inset percentages, same coverage maths —
// because they are the same object from the same design system, drawn at a
// second size for the review cards (Figma 885:2631).
//
// TrustpilotBar deliberately keeps its own copy for now. Its star row is
// interleaved with the compact/full responsive switch that `--ea-trustpilot-h`
// and the hero's `100svh - topbar - trustpilot` height subtraction depend on,
// and swapping it for this component is a change to the hero's geometry budget
// rather than to a star. Worth doing, but not inside this section's change.
//
// Size comes from `--ea-star` so the caller sets one number and the glyph, its
// grey remainder and the gaps all scale together. Default 24px, as drawn.
//
// aria-hidden throughout: a row of five boxes says nothing useful read out one
// at a time. The caller announces the whole rating once, as a sentence.
const props = withDefaults(defineProps<{ rating: number; count?: number }>(), { count: 5 })

// Trustpilot fills each star by how much of the rating falls in its own slot —
// star N covers [N-1, N) — rather than rounding the rating to a whole star. A
// 4.6 is four full stars and a 60%-filled fifth, not five.
function starFill(star: number) {
    const coverage = Math.min(1, Math.max(0, props.rating - (star - 1)))
    return Math.round(coverage * 1000) / 10
}
</script>

<template>
    <span class="flex items-center gap-[2px]" aria-hidden="true">
        <span
            v-for="star in count"
            :key="star"
            class="relative block h-[var(--ea-star,24px)] w-[var(--ea-star,24px)] shrink-0 overflow-hidden bg-[#00B67A]"
        >
            <!-- The green box is the ground and the grey is laid over whatever
                 the rating does not reach, so a fractional star needs one
                 element rather than a clipped second copy of the glyph. -->
            <span class="absolute inset-y-0 right-0 bg-[#D9D9D9]" :style="{ left: starFill(star) + '%' }" />
            <svg class="absolute left-[15.22%] top-[17.83%] h-[64.39%] w-[69.56%]" viewBox="0 0 17 16" fill="none">
                <path
                    d="M8.34783 11.7704L12.0313 10.7896L13.5026 15.4539L8.34783 11.7704ZM16.6957 5.88522H10.3096L8.34783 0L6.38609 5.88522H0L5.15478 9.5687L3.19304 15.4539L8.34783 11.7704L11.5409 9.55826L16.6957 5.87478V5.88522Z"
                    fill="#fff"
                />
            </svg>
        </span>
    </span>
</template>
