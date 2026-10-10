<script setup lang="ts">
// The Affiliate Program — Figma "Home" (16:1149) in EasyAlgos Affiliates - WEB3
// (Xwelw9D6Cg9wBKI7snTnnb). Recruits AFFILIATES: people with an audience of
// traders, paid a revenue share on every trade their referrals place.
//
// What the frame draws, in order:
//
//   Topbar (dark)                              SiteHeader tone="dark"
//   section - Hero (16:1151)                   AffiliateHero (+ AffiliateHeroGraphic)
//   section - Proof Metrics (22:1443)          AffiliateMetrics
//   section - Passive Income (22:1609)         AffiliateStepsSection
//   section - Recurring Commissions (26:1535)  AffiliateTiersSection
//   section - Recurring Commissions (35:1739)  AffiliateReasonsSection ("7 Reasons")
//   section - Affiliate Testimonials (48:1564) AffiliateTestimonials
//   section - FAQ (65:1555)                    PricingFaqSection, with this page's items
//   Footer                                     SiteFooter
//
// No closing banner — the frame goes straight from the FAQ to the footer — so
// this assembles its own shell, as /for-developers does, rather than taking the
// `page` layout (which adds one).
//
// Same hydration rules as the other pages: the header and the hero hydrate
// normally because they are the first screen, and everything below hydrates on
// visibility with a 300px margin, which is also what lets v-reveal arm its
// hidden state off-screen. The metrics strip is the one exception worth naming:
// it is the foot of the hero's dark band and is usually on the first screen, so
// it hydrates eagerly too.
import { AFF_FAQ } from '~/data/affiliates'

const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('affiliates.seoTitle')}`,
    ogTitle: () => `${t('affiliates.hero.titleLine1')} ${t('affiliates.hero.titleLine2')}`,
    description: () => t('affiliates.hero.lead'),
    ogDescription: () => t('affiliates.hero.lead')
})
</script>

<template>
    <div class="relative overflow-x-clip">
        <a
            href="#top"
            class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-Tinted/950 focus:px-4 focus:py-2 focus:text-white"
        >
            {{ $t('common.skipToContent') }}
        </a>

        <SiteHeader tone="dark" />

        <main>
            <AffiliateHero />
            <AffiliateMetrics />
            <LazyAffiliateStepsSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyAffiliateTiersSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyAffiliateReasonsSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyAffiliateTestimonials :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyPricingFaqSection
                ns="affiliates.faq"
                :items="AFF_FAQ"
                initial-open="howCommissions"
                :hydrate-on-visible="{ rootMargin: '300px' }"
            />
        </main>

        <LazySiteFooter :hydrate-on-visible="{ rootMargin: '300px' }" />
    </div>
</template>
