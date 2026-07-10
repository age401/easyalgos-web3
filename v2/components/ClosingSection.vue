<script setup lang="ts">
// Closing: an ink panel with the page's single moment of colour — a hairline
// gradient rule. One statement, one action, one quiet alternative.
</script>

<template>
    <section class="py-24 tablet-md:py-32">
        <div class="eal-container">
            <div v-reveal class="relative overflow-hidden rounded-3xl bg-Ink/950 px-7 py-16 tablet:px-14 tablet-md:px-20 tablet-md:py-24">
                <!-- Restrained wash in the corner, echoing the wordmark's violet ticks -->
                <div class="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(84,129,249,0.14),transparent_65%)]" aria-hidden="true" />

                <!-- The one gradient on the page: a hairline, not a banner. -->
                <div class="h-px w-24 bg-[linear-gradient(90deg,#5481F9,#A299FF)]" aria-hidden="true" />

                <h2 class="eal-h2 mt-10 max-w-[38rem] !text-white">
                    Considered. Verified.<br />
                    Free to those who qualify.
                </h2>
                <p class="mt-6 max-w-[32rem] font-franklin text-[16px] leading-[1.68] text-Tinted/300">
                    If your account meets the thresholds, the full program &mdash; strategies,
                    infrastructure and desk &mdash; is available at no cost. The application takes
                    a few minutes; the record took eight years.
                </p>

                <div class="mt-11 flex flex-wrap items-center gap-4">
                    <CtaButton label="Apply for access" href="https://easyalgos.ai/" variant="white" />
                    <a href="https://easyalgos.ai/contacts" class="eal-textlink !text-white/70 transition-colors duration-300 hover:!text-white">
                        Or speak with the team
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </section>
</template>
