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
      title: 'EasyAlgos — Access the best Expert Advisors, without paying for them',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Award-winning Expert Advisors with 8+ years of third-party-verified track records — free for qualifying traders. No license fees, no commissions. The Expert Advisor industry was broken. We fixed it.'
        },
        { name: 'theme-color', content: '#070B1A' },
        { property: 'og:title', content: 'EasyAlgos — The best Expert Advisors, without paying for them' },
        { property: 'og:description', content: 'Institutional-grade algorithmic trading, verified by MyFxBook and FXBlue, at zero cost of access.' },
        { property: 'og:type', content: 'website' }
      ],
      script: [
        // Add `js` to <html> synchronously so reveal animations only hide
        // content when JS is active (no flash, graceful no-JS fallback).
        { innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/img/easyalgos-logo.svg' },
        // Preload the brand faces used above the fold (mirrors easyalgos.ai)
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-700.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/poppins-latin-600.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/roboto-latin-400.woff2', crossorigin: '' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
