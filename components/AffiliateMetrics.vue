<script setup lang="ts">
// "section - Proof Metrics" (22:1443) — the strip that closes the dark hero
// band: one panel, a context cell (live dot, "Network performance", a line of
// copy and a timestamp) and three figures.
//
// From the file: panel #1B1D21 on a #343943 hairline, 24px corners, 164 tall;
// the context cell a fixed 280, the figure cells sharing the rest over a 1px
// rule; figures Poppins SemiBold 48/48 at -2px in the brand gradient, labels
// 10px Neutral/500 at 1.5px tracking, captions Roboto 16 Neutral/300.
//
// Ours below `desktop`: the context cell takes the full width over a three-up
// row. Under `tablet` everything stacks with the rules turned horizontal, and
// stacked it is kept compact: tighter padding, and each figure sits to the
// LEFT of its label and caption instead of above them, so a cell is one 64px
// row rather than a 140px block. Their `self-end`/`self-start` are for that
// grid only; from `tablet` the cell is a flex column, where `self-end` would
// push the label to the RIGHT, so both are reset to stretch there.
//
// Revised 2026-10: title Poppins SemiBold Neutral/200, body and timestamp
// Neutral/300, labels Poppins SemiBold Neutral/300, captions Roboto SemiBold
// (the shipped 500 face, as elsewhere) Neutral/200.
import { AFF_METRICS } from '~/data/affiliates'
</script>

<template>
    <section data-dark-band class="ea-dark bg-Neutral/900 pb-16 antialiased tablet:pb-20 desktop:pb-24">
        <div class="ea-container">
            <div
                v-reveal
                class="grid overflow-hidden rounded-3xl border border-[#343943] bg-[#1B1D21]
                       tablet:grid-cols-3 desktop:min-h-[164px] desktop:grid-cols-[280px_repeat(3,minmax(0,1fr))]"
            >
                <div class="flex flex-col justify-center gap-2 px-6 py-4 tablet:col-span-3 tablet:gap-6 tablet:px-8 tablet:py-5 desktop:col-span-1">
                    <p class="flex items-center gap-2.5 font-poppins text-[10px] font-semibold uppercase leading-[1.4] tracking-[1.5px] text-Neutral/200">
                        <span class="aff-live-dot" aria-hidden="true" />
                        {{ $t('affiliates.metrics.title') }}
                    </p>
                    <p class="font-franklin text-[14px] leading-[1.4] text-Neutral/300">{{ $t('affiliates.metrics.body') }}</p>
                    <p class="font-poppins text-[8px] font-medium uppercase leading-[1.4] tracking-[1.5px] text-Neutral/300">
                        {{ $t('affiliates.metrics.updated') }}
                    </p>
                </div>

                <div
                    v-for="(id, i) in AFF_METRICS"
                    :key="id"
                    v-reveal="120 + i * 90"
                    class="grid grid-cols-[124px_minmax(0,1fr)] items-center gap-x-4 border-t border-[#343943] px-6 py-4
                           tablet:flex tablet:flex-col tablet:items-stretch tablet:justify-center tablet:border-l tablet:px-8 tablet:py-6
                           tablet:[&:nth-child(2)]:border-l-0 desktop:border-t-0 desktop:[&:nth-child(2)]:border-l"
                >
                    <p class="ea-grad ea-num row-span-2 self-center justify-self-start font-poppins text-[32px] font-semibold leading-[40px] tracking-[-1.5px]
                              tablet:self-start tablet:text-[40px] tablet:leading-[48px] tablet:tracking-[-2px] tablet-wide:text-[48px]">
                        {{ $t(`affiliates.metrics.items.${id}.value`) }}
                    </p>
                    <p class="col-start-2 self-end font-poppins text-[10px] font-semibold uppercase leading-[1.4] tracking-[1.5px] text-Neutral/300 tablet:mt-0.5 tablet:self-stretch">
                        {{ $t(`affiliates.metrics.items.${id}.label`) }}
                    </p>
                    <p class="col-start-2 self-start font-franklin text-[14px] font-medium leading-[1.4] text-Neutral/200 tablet:mt-4 tablet:self-stretch tablet:text-[16px]">
                        {{ $t(`affiliates.metrics.items.${id}.caption`) }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
