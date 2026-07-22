// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-06-01',
    devtools: { enabled: false },
    modules: ['@nuxtjs/tailwindcss'],
    css: ['~/assets/css/main.css'],
    // Use bare component names (e.g. <HeroSection/>) regardless of subfolder.
    components: [{ path: '~/components', pathPrefix: false }],
    app: {
        head: {
            htmlAttrs: { lang: 'en' },
            title: 'EasyAlgos — Algorithmic trading, held to an institutional standard',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                {
                    name: 'description',
                    content:
                        'EasyAlgos provides qualified traders with award-winning Expert Advisors, managed infrastructure, and eight years of independently verified performance. No license fees. No commissions. Incentives aligned.'
                },
                { name: 'theme-color', content: '#0B1125' },
                { property: 'og:title', content: 'EasyAlgos — Algorithmic trading, held to an institutional standard' },
                { property: 'og:description', content: 'Award-winning Expert Advisors with eight years of independently verified performance. Access is free. Qualification is not.' },
                { property: 'og:type', content: 'website' }
            ],
            script: [
                // Add `js` to <html> synchronously so reveal animations only hide
                // content when JS is active (no flash, graceful no-JS fallback).
                { innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }
            ],
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/img/easyalgos-logo.svg' },
                // Preload only the faces used above the fold.
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-500.woff2', crossorigin: '' },
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-600.woff2', crossorigin: '' },
                { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/roboto-latin-400.woff2', crossorigin: '' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' }
    }
})
