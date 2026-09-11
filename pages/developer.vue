<script setup lang="ts">
// Expert Advisors — developer landing page (Figma 3191:11677, which supersedes
// the 3157:7222 frame the hero and banner were drawn on).
//
// Built out of that frame in the order it draws: topbar, hero, "The Solution",
// the closing banner, footer. ONE module of the drawn page is still missing —
// "module - How We Make It Easier For You" (3191:11681), the three-question block
// that sits between the hero and the solution — so there is a gap in the argument
// between those two for now rather than a placeholder standing in for it.
//
// Same assembly rules as pages/index.vue: the header and hero hydrate normally
// because they are the first thing touched, and everything below hydrates on
// visibility with a 300px margin, which is also what lets the v-reveal
// directive arm its hidden state off-screen instead of the content flashing in
// already-visible.
const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('devHero.title', { name: DEVELOPER.name })}`,
    ogTitle: () => t('devHero.title', { name: DEVELOPER.name }),
    description: () => DEVELOPER.bio,
    ogDescription: () => DEVELOPER.bio
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

        <SiteHeader />

        <main>
            <DeveloperHero />
            <!-- Kept on visibility hydration like every section below the fold,
                 and the 300px margin earns its keep twice over here: the module's
                 scroll listeners and its canvas are mounted before the reader
                 arrives, AND the page tint is already measuring, so the darkening
                 starts on the drawn ramp instead of the frame the section
                 hydrates on. -->
            <LazyDeveloperSolutionSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <!-- The banner the frame draws here is "Banner - Discover why traders
                 choose us" (3191:11776), which is the home page's ClosingBanner —
                 same eyebrow, same headline, same live trader count. It replaces
                 the white invite card that was on this page from the older
                 3157:7222 frame; `DeveloperBanner` is left in the repo but is now
                 unused, since which of the two the page should close on is a
                 design call rather than a cleanup.

                 It also happens to be what makes the module above end cleanly: it
                 paints its own full-bleed gradient, so the page tint's wash back
                 to white plays out behind an opaque block instead of under a
                 near-white card. -->
            <LazyClosingBanner :hydrate-on-visible="{ rootMargin: '300px' }" />
        </main>

        <LazySiteFooter :hydrate-on-visible="{ rootMargin: '300px' }" />
    </div>
</template>
