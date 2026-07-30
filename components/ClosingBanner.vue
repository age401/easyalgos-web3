<script setup lang="ts">
// Closing CTA.
//
// The background is three layers — a blue-to-violet base with a navy bloom
// darkening the bottom-left and a cyan bloom lifting the top-right (bg-ea-banner).
// That layering is what stops 636px of gradient reading as flat; a single linear
// pass at this size bands visibly.
//
// The trader count comes from the same SITE_STATS as the accolades band, so the
// two can never disagree.
const { n } = useI18n()
</script>

<template>
    <section class="relative overflow-hidden bg-ea-banner">
        <div class="ea-container flex flex-col items-center py-[88px] text-center tablet-wide:py-[128px]">
            <p v-reveal class="ea-eyebrow !text-white/80">{{ $t('banner.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-h2 ea-h2--display mt-7 max-w-[900px] !text-white tablet-wide:mt-9">
                {{ $t('banner.titleLine1') }}<br class="hidden tablet:inline" />
                <span class="ea-num text-white/70">{{ n(SITE_STATS.traders, { style: 'decimal' }) }}</span>
                {{ $t('banner.titleLine2') }}
            </h2>

            <p v-reveal="170" class="ea-lead mt-7 max-w-[560px] !text-white/90">
                {{ $t('banner.leadLine1') }}<br class="hidden tablet:inline" />
                {{ $t('banner.leadLine2') }}
            </p>

            <div v-reveal="240" class="mt-10 tablet-wide:mt-12">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" variant="white" :arrow="false" />
            </div>
        </div>
    </section>
</template>
