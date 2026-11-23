<script setup lang="ts">
// Expert Advisors - one developer (Figma "Expert Advisors - Developer v2",
// 3923:16224).
//
// Two sections: the developer's header on white, then their portfolio on
// Tinted/25. The chrome is `layouts/page.vue`. This route replaces the old
// single-developer landing page at /developer, which now redirects to the list.
//
// Every developer is prerendered from data/expertAdvisors.ts; an unknown slug is
// a real 404, thrown during setup so the server render carries the status.
definePageMeta({ layout: 'page' })

const route = useRoute()
const { t } = useI18n()

const developer = findEaDeveloper(String(route.params.slug))
if (!developer) {
    throw createError({ statusCode: 404, statusMessage: 'Developer not found', fatal: true })
}

const count = developer.eas.length
const callName = developer.givenName ?? developer.name
const description = computed(() => developer.bio ?? t('ea.dev.genericBio', { name: developer.name, count }, count))

useSeoMeta({
    title: () => `EasyAlgos — ${t('ea.dev.seoTitle', { name: developer.name })}`,
    ogTitle: () => t('ea.dev.seoTitle', { name: developer.name }),
    description: () => description.value,
    ogDescription: () => description.value
})
</script>

<template>
    <div>
        <EaDeveloperHero :developer="developer" />
        <EaPortfolio :developer="developer" />

        <EaStickyCta
            target="dev-cta"
            :label="$t('ea.dev.cta', { name: callName })"
            :short-label="$t('ea.dev.ctaShort')"
            :href="APPLY_HREF"
            :title="developer.name"
            :caption="$t('ea.dev.meta.count', { count }, count)"
        />
    </div>
</template>
