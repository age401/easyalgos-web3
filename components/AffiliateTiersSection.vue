<script setup lang="ts">
// "section - Recurring Commissions" (26:1535) — the tier table.
//
// Three tiers by reach (VIP / Tier 2 / Tier 1) against three commission bands,
// each cell a profit share. From the file (revised 2026-10): a 16px lavender
// frame (105deg #F6F7FF -> #E7E9F9 -> #F2F3FF, 20px corners) around a Tinted/25
// sheet with a 2px white rule and 12px corners; rows 1px apart on a Tinted/50
// rule, each a white-to-Tinted/25 wash. Every figure is Poppins SemiBold 18 at
// -0.5px over a Roboto 12/140% Tinted/500 unit, in 140px columns 8 apart. The
// tier tag HUGS its name (Poppins SemiBold 18 at -1px) with the three-chevron
// glyph after it, inside a fixed 112px "Tag" box — so the tags are as long as
// their names but the reach copy after them still starts on one vertical line.
//
// It is a real <table> from `tablet-wide` up — a reader with a screen reader
// should be able to ask for "Tier 2, 50 - 250K" — and a card per tier below
// that, where three 140px columns no longer fit beside the reach copy. The
// cards are drawn in Figma (82:761, revised 82:804): each band reads "0 - 50K
// USD / Commissions" over a dark tile holding its share and "Profit share",
// with "Profit share" also titling the row.
import { AFF_BANDS, AFF_TIERS } from '~/data/affiliates'

const chevrons = (featured: boolean) =>
    featured ? '/img/affiliates/icons/tier-chevrons-white.svg' : '/img/affiliates/icons/tier-chevrons.svg'
</script>

<template>
    <section class="bg-white pb-[72px] tablet:pb-[96px] tablet-wide:pb-[128px] desktop:pb-[192px]">
        <div class="ea-container">
            <h2 v-reveal class="ea-h2">
                {{ $t('affiliates.tiers.titleBefore') }}<span class="ea-grad">{{ $t('affiliates.tiers.titleAccent') }}</span>{{ $t('affiliates.tiers.titleAfter') }}
            </h2>
            <p v-reveal="90" class="ea-lead--tight mt-6 max-w-[640px]">{{ $t('affiliates.tiers.lead') }}</p>

            <div v-reveal="160" class="aff-tiers mt-12 rounded-[20px] p-2 tablet:p-4 tablet-wide:mt-16">
                <!-- Table, tablet-wide and up. -->
                <div class="hidden overflow-hidden rounded-xl border-2 border-white bg-Tinted/25 tablet-wide:block">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <!-- Labelled for assistive tech only. The cells stay in the
                                     table; `sr-only` on the <th> itself would take it out of
                                     the column flow and shift every band left. -->
                                <th scope="col" class="w-[160px]"><span class="sr-only">{{ $t('affiliates.tiers.tierColumn') }}</span></th>
                                <th scope="col"><span class="sr-only">{{ $t('affiliates.tiers.reachColumn') }}</span></th>
                                <th v-for="band in AFF_BANDS" :key="band" scope="col" class="w-[148px] py-2 pr-2 text-center last:w-[140px] last:pr-0">
                                    <span class="aff-tiers__figure block text-Tinted/900">{{ band }}</span>
                                    <span class="aff-tiers__unit block font-normal">{{ $t('affiliates.tiers.bandUnit') }}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tier in AFF_TIERS" :key="tier.id" class="aff-tiers__row">
                                <th scope="row" class="w-[160px] pl-8 pr-4 text-left" :class="tier.featured ? 'py-2' : 'py-3'">
                                    <!-- The fixed "Tag" box (74:2116): the pill hugs its
                                         name inside it, and the reach copy starts after it. -->
                                    <span class="block w-28">
                                        <span :class="['aff-tier-pill', { 'aff-tier-pill--vip': tier.featured }]">
                                            {{ $t(`affiliates.tiers.names.${tier.id}`) }}
                                            <img :src="chevrons(tier.featured)" alt="" width="16" height="16" />
                                        </span>
                                    </span>
                                </th>
                                <td class="pr-4" :class="tier.featured ? 'py-2' : 'py-3'">
                                    <span class="aff-tiers__figure text-Tinted/700">{{ tier.reach }}</span>
                                    <span class="ml-2 font-franklin text-[16px] leading-[1.4] text-Tinted/600">{{ $t('affiliates.tiers.reach') }}</span>
                                </td>
                                <td
                                    v-for="(share, i) in tier.shares"
                                    :key="i"
                                    class="pr-2 text-center last:pr-0"
                                    :class="tier.featured ? 'py-2' : 'py-3'"
                                >
                                    <span class="aff-tiers__figure block text-Tinted/700">{{ share }}%</span>
                                    <span class="aff-tiers__unit block">{{ $t('affiliates.tiers.shareUnit') }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Cards, below tablet-wide. -->
                <ul class="grid gap-2 tablet:gap-3 tablet-wide:hidden">
                    <li v-for="tier in AFF_TIERS" :key="tier.id" class="aff-tiers__row rounded-xl border-2 border-white px-3 py-5">
                        <span :class="['aff-tier-pill', { 'aff-tier-pill--vip': tier.featured }]">
                            {{ $t(`affiliates.tiers.names.${tier.id}`) }}
                            <img :src="chevrons(tier.featured)" alt="" width="16" height="16" />
                        </span>
                        <p class="mt-3">
                            <span class="aff-tiers__figure text-Tinted/700">{{ tier.reach }}</span>
                            <span class="ml-1.5 font-franklin text-[14px] leading-[1.4] text-Tinted/600">{{ $t('affiliates.tiers.reach') }}</span>
                        </p>
                        <div class="mt-4 border-t border-Tinted/50 pt-3">
                            <p class="aff-tiers__unit">{{ $t('affiliates.tiers.shareUnit') }}</p>
                            <dl class="mt-2 grid grid-cols-3 gap-2 text-center">
                                <!-- Each band (82:804): its reach over a dark Tinted/800
                                     tile with the share, so the figure is the thing
                                     the eye lands on. -->
                                <div v-for="(share, i) in tier.shares" :key="i" class="flex flex-col gap-1 rounded-lg bg-white/70">
                                    <dt class="px-1">
                                        <span class="block font-poppins text-[12px] font-semibold leading-[1.4] tracking-[-0.5px] text-Tinted/900">
                                            {{ AFF_BANDS[i] }} {{ $t('affiliates.tiers.bandCurrency') }}
                                        </span>
                                        <span class="block font-franklin text-[10px] leading-[1.2] text-Tinted/500">{{ $t('affiliates.tiers.bandUnitShort') }}</span>
                                    </dt>
                                    <dd class="rounded-lg bg-Tinted/800 pb-1.5 pt-1">
                                        <span class="aff-tiers__figure block text-white">{{ share }}%</span>
                                        <span class="block font-franklin text-[10px] leading-[1.2] text-Tinted/100">{{ $t('affiliates.tiers.shareUnit') }}</span>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
</template>
