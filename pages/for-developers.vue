<script setup lang="ts">
// EasyAlgos for Developers — Figma frame 3191:11677.
//
// A DIFFERENT PAGE from /developer, and worth being explicit about because the two
// have been mixed up once already. Both are "the developer page" in conversation;
// they are not the same page and do not share a hero:
//
//   /developer       "Developer landing page", frame 3157:7222. Sells ONE named
//                    developer's Expert Advisors to TRADERS. Hero is a left copy
//                    column beside that developer's profile card — DeveloperHero.
//   /for-developers  this page, frame 3191:11677. Recruits EA DEVELOPERS to
//                    publish on EasyAlgos. Hero is centred, "Build Expert Advisors
//                    once. Earn recurring revenues for life.", over a wireframe
//                    field, with Apply now / Book a demo and the Trustpilot bar.
//
// What the frame draws, in order:
//
//   Topbar                                      SiteHeader
//   module Hero (3196:7953)                     ForDevHero
//   module - How We Make It Easier (3191:11681) ForDevProblemSection
//   module - The Solution (3199:8780)           ForDevSolutionSection
//   Banner - Discover why traders choose us     ClosingBanner
//   Footer                                      SiteFooter
//
// Same assembly rules as pages/index.vue: the header and hero hydrate normally
// because they are the first thing touched, and everything below hydrates on
// visibility with a 300px margin, which is also what lets the v-reveal directive
// arm its hidden state off-screen instead of the content flashing in
// already-visible.
const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('forDevHero.titleLine1')} ${t('forDevHero.titleLine2')}`,
    ogTitle: () => `${t('forDevHero.titleLine1')} ${t('forDevHero.titleLine2')}`,
    description: () => t('forDevHero.lead'),
    ogDescription: () => t('forDevHero.lead')
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
            <ForDevHero />
            <LazyForDevProblemSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <!-- The 300px hydration margin earns its keep twice over on this
                 module: its scroll listeners and its canvas are mounted before the
                 reader arrives, AND the page tint is already measuring, so the
                 darkening starts on the drawn ramp rather than on the frame the
                 section happens to hydrate. -->
            <LazyForDevSolutionSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <!-- "Banner - Discover why traders choose us" (3191:11776) is this
                 codebase's ClosingBanner — same eyebrow, same headline, same live
                 trader count off SITE_STATS. It paints its own full-bleed gradient,
                 which is also what lets the module above end cleanly: the page
                 tint's wash back to white plays out behind an opaque block. -->
            <LazyClosingBanner :hydrate-on-visible="{ rootMargin: '300px' }" />
        </main>

        <LazySiteFooter :hydrate-on-visible="{ rootMargin: '300px' }" />
    </div>
</template>
