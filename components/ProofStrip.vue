<script setup lang="ts">
// Figures first — the strip reads like the summary row of an annual report.
const figures = [
    { value: '8', unit: '+', label: 'Years of independently verified track record' },
    { value: '4,000', unit: '+', label: 'Traders running EasyAlgos strategies' },
    { value: '$0', unit: '', label: 'License fees and commissions, on every plan' },
    { value: '20', unit: '+', label: 'Expert Advisors under continuous review' },
]
</script>

<template>
    <section class="border-y border-Tinted/100" aria-label="Key figures">
        <div class="eal-container grid grid-cols-2 tablet-wide:grid-cols-4">
            <div
                v-for="(figure, i) in figures"
                :key="figure.label"
                v-reveal="i * 90"
                :class="[
                    'py-9 pr-6 tablet-wide:py-12',
                    i > 0 ? 'tablet-wide:border-l tablet-wide:border-Tinted/100 tablet-wide:pl-8' : '',
                    i % 2 === 1 ? 'border-l border-Tinted/100 pl-6 tablet-wide:border-l' : '',
                    i > 1 ? 'border-t border-Tinted/100 tablet-wide:border-t-0' : '',
                ]"
            >
                <p class="eal-num font-poppins text-[2rem] font-medium leading-none tracking-[-1px] text-Ink/950 tablet:text-[2.375rem]">
                    {{ figure.value }}<span v-if="figure.unit" class="text-Tinted/400">{{ figure.unit }}</span>
                </p>
                <p class="mt-3 max-w-[15rem] font-franklin text-[13.5px] leading-[1.5] text-Neutral/500">{{ figure.label }}</p>
            </div>
        </div>
    </section>
</template>
