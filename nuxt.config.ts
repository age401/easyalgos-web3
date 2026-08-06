// EasyAlgos home v3 — Nuxt config.
//
// Performance is the project's #1 priority (PROJECT_STACK_GUIDE_FOR_AI.md §13), so:
//  - the page is prerendered: zero server work, and the hero's daily EA figures are
//    "baked" into static HTML at build time rather than fetched in the browser;
//  - no @nuxt/image module — every raster is pre-encoded to AVIF/WebP by
//    scripts/optimize-assets.mjs and served through a plain <picture>, which costs
//    one fewer dependency and no runtime transform;
//  - only the above-the-fold font faces are preloaded;
//  - long-lived immutable cache headers on every static asset directory.
export default defineNuxtConfig({
    compatibilityDate: '2025-06-01',
    devtools: { enabled: false },
    modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
    css: ['~/assets/css/main.css'],
    // Bare component names (<HeroSection/>) regardless of subfolder.
    components: [{ path: '~/components', pathPrefix: false }],
    // Auto-import the static content modules alongside composables/utils, so a
    // section can read SITE_STATS or HERO_CARDS without an import line — the same
    // convention the rest of the codebase uses for helpers.
    imports: { dirs: ['data'] },

    i18n: {
        strategy: 'no_prefix', // deliberate: one URL per page, no /de/ segments
        defaultLocale: 'en',
        langDir: 'locales',
        lazy: true, // only the active locale's messages enter the bundle
        detectBrowserLanguage: false, // always default to en
        locales: [
            { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
            { code: 'de', language: 'de-DE', file: 'de.json', name: 'Deutsch' },
            { code: 'es', language: 'es-ES', file: 'es.json', name: 'Espanol' },
            { code: 'pt', language: 'pt-PT', file: 'pt.json', name: 'Portugues' }
        ],
        bundle: { optimizeTranslationDirective: false }
    },

    nitro: {
        prerender: { routes: ['/'], crawlLinks: false },
        compressPublicAssets: { gzip: true, brotli: true }
    },

    routeRules: {
        '/': { prerender: true },
        // Static assets are content-addressed by the optimize script or stable by
        // name; a year of immutable caching is safe and removes revalidation RTTs.
        '/fonts/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
        '/img/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
        '/icons/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } },
        '/_nuxt/**': { headers: { 'cache-control': 'public,max-age=31536000,immutable' } }
    },

    app: {
        head: {
            htmlAttrs: { lang: 'en' },
            title: 'EasyAlgos — Access top-rated Expert Advisors, without paying for them',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                {
                    name: 'description',
                    content:
                        'The Expert Advisors trading industry was broken. EasyAlgos gives qualified traders a curated selection of top-rated Expert Advisors, EasyVPS, analytics and AI market forecasts — with no license payments, no subscriptions and no hidden fees.'
                },
                { name: 'theme-color', content: '#171717' },
                { property: 'og:title', content: 'EasyAlgos — Access top-rated Expert Advisors, without paying for them' },
                {
                    property: 'og:description',
                    content: 'You do not pay, you qualify. No license payments, no subscriptions, no hidden fees.'
                },
                { property: 'og:type', content: 'website' },
                { name: 'twitter:card', content: 'summary_large_image' }
            ],
            script: [
                // Add `js` to <html> synchronously so reveal animations only hide
                // content when JS is active (no flash, graceful no-JS fallback).
                { innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }
            ],
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/img/logo-mark.svg' },
                // Only the faces the first viewport actually paints.
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-500.woff2', crossorigin: '' },
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-600.woff2', crossorigin: '' },
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/roboto-latin-400.woff2', crossorigin: '' },
                // Roboto 500 is above the fold too: the Trustpilot bar renders in
                // it, and the hero's `100svh - topbar - trustpilot` height math
                // exists precisely to guarantee that bar is never pushed under.
                // Without the preload it is the one strip on the first screen
                // that visibly reflows when the face arrives.
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/roboto-latin-500.woff2', crossorigin: '' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' }
    },

    vite: {
        build: {
            cssCodeSplit: true,
            // Three.js is the only heavy dependency and it is dynamically imported
            // inside the particle stage; keep it in its own chunk so it can never
            // be pulled into the entry bundle by a stray static import.
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        if (id.includes('node_modules/three')) return 'three'
                    }
                }
            }
        }
    }
})
