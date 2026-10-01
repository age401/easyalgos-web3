<script setup lang="ts">
// Module — Figma "module - Results table" (node 3039:14223).
//
// The module is the dark panel (titlebar + table) plus the CTA and scarcity
// line beneath it. The table itself is ResultsAccountsTable, kept separate so
// this file stays about the panel's chrome and that one stays about the rows.
import type { ResultsAccount } from '~/types/results'

interface Props {
    rows?: ResultsAccount[]
}
withDefaults(defineProps<Props>(), {
    rows: () => RESULTS_ACCOUNTS
})

const { stamp } = useResultsFormat()
const updated = computed(() => stamp(RESULTS_META.updatedAt))
</script>

<template>
    <section class="bg-white pb-[72px] tablet:pb-[96px] tablet-wide:pb-[128px] desktop:pb-[192px]">
        <!-- `.ea-container` everywhere except the phone step, which is 12px
             here against its 20. This is the one module on the site whose
             content is measured in columns rather than in a text column, and
             those 8px a side are 16px of broker name — the difference between
             "Blueberry Markets" and "Blueberry Mark...". From `tablet` up the
             gutters are `.ea-container`'s exactly; keep them in step with it. -->
        <div class="mx-auto w-full max-w-[1480px] px-3 tablet:px-8 tablet-wide:px-10 desktop:px-[60px]">
            <!-- The panel. `Table/Background` at radius 16 under the same
                 five-layer suspended-sheet shadow the "what you get" slide uses
                 — one design-system fill, not a lookalike, so `shadow-ea-slide`
                 is reused rather than a sixth shadow token being added. -->
            <div v-reveal class="rounded-2xl bg-Table/Background px-3 py-4 shadow-ea-slide tablet:p-6">
                <!-- 20px under the titlebar, as drawn. The 4px side padding is
                     the phone panel's: the table body runs to the panel's inner
                     edge there, and this puts the title on the same x as the
                     rank column's digits (12 + 4) rather than 4px outboard of
                     the whole table. It goes away at `tablet`, where the panel's
                     own 24px does the aligning. -->
                <div
                    class="flex flex-col gap-1 px-1 pb-5 tablet:flex-row tablet:items-center tablet:gap-6 tablet:px-0"
                >
                    <!-- On the ramp now except for its weight: size, leading and
                         tracking are `Display/Size/18` exactly (18 / 140% /
                         -0.5px), and SemiBold is the one deliberate override —
                         it is a panel title, not body copy. Visible here rather
                         than buried in a one-off `text-[18px]`. -->
                    <h2 class="grow font-poppins text-display-18 font-semibold text-white">
                        {{ $t('results.panelTitle') }}
                    </h2>

                    <p
                        class="flex shrink-0 flex-wrap items-center gap-x-3 font-franklin text-body-12 text-Tinted/300"
                    >
                        <span>{{ $t('results.lastUpdate') }}</span>
                        <time :datetime="RESULTS_META.updatedAt">{{ updated.date }}</time>
                        <span>{{ updated.time }}</span>
                        <span>{{ updated.zone }}</span>
                    </p>
                </div>

                <ResultsAccountsTable :rows="rows" />
            </div>

            <!-- CTA. 48px under the panel, as drawn. -->
            <div v-reveal="120" class="mt-12 flex flex-col items-center">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />

                <ScarcityNote class="mt-4" />
            </div>
        </div>
    </section>
</template>
