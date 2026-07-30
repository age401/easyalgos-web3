<script setup lang="ts">
// Trustpilot rating strip. Static markup, deliberately: the official Trustpilot
// widget is a third-party script that would cost a blocking request, a
// same-origin iframe and a chunk of main-thread time immediately below the fold.
// The figures come from data/site.ts and are refreshed with the same daily bake
// as the hero cards.
//
// The star row is decorative — the whole rating is announced once, as a sentence,
// through the visually-hidden label.
const rating = SITE_STATS.trustpilotRating
const reviews = SITE_STATS.trustpilotReviews
const filled = Math.round(rating)
</script>

<template>
    <div class="border-y border-Tinted/50 bg-white">
        <div class="ea-container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 tablet-wide:gap-x-12">
            <p class="sr-only">{{ $t('trustpilot.srLabel', { rating, count: reviews }) }}</p>

            <div class="flex items-center gap-3" aria-hidden="true">
                <span class="font-poppins text-[14px] font-semibold tracking-[-0.02em] text-Tinted/800">
                    {{ $t('trustpilot.excellent') }}
                </span>
                <span class="flex gap-0.5">
                    <span
                        v-for="star in 5"
                        :key="star"
                        class="flex h-[22px] w-[22px] items-center justify-center"
                        :class="star <= filled ? 'bg-[#00B67A]' : 'bg-[#DCDCE6]'"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1.2l1.76 3.72 3.99.55-2.9 2.79.72 4.04L7 10.36 3.43 12.3l.72-4.04-2.9-2.79 3.99-.55L7 1.2Z" fill="#fff" />
                        </svg>
                    </span>
                </span>
            </div>

            <p class="font-poppins text-[12px] font-semibold tracking-[-0.02em] text-Tinted/700" aria-hidden="true">
                {{ $t('trustpilot.basedOn', { rating }) }}
                <a href="https://www.trustpilot.com/" rel="noopener nofollow" target="_blank" class="underline decoration-Tinted/300 underline-offset-2 transition-colors duration-300 hover:text-Tinted/950">
                    {{ $t('trustpilot.reviews', { count: reviews }) }}
                </a>
            </p>

            <img
                src="/img/brands/trustpilot.svg"
                alt="Trustpilot"
                width="99"
                height="24"
                loading="lazy"
                class="h-6 w-auto"
            />
        </div>
    </div>
</template>
