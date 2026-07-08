<script setup lang="ts">
// "From application to live trading in three steps." — divided steps card.
const steps = [
    { n: '01', title: 'Apply', desc: 'A five-minute application. We review every account to keep the ecosystem healthy — most traders hear back within a day.', cta: true },
    { n: '02', title: 'Onboard', desc: 'Your EasyVPS is provisioned and your Expert Advisors are installed and configured by our team — remotely and securely.', cta: false },
    { n: '03', title: 'Trade', desc: 'Your algorithms go live on your own broker account. You stay in full control of your capital; we never touch your funds.', cta: false },
]
</script>

<template>
    <section id="how" class="bg-white py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[820px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>How to join</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    From application to<br />
                    live trading in <span class="ea-grad-text">three steps</span>.
                </h2>
                <p class="ea-lead mt-6 max-w-[36rem]" v-reveal="140">
                    No downloads to fight with, no configuration marathons. Apply once, and our team sets up the entire operation around your account &mdash; most members are live within days.
                </p>
            </div>

            <div
                class="mt-12 grid grid-cols-1 divide-y divide-Tinted/100 overflow-hidden rounded-2xl border border-Tinted/100 tablet-md:grid-cols-3 tablet-md:divide-x tablet-md:divide-y-0"
                v-reveal="180"
            >
                <div v-for="step in steps" :key="step.n" class="flex flex-col p-8">
                    <span class="font-poppins text-[2.75rem] font-bold leading-none text-Blue/600">{{ step.n }}</span>
                    <h3 class="mt-6 font-poppins text-lg font-semibold text-Tinted/950">{{ step.title }}</h3>
                    <p class="mt-3 font-franklin text-[15px] leading-[1.6] text-Tinted/600">{{ step.desc }}</p>
                    <div v-if="step.cta" class="mt-7">
                        <CtaButton label="Apply now" href="https://easyalgos.ai/" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
