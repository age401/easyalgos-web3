<script setup lang="ts">
// EasyAlgos home page v2 ("living financial documents") — thin assembler;
// each section is a self-contained financial artifact turned instrument.
useHead({ bodyAttrs: { class: 'antialiased' } })
</script>

<template>
    <div class="relative">
        <a href="#top" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-Tinted/950 focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
        <SiteHeader />
        <main>
            <HeroSection />
            <TickerStrip />
            <ReceiptSection />
            <ModelSection />
            <CollectionSection />
            <VerifiedResults />
            <ServicesIndex />
            <StoriesSection />
            <TermsSection />
            <JoinTimeline />
            <ClosingCta />
        </main>
        <SiteFooter />
    </div>
</template>
