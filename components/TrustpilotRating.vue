<script setup lang="ts">
// The Trustpilot rating row — Figma component "module Trustpilot" (3197:8018).
//
// Extracted from TrustpilotBar when the developer-recruitment hero turned out to
// draw the same component inline. It is one component in Figma and it is one
// component here; the difference between the two uses is the BOX around it, which
// is where it stays:
//
//   TrustpilotBar    a full-bleed strip under the home hero, with rules top and
//                    bottom and a background that rides the page tint.
//   ForDevHero       no box at all, centred under the CTAs.
//
// Everything below is the content, unchanged from the bar it came out of —
// including the compact layout under 769px, which the hero gets too and wants.
//
// Static markup, deliberately: the official Trustpilot widget is a third-party
// script that would cost a blocking request, a same-origin iframe and a chunk of
// main-thread time. The figures come from data/site.ts and are refreshed with the
// same daily bake as the hero cards.
//
// Type note: Figma draws this in Inter Bold — the only place in the whole site
// that reaches for Inter. Rather than pull a third family into the critical path
// for one strip, it renders in Roboto Medium (`font-franklin`), the closest face
// already loaded. It was previously Poppins SemiBold, which is a much rounder,
// wider letterform than either and read noticeably off against the Trustpilot
// mark beside it.
//
// The star row is decorative — the whole rating is announced once, as a sentence,
// through the visually-hidden label.
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
    <div class="flex flex-wrap items-center justify-center gap-3 min-[769px]:gap-x-12">
        <p class="sr-only">{{ $t('trustpilot.srLabel', { rating, count: reviews }) }}</p>

        <div class="flex flex-wrap items-center gap-3 min-[769px]:gap-4" aria-hidden="true">
            <div class="flex items-center gap-3">
                <span class="font-franklin text-[12px] font-medium tracking-[-0.02em] text-Tinted/800 min-[769px]:text-[14px]">
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
            <p class="order-2 font-franklin text-[12px] font-medium tracking-[-0.02em] text-Tinted/700 min-[769px]:hidden">
                {{ rating }}
            </p>

            <!-- separator dot: before the score on >=769px, after it on <=768px -->
            <span class="order-3 h-1 w-1 shrink-0 rounded-full bg-Tinted/100 min-[769px]:order-2" />

            <!-- full score sentence + reviews link: >=769px only -->
            <p class="hidden font-franklin text-[12px] font-medium tracking-[-0.02em] text-Tinted/700 min-[769px]:order-3 min-[769px]:block">
                {{ $t('trustpilot.basedOn', { rating }) }}
                <a href="https://www.trustpilot.com/" rel="noopener nofollow" target="_blank" class="underline decoration-Tinted/300 underline-offset-2 transition-colors duration-300 hover:text-Tinted/950">
                    {{ $t('trustpilot.reviews', { count: reviews }) }}
                </a>
            </p>
        </div>

        <!-- pb-0.5 on mobile nudges the logo up from true centre, matching the
             Figma container; dropped on >=769px since the equivalent slack there
             (a 28px frame vs a 24px logo) would grow the home page's bar past the
             68px `--ea-trustpilot-h` its hero height math depends on. -->
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
</template>
