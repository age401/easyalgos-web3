<script setup lang="ts">
// Dark band: the site background animates white -> dark on scroll-in (and back
// to white on scroll-away) via useDarkBand; the chart draws in while dark.
const sectionRef = ref<HTMLElement | null>(null)
const { dark } = useDarkBand(sectionRef)
</script>

<template>
    <section
        id="results"
        ref="sectionRef"
        :class="['relative transition-colors duration-[1300ms] ease-smooth', dark ? 'bg-Neutral/800' : 'bg-white']"
    >
        <div
            class="ea-container py-24 transition-opacity duration-700 ease-smooth tablet-md:py-32"
            :class="dark ? 'opacity-100' : 'opacity-0'"
        >
            <div class="max-w-[640px]">
                <h2 class="ea-h2 !text-white">
                    Verified in public.<br />
                    For over<br />
                    eight years.
                </h2>
                <p class="mt-6 max-w-[34rem] font-franklin text-[17px] leading-[1.667] text-Tinted/100">
                    Every EasyAlgos strategy publishes its live performance to MyFxBook and FXBlue &mdash; every trade, every drawdown, every month since 2017. No screenshots, no cherry-picked backtests. That is the difference between a track record and a sales page.
                </p>
            </div>

            <div class="mt-12 tablet-md:mt-16">
                <VerifiedGrowthChart :active="dark" />
            </div>
        </div>
    </section>
</template>
