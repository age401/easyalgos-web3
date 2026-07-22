<script setup lang="ts">
// The old ecosystem: background flips white -> ink on scroll-in (reuses
// useDarkBand, the same triggered, non-scrubbed transition as the "Track
// record" section below), wrapped around the Stellar core WebGL stage.
//
// The stage renders on a transparent clear, so it sits on the band's own ink
// rather than carrying a backdrop of its own.
const sectionRef = ref<HTMLElement | null>(null)
const { dark } = useDarkBand(sectionRef)
</script>

<template>
    <section
        id="ecosystem"
        ref="sectionRef"
        :class="['relative transition-colors duration-[1300ms] ease-smooth', dark ? 'bg-[#171717]' : 'bg-white']"
    >
        <div
            class="eal-container py-24 transition-opacity duration-700 ease-smooth tablet-md:py-32"
            :class="dark ? 'opacity-100' : 'opacity-0'"
        >
            <div class="max-w-[640px]">
                <p class="eal-eyebrow eal-eyebrow--invert">The old ecosystem</p>
                <h2 class="eal-h2 mt-6 !text-white">
                    Every seat at the table<br />
                    doubts the next one.
                </h2>
                <p class="mt-6 max-w-[34rem] font-franklin text-[17px] leading-[1.667] text-Tinted/200">
                    Traders doubt sellers. Brokers doubt strategies. Developers doubt each other,
                    and infrastructure doubts uptime. The forex ecosystem runs on unverified
                    claims &mdash; the exact problem EasyAlgos was built to settle.
                </p>
            </div>

            <div class="mt-20 tablet-md:mt-24">
                <StellarCore />
            </div>
        </div>
    </section>
</template>
