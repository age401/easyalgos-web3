<script setup lang="ts">
// The business model, stated plainly. This is the section that does the work
// the old "problem/testimonial" blocks tried to do — but by disclosure, not
// persuasion. Editorial two-column: thesis left, terms right.
const terms = [
    {
        title: 'No purchase price',
        body: 'Every Expert Advisor in the program is provided without charge. We do not sell software, licenses, or upgrades.',
    },
    {
        title: 'No commissions',
        body: 'EasyAlgos takes no share of profits and no per-trade fee. Your account, your broker, your returns.',
    },
    {
        title: 'Aligned incentives',
        body: 'We are compensated through partner-broker volume from qualified, funded accounts. Our revenue depends on strategies that keep working — not on the next sale.',
    },
]
</script>

<template>
    <section id="model" class="py-24 tablet-md:py-32">
        <div class="eal-container">
            <div class="grid grid-cols-1 gap-12 tablet-wide:grid-cols-[0.9fr_1.1fr] tablet-wide:gap-20">
                <div v-reveal>
                    <p class="eal-eyebrow"><b>01</b><span aria-hidden="true">/</span>The model</p>
                    <h2 class="eal-h2 mt-6">
                        Most Expert Advisors are sold.<br class="hidden tablet:block" />
                        Ours are underwritten.
                    </h2>
                    <p class="eal-lead mt-6 max-w-[30rem]">
                        The industry standard is to sell an algorithm on the strength of a backtest and
                        move on. We inverted the arrangement: strategies earn their place through live,
                        verified performance &mdash; and members access them at no cost, because our
                        interests only pay when theirs do.
                    </p>
                </div>

                <div class="tablet-wide:pt-14">
                    <div
                        v-for="(term, i) in terms"
                        :key="term.title"
                        v-reveal="i * 110"
                        class="group border-t border-Tinted/100 py-8 transition-colors duration-500 last:border-b"
                    >
                        <div class="grid grid-cols-1 gap-3 tablet:grid-cols-[14rem_1fr] tablet:gap-8">
                            <h3 class="font-poppins text-[17px] font-medium text-Ink/950">{{ term.title }}</h3>
                            <p class="font-franklin text-[15px] leading-[1.68] text-Neutral/500">{{ term.body }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
