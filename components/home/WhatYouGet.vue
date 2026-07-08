<script setup lang="ts">
// "Everything you need to trade well." — bento grid of the 8 membership features.
const features = [
    { n: '01', icon: 'feature-01', title: 'EasyVPS', desc: 'Trade on a ready-to-go, algo-optimized server provided by ForexVPS.net and hosted on Equinix infrastructure — provisioned for you, tuned for execution.', span: 'tablet-md:col-span-2', tint: false },
    { n: '02', icon: 'feature-02', title: 'AI technology', desc: 'Experience the full potential of modern artificial intelligence — from strategy research to execution monitoring, our Expert Advisors use real AI where it measurably helps, and never where it adds risk. Models from OpenAI, Gemini and Claude work behind the scenes.', span: 'tablet-md:col-span-4', tint: true },
    { n: '03', icon: 'feature-03', title: 'AI market forecasts', desc: 'Stay ahead of the curve with weekly market forecasts powered by frontier AI models — context for what your algorithms are doing, and why.', span: 'tablet-md:col-span-3', tint: true },
    { n: '04', icon: 'feature-07', title: 'Remote support', desc: 'Direct, secure remote support whenever you need it — our team connects to your EasyVPS and resolves issues without interrupting your trading.', span: 'tablet-md:col-span-3', tint: false },
    { n: '05', icon: 'feature-04', title: 'Simple analytics', desc: 'Track and understand performance with clean, intuitive analytics — no spreadsheets required.', span: 'tablet-md:col-span-2', tint: false },
    { n: '06', icon: 'feature-05', title: 'Trading history', desc: 'A clear, detailed record of every trade on your account — exportable, auditable, yours.', span: 'tablet-md:col-span-2', tint: false },
    { n: '07', icon: 'feature-06', title: 'Back-testing data', desc: 'Study each Expert Advisor with high-quality, tick-accurate back-testing data before it ever trades your capital.', span: 'tablet-md:col-span-2', tint: false },
    { n: '08', icon: 'feature-08', title: 'Community', desc: 'Connect with other traders in our private Telegram community — exchange settings, compare results and learn from people running the same algorithms you are.', span: 'tablet-md:col-span-6', tint: true },
]
</script>

<template>
    <section id="features" class="py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[640px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>What you get</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    Everything you need<br />
                    to <span class="ea-grad-text">trade well</span>,<br />
                    in one membership.
                </h2>
                <p class="ea-lead mt-6 max-w-[34rem]" v-reveal="140">
                    EasyAlgos goes beyond Expert Advisors. Membership covers the entire operation — the infrastructure your algorithms run on, the data that validates them and the people who keep it all working.
                </p>
            </div>

            <div class="mt-12 grid grid-cols-1 gap-x-6 gap-y-2.5 tablet-md:grid-cols-6">
                <article
                    v-for="(f, i) in features"
                    :key="f.n"
                    :class="[
                        'flex min-h-[254px] flex-col justify-between rounded-2xl border-2 p-8',
                        f.span,
                        f.tint ? 'border-Tinted/100 bg-Tinted/25' : 'border-Tinted/100 bg-white',
                    ]"
                    v-reveal="i * 70"
                >
                    <div class="flex items-start justify-between">
                        <span class="font-poppins text-sm font-medium tracking-[2px] text-BLUE/BASE">{{ f.n }}</span>
                        <span class="ea-feature-icon-bubble flex h-12 w-12 items-center justify-center rounded-full">
                            <img :src="`/icons/home/${f.icon}.svg`" :alt="''" aria-hidden="true" class="h-8 w-8" width="32" height="32" />
                        </span>
                    </div>
                    <div class="mt-10">
                        <h3 class="font-poppins text-[22px] font-semibold leading-8 tracking-[-0.5px] text-[#0B1125]">{{ f.title }}</h3>
                        <p class="mt-2 max-w-[54ch] font-franklin text-base leading-[26px] text-Tinted/700">{{ f.desc }}</p>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
