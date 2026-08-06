<script setup lang="ts">
// Two headline figures, sitting between Pricing and Research. It reads as a
// breath between two heavy sections, so it stays deliberately short.
//
// It carries its own very light lavender ground (#F6F7FF, Figma's fill on
// "Section - Accolades"). That is deliberately the same value the pricing
// shell gradient opens on, so the band reads as the tail of the pricing block
// settling out rather than as a new stripe. (An older revision of this file
// painted nothing, because the band then sat directly under the particle
// section whose page tint was still fading back to white and a coloured band
// would have cut that fade with a hard edge. The band has since moved and is
// nowhere near that fade, so the fill is back.)
//
// The trader count is formatted through i18n's number formatter, so it groups
// as 7,435 / 7.435 per locale rather than being hard-coded either way.
//
// Both labels are stored lowercase in the locale files and uppercased in CSS —
// Figma draws them uppercase via textCase, and translators need the natural
// casing, so the transform belongs here and not in the strings.
const { n } = useI18n()
</script>

<template>
    <div class="bg-[#F6F7FF]">
        <!-- 48px of vertical padding, a 64px line box for the figure and 12px
             down to the label is exactly the drawn 190px band at 1920. -->
        <div class="ea-container grid grid-cols-1 gap-10 py-10 text-center tablet:grid-cols-2 tablet:gap-0 tablet-wide:py-12">
            <div v-reveal class="px-6">
                <!-- Tracking is -2px on the numeral but only -1px on the word
                     below: Poppins' digits need the tighter fit, the caps do not. -->
                <p class="ea-num font-poppins text-[2rem] font-semibold leading-none tracking-[-1px] text-Tinted/950 tablet-wide:text-[3rem] tablet-wide:leading-[64px] tablet-wide:tracking-[-2px]">
                    {{ n(SITE_STATS.traders, { style: 'decimal' }) }}
                </p>
                <p class="mt-3 font-poppins text-[12px] uppercase leading-4 tracking-[1px] text-Tinted/600">
                    {{ $t('accolades.tradersLabel') }}
                </p>
            </div>

            <div v-reveal="120" class="px-6">
                <p class="font-poppins text-[2rem] font-semibold uppercase leading-none tracking-[-1px] text-Tinted/950 tablet-wide:text-[3rem] tablet-wide:leading-[64px]">
                    {{ $t('accolades.volumeValue') }}
                </p>
                <p class="mt-3 font-poppins text-[12px] uppercase leading-4 tracking-[1px] text-Tinted/600">
                    {{ $t('accolades.volumeLabel') }}
                </p>
            </div>
        </div>
    </div>
</template>
