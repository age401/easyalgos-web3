<script setup lang="ts">
// Dark band: the site background animates white -> ink on scroll-in (and back
// on scroll-away) via useDarkBand; the equity curve draws in while dark.
const sectionRef = ref<HTMLElement | null>(null)
const { dark } = useDarkBand(sectionRef)

const assurances = [
    {
        title: 'Every trade on the record',
        body: 'Complete trading history for each Expert Advisor is published and kept current — entries, exits, drawdowns, losing months included.',
    },
    {
        title: 'Verified by third parties',
        body: 'Performance is tracked on independent verification services, not on our own word. The record is eight years deep and audit-friendly.',
    },
    {
        title: 'Scored by AlgoScore',
        body: 'Each strategy carries an AlgoScore rating — a standing grade of risk, consistency and durability that decides whether it stays in the program.',
    },
]
</script>

<template>
    <section
        id="record"
        ref="sectionRef"
        :class="['relative transition-colors duration-[1300ms] ease-smooth', dark ? 'bg-Ink/950' : 'bg-white']"
    >
        <div
            class="eal-container py-24 transition-opacity duration-700 ease-smooth tablet-md:py-32"
            :class="dark ? 'opacity-100' : 'opacity-0'"
        >
            <div class="grid grid-cols-1 items-end gap-8 tablet-wide:grid-cols-[1fr_auto]">
                <div class="max-w-[640px]">
                    <p class="eal-eyebrow eal-eyebrow--invert"><b>02</b><span aria-hidden="true">/</span>The record</p>
                    <h2 class="eal-h2 mt-6 !text-white">
                        Performance,<br />
                        on the record.
                    </h2>
                    <p class="mt-6 max-w-[34rem] font-franklin text-[17px] leading-[1.667] text-Tinted/200">
                        Since 2017, every strategy in the program has traded in public view. No curated
                        screenshots, no reset accounts &mdash; a continuous, independently verified history
                        that we are content to be judged on.
                    </p>
                </div>
                <a href="https://easyalgos.ai/" class="eal-textlink !text-white/80 mb-1 transition-colors duration-300 hover:!text-white">
                    Inspect the full history
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
            </div>

            <!-- Equity curve: normalised pathLength lines, draw-in gated on `dark`. -->
            <div class="mt-14 tablet-md:mt-20">
                <div :class="['eal-chart', { 'is-active': dark }]">
                    <div class="mb-5 flex flex-wrap items-center gap-x-7 gap-y-2">
                        <p class="flex items-center gap-2.5 font-poppins text-[11.5px] uppercase tracking-[0.16em] text-white/60">
                            <span class="inline-block h-0.5 w-5 rounded bg-Blue/400" aria-hidden="true" />
                            Verified equity, composite
                        </p>
                        <p class="flex items-center gap-2.5 font-poppins text-[11.5px] uppercase tracking-[0.16em] text-white/40">
                            <span class="inline-block h-0.5 w-5 rounded bg-[#33406F]" aria-hidden="true" />
                            Industry average EA lifespan
                        </p>
                    </div>

                    <svg class="h-auto w-full" viewBox="0 0 1104 400" fill="none" role="img" aria-label="Equity growth chart: EasyAlgos composite verified equity rising steadily from 2018 through 2026, while the industry-average Expert Advisor decays within its first two years.">
                        <!-- Grid -->
                        <g class="chart-grid" stroke="#232D52" stroke-width="1">
                            <line x1="0" y1="40" x2="1104" y2="40" />
                            <line x1="0" y1="120" x2="1104" y2="120" />
                            <line x1="0" y1="200" x2="1104" y2="200" />
                            <line x1="0" y1="280" x2="1104" y2="280" />
                            <line x1="0" y1="360" x2="1104" y2="360" />
                        </g>

                        <!-- Industry-average decay: launched, decayed, gone. -->
                        <path
                            class="chart-line"
                            pathLength="1"
                            d="M0 330 C 60 322, 110 318, 170 320 C 240 323, 300 336, 368 352 C 420 364, 470 372, 520 376"
                            stroke="#33406F"
                            stroke-width="2"
                        />

                        <!-- Composite verified equity. -->
                        <path
                            class="chart-line"
                            pathLength="1"
                            d="M0 356 C 80 344, 130 330, 190 318 C 260 304, 300 296, 360 280 C 430 261, 470 244, 540 230 C 600 218, 650 196, 720 176 C 790 156, 840 140, 900 116 C 960 92, 1020 68, 1096 44"
                            stroke="#5481F9"
                            stroke-width="2.5"
                            stroke-linecap="round"
                        />

                        <!-- Year ticks -->
                        <g class="chart-tick" font-family="Poppins, sans-serif" font-size="11.5" fill="#7A7FA3" letter-spacing="0.1em">
                            <text x="0" y="394">2018</text>
                            <text x="262" y="394">2020</text>
                            <text x="524" y="394">2022</text>
                            <text x="786" y="394">2024</text>
                            <text x="1058" y="394">2026</text>
                        </g>

                        <!-- Annotations -->
                        <g class="chart-label">
                            <text x="524" y="360" font-family="Poppins, sans-serif" font-size="12" fill="#62678F">Average EA is abandoned</text>
                            <text x="920" y="200" font-family="Poppins, sans-serif" font-size="12" fill="#A6BFFD" text-anchor="end">Eight years, one record</text>
                        </g>

                        <!-- Endpoint -->
                        <circle class="chart-pulse" cx="1096" cy="44" r="10" fill="rgba(84,129,249,0.25)" />
                        <circle class="chart-dot" cx="1096" cy="44" r="4" fill="#5481F9" />
                    </svg>
                </div>
            </div>

            <!-- Assurances -->
            <div class="mt-16 grid grid-cols-1 gap-0 border-t border-white/10 tablet-md:grid-cols-3 tablet-md:gap-10">
                <div
                    v-for="(assurance, i) in assurances"
                    :key="assurance.title"
                    v-reveal="i * 110"
                    class="border-b border-white/10 py-8 tablet-md:border-b-0"
                >
                    <h3 class="font-poppins text-[16px] font-medium text-white">{{ assurance.title }}</h3>
                    <p class="mt-3 font-franklin text-[14.5px] leading-[1.68] text-Tinted/300">{{ assurance.body }}</p>
                </div>
            </div>
        </div>
    </section>
</template>
