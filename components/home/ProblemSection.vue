<script setup lang="ts">
// "The Expert Advisor industry was broken." — thesis + what-traders-paid-for card,
// closed by the Petko Aleksandrov endorsement quote.
const oldCosts = ['Four-figure license fees', 'Curve-fit backtests', 'Unverified track records', 'Misaligned incentives']
</script>

<template>
    <section id="problem" class="py-20 tablet-md:py-28">
        <div class="ea-container grid grid-cols-1 items-start gap-12 tablet-wide:grid-cols-2 tablet-wide:gap-16">
            <!-- Heading -->
            <div>
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The problem</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    The Expert Advisor<br />
                    industry was<br />
                    <span class="ea-grad-text">broken</span>.
                </h2>

                <div class="mt-12" v-reveal="160">
                    <a href="#pricing" class="ea-pill">
                        <img src="/img/home/logo-easyalgos-isologo.svg" alt="" width="12" height="12" class="h-3 w-3 shrink-0" />
                        Free for qualifying traders
                    </a>
                </div>
            </div>

            <!-- Copy + card -->
            <div class="tablet-wide:pt-3">
                <div class="border-t border-Tinted/100 pt-8" v-reveal="120">
                    <p class="ea-lead max-w-[34rem]">
                        You've been there: the "Holy Grail" promise, the four-figure license, the backtest that never survives live markets. Sellers profited whether you did or not &mdash; so after enough false starts, every algorithmic trader ends up asking the same question: who is actually accountable for results?
                    </p>
                </div>

                <div
                    class="mt-8 rounded-[20px] p-4 shadow-[0_20px_40px_-28px_rgba(47,42,74,0.25)]"
                    style="background: linear-gradient(100.3deg, #F6F7FF 0%, #E7E9F9 39.423%, #F2F3FF 100%)"
                    v-reveal="200"
                >
                    <div class="rounded-xl border-2 border-white bg-Tinted/25 p-4">
                        <p class="font-poppins text-[10px] uppercase tracking-[1px] text-Tinted/600">
                            What traders kept paying for
                        </p>
                        <ul class="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 tablet:grid-cols-2">
                            <li v-for="cost in oldCosts" :key="cost" class="flex items-center gap-3">
                                <img src="/img/home/bullet-hidden-costs.svg" alt="" width="40" height="40" class="h-10 w-10 flex-none" aria-hidden="true" />
                                <span class="font-franklin text-base leading-6 tracking-[0.5px] text-Tinted/900">{{ cost }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Endorsement -->
        <div class="ea-container mt-16 tablet-md:mt-20" v-reveal="120">
            <figure class="border-t border-Tinted/100 pt-10">
                <blockquote class="max-w-[52rem] font-poppins text-[1.375rem] font-medium leading-[1.5] tracking-[-0.5px] text-Tinted/900 tablet:text-[1.625rem]">
                    &ldquo;EasyAlgos is a great opportunity if you want to trade some of the top Expert Advisors on the market &mdash; <span class="ea-grad-text">without paying for them</span>.&rdquo;
                </blockquote>
                <figcaption class="mt-6 flex items-center gap-3">
                    <span class="h-px w-4 bg-Tinted/400" aria-hidden="true" />
                    <span class="font-poppins text-sm font-semibold text-Tinted/900">Petko Aleksandrov</span>
                    <span class="font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-Tinted/400">Founder &amp; CEO &middot; Algo Trading Space</span>
                </figcaption>
            </figure>
        </div>
    </section>
</template>
