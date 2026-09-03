<script setup lang="ts">
// EasyAlgos home v3 — a thin assembler. Every section is self-sufficient: it owns
// its own data (via a data module or composable) and takes no props.
//
// Hydration strategy: the header and hero hydrate normally because they are the
// first thing touched. Everything below hydrates on visibility with a 300px
// margin, so a section's JS is compiled just before it scrolls into view rather
// than all at once on load — that is what keeps TBT/INP low on a page this long.
// The margin matters twice over: each section is interactive before the reader
// reaches it, AND the v-reveal directive gets to arm its hidden state off-screen,
// so the reveal plays properly instead of the content flashing in already-visible.
//
// The root element carries `overflow-x: clip` rather than `hidden`. Several
// sections bleed past the text column by design (the hero collage, the analytics
// panel), which on a narrow viewport adds a few pixels of horizontal scroll.
// `clip` removes that without creating a scroll container — `hidden` would, and
// that would break the `position: sticky` stage in the particle section.
const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('hero.titleLine1')} ${t('hero.titleLine2')} ${t('hero.titleLine3')} ${t('hero.titleLine4')}`,
    ogTitle: () => `EasyAlgos — ${t('hero.titleLine3')} ${t('hero.titleLine4')}`,
    description: () => `${t('hero.leadLine1')} ${t('hero.leadLine2')}`,
    ogDescription: () => `${t('pricing.leadLine1')} ${t('pricing.leadLine2')}`
})
</script>

<template>
    <div class="relative overflow-x-clip">
        <a
            href="#top"
            class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-neutral-950 focus:px-4 focus:py-2 focus:text-white"
        >
            {{ $t('common.skipToContent') }}
        </a>

        <SiteHeader />

        <main>
            <HeroSection />

            <LazyTrustpilotBar :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyProblemSolutionSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyWhatYouGetSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyBrandMarquee :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyHowItWorksSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyTestimonialsSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyPricingSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <!-- The two headline figures. Reintroduced 2026-08-06, and note it
                 sits BETWEEN pricing and research now, not up against the
                 particle section as it did in v2 — so it is nowhere near the
                 page tint's fade and is free to paint its own background. -->
            <LazyAccoladesBand :hydrate-on-visible="{ rootMargin: '300px' }" /><!--
                 Kept on visibility hydration: the marks' spin-up is armed by an
                 observer inside the component, and the 300px margin is what
                 gets it mounted and observing before the reader arrives. -->
            <!-- Trustpilot review strip (Figma 885:2323), directly under the
                 accolades band as drawn. It paints the same white ground, so the
                 two read as one block: the figures, then the voices behind them.
                 The band's own bottom padding is the gap between them, which is
                 why this section carries none of its own on top. -->
            <LazyTrustpilotReviews :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyResearchSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyClosingBanner :hydrate-on-visible="{ rootMargin: '300px' }" />
        </main>

        <LazySiteFooter :hydrate-on-visible="{ rootMargin: '300px' }" />
    </div>
</template>
