<script setup lang="ts">
// Two headline figures on a tinted band, between the dark particle section and
// the white "What you get". It reads as a breath between two heavy sections, so
// it stays deliberately short.
//
// The trader count is formatted through i18n's number formatter, so it groups as
// 7,435 / 7.435 per locale rather than being hard-coded either way.
const { n } = useI18n()
</script>

<template>
    <div class="bg-Tinted/50">
        <div class="ea-container grid grid-cols-1 gap-8 py-12 text-center tablet:grid-cols-2 tablet:gap-6 tablet-wide:py-14">
            <div v-reveal>
                <p class="ea-num font-poppins text-[2rem] font-semibold leading-none tracking-[-1px] text-Tinted/950 tablet-wide:text-[3rem] tablet-wide:tracking-[-2px]">
                    {{ n(SITE_STATS.traders, { style: 'decimal' }) }}
                </p>
                <p class="mt-4 font-poppins text-[12px] uppercase leading-4 tracking-[0.08em] text-Tinted/600">
                    {{ $t('accolades.tradersLabel') }}
                </p>
            </div>

            <div v-reveal="120">
                <p class="font-poppins text-[2rem] font-semibold uppercase leading-none tracking-[-1px] text-Tinted/950 tablet-wide:text-[3rem] tablet-wide:tracking-[-1px]">
                    {{ $t('accolades.volumeValue') }}
                </p>
                <p class="mt-4 font-poppins text-[12px] uppercase leading-4 tracking-[0.08em] text-Tinted/600">
                    {{ $t('accolades.volumeLabel') }}
                </p>
            </div>
        </div>
    </div>
</template>
