<script setup lang="ts">
// What surrounds the algorithm, filed as a ledger — numbered rows, hairline
// rules, one line of substance each. No feature cards, no icon grid.
const items = [
    {
        index: '01',
        name: 'EasyVPS',
        detail: 'A pre-configured, algo-optimised trading server through ForexVPS. Your strategies run around the clock, independent of your own machine.',
    },
    {
        index: '02',
        name: 'Analytics dashboard',
        detail: 'Account performance, growth curves and per-strategy attribution in one place — the same numbers we watch, presented without decoration.',
    },
    {
        index: '03',
        name: 'AI market forecasts',
        detail: 'A weekly forecast brief produced with frontier AI models and reviewed by the research desk before it reaches members.',
    },
    {
        index: '04',
        name: 'Back-testing archives',
        detail: 'Full historical test data for every Expert Advisor, alongside its live record — so you can compare the promise against the delivery.',
    },
    {
        index: '05',
        name: 'Remote support',
        detail: 'Secure, direct assistance with setup and operations from the EasyAlgos team, on your schedule.',
    },
    {
        index: '06',
        name: 'Private community',
        detail: 'A members-only group where the team and several thousand practitioners discuss deployments, allocations and market conditions.',
    },
]
</script>

<template>
    <section id="infrastructure" class="bg-Tinted/25 py-24 tablet-md:py-32">
        <div class="eal-container">
            <div v-reveal class="max-w-[640px]">
                <p class="eal-eyebrow"><b>03</b><span aria-hidden="true">/</span>The infrastructure</p>
                <h2 class="eal-h2 mt-6">Everything around<br />the algorithm.</h2>
                <p class="eal-lead mt-6 max-w-[32rem]">
                    A strategy is only as dependable as the environment it runs in. Membership includes
                    the full operating layer &mdash; provisioned, maintained and supported.
                </p>
            </div>

            <div class="mt-14 border-t border-Tinted/100 tablet-md:mt-16">
                <div
                    v-for="(item, i) in items"
                    :key="item.name"
                    v-reveal="Math.min(i * 70, 350)"
                    class="group grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-Tinted/100 py-7 transition-colors duration-500 hover:bg-white tablet-md:grid-cols-[4rem_16rem_1fr] tablet-md:gap-8 tablet-md:px-4 tablet-md:-mx-4"
                >
                    <p class="eal-num font-poppins text-[13px] text-Tinted/400">{{ item.index }}</p>
                    <h3 class="font-poppins text-[17px] font-medium text-Ink/950">{{ item.name }}</h3>
                    <p class="col-span-2 font-franklin text-[15px] leading-[1.68] text-Neutral/500 tablet-md:col-span-1">{{ item.detail }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
