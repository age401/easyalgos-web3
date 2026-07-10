<script setup lang="ts">
// Three steps, stated like a procedure — because it is one.
const steps = [
    {
        index: '01',
        title: 'Apply',
        body: 'A short application establishes your account size, broker and experience. Most reviews conclude within one business day.',
    },
    {
        index: '02',
        title: 'Connect',
        body: 'We provision your EasyVPS, connect your MetaTrader 5 account at IC Markets or IC Trading, and configure the allocation with you.',
    },
    {
        index: '03',
        title: 'Operate',
        body: 'Strategies trade under continuous review. You watch the same verified numbers we do, and the desk stays available throughout.',
    },
]
</script>

<template>
    <section class="border-t border-Tinted/100 py-24 tablet-md:py-32">
        <div class="eal-container">
            <div class="grid grid-cols-1 gap-12 tablet-wide:grid-cols-[0.9fr_1.1fr] tablet-wide:gap-20">
                <div v-reveal>
                    <p class="eal-eyebrow"><b>05</b><span aria-hidden="true">/</span>The procedure</p>
                    <h2 class="eal-h2 mt-6">From application<br />to operation.</h2>
                    <p class="eal-lead mt-6 max-w-[28rem]">
                        Onboarding is deliberate but short. Most members are trading within
                        two days of approval.
                    </p>
                    <div v-reveal="200" class="mt-10">
                        <CtaButton label="Begin the application" href="https://easyalgos.ai/" />
                    </div>
                </div>

                <div>
                    <div
                        v-for="(step, i) in steps"
                        :key="step.index"
                        v-reveal="i * 120"
                        class="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-Tinted/100 py-9 last:border-b tablet:gap-8"
                    >
                        <p class="eal-num font-poppins text-[1.375rem] font-medium leading-none text-Tinted/200">{{ step.index }}</p>
                        <div>
                            <h3 class="font-poppins text-[17px] font-medium text-Ink/950">{{ step.title }}</h3>
                            <p class="mt-3 max-w-[30rem] font-franklin text-[15px] leading-[1.68] text-Neutral/500">{{ step.body }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
