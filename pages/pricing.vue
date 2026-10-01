<script setup lang="ts">
// Pricing — Figma artboard "Account Tiers" (3507:11749) on the ◽ Pricing page,
// with the EasyVPS specs panel unfolded in "Account Tiers > Specs Unfolded"
// (3507:10468). The table's own responsive frames are [1024~769] (3514:19825)
// and [768~] (3517:21235); everything else on the page already reflows.
//
// What the frame draws, in order:
//
//   Topbar                                       SiteHeader      (layout)
//   page Heading (3507:11751)                    PageHeading
//   module - Table (3507:11752)                  PricingPlansTable (+ PricingPlanCards <= 768)
//   section - Business Model (3514:16409)        BusinessModelSection
//   section - FAQ (3507:11753)                   PricingFaqSection
//   section - Testimonial (3507:11770)           TestimonialsSection, the home page's four
//   section - Requirements (3507:11855)          RequirementsSection
//   Banner - Discover why traders choose us      ClosingBanner   (layout)
//   Footer                                       SiteFooter      (layout)
//
// The heading and the table hydrate normally — they are the page. Everything
// below hydrates on visibility with the usual 300px margin (see pages/index.vue).
import { PRICING_REQUIREMENTS } from '~/data/content'

definePageMeta({ layout: 'page' })

const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('pricingPage.title')}`,
    ogTitle: () => t('pricingPage.title'),
    description: () => t('pricingPage.seoDescription'),
    ogDescription: () => t('pricingPage.seoDescription')
})
</script>

<template>
    <div>
        <PageHeading>
            <template #title>{{ $t('pricingPage.title') }}</template>
            <!-- The home page's pricing lead, word for word — two lines as drawn. -->
            <template #lead>
                {{ $t('pricing.leadLine1') }}<br class="hidden tablet:inline" />
                {{ $t('pricing.leadLine2') }}
            </template>
        </PageHeading>

        <PricingPlansTable />

        <LazyBusinessModelSection :hydrate-on-visible="{ rootMargin: '300px' }" />
        <LazyPricingFaqSection :hydrate-on-visible="{ rootMargin: '300px' }" />
        <!-- The home page's dark band and quotes, unchanged. It carries
             data-dark-band, so the header inverts over it as it does there. -->
        <LazyTestimonialsSection :hydrate-on-visible="{ rootMargin: '300px' }" />
        <LazyRequirementsSection
            ns="pricingPage.requirements"
            :items="PRICING_REQUIREMENTS"
            :hydrate-on-visible="{ rootMargin: '300px' }"
        />
    </div>
</template>
