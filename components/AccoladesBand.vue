<script setup lang="ts">
// Two headline figures, sitting between Pricing and Research. It reads as a
// breath between two heavy sections, so it stays deliberately short.
//
// v3 (Figma 812:5809) rebuilds it around a centred heading and gives each
// figure an animated mark: a white ground, "Numbers tell the best story", then
// the two cards side by side with a hairline between them. The band no longer
// paints the lavender ground it carried before — the drawn section is white,
// and with a heading above the figures it reads as a section in its own right
// rather than as the tail of the pricing block.
//
// The trader count is formatted through i18n's number formatter, so it groups
// as 7,435 / 7.435 per locale. The Figma text layer shows a bare "7435"; that
// is the unformatted placeholder, not an instruction to drop grouping.
//
// The labels are stored in natural sentence case and set as drawn — the v2
// band uppercased them in CSS, which the new 28px treatment does not do.
//
// ------------------------------------------------------------ Choreography --
// Each card arrives as one gesture: its mark starts spinning up while its
// figure resolves out of flickering glyphs, and the phrase rises in underneath
// a beat later. Card B then repeats the whole thing, starting halfway through
// card A's mark.
//
// Halfway is a good handover rather than an arbitrary one: card A's figure has
// finished resolving by then (~1.5s), and its mark has covered 95% of its
// rotation, so what card B interrupts is only the long imperceptible tail of
// the ease-out. The pair still reads in order, but the section lands in about
// five and a half seconds instead of the seven a fully serial version costs.
//
// The marks and figures are each triggered by their own observer; the phrases
// hang off the one below, because their delay is measured from their card's
// start rather than from when the phrase itself scrolls into view. The two
// cards are side by side, so every observer fires within a frame of the others
// and these offsets are all that actually separates them.
const { n } = useI18n()

/** ms card B trails card A by — half of --ea-mark-dur in main.css (3.64s).
 *  Change the duration there and this wants changing with it. */
const CARD_B = 1820
/** ms a phrase trails its own card's figure by. */
const LABEL = 420

const row = ref<HTMLElement | null>(null)
const { visible } = useRevealOnce(row, { threshold: 0.2 })
</script>

<template>
    <section class="bg-white pb-[72px] pt-[56px] tablet:pb-[96px] tablet:pt-[64px] tablet-wide:pb-[128px] tablet-wide:pt-[80px] desktop:pb-[192px] desktop:pt-[96px]">
        <div class="ea-container">
            <SectionHeading align="center">
                <template #title>
                    {{ $t('accolades.heading') }}
                </template>
            </SectionHeading>

            <!-- 80px under the heading at desktop, as drawn. -->
            <div
                ref="row"
                class="mt-12 flex flex-col items-center gap-10 tablet-wide:mt-16 tablet-wide:flex-row tablet-wide:justify-center tablet-wide:gap-12 desktop:mt-20 desktop:gap-24"
            >
                <!-- No v-reveal on the cards: the mark, the figure and the
                     phrase each own their entrance, and fading the container as
                     well would just multiply into all three. -->
                <div class="flex w-full max-w-[420px] items-center gap-4 tablet-wide:w-[420px] desktop:gap-6">
                    <AccoladesMark class="size-[88px] shrink-0 tablet:size-[104px] desktop:size-[128px]" />
                    <div class="min-w-0 font-poppins font-medium tracking-[-1px] desktop:tracking-[-2px]">
                        <!-- Tabular figures: the two columns align, and a digit
                             flickering to another cannot change its own width. -->
                        <p class="ea-num ea-grad ea-grad--stat text-[44px] leading-none tablet:text-[56px] tablet-wide:text-[64px] desktop:text-[72px]">
                            <ScrambleText :text="n(SITE_STATS.traders, { style: 'decimal' })" />
                        </p>
                        <p
                            :class="['ea-rise mt-1.5 text-[18px] leading-tight text-Tinted/950 tablet:text-[22px] tablet-wide:text-[24px] desktop:text-[28px] desktop:leading-[32px]', { 'is-in': visible }]"
                            :style="{ '--ea-rise-delay': `${LABEL}ms` }"
                        >
                            {{ $t('accolades.tradersLabel') }}
                        </p>
                    </div>
                </div>

                <div class="hidden w-px self-center bg-Tinted/100 tablet-wide:block tablet-wide:h-[128px]" />

                <div class="flex w-full max-w-[420px] items-center gap-4 tablet-wide:w-[420px] desktop:gap-6">
                    <AccoladesGrid
                        class="size-[88px] shrink-0 tablet:size-[104px] desktop:size-[128px]"
                        :style="{ '--ea-grid-delay': `${CARD_B}ms` }"
                    />
                    <div class="min-w-0 font-poppins font-medium tracking-[-1px] desktop:tracking-[-2px]">
                        <p class="ea-grad ea-grad--stat text-[44px] leading-none tablet:text-[56px] tablet-wide:text-[64px] desktop:text-[72px]">
                            <ScrambleText :text="$t('accolades.volumeValue')" :delay="CARD_B" />
                        </p>
                        <p
                            :class="['ea-rise mt-1.5 text-[18px] leading-tight text-Tinted/950 tablet:text-[22px] tablet-wide:text-[24px] desktop:text-[28px] desktop:leading-[32px]', { 'is-in': visible }]"
                            :style="{ '--ea-rise-delay': `${CARD_B + LABEL}ms` }"
                        >
                            {{ $t('accolades.volumeLabel') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
