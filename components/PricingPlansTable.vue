<script setup lang="ts">
// /pricing — "module - Table". Three frames, three layouts:
//
//   1025 up    "Account Tiers" (3507:11749) / "> Specs Unfolded" (3507:10468)
//   769-1024   "Account Tiers Table [1024~769]" (3514:19825)
//   768 down   "Account Tiers Table [768~]" (3517:21235) — PricingPlanCards
//
// From 769 it is a comparison table: the feature names in the first column and
// one column per tier, the tier cards over columns 2-4 and the "You don't pay,
// you qualify." line beside them in column 1. Columns are four equal tracks
// from 1025, and 220 + three equal tracks at 769-1024, always 12 apart.
//
// Two annotations on 3507:10468 set the geometry:
//
//   - Each tier card is as wide as the table column under it; the shell's
//     tinted padding hangs OUTSIDE that width ("subtracted from the width
//     calculation"). The cards are split by 1px seams and the columns by 12px
//     gutters, so "as wide" means the same pitch: each card is its column plus
//     half of each neighbouring gutter, less the seam — 5.5px either side. The
//     card row is pulled out by that much, then the white ring and the shell's
//     padding are hung outside it with negative margins of their own size.
//   - Every value cell's left padding lines its content up with the card's
//     content above it: the card's own padding less those 5.5px — 26.5 at
//     1025 up (32px cards), 10.5 at 769-1024 (16px cards). Inside the specs
//     panel the panel's 2px border comes off that too.
//
// The specs panel is one disclosure with four triggers — "view specs" and
// each plan's "?" — pointing at the same region, opening in place under the
// EasyVPS row as a nested table on the same columns. Tinted cells stack edge to
// edge and round only at the ends, which draws the file's continuous blue
// column without a separate background element.
//
// ARIA table roles on divs rather than a <table>: the header row's cards and the
// panel need block layout a <tr> will not give them.
import type { ComponentPublicInstance } from 'vue'
import type { PricingFeature, PricingTierId } from '~/types/home'
import {
    PRICING_FEATURES,
    PRICING_FEATURES_AFTER_VPS,
    PRICING_TIERS,
    VPS_PLANS,
    VPS_SPEC_ROWS
} from '~/data/content'

const PANEL_ID = 'pricing-vps-specs'

type Row = { kind: 'feature'; feature: PricingFeature } | { kind: 'vps' }
const ROWS: Row[] = [
    ...PRICING_FEATURES.map((feature) => ({ kind: 'feature' as const, feature })),
    { kind: 'vps' },
    ...PRICING_FEATURES_AFTER_VPS.map((feature) => ({ kind: 'feature' as const, feature }))
]

const TIER_IDS = PRICING_TIERS.map((tier) => tier.id as PricingTierId)

// The shared column template, and the value-cell inset that lines each cell's
// content up with its card's (see the note at the top).
const COLS = 'grid grid-cols-[220px_repeat(3,minmax(0,1fr))] gap-x-3 min-[1025px]:grid-cols-4'
const CELL_INSET = 'pl-[10.5px] pr-3 min-[1025px]:pl-[26.5px]'
const PANEL_INSET = 'pl-[8.5px] pr-3 min-[1025px]:pl-[24.5px]'

const open = ref(false)
const specsTrigger = ref<HTMLButtonElement | null>(null)

// A function ref: the button sits inside the row v-for, where a string ref
// would collect into an array.
function setTrigger(el: Element | ComponentPublicInstance | null) {
    specsTrigger.value = el as HTMLButtonElement | null
}

// Every trigger toggles the same region: a plan's "?" pressed while the panel is
// open closes it, the same as "hide specs". One region, one state.
function toggleSpecs() {
    open.value = !open.value
}

function closeSpecs() {
    if (!open.value) return
    open.value = false
    // The panel's own close button is about to become inert, which would drop
    // focus to <body>. Hand it to the trigger the panel belongs to.
    specsTrigger.value?.focus()
}
</script>

