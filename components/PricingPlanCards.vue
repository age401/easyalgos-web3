<script setup lang="ts">
// /pricing at 768 and below — "Account Tiers Table [768~]" (3517:21235).
//
// The comparison table stops being a table: each tier becomes its own card,
// the intro (PricingTierIntro) over a list of only what that tier includes, in
// the table's order. Elite's list is therefore the full twelve and Starter's
// six; the comparison is carried by the lists growing, not by empty cells.
//
// From the frame: the cards sit 16 apart in an 8px page gutter, each in the
// tinted shell with 12px padding (Pro: 6px of the brand gradient instead,
// which is what makes it read as the pick, with the "Popular" tag at its top
// right). The card is 24 / 16 vertically, the intro 16 in from the sides; list
// rows are 8 + content + 8, a 24px check (the table's mark at 0.75), 12 to the
// copy, 14px type.
//
// The EasyVPS row has a 24px "?" and no "view specs" link. It opens that plan's
// specs under the row (open state: 3530:22881) — a 2px Tinted/100 panel at 16px
// radius across the list's width, 48 above for the close button (top right, 8
// in) and 12 below. Labels on the left, 12 in; the plan's figures in a 120px
// column on the right, as the desktop panel's tinted cells (12 inset, 10 / 12
// vertical, 2px rules, rounded only at the ends). The file draws every row at a
// fixed 32px, which lets "Trading platforms you can run" overflow into the next
// row once it wraps; here the rows grow with their label instead.
import type { PricingTierId } from '~/types/home'
import {
    PRICING_FEATURES,
    PRICING_FEATURES_AFTER_VPS,
    PRICING_TIERS,
    VPS_PLANS,
    VPS_SPEC_ROWS
} from '~/data/content'

// The VPS row sits between the two runs of plain features, as in the table.
const GROUPS = ['before', 'vps', 'after'] as const

const open = ref<Record<string, boolean>>({})

function toggle(tier: string) {
    open.value[tier] = !open.value[tier]
}

// The panel's close button is about to go inert, which would drop focus to
// <body>; hand it back to the "?" that opened it.
function close(tier: string) {
    open.value[tier] = false
    document.getElementById(`pricing-vps-help-${tier}`)?.focus()
}

function featuresFor(tier: PricingTierId) {
    return {
        before: PRICING_FEATURES.filter((f) => f.tiers.includes(tier)),
        after: PRICING_FEATURES_AFTER_VPS.filter((f) => f.tiers.includes(tier))
    }
}

// Pro's 6px frame: the brand gradient at the angle the file's paint resolves to
// on a 344x621 card (stops 0 / 46 / 100%).
const PRO_FRAME = 'background-image: linear-gradient(128deg, #205EFB 0%, #5959FF 46%, #B36DFF 100%)'

function planFor(tier: string) {
    return VPS_PLANS.find((plan) => plan.tier === tier)!
}
</script>

