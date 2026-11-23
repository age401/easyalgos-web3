<script setup lang="ts">
// Expert Advisors - the list (Figma "Expert Advisors - List [Cards] v2",
// 3939:19333, and "List [Compact] v2", 3915:15685).
//
// The two frames are one page in two views: same header, same toolbar, and a
// switch on that toolbar between them. The chrome - topbar, closing banner,
// footer - is `layouts/page.vue`, so this file is only the two modules that are
// new.
//
// Neither module is lazily hydrated, unlike the sections of the home page. The
// header is the first thing on screen and the list starts 560px down, so both
// are in the first viewport on a desktop and the toolbar is the page's main
// interaction; deferring it would mean a search box that ignores the first
// keystrokes.
definePageMeta({ layout: 'page' })

const { t } = useI18n()

useSeoMeta({
    title: () => `EasyAlgos — ${t('ea.list.seoTitle')}`,
    ogTitle: () => t('ea.list.seoTitle'),
    description: () => t('ea.list.seoDescription', { count: EXPERT_ADVISORS.length }),
    ogDescription: () => t('ea.list.seoDescription', { count: EXPERT_ADVISORS.length })
})
</script>

<template>
    <div>
        <EaListHero />
        <EaListSection />
    </div>
</template>