<template>
    <section class="bg-white pb-[72px] tablet:pb-[96px]">
        <!-- Gutters from the frames: 8 at 360, 24 at 769, then .ea-container's. -->
        <div class="mx-auto w-full max-w-[1480px] px-2 min-[769px]:px-6 min-[1025px]:px-10 desktop:px-[60px]">
            <PricingPlanCards v-reveal class="min-[769px]:hidden" />

            <div class="max-[768px]:hidden">
                <!-- Header: the phrase in column 1, the cards over 2-4. -->
                <div v-reveal :class="COLS">
                    <p class="self-center font-poppins text-[24px] font-semibold leading-[1.35] text-Tinted/950 min-[1025px]:text-[32px] min-[1025px]:leading-[1.3]">
                        <span class="ea-grad">{{ $t('pricing.titleAccent') }}</span>,<br />
                        {{ $t('pricing.titleRest') }}
                    </p>

                    <!-- Card row = the three columns + 5.5px each side; the white
                         ring's 2px is in the same pull. -->
                    <div class="col-span-3 -mx-[7.5px]">
                        <div class="-mx-3 rounded-[20px] bg-ea-pricing-shell p-3 min-[1025px]:-mx-4 min-[1025px]:p-4">
                            <ul class="grid grid-cols-3 gap-px overflow-hidden rounded-xl border-2 border-white bg-Tinted/25">
                                <li
                                    v-for="tier in PRICING_TIERS"
                                    :key="tier.id"
                                    class="relative bg-ea-pricing-card px-4 py-6 min-[1025px]:px-8 min-[1025px]:py-10"
                                >
                                    <!-- Not drawn at 769-1024, where the card is
                                         ~150px and the tag would crowd the name. -->
                                    <span
                                        v-if="tier.featured"
                                        class="absolute right-4 top-4 hidden rounded-lg bg-Blue/600 px-2.5 py-1 font-poppins text-[12px] font-semibold leading-[1.4] text-white min-[1025px]:block"
                                    >
                                        {{ $t('pricingPage.popular') }}
                                    </span>
                                    <PricingTierIntro :tier="tier" />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div role="table" :aria-label="$t('pricingPage.tableCaption')" class="mt-2">
                    <!-- The cards name the columns, so the tier headers are for
                         screen readers only. -->
                    <div role="row" :class="[COLS, 'border-b-2 border-Neutral/100 py-4']">
                        <span role="columnheader" class="font-poppins text-[16px] font-medium leading-[1.4] text-Neutral/400">
                            {{ $t('pricingPage.whatYouGet') }}
                        </span>
                        <span v-for="tier in PRICING_TIERS" :key="tier.id" role="columnheader" class="sr-only">
                            {{ $t(`pricing.tiers.${tier.id}.name`) }}
                        </span>
                    </div>

                    <template v-for="row in ROWS" :key="row.kind === 'feature' ? row.feature.id : 'vps'">
                        <div role="row" :class="[COLS, 'border-b border-Neutral/50 py-3']">
                            <!-- 14 / 16-18 at 769-1024, 16 / 18 from 1025. -->
                            <div role="rowheader" class="flex flex-col justify-center gap-1">
                                <span class="font-poppins text-[14px] font-semibold leading-[18px] text-Neutral/700 min-[1025px]:text-[16px]">
                                    {{ row.kind === 'vps' ? $t('pricingPage.vps.name') : $t(`pricingPage.features.${row.feature.id}`) }}
                                </span>

                                <span v-if="row.kind === 'vps'" class="flex flex-wrap gap-x-1 font-franklin text-[14px] leading-4">
                                    <span class="text-Neutral/400">{{ $t('pricingPage.vps.by') }}</span>
                                    <button
                                        :ref="setTrigger"
                                        type="button"
                                        class="font-medium text-Blue/600 underline-offset-2 hover:underline focus-visible:underline"
                                        :aria-expanded="open"
                                        :aria-controls="PANEL_ID"
                                        @click="toggleSpecs"
                                    >
                                        {{ open ? $t('pricingPage.vps.hideSpecs') : $t('pricingPage.vps.viewSpecs') }}
                                    </button>
                                </span>

                                <!-- "$19,600 value": the figure is emphasised inside the
                                     sentence, so it is one string with a slot. The
                                     violet is the file's #BC78FF, which the palette
                                     carries as Role/trader. Roboto Medium for the
                                     drawn SemiBold: only 400 and 500 ship. -->
                                <i18n-t
                                    v-else-if="row.feature.value"
                                    keypath="pricingPage.value"
                                    tag="span"
                                    scope="global"
                                    class="font-franklin text-[14px] leading-4 text-Neutral/400"
                                >
                                    <template #amount>
                                        <strong class="ea-num font-medium text-Role/trader">${{ $n(row.feature.value) }}</strong>
                                    </template>
                                </i18n-t>
                            </div>

                            <template v-if="row.kind === 'vps'">
                                <div
                                    v-for="plan in VPS_PLANS"
                                    :key="plan.tier"
                                    role="cell"
                                    :class="['flex flex-col items-start justify-center gap-1 min-[1025px]:gap-2', CELL_INSET]"
                                >
                                    <button
                                        type="button"
                                        class="group -my-1 inline-flex items-center gap-1.5 py-1 font-franklin text-[14px] font-medium leading-4 tracking-[-0.16px] text-Blue/600 min-[1025px]:text-[16px]"
                                        :aria-label="$t('pricingPage.vps.aboutPlan', { plan: plan.name })"
                                        :aria-expanded="open"
                                        :aria-controls="PANEL_ID"
                                        @click="toggleSpecs"
                                    >
                                        <span>{{ plan.name }}</span>
                                        <img
                                            src="/img/icons/help-12.svg"
                                            alt=""
                                            width="12"
                                            height="12"
                                            class="size-3 transition-opacity group-hover:opacity-60"
                                        />
                                    </button>
                                    <i18n-t keypath="pricingPage.value" tag="span" scope="global" class="font-franklin text-[14px] leading-4 text-Neutral/400">
                                        <template #amount>
                                            <strong class="ea-num font-medium text-Role/trader">${{ $n(plan.value) }}</strong>
                                        </template>
                                    </i18n-t>
                                </div>
                            </template>

                            <template v-else>
                                <div v-for="tier in TIER_IDS" :key="tier" role="cell" :class="['flex items-center', CELL_INSET]">
                                    <template v-if="row.feature.tiers.includes(tier)">
                                        <PricingCheckBubble />
                                        <span class="sr-only">{{ $t('pricingPage.included') }}</span>
                                    </template>
                                    <span v-else class="sr-only">{{ $t('pricingPage.notIncluded') }}</span>
                                </div>
                            </template>
                        </div>

                        <!-- The specs panel, directly under the EasyVPS row: a row
                             with one full-width cell holding a nested table. -->
                        <div v-if="row.kind === 'vps'" role="row">
                            <div
                                :id="PANEL_ID"
                                role="cell"
                                aria-colspan="4"
                                class="ea-collapse"
                                :data-open="open"
                                :inert="!open"
                                @keydown.esc="closeSpecs"
                            >
                                <div>
                                    <div
                                        role="table"
                                        :aria-label="$t('pricingPage.vps.panelLabel')"
                                        class="relative rounded-2xl border-2 border-Tinted/100 py-3"
                                    >
                                        <button
                                            type="button"
                                            class="absolute right-1 top-1 grid size-8 place-items-center rounded-full transition-colors hover:bg-[rgb(105_115_175/0.1)]"
                                            :aria-label="$t('pricingPage.vps.closeSpecs')"
                                            @click="closeSpecs"
                                        >
                                            <img src="/img/icons/x-close-24.svg" alt="" width="24" height="24" class="size-6" />
                                        </button>

                                        <div v-for="(spec, i) in VPS_SPEC_ROWS" :key="spec" role="row" :class="COLS">
                                            <div
                                                role="rowheader"
                                                class="ml-[22px] mr-3 border-b-2 border-transparent pb-3 pt-2.5 font-franklin text-[14px] leading-[1.4] text-[#2D2D2D]"
                                            >
                                                {{ $t(`pricingPage.specs.${spec}`) }}
                                            </div>
                                            <div v-for="plan in VPS_PLANS" :key="plan.tier" role="cell" :class="PANEL_INSET">
                                                <div
                                                    :class="[
                                                        'flex h-full w-full max-w-40 items-center border-b-2 border-[rgb(210_223_254/0.25)] bg-Blue/50 px-3 pb-3 pt-2.5 font-franklin text-[14px] font-medium leading-[1.4] text-[#1E1E1E]',
                                                        i === 0 && 'rounded-t-lg',
                                                        i === VPS_SPEC_ROWS.length - 1 && 'rounded-b-lg'
                                                    ]"
                                                >
                                                    <template v-if="typeof plan.specs[spec] === 'boolean'">
                                                        <img
                                                            v-if="plan.specs[spec]"
                                                            src="/img/icons/check-12.svg"
                                                            alt=""
                                                            width="12"
                                                            height="12"
                                                            class="my-1 size-3"
                                                        />
                                                        <span class="sr-only">
                                                            {{ plan.specs[spec] ? $t('pricingPage.included') : $t('pricingPage.notIncluded') }}
                                                        </span>
                                                    </template>
                                                    <span v-else class="ea-num">{{ plan.specs[spec] }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Closing CTA: 144px under the table at desktop (the drawn 96 + 48),
                 then the scarcity line 16 under the button. -->
            <div v-reveal="120" class="mt-16 flex flex-col items-center tablet:mt-24 desktop:mt-36">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                <ScarcityNote class="mt-4" />
            </div>
        </div>
    </section>
</template>