<template>
    <div>
        <!-- 20px Poppins SemiBold, centred, 12 above the first card. -->
        <p class="pb-3 text-center font-poppins text-[20px] font-semibold leading-[1.4] text-Tinted/950">
            <span class="ea-grad">{{ $t('pricing.titleAccent') }}</span>, {{ $t('pricing.titleRest') }}
        </p>

        <ul class="flex flex-col gap-4">
            <li
                v-for="tier in PRICING_TIERS"
                :key="tier.id"
                :class="['rounded-[20px]', tier.featured ? 'p-1.5' : 'bg-ea-pricing-shell p-3']"
                :style="tier.featured ? PRO_FRAME : undefined"
            >
                <div class="relative overflow-hidden rounded-xl border-2 border-white bg-ea-pricing-card pb-4 pt-6">
                    <span
                        v-if="tier.featured"
                        class="absolute right-4 top-4 rounded-lg bg-Blue/600 px-2.5 py-1 font-poppins text-[12px] font-semibold leading-[1.4] text-white"
                    >
                        {{ $t('pricingPage.popular') }}
                    </span>

                    <PricingTierIntro :tier="tier" card class="px-4 pb-6" />

                    <ul :aria-label="$t('pricingPage.whatYouGet')">
                        <template v-for="group in GROUPS" :key="group">
                            <!-- EasyVPS: name, the plan and its value, the "?". -->
                            <li v-if="group === 'vps'" class="pt-2">
                                <div class="flex items-center gap-3 pb-2 pl-3 pr-4">
                                    <PricingCheckBubble small />
                                    <span class="sr-only">{{ $t('pricingPage.included') }}</span>
                                    <div class="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                                        <span class="flex flex-col gap-1">
                                            <span class="font-poppins text-[14px] font-semibold leading-4 text-Neutral/700">
                                                {{ $t('pricingPage.vps.name') }}
                                            </span>
                                            <span class="font-franklin text-[14px] leading-4 text-Neutral/400">{{ $t('pricingPage.vps.by') }}</span>
                                        </span>
                                        <span class="flex flex-col gap-1">
                                            <span class="font-franklin text-[14px] font-medium leading-4 text-Blue/600">{{ planFor(tier.id).name }}</span>
                                            <i18n-t keypath="pricingPage.value" tag="span" scope="global" class="font-franklin text-[14px] leading-4 text-Neutral/400">
                                                <template #amount>
                                                    <strong class="ea-num font-medium text-Role/trader">${{ $n(planFor(tier.id).value) }}</strong>
                                                </template>
                                            </i18n-t>
                                        </span>
                                        <button
                                            :id="`pricing-vps-help-${tier.id}`"
                                            type="button"
                                            class="grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgb(105_115_175/0.1)]"
                                            :aria-label="$t('pricingPage.vps.aboutPlan', { plan: planFor(tier.id).name })"
                                            :aria-expanded="!!open[tier.id]"
                                            :aria-controls="`pricing-vps-specs-${tier.id}`"
                                            @click="toggle(tier.id)"
                                        >
                                            <img src="/img/icons/help-24.svg" alt="" width="24" height="24" class="size-6" />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    :id="`pricing-vps-specs-${tier.id}`"
                                    class="ea-collapse"
                                    :data-open="!!open[tier.id]"
                                    :inert="!open[tier.id]"
                                >
                                    <div>
                                        <div
                                            role="table"
                                            :aria-label="$t('pricingPage.vps.aboutPlan', { plan: planFor(tier.id).name })"
                                            class="relative rounded-2xl border-2 border-Tinted/100 pb-3 pt-12"
                                            @keydown.esc="close(tier.id)"
                                        >
                                            <button
                                                type="button"
                                                class="absolute right-1 top-1 grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgb(105_115_175/0.1)]"
                                                :aria-label="$t('pricingPage.vps.closeSpecs')"
                                                @click="close(tier.id)"
                                            >
                                                <img src="/img/icons/x-close-24.svg" alt="" width="24" height="24" class="size-6" />
                                            </button>

                                            <div
                                                v-for="(spec, i) in VPS_SPEC_ROWS"
                                                :key="spec"
                                                role="row"
                                                class="grid grid-cols-[minmax(0,1fr)_120px]"
                                            >
                                                <div role="rowheader" class="px-3 pb-3 pt-2.5 font-franklin text-[14px] leading-[1.4] text-[#2D2D2D]">
                                                    {{ $t(`pricingPage.specs.${spec}`) }}
                                                </div>
                                                <div role="cell" class="px-3">
                                                    <div
                                                        :class="[
                                                            'flex h-full items-center border-b-2 border-[rgb(210_223_254/0.25)] bg-Blue/50 px-3 pt-2.5 font-franklin text-[14px] font-medium leading-[1.4] text-[#1E1E1E]',
                                                            i === 0 && 'rounded-t-lg',
                                                            i === VPS_SPEC_ROWS.length - 1 ? 'rounded-b-lg pb-2.5' : 'pb-3'
                                                        ]"
                                                    >
                                                        <template v-if="typeof planFor(tier.id).specs[spec] === 'boolean'">
                                                            <img
                                                                v-if="planFor(tier.id).specs[spec]"
                                                                src="/img/icons/check-12.svg"
                                                                alt=""
                                                                width="12"
                                                                height="12"
                                                                class="my-1 size-3"
                                                            />
                                                            <span class="sr-only">
                                                                {{ planFor(tier.id).specs[spec] ? $t('pricingPage.included') : $t('pricingPage.notIncluded') }}
                                                            </span>
                                                        </template>
                                                        <span v-else class="ea-num whitespace-nowrap">{{ planFor(tier.id).specs[spec] }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>

                            <template v-else>
                                <li
                                    v-for="feature in featuresFor(tier.id as PricingTierId)[group as 'before' | 'after']"
                                    :key="feature.id"
                                    class="flex items-center gap-3 py-2 pl-3 pr-4"
                                >
                                    <PricingCheckBubble small />
                                    <span class="flex min-w-0 flex-col gap-1">
                                        <span class="font-poppins text-[14px] font-semibold leading-[18px] text-Neutral/700">
                                            {{ $t(`pricingPage.features.${feature.id}`) }}
                                        </span>
                                        <i18n-t
                                            v-if="feature.value"
                                            keypath="pricingPage.value"
                                            tag="span"
                                            scope="global"
                                            class="font-franklin text-[14px] leading-4 text-Neutral/400"
                                        >
                                            <template #amount>
                                                <strong class="ea-num font-medium text-Role/trader">${{ $n(feature.value) }}</strong>
                                            </template>
                                        </i18n-t>
                                    </span>
                                </li>
                            </template>
                        </template>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</template>
