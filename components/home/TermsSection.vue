<script setup lang="ts">
// "The catch" as a term sheet — one comparison table instead of price cards.
// The figure is the required account balance; the cost row is always $0.
const plans = [
    { name: 'Starter', balance: '$5,000', popular: false },
    { name: 'Pro', balance: '$10,000', popular: true },
    { name: 'Elite', balance: '$20,000', popular: false },
]

const terms = [
    { label: 'Minimum activity', values: ['10 trades / mo', '10 trades / mo', '10 trades / mo'] },
    { label: 'Expert Advisor suite', values: ['Full', 'Full', 'Full + early access'] },
    { label: 'EasyVPS tier', values: ['Standard', 'High-spec', 'Top-tier'] },
    { label: 'Support', values: ['Remote', 'Priority', 'White-glove'] },
    { label: 'Analytics', values: ['Simple', 'Advanced', 'Advanced'] },
    { label: 'License fees & commissions', values: ['$0', '$0', '$0'], gradient: true },
]
</script>

<template>
    <section id="terms" class="py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[720px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The "catch"</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    No cost.<br />
                    Just <span class="ea-grad-text">not for everyone</span>.
                </h2>
                <p class="ea-lead mt-6 max-w-[38rem]" v-reveal="140">
                    There are no payments, no subscriptions and no commissions. The only requirements are a funded account that meets your plan's minimum, and at least 10 trades a month &mdash; the volume that keeps the broker partnership, and therefore the whole model, running.
                </p>
            </div>

            <!-- Term sheet -->
            <div class="mt-12 overflow-x-auto" v-reveal="180">
                <div class="min-w-[760px] overflow-hidden rounded-2xl border-2 border-Tinted/100 bg-white">
                    <!-- Plan header row -->
                    <div class="grid grid-cols-[1.15fr_1fr_1fr_1fr]">
                        <div class="flex items-end p-6">
                            <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.16em] text-Tinted/400">Term sheet &middot; 2026</span>
                        </div>
                        <div
                            v-for="plan in plans"
                            :key="plan.name"
                            :class="['relative p-6', plan.popular ? 'bg-Tinted/25' : '']"
                        >
                            <div v-if="plan.popular" class="absolute inset-x-0 top-0 h-[3px]" style="background: linear-gradient(90deg, #205EFB, #5959FF, #B36DFF)" aria-hidden="true" />
                            <div class="flex items-center gap-2.5">
                                <h3 class="font-poppins text-base font-semibold text-Tinted/950">{{ plan.name }}</h3>
                                <span
                                    v-if="plan.popular"
                                    class="inline-flex h-5 items-center rounded-full px-2 font-poppins text-[9px] font-semibold uppercase tracking-[0.1em] text-white"
                                    style="background: linear-gradient(131deg, #205EFB 8%, #5959FF 47%, #B36DFF 92%)"
                                >
                                    Popular
                                </span>
                            </div>
                            <div class="mt-3 font-poppins text-[1.75rem] font-bold leading-none tracking-[-0.5px] text-Tinted/950 tabular-nums">{{ plan.balance }}</div>
                            <div class="mt-2 font-poppins text-[9px] font-medium uppercase tracking-[0.12em] text-Tinted/400">Required balance</div>
                        </div>
                    </div>

                    <!-- Term rows -->
                    <div
                        v-for="term in terms"
                        :key="term.label"
                        class="grid grid-cols-[1.15fr_1fr_1fr_1fr] border-t border-Tinted/100"
                    >
                        <div class="px-6 py-4 font-franklin text-[14px] text-Tinted/600">{{ term.label }}</div>
                        <div
                            v-for="(value, i) in term.values"
                            :key="i"
                            :class="['px-6 py-4', plans[i].popular ? 'bg-Tinted/25' : '']"
                        >
                            <span
                                :class="[
                                    'font-poppins text-[14px]',
                                    term.gradient ? 'ea-grad-text font-bold' : term.strong ? 'font-semibold text-Tinted/950' : 'font-medium text-Tinted/800',
                                ]"
                            >{{ value }}</span>
                        </div>
                    </div>

                    <!-- CTA row -->
                    <div class="grid grid-cols-[1.15fr_1fr_1fr_1fr] border-t border-Tinted/100">
                        <div class="px-6 py-6 font-franklin text-[13px] leading-snug text-Tinted/400">
                            Reviewed per application.<br />Most traders hear back within a day.
                        </div>
                        <div
                            v-for="plan in plans"
                            :key="plan.name + '-cta'"
                            :class="['flex items-center px-6 py-6', plan.popular ? 'bg-Tinted/25' : '']"
                        >
                            <CtaButton
                                label="Apply"
                                href="https://easyalgos.ai/"
                                :variant="plan.popular ? 'primary' : 'white-stroke'"
                                size="sm"
                                :arrow="plan.popular"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8" v-reveal>
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
