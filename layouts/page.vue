<script setup lang="ts">
// The inner-page template: topbar, content, closing banner, footer.
//
// This is the other half of "establish the page heading as a template". The
// PageHeading COMPONENT is the module; this is the shell it opens, and between
// them a new inner page is a <PageHeading> plus its modules and nothing else —
// no page ever re-assembles the chrome by hand, which is how the topbar and
// footer drifted between pages on the old site.
//
// The banner and the footer are the same instances the home page uses (Figma
// "Banner - Discover why traders choose us" and "Footer", both present on the
// Results artboard), lazily hydrated on visibility exactly as they are there —
// the pattern and the 300px margin are explained at the top of pages/index.vue.
//
// `overflow-x-clip` rather than `hidden` for the same reason as the home page:
// `hidden` creates a scroll container and would break any `position: sticky`
// inside a module. The results ledger's frozen columns are exactly that.
</script>

<template>
    <div class="relative overflow-x-clip">
        <a
            href="#main"
            class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-Tinted/950 focus:px-4 focus:py-2 focus:text-white"
        >
            {{ $t('common.skipToContent') }}
        </a>

        <SiteHeader />

        <main id="main">
            <slot />
        </main>

        <LazyClosingBanner :hydrate-on-visible="{ rootMargin: '300px' }" />
        <LazySiteFooter :hydrate-on-visible="{ rootMargin: '300px' }" />
    </div>
</template>
