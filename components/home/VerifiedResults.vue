<script setup lang="ts">
// Dark band: the site background animates white -> dark on scroll-in (and back
// to white on scroll-away) via useDarkBand; the monthly-returns heatmap pops
// in cell by cell while dark.
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
            <div class="grid grid-cols-1 items-start gap-12 tablet-wide:grid-cols-[0.9fr_1.1fr] tablet-wide:gap-16">
                <div>
                    <h2 class="ea-h2 !text-white">
                        Every month<br />
                        since 2017.<br />
                        On the record.
                    </h2>
                    <p class="mt-6 max-w-[30rem] font-franklin text-[17px] leading-[1.667] text-Tinted/100">
                        Every EasyAlgos strategy publishes its live performance to MyFxBook and FXBlue &mdash; every trade, every drawdown, every month. No screenshots, no cherry-picked backtests. Including the red months, because a track record with no losses isn't a track record.
                    </p>
                </div>

                <MonthlyHeatmap :active="dark" />
            </div>
        </div>
    </section>
</template>
