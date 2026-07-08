<script setup lang="ts">
// "The 'catch'" — access plans. No prices: the figure is the required account
// balance. Pro is the highlighted plan (gradient frame + Popular tag).
const plans = [
    {
        name: 'Starter',
        balance: '$5,000',
        desc: 'Everything you need to begin trading smoothly — the full Expert Advisor suite on a reliable, performance-optimized EasyVPS.',
        popular: false,
        includes: ['Full Expert Advisor suite', 'EasyVPS included', 'Weekly AI market forecasts', 'Remote support'],
    },
    {
        name: 'Pro',
        balance: '$10,000',
        desc: 'Designed for traders who want more headroom — an upgraded, higher-spec VPS and priority support for larger accounts.',
        popular: true,
        includes: ['Everything in Starter', 'Higher-spec EasyVPS', 'Priority support', 'Advanced analytics'],
    },
    {
        name: 'Elite',
        balance: '$20,000',
        desc: 'The highest level of capability — top-tier VPS, early access to new Expert Advisors and white-glove onboarding.',
        popular: false,
        includes: ['Everything in Pro', 'Top-tier EasyVPS', 'Early access to new EAs', 'White-glove onboarding'],
    },
]
</script>

<template>
    <section id="pricing" class="py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[720px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The "catch"</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    No cost.<br />
                    Just <span class="ea-grad-text">not for everyone</span>.
                </h2>
                <p class="ea-lead mt-6 max-w-[38rem]" v-reveal="140">
                    There are no payments, no subscriptions and no commissions &mdash; EasyAlgos is compensated through its broker partnerships, so we only do well when you keep trading well. The only requirement is a funded account that meets your plan's minimum, and at least 10 trades a month.
                </p>
            </div>

            <div class="mt-12 grid grid-cols-1 gap-6 tablet-md:grid-cols-3">
                <div
                    v-for="(plan, i) in plans"
                    :key="plan.name"
                    :class="plan.popular ? 'rounded-[18px] p-[2px]' : ''"
                    :style="plan.popular ? 'background: linear-gradient(131deg, #205EFB 8%, #5959FF 47%, #B36DFF 92%)' : ''"
                    v-reveal="i * 90"
                >
                    <article
                        :class="[
                            'flex h-full flex-col rounded-2xl bg-white p-8',
                            plan.popular ? 'shadow-pricing-card' : 'border-2 border-Tinted/100',
                        ]"
                    >
                        <div class="flex items-center justify-between">
                            <h3 class="font-poppins text-lg font-semibold text-Tinted/950">{{ plan.name }}</h3>
                            <span
                                v-if="plan.popular"
                                class="inline-flex h-7 items-center rounded-full px-3 font-poppins text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
                                style="background: linear-gradient(131deg, #205EFB 8%, #5959FF 47%, #B36DFF 92%)"
                            >
                                Popular
                            </span>
                        </div>

                        <div class="mt-7 font-poppins text-[2.5rem] font-bold leading-none tracking-[-1px] text-Tinted/950">{{ plan.balance }}</div>
                        <div class="mt-3 font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">Required account balance &middot; Min. 10 trades / month</div>

                        <p class="mt-5 font-franklin text-[15px] leading-[1.6] text-Tinted/600">{{ plan.desc }}</p>

                        <ul class="mt-6 flex flex-col gap-2.5 border-t border-Tinted/100 pt-6">
                            <li v-for="item in plan.includes" :key="item" class="flex items-center gap-3">
                                <img src="/img/home/bullet-checkmark.svg" alt="" width="24" height="24" class="h-6 w-6 flex-none" aria-hidden="true" />
                                <span class="font-franklin text-[14px] leading-5 text-Tinted/800">{{ item }}</span>
                            </li>
                        </ul>

                        <div class="mt-auto pt-8">
                            <CtaButton
                                label="Apply now"
                                href="https://easyalgos.ai/"
                                :variant="plan.popular ? 'primary' : 'white-stroke'"
                                size="sm"
                                :class="'w-full'"
                            />
                        </div>
                    </article>
                </div>
            </div>

            <div class="mt-10" v-reveal>
                <a href="https://easyalgos.ai/pricing" class="ea-textlink group text-Tinted/700">
                    <span class="relative">
                        See the full plans breakdown
                        <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-Tinted/400 transition-all duration-300 ease-smooth group-hover:w-full" />
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h9M8.5 4.5 12.5 8l-4 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </a>
            </div>
        </div>
    </section>
</template>
