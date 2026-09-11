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

                <p class="mt-4 flex items-center gap-3 text-center font-franklin text-body-16 text-Tinted/700">
                    <!-- Exported from the module's "img - Warning" frame rather
                         than redrawn, and inlined rather than requested: it is
                         20x20 of path data, so a file would cost a round trip to
                         save ~300 bytes. -->
                    <svg
                        class="shrink-0"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M8.52242 1.75163L0.228014 16.1169C0.0781882 16.3763 -0.000704692 16.6706 -0.000732415 16.9702C-0.000760137 17.2698 0.0780783 17.5641 0.227857 17.8235C0.377635 18.083 0.593075 18.2984 0.852517 18.4482C1.11196 18.598 1.40626 18.6768 1.70584 18.6768H18.2933C18.5929 18.6768 18.8872 18.598 19.1466 18.4482C19.4061 18.2984 19.6215 18.083 19.7713 17.8235C19.9211 17.5641 19.9999 17.2698 19.9999 16.9702C19.9999 16.6706 19.921 16.3763 19.7711 16.1169L11.4776 1.75163C11.3279 1.49226 11.1125 1.27688 10.8531 1.12714C10.5937 0.977394 10.2995 0.89856 10 0.89856C9.70053 0.89856 9.40631 0.977394 9.14694 1.12714C8.88756 1.27688 8.67218 1.49226 8.52242 1.75163Z"
                            fill="#DC2626"
                        />
                        <path
                            d="M10.1081 6.18225H9.89176C9.35907 6.18225 8.92725 6.61408 8.92725 7.14676V11.757C8.92725 12.2897 9.35907 12.7215 9.89176 12.7215H10.1081C10.6408 12.7215 11.0726 12.2897 11.0726 11.757V7.14676C11.0726 6.61408 10.6408 6.18225 10.1081 6.18225Z"
                            fill="#FFF7ED"
                        />
                        <path
                            d="M9.99994 16.3778C10.5924 16.3778 11.0726 15.8975 11.0726 15.3051C11.0726 14.7127 10.5924 14.2324 9.99994 14.2324C9.40751 14.2324 8.92725 14.7127 8.92725 15.3051C8.92725 15.8975 9.40751 16.3778 9.99994 16.3778Z"
                            fill="#FFF7ED"
                        />
                    </svg>

                    <!-- The two figures are emphasised inside the sentence, so
                         the sentence has to stay one translatable string with
                         slots rather than three concatenated fragments — word
                         order moves between languages.

                         Roboto Medium, not the drawn SemiBold: only 400 and 500
                         ship (see the font block at the top of main.css), and
                         asking for 600 makes the browser synthesise a distorted
                         face rather than load one. -->
                    <i18n-t keypath="results.scarcity" tag="span" scope="global">
                        <template #remaining>
                            <strong class="ea-num font-medium">{{ $n(RESULTS_META.spotsRemaining) }}</strong>
                        </template>
                        <template #total>
                            <strong class="ea-num font-medium">{{ $n(RESULTS_META.spotsTotal) }}</strong>
                        </template>
                    </i18n-t>
                </p>
            </div>
        </div>
    </section>
</template>
