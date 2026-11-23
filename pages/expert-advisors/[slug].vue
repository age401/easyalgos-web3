<script setup lang="ts">
// Expert Advisors - one EA (Figma "Expert Advisors - Expert Advisor v2",
// 3920:15979).
//
// Two sections on the artboard: the EA itself on Tinted/25 (identity card
// beside a column of KPIs, the track record, the monthly table and the
// screenshots), then on white the developer panel and more of their EAs. The
// chrome is `layouts/page.vue`.
//
// LAYOUT, top section. Drawn as 400 + 936 on a 1360px container.
//   >= 1400px  400 + the rest, as drawn.
//   1280-1399  360 + the rest: the identity card gives up 40px before the
//              KPI strip has to break out of its single row.
//   1024-1279  320 + the rest. The data column is ~600px here and each module
//              in it re-lays for that width on its own (see the notes in each).
//   <  1024    one column, identity first. The card itself goes two-column
//              from 620px of its own width, so a tablet does not get a phone
//              layout stretched to 900px.
//
// The identity card is sticky beside the data column, but only on a viewport
// tall enough to show all of it (960px): a sticky element taller than the
// screen pins its top and hides its foot - here, the CTA - for the whole scroll.
// Wherever it is not sticky, EaStickyCta takes over once the CTA is out of view.
//
// Every EA is prerendered from data/expertAdvisors.ts. An unknown slug is a real
// 404, thrown during setup so the status is right on the server render too.
definePageMeta({ layout: 'page' })

const route = useRoute()
const { t } = useI18n()

const ea = findExpertAdvisor(String(route.params.slug))
if (!ea) {
    throw createError({ statusCode: 404, statusMessage: 'Expert Advisor not found', fatal: true })
}
const developer = findEaDeveloper(ea.developer)!

const loaded = ref(false)
onMounted(() => {
    requestAnimationFrame(() => {
        loaded.value = true
    })
})

const seoDescription = computed(
    () =>
        ea.description ??
        t('ea.detail.seoDescription', {
            name: ea.name,
            developer: developer.name,
            growth: eaPercent(ea.growth, { sign: true }),
            score: ea.score
        })
)

useSeoMeta({
    title: () => `EasyAlgos — ${t('ea.detail.seoTitle', { name: ea.name, developer: developer.name })}`,
    ogTitle: () => t('ea.detail.seoTitle', { name: ea.name, developer: developer.name }),
    description: () => seoDescription.value,
    ogDescription: () => seoDescription.value
})
</script>

<template>
    <div>
        <section :class="['bg-Tinted/25 pb-16 pt-6 tablet:pt-8 tablet-wide:pb-24', { 'is-loaded': loaded }]">
            <div class="ea-container">
                <nav
                    class="hero-fade flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
                    :aria-label="$t('ea.detail.breadcrumb')"
                >
                    <NuxtLink :to="EA_ROUTES.list" class="xa-link xa-link--back text-Tinted/600 hover:text-Tinted/950">
                        <EaIcon name="chevronLeft" class="size-4" />
                        {{ $t('ea.allExpertAdvisors') }}
                    </NuxtLink>
                    <a :href="EA_ROUTES.algoscore" class="xa-link text-Blue/600 hover:text-Blue/100">
                        {{ $t('ea.score.howCalculated') }}
                    </a>
                </nav>

                <div
                    class="mt-6 grid grid-cols-1 items-start gap-4 tablet:mt-8 tablet-wide:grid-cols-[320px_minmax(0,1fr)] tablet-wide:gap-5
                           desktop:mt-10 desktop:grid-cols-[360px_minmax(0,1fr)] desktop:gap-6 min-[1400px]:grid-cols-[400px_minmax(0,1fr)]"
                >
                    <!-- The wrapper carries the reveal and the stickiness; the card
                         keeps its own transition for its hover state. -->
                    <div
                        v-inview
                        class="xa-in min-w-0 [@media(min-width:1024px)_and_(min-height:960px)]:sticky
                               [@media(min-width:1024px)_and_(min-height:960px)]:top-[92px]"
                        :style="{ '--reveal-delay': '80ms' }"
                    >
                        <EaIdentityCard :ea="ea" :developer="developer" />
                    </div>

                    <div class="flex min-w-0 flex-col gap-4">
                        <EaKpiStrip v-inview :ea="ea" class="xa-in" :style="{ '--reveal-delay': '160ms' }" />
                        <EaTrackRecord v-inview :ea="ea" class="xa-in" :style="{ '--reveal-delay': '240ms' }" />
                        <EaMonthlyHeatmap v-inview :ea="ea" class="xa-in" />
                        <EaInsideGallery
                            v-if="ea.screenshots?.length"
                            v-inview
                            :name="ea.name"
                            :shots="ea.screenshots"
                            class="xa-in"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-white pb-16 pt-14 tablet:pt-20 tablet-wide:pb-24 tablet-wide:pt-24 desktop:pb-32">
            <div class="ea-container flex flex-col gap-12 tablet-wide:gap-16">
                <EaDeveloperPanel v-inview :developer="developer" class="xa-in" />
                <EaMoreFrom :developer="developer" :current="ea" />
            </div>
        </section>

        <EaStickyCta
            target="ea-cta"
            :label="$t('ea.detail.cta')"
            :short-label="$t('ea.detail.ctaShort')"
            :href="APPLY_HREF"
            :title="ea.name"
            :caption="$t('ea.detail.stickyCaption', { growth: eaPercent(ea.growth, { sign: true }), score: ea.score })"
        >
            <template #media>
                <EaThumb :image="ea.image" :name="ea.name" :size="40" class="size-10 rounded-lg" />
            </template>
        </EaStickyCta>
    </div>
</template>
