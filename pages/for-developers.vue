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
//   section - Accolades (3281:23382)            AccoladesBand bare
//   section - The Model (3281:24669)            ForDevModelSection
//   section - Testimonials (3282:31975)         TestimonialsSection
//   section - The Edge (3295:10242)             ForDevEdgeSection
//   section - Requirements (3388:11825)         ForDevRequirementsSection
//   Banner - Discover why traders choose us     ClosingBanner
//   Footer                                      SiteFooter
//
// The sections from Accolades down are laid out in frame 3236:13737 ("EasyAlgos
// for Developers"), the newer artboard on the ◽ For Developers page.
//
// Same assembly rules as pages/index.vue: the header and hero hydrate normally
// because they are the first thing touched, and everything below hydrates on
// visibility with a 300px margin, which is also what lets the v-reveal directive
// arm its hidden state off-screen instead of the content flashing in
// already-visible.
import { FOR_DEV_TESTIMONIALS } from '~/data/content'

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
            <!-- The home page's accolades band without its heading — the frame
                 draws the two figures alone, as a 96px breath after The
                 Solution. -->
            <LazyAccoladesBand bare :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyForDevModelSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <!-- The home page's dark testimonials band with this page's two
                 developer quotes. It carries data-dark-band, so the header
                 inverts over it exactly as it does on the home page. -->
            <LazyTestimonialsSection
                :items="FOR_DEV_TESTIMONIALS"
                ns="forDevTestimonials"
                dense
                :hydrate-on-visible="{ rootMargin: '300px' }"
            />
            <LazyForDevEdgeSection :hydrate-on-visible="{ rootMargin: '300px' }" />
            <LazyForDevRequirementsSection :hydrate-on-visible="{ rootMargin: '300px' }" />
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
