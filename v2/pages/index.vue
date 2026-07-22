<script setup lang="ts">
// EasyAlgos home v2 ("The Ledger") — thin assembler; each section is self-contained.
useHead({ bodyAttrs: { class: 'antialiased' } })
</script>

<template>
    <div class="relative">
        <a href="#top" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-Ink/950 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
        <SiteHeader />
        <main>
            <HeroSection />
            <OldEcosystemSection />
            <SolutionsStackSection />
            <ProofStrip />
            <ModelSection />
            <TrackRecordSection />
            <InfrastructureSection />
            <MembershipSection />
            <ProcessSection />
            <VoicesSection />
            <ClosingSection />
        </main>
        <SiteFooter />
    </div>
</template>
