<script setup lang="ts">
// Trustpilot rating strip. Static markup, deliberately: the official Trustpilot
// widget is a third-party script that would cost a blocking request, a
// same-origin iframe and a chunk of main-thread time immediately below the fold.
// The figures come from data/site.ts and are refreshed with the same daily bake
// as the hero cards.
//
// Type note: Figma draws this bar in Inter Bold — the only place in the whole
// page that reaches for Inter. Rather than pull a third family into the critical
// path for one strip, it renders in Roboto Medium (`font-franklin`), the closest
// face already loaded. It was previously Poppins SemiBold, which is a much
// rounder, wider letterform than either and read noticeably off against the
// Trustpilot mark beside it.
//
// The star row is decorative — the whole rating is announced once, as a sentence,
// through the visually-hidden label. Below 769px the bar switches to a
// compact layout (Figma frames "[1024~769]" and "[1920~1025]" render
// identically; only "[768~]" differs): smaller type/stars, the score
// shortened to a bare number, and the separator dot moves to sit before the
// logo instead of before the score sentence.
const rating = SITE_STATS.trustpilotRating
const reviews = SITE_STATS.trustpilotReviews

// Trustpilot fills each star by how much of the rating falls in its slot
// (star N covers the range [N-1, N)) rather than rounding the whole rating
// to the nearest star, so a 4.6 rating shows 4 full stars and a 60%-filled 5th.
function starFill(star: number) {
    const coverage = Math.min(1, Math.max(0, rating - (star - 1)))
    return Math.round(coverage * 1000) / 10
}
</script>

<template>
    <!-- Background, rules and content all track the page darkening as the section
         below arrives, but not in the same way — see `.ea-trustpilot` in main.css.
         The background and the two rules are declared there rather than as
         utilities here because they are expressions, not fixed colours. -->
    <div class="ea-trustpilot">
        <!-- min-h pins the bar to the height it is drawn at (52px on phones,
             68px above 768 — the variable carries the switch), which is what the
             hero's `100svh - topbar - trustpilot` subtraction assumes. Content
             is untouched; it is still centred in whatever height it needs.
             py is 1px under Figma's 16/20 because Figma's borders are INSIDE
             strokes — its padding already contains the 1px rule, while CSS adds
             the border outside the padding box. -->
        <div
            class="ea-trustpilot__inner ea-container flex min-h-[calc(var(--ea-trustpilot-h)-2px)] flex-wrap items-center justify-center gap-3 px-4 py-[15px] min-[769px]:gap-x-12 min-[769px]:py-[19px]"
        >
            <p class="sr-only">{{ $t('trustpilot.srLabel', { rating, count: reviews }) }}</p>

            <div class="flex flex-wrap items-center gap-3 min-[769px]:gap-4" aria-hidden="true">
                <div class="flex items-center gap-3">
                    <span class="font-franklin text-[12px] font-medium tracking-[-0.02em] text-neutral-800 min-[769px]:text-[14px]">
                        {{ $t('trustpilot.excellent') }}
                    </span>
                    <span class="flex gap-0.5">
                        <span
                            v-for="star in 5"
                            :key="star"
                            class="relative h-5 w-5 shrink-0 overflow-hidden bg-[#00B67A] min-[769px]:h-6 min-[769px]:w-6"
                        >
                            <span class="absolute inset-y-0 right-0 bg-[#D9D9D9]" :style="{ left: starFill(star) + '%' }" />
                            <svg class="absolute left-[15.22%] top-[17.83%] h-[64.39%] w-[69.56%]" viewBox="0 0 17 16" fill="none">
                                <path
                                    d="M8.34783 11.7704L12.0313 10.7896L13.5026 15.4539L8.34783 11.7704ZM16.6957 5.88522H10.3096L8.34783 0L6.38609 5.88522H0L5.15478 9.5687L3.19304 15.4539L8.34783 11.7704L11.5409 9.55826L16.6957 5.87478V5.88522Z"
                                    fill="#fff"
                                />
                            </svg>
                        </span>
                    </span>
                </div>

                <!-- compact score: <=768px only -->
                <p class="order-2 font-franklin text-[12px] font-medium tracking-[-0.02em] text-secondary min-[769px]:hidden">
                    {{ rating }}
                </p>

                <!-- separator dot: before the score on >=769px, after it on <=768px -->
                <span class="order-3 h-1 w-1 shrink-0 rounded-full bg-sunken min-[769px]:order-2" />

                <!-- full score sentence + reviews link: >=769px only -->
                <p class="hidden font-franklin text-[12px] font-medium tracking-[-0.02em] text-secondary min-[769px]:order-3 min-[769px]:block">
                    {{ $t('trustpilot.basedOn', { rating }) }}
                    <a href="https://www.trustpilot.com/" rel="noopener nofollow" target="_blank" class="underline decoration-neutral-300 underline-offset-2 transition-colors duration-300 hover:text-primary">
                        {{ $t('trustpilot.reviews', { count: reviews }) }}
                    </a>
                </p>
            </div>

            <!-- pb-0.5 on mobile nudges the logo up from true centre, matching the
                 Figma container; dropped on >=769px since the equivalent slack there
                 (a 28px frame vs a 24px logo) would grow the bar past the 68px
                 `--ea-trustpilot-h` the hero's height math depends on. -->
            <div class="flex shrink-0 flex-col items-start justify-start pb-0.5 min-[769px]:pb-0">
                <img
                    src="/img/brands/trustpilot.svg"
                    alt="Trustpilot"
                    width="99"
                    height="24"
                    loading="lazy"
                    class="h-[18px] w-[74.118px] min-[769px]:h-6 min-[769px]:w-[99px]"
                />
            </div>
        </div>
    </div>
</template>
