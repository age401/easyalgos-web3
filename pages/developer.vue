<script setup lang="ts">
// Expert Advisors — developer landing page (Figma 3157:7222).
//
// Scoped to the top of that frame on purpose: the hero and the invite banner
// under it. The rest of the drawn page (the "More from EA Developer" grid, the
// closing banner, the footer) is not built yet, so this route deliberately ends
// after the banner rather than borrowing the home page's lower sections.
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
            <LazyDeveloperBanner :hydrate-on-visible="{ rootMargin: '300px' }" />
        </main>
    </div>
</template>
