<script setup lang="ts">
// Results — Figma artboard "Results" (node 3033:13540).
//
// The artboard is topbar / page heading / results table / testimonials /
// trustpilot / banner / footer. The chrome comes from `layouts/page.vue`; this
// page is the two modules that are actually new. The testimonial and trustpilot
// sections between them are already built for the home page and are not part of
// this pass.
definePageMeta({ layout: 'page' })

const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('results.heading')}`,
    ogTitle: () => t('results.heading'),
    description: () => t('results.lead'),
    ogDescription: () => t('results.lead')
})
</script>

<template>
    <div>
        <PageHeading>
            <template #title>{{ $t('results.heading') }}</template>
            <template #lead>{{ $t('results.lead') }}</template>
        </PageHeading>

        <ResultsTable />
    </div>
</template>
