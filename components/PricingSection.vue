<script setup lang="ts">
// "You don't pay, you qualify" — the three qualification tiers.
//
// Drawn as a tinted shell holding three near-white cards separated by a 1px
// gutter, which is done with `gap-px` over the shell's own background rather than
// borders: no double lines at the joins, and the outer radius stays clean because
// only the wrapper is rounded.
//
// The middle tier is the emphasised one and takes the gradient CTA; the outer two
// take the ink pill. That comes from the data (`featured`), not from an index, so
// re-ordering the tiers cannot break it.
import { PRICING_TIERS } from '~/data/content'

const { n } = useI18n()
</script>

<template>
    <section id="pricing" class="ea-section bg-white">
        <div class="ea-container">
            <SectionHeading :eyebrow="$t('pricing.eyebrow')">
                <template #title>
                    <span class="ea-grad">{{ $t('pricing.titleAccent') }}</span>,<br />
                    {{ $t('pricing.titleRest') }}
                </template>
                <template #lead>
                    <p class="ea-lead--tight max-w-[640px]">
                        {{ $t('pricing.leadLine1') }}<br class="hidden tablet:inline" />
                        {{ $t('pricing.leadLine2') }}
                    </p>
                </template>
            </SectionHeading>

            <!-- Tier shell -->
            <div
                v-reveal="160"
                class="mt-12 rounded-[20px] border-2 border-white bg-ea-pricing-shell p-4 tablet-wide:mt-16"
            >
                <ul class="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-Tinted/25 tablet-md:grid-cols-3">
                    <li
                        v-for="tier in PRICING_TIERS"
                        :key="tier.id"
                        class="flex flex-col bg-ea-pricing-card p-8 tablet-wide:p-10"
                    >
                        <h3 class="font-poppins text-[1.75rem] font-medium leading-9 tracking-[-0.5px] text-Neutral/700 tablet-wide:text-[2rem]">
                            {{ $t(`pricing.tiers.${tier.id}.name`) }}
                        </h3>

                        <p class="mt-3 flex flex-wrap items-baseline gap-x-2">
                            <span class="ea-num font-poppins text-[1.75rem] font-medium leading-8 tracking-[-0.5px] text-Tinted/800">
                                ${{ n(tier.minimumBalance, { style: 'decimal' }) }}
                            </span>
                            <span class="ea-body">{{ $t('pricing.minimumBalance') }}</span>
                        </p>

                        <p class="mt-2 flex items-center gap-2">
                            <span class="h-1 w-1 shrink-0 rounded-full bg-Blue/600" aria-hidden="true" />
                            <span class="font-franklin text-[14px] leading-6 text-Tinted/500">
                                {{ $t('pricing.minimumTrades', { count: tier.minimumTrades }) }}
                            </span>
                        </p>

                        <div class="mt-7">
                            <AppButton
                                :label="$t('common.applyNow')"
                                :href="APPLY_HREF"
                                :variant="tier.featured ? 'primary' : 'ink'"
                                :size="tier.featured ? 'md' : 'sm'"
                            />
                        </div>

                        <p class="ea-body mt-8">{{ $t(`pricing.tiers.${tier.id}.description`) }}</p>
                    </li>
                </ul>
            </div>

            <!-- Model explainer link -->
            <div
                v-reveal="120"
                class="mt-12 flex flex-col items-start justify-between gap-6 tablet-md:flex-row tablet-md:items-center tablet-wide:mt-16"
            >
                <h3 class="ea-h4">&mdash; {{ $t('pricing.modelTitle') }}</h3>
                <AppButton :label="$t('common.learnMore')" href="/pricing" variant="stroke" :arrow="false" />
            </div>
        </div>
    </section>
</template>
