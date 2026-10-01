<script setup lang="ts">
// A tier's name, minimum balance, trade requirement and CTA — the "Text" block
// every tier card opens with, shared by the comparison table's cards (from
// 769) and the phone cards (768 and below).
//
// Per breakpoint, from the three frames:
//
//                  1025 up (3507:10468)  769-1024 (3514:19825)  768 down (3517:21235)
//   name           Poppins 32 / 36       24 / 135%              24 / 135%
//   balance label  "/ Minimum balance"   "Minimum balance"      "Minimum balance"
//                  16, inline, 16 apart  12, its own line       12, its own line
//   trades         one line              wraps under its dot    one line
//   CTA            56, 32 padding, 16    48, 24 padding, 14     48, 32 padding, 14
//   Pro's arrow    yes                   no                     yes
//
// The figure is 28 / 32 everywhere. The Pro name takes the brand gradient at
// every width (annotation on 3521:22763). The balance label's slash is its own
// span so the phone wording is the desktop string without it.
import type { PricingTier } from '~/types/home'

const props = defineProps<{
    tier: PricingTier
    /** The phone card. Only its CTA differs from the table's at the same
     *  width — 32px padding and the arrow back on Pro. */
    card?: boolean
}>()

// Spelled out so Tailwind's scanner finds every class. The table's CTA has its
// own 769-1024 step; the phone card's is a single 48px pill below 769 and the
// standard button above it, which it never reaches.
const ctaClass = computed(() =>
    props.card
        ? '!h-12 !px-8 !text-[14px]'
        : 'max-[1024px]:!h-12 max-[1024px]:!px-6 max-[1024px]:!text-[14px] ea-btn--no-arrow-tablet'
)
</script>

<template>
    <div>
        <h2
            :class="[
                'font-poppins text-[24px] font-medium leading-[1.35] tracking-[-0.5px] min-[1025px]:text-[32px] min-[1025px]:leading-9',
                tier.featured ? 'ea-grad' : 'text-Neutral/700'
            ]"
        >
            {{ $t(`pricing.tiers.${tier.id}.name`) }}
        </h2>

        <p class="mt-2 flex flex-col gap-1 pb-3 min-[1025px]:flex-row min-[1025px]:flex-wrap min-[1025px]:items-center min-[1025px]:gap-x-4 min-[1025px]:gap-y-0 min-[1025px]:pb-1">
            <span class="ea-num flex gap-1 font-poppins text-[28px] font-medium leading-8 tracking-[-0.5px] text-Tinted/800">
                <span>$</span>{{ $n(tier.minimumBalance) }}
            </span>
            <span class="font-franklin text-[12px] leading-[1.4] text-Tinted/700 min-[1025px]:text-[16px]">
                <span class="hidden min-[1025px]:inline" aria-hidden="true">/ </span>{{ $t('pricingPage.minimumBalance') }}
            </span>
        </p>

        <!-- The dot rides the first line (7px = half of 14 x 140% less half its
             own 6px), so a wrapped line at 769 does not centre it. -->
        <p :class="['flex items-start gap-1.5', card ? 'pb-4' : 'pb-6']">
            <span class="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#5481F9]" aria-hidden="true" />
            <span class="font-franklin text-[14px] leading-[1.4] text-Tinted/500">
                {{ $t('pricing.minimumTrades', { count: tier.minimumTrades }) }}
            </span>
        </p>

        <AppButton
            :label="$t('common.applyNow')"
            :href="APPLY_HREF"
            :variant="tier.featured ? 'primary' : 'ink'"
            :arrow="!!tier.featured"
            :class="ctaClass"
        />
    </div>
</template>
