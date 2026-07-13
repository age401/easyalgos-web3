<script setup lang="ts">
// Membership terms as a rate card. The qualification threshold is presented
// the way a private bank presents a minimum — as the structure of the offer,
// not a price tag. All plans cost nothing; they differ by account size.
const tiers = [
    { name: 'Starter', minimum: '$5,000', advisors: 'Core allocation', note: 'For a first funded account' },
    { name: 'Pro', minimum: '$10,000', advisors: 'Full allocation', note: 'The standard membership', featured: true },
    { name: 'Elite', minimum: '$20,000', advisors: 'Full allocation, priority desk', note: 'For established accounts' },
]

const sharedTerms = [
    { term: 'License fee', value: '$0' },
    { term: 'Commissions', value: '0%' },
    { term: 'Minimum activity', value: '10 trades / month' },
    { term: 'Exit terms', value: 'Leave at any time' },
]
</script>

<template>
    <section id="membership" class="py-24 tablet-md:py-32">
        <div class="eal-container">
            <div class="grid grid-cols-1 items-end gap-8 tablet-wide:grid-cols-[1fr_auto]">
                <div v-reveal class="max-w-[640px]">
                    <p class="eal-eyebrow"><b>04</b><span aria-hidden="true">/</span>Membership</p>
                    <h2 class="eal-h2 mt-6">Free of charge.<br />Not free of standards.</h2>
                    <p class="eal-lead mt-6 max-w-[32rem]">
                        We work with funded, active accounts because that is what our model is built on.
                        If the thresholds below fit your account, membership costs you nothing &mdash; now
                        or later.
                    </p>
                </div>
                <p v-reveal="150" class="mb-1 font-franklin text-[13px] leading-[1.6] text-Tinted/500 tablet-wide:max-w-[240px] tablet-wide:text-right">
                    Terms apply identically across partner brokers IC&nbsp;Markets and IC&nbsp;Trading.
                </p>
            </div>

            <!-- Rate card -->
            <div class="mt-14 grid grid-cols-1 gap-5 tablet-md:grid-cols-3 tablet-md:gap-0 tablet-md:rounded-2xl tablet-md:border tablet-md:border-Tinted/100">
                <div
                    v-for="(tier, i) in tiers"
                    :key="tier.name"
                    v-reveal="i * 110"
                    :class="[
                        'relative rounded-2xl border border-Tinted/100 p-8 tablet-md:rounded-none tablet-md:border-0',
                        i > 0 ? 'tablet-md:border-l tablet-md:border-Tinted/100' : '',
                        tier.featured ? 'bg-Ink/950' : 'bg-white',
                        i === 0 ? 'tablet-md:rounded-l-2xl' : '',
                        i === tiers.length - 1 ? 'tablet-md:rounded-r-2xl' : '',
                    ]"
                >
                    <div class="flex items-baseline justify-between">
                        <h3 :class="['font-poppins text-[15px] font-medium', tier.featured ? 'text-white' : 'text-Ink/950']">{{ tier.name }}</h3>
                        <p v-if="tier.featured" class="font-poppins text-[10.5px] font-medium uppercase tracking-[0.16em] text-Blue/200">Most held</p>
                    </div>

                    <p :class="['eal-num mt-7 font-poppins text-[2.25rem] font-medium leading-none tracking-[-1.2px]', tier.featured ? 'text-white' : 'text-Ink/950']">
                        {{ tier.minimum }}
                    </p>
                    <p :class="['mt-2 font-franklin text-[13px]', tier.featured ? 'text-Tinted/300' : 'text-Tinted/500']">minimum account balance</p>

                    <div :class="['mt-7 border-t pt-5', tier.featured ? 'border-white/10' : 'border-Tinted/100']">
                        <p :class="['font-poppins text-[13.5px] font-medium', tier.featured ? 'text-white' : 'text-Ink/950']">{{ tier.advisors }}</p>
                        <p :class="['mt-1.5 font-franklin text-[13px] leading-[1.6]', tier.featured ? 'text-Tinted/300' : 'text-Neutral/500']">{{ tier.note }}</p>
                    </div>
                </div>
            </div>

            <!-- Shared terms row -->
            <div v-reveal class="mt-10 grid grid-cols-2 gap-y-6 border-y border-Tinted/100 py-7 tablet-md:grid-cols-4">
                <div v-for="item in sharedTerms" :key="item.term" class="pr-6">
                    <p class="font-poppins text-[11px] uppercase tracking-[0.15em] text-Tinted/500">{{ item.term }}</p>
                    <p class="eal-num mt-2 font-poppins text-[17px] font-medium text-Ink/950">{{ item.value }}</p>
                </div>
            </div>

            <p v-reveal class="mt-8 font-franklin text-[13px] leading-[1.7] text-Tinted/500">
                Applications are reviewed individually. Where an account does not yet meet a threshold,
                we would rather you wait than stretch &mdash; the thresholds exist because the strategies
                assume adequate capitalisation.
            </p>
        </div>
    </section>
</template>
