<script setup lang="ts">
// Hero: a statement, not a pitch. Line-masked headline, quiet lead, two CTAs,
// and a member-statement document as the visual — the product presented as a
// bank record rather than a dashboard screenshot. Entrance is orchestrated on
// mount via `.is-loaded` (hero-fade / line-mask classes in main.css); the
// statement sparkline draws once after full page load (usePlayOnceAfterLoad).
const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))

const { play } = usePlayOnceAfterLoad(900)

const allocations = [
    { name: 'Perceptrader AI', share: '38%', monthly: '+3.4%' },
    { name: 'Golden Pickaxe', share: '34%', monthly: '+2.8%' },
    { name: 'Night Hunter Pro', share: '28%', monthly: '+2.1%' },
]
</script>

<template>
    <section id="top" :class="['relative overflow-hidden pt-[68px]', { 'is-loaded': loaded }]">
        <!-- Paper wash: barely-there tint, no gradients shouting. -->
        <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div class="absolute inset-x-0 top-0 h-[520px] bg-[linear-gradient(180deg,#F7F7FB_0%,rgba(247,247,251,0)_100%)]" />
        </div>

        <div class="eal-container grid grid-cols-1 items-center gap-14 pb-16 pt-14 tablet-wide:grid-cols-[1.12fr_0.88fr] tablet-wide:gap-10 tablet-wide:pb-24 tablet-wide:pt-20 desktop:min-h-[calc(100vh-68px)] desktop:pb-28">
            <!-- Copy -->
            <div class="max-w-[42rem]">
                <p class="eal-eyebrow hero-fade" style="--reveal-delay: 0ms">
                    <b>EasyAlgos</b><span aria-hidden="true">/</span>Established 2017
                </p>

                <h1 class="eal-h1 mt-7">
                    <span class="line-mask"><span style="--reveal-delay: 80ms">Algorithmic trading,</span></span>
                    <span class="line-mask"><span style="--reveal-delay: 160ms">held to an</span></span>
                    <span class="line-mask"><span style="--reveal-delay: 240ms">institutional standard.</span></span>
                </h1>

                <p class="eal-lead hero-fade mt-7 max-w-[34rem]" style="--reveal-delay: 360ms">
                    EasyAlgos provides qualified traders with award-winning Expert Advisors, managed
                    infrastructure, and eight years of independently verified performance.
                    There is no license fee and there are no commissions &mdash;
                    <strong class="font-medium text-Neutral/700">access is granted on qualification, not payment.</strong>
                </p>

                <div class="hero-fade mt-11 flex flex-wrap items-center gap-4" style="--reveal-delay: 460ms">
                    <CtaButton label="Apply for access" href="https://easyalgos.ai/" />
                    <CtaButton label="Review the record" href="#record" variant="stroke" :arrow="false" />
                </div>

                <p class="hero-fade mt-11 font-poppins text-[11px] font-medium uppercase tracking-[0.18em] text-Tinted/500" style="--reveal-delay: 560ms">
                    Built on MetaTrader 5 &nbsp;&middot;&nbsp; Partnered with IC Markets &amp; IC Trading
                </p>
            </div>

            <!-- Member statement document -->
            <div class="hero-fade relative mx-auto w-full max-w-[440px] tablet-wide:mx-0 tablet-wide:ml-auto" style="--reveal-delay: 300ms">
                <!-- Sheet stacked behind, like filed paperwork -->
                <div class="absolute -bottom-3 left-4 right-4 top-3 rounded-2xl border border-Tinted/100 bg-Tinted/25" aria-hidden="true" />

                <div :class="['relative rounded-2xl border border-Tinted/100 bg-white p-7 shadow-notify', { 'is-playing': play }]">
                    <div class="flex items-start justify-between">
                        <img src="/img/easyalgos-logo.svg" alt="" class="h-4 w-auto opacity-90" width="172" height="32" aria-hidden="true" />
                        <p class="eal-num font-poppins text-[11px] uppercase tracking-[0.14em] text-Tinted/400">Member statement &middot; Q2</p>
                    </div>

                    <div class="mt-8 flex items-end justify-between gap-4">
                        <div>
                            <p class="font-poppins text-[11px] uppercase tracking-[0.14em] text-Tinted/400">Net equity</p>
                            <p class="eal-num mt-2 font-poppins text-[2.125rem] font-medium leading-none tracking-[-1px] text-Ink/950">$128,405<span class="text-[1.25rem] text-Tinted/400">.16</span></p>
                        </div>
                        <p class="eal-num rounded-full bg-Green/10 px-2.5 py-1 font-poppins text-[12px] font-medium text-Green/200">+3.2% MTD</p>
                    </div>

                    <!-- Sparkline: 12 months, draws once after load -->
                    <svg class="mt-6 h-[72px] w-full" viewBox="0 0 376 72" fill="none" preserveAspectRatio="none" aria-hidden="true">
                        <path
                            class="stmt-spark"
                            pathLength="1"
                            d="M2 62 C 22 58, 34 54, 52 52 S 86 50, 104 44 S 138 40, 156 38 S 190 40, 208 33 S 242 26, 260 24 S 294 22, 312 16 S 356 12, 374 8"
                            stroke="#285FF7"
                            stroke-width="2"
                            stroke-linecap="round"
                        />
                        <circle class="stmt-spark-dot" cx="374" cy="8" r="3" fill="#285FF7" />
                    </svg>

                    <!-- Allocation ledger rows -->
                    <div class="mt-6 border-t border-Tinted/100">
                        <div
                            v-for="allocation in allocations"
                            :key="allocation.name"
                            class="flex items-center justify-between border-b border-Tinted/100 py-3"
                        >
                            <p class="font-poppins text-[13px] font-medium text-Ink/950">{{ allocation.name }}</p>
                            <div class="flex items-center gap-5">
                                <p class="eal-num font-franklin text-[12.5px] text-Tinted/500">{{ allocation.share }}</p>
                                <p class="eal-num w-14 text-right font-poppins text-[12.5px] font-medium text-Green/200">{{ allocation.monthly }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 flex items-center justify-between">
                        <p class="font-franklin text-[11.5px] text-Tinted/400">Third-party verified track record</p>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="6.25" stroke="#285FF7" stroke-width="1.2" />
                            <path d="m4.5 7.2 1.8 1.8 3.2-3.8" stroke="#285FF7" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
