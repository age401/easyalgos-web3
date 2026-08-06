<script setup lang="ts">
// Closing CTA.
//
// The background is the three-paint stack Figma draws on node 226:5462 —
// a blue-to-violet linear base, a navy radial darkening the bottom-left and a
// cyan radial lifting the top-right. That layering is what stops 636px of
// gradient reading as flat; a single linear pass at this size bands visibly.
// It lives in the `ea-banner` token, where the derivation is written up.
//
// The trader count comes from the same SITE_STATS as the accolades band, so the
// two can never disagree.
const { n } = useI18n()
</script>

<template>
    <section class="relative overflow-hidden bg-ea-banner">
        <div class="ea-container flex flex-col items-center py-[88px] text-center tablet-wide:py-[128px]">
            <!-- `--bare` drops the 16px rule the eyebrow normally carries: the
                 drawn banner label is the bare words, unlike the section eyebrows. -->
            <p v-reveal class="ea-eyebrow ea-eyebrow--bare !text-white">{{ $t('banner.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-h2 ea-h2--display mt-5 max-w-[900px] !text-white tablet-wide:mt-6">
                {{ $t('banner.titleLine1') }}<br class="hidden tablet:inline" />
                <span class="ea-num text-[#D2DFFE]">{{ n(SITE_STATS.traders, { style: 'decimal' }) }}</span>
                {{ $t('banner.titleLine2') }}
            </h2>

            <!-- Figma sets this paragraph at Roboto 18/28, one step below what
                 `.ea-lead` gives at desktop (20/30). `.ea-lead` is shared with
                 other sections, so the step down is overridden here only. -->
            <p v-reveal="170" class="ea-lead mt-6 max-w-[560px] !text-white/[0.86] tablet:leading-[28px] tablet-wide:mt-8 desktop:text-[18px] desktop:leading-[28px]">
                {{ $t('banner.leadLine1') }}<br class="hidden tablet:inline" />
                {{ $t('banner.leadLine2') }}
            </p>

            <div v-reveal="240" class="mt-10 tablet-wide:mt-16">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" variant="white" :arrow="false" />
            </div>
        </div>
    </section>
</template>
