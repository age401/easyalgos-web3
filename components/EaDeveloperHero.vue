<script setup lang="ts">
// Developer page - "section - Developer Header" (Figma 3923:16268).
//
// Breadcrumb, then a 760px column - eyebrow, portrait beside the name, a meta
// line, the developer's statement, the CTA - with four stat tiles in a 2x2
// block bottom-aligned on the right.
//
// RESPONSIVE.
//   - The 2x2 block needs 452px beside a 760px column, so it holds from 1280.
//     Below that the stats move under the copy and EaStatGroup takes them
//     through four-across, 2x2 and (on a phone) a ledger, by its own width.
//   - The name is the page's <h1> at the site's module-heading scale (28 to
//     48px). It is drawn on one line; a long name ("Barbaros Bulent Kortarla")
//     or a narrow screen simply wraps, and the portrait stays pinned to the
//     first line rather than centring against a three-line block.
//   - The portrait steps 56 / 72 / 88px with the heading, so the pair keeps its
//     drawn proportion instead of an 88px picture beside a 28px name.
//   - The meta line wraps as whole items: each fact is its own nowrap chip and
//     the separators are drawn by the gap, so a dot can never end up first on
//     a line.
//
// The gradient lands on the family name, as drawn ("Wim Schrynemakers."). A
// studio or a handle has no family name, and takes the gradient whole.
import type { EaDeveloper } from '~/types/expertAdvisors'

interface Props {
    developer: EaDeveloper
}
const props = defineProps<Props>()

const { t } = useI18n()

const loaded = ref(false)
onMounted(() => {
    requestAnimationFrame(() => {
        loaded.value = true
    })
})

const portrait = computed(() =>
    props.developer.avatar ? mediaAsset('expert-advisors/developers', props.developer.avatar, 88, 88) : null
)

const nameParts = computed(() => {
    const words = props.developer.name.split(' ')
    if (!props.developer.givenName || words.length < 2) return { lead: '', accent: props.developer.name }
    return { lead: `${words[0]} `, accent: words.slice(1).join(' ') }
})

const callName = computed(() => props.developer.givenName ?? props.developer.name)
const count = computed(() => props.developer.eas.length)

const statement = computed(
    () =>
        props.developer.statement ??
        props.developer.bio ??
        t('ea.dev.genericBio', { name: props.developer.name, count: count.value }, count.value)
)

const meta = computed(() =>
    [
        props.developer.since ? t('ea.dev.meta.since', { year: props.developer.since }) : null,
        t('ea.dev.meta.count', { count: count.value }, count.value)
    ].filter((item): item is string => item !== null)
)

const stats = computed(() => {
    const { topScore, averageScore, bestGrowth, longestRecord } = props.developer
    return [
        { label: t('ea.list.stats.topScore'), value: { amount: topScore.score }, caption: topScore.name },
        {
            label: t('ea.dev.stats.average'),
            value: { amount: averageScore },
            caption: t('ea.dev.stats.averageCaption', { count: count.value }, count.value)
        },
        {
            label: t('ea.dev.stats.bestGrowth'),
            value: eaPercent(bestGrowth.growth, { sign: true, decimals: 0 }),
            caption: t('ea.dev.stats.bestGrowthCaption', { name: bestGrowth.name, year: bestGrowth.startYear })
        },
        {
            label: t('ea.dev.stats.longest'),
            value: t('ea.dev.stats.longestValue', { years: eaYears(longestRecord.monthsTotal) }),
            caption: longestRecord.name
        }
    ]
})
</script>

<template>
    <section :class="['bg-white pb-12 pt-6 tablet:pt-8 tablet-wide:pb-16', { 'is-loaded': loaded }]">
        <div class="ea-container">
            <nav class="hero-fade" :aria-label="$t('ea.detail.breadcrumb')">
                <NuxtLink :to="EA_ROUTES.list" class="xa-link xa-link--back text-Tinted/600 hover:text-Tinted/950">
                    <EaIcon name="chevronLeft" class="size-4" />
                    {{ $t('ea.allExpertAdvisors') }}
                </NuxtLink>
            </nav>

            <div
                class="mt-8 flex flex-col gap-10 tablet:mt-10 desktop:mt-12 desktop:flex-row desktop:items-end desktop:justify-between
                       desktop:gap-12"
            >
                <div class="flex min-w-0 max-w-[760px] flex-col items-start">
                    <p class="hero-fade ea-eyebrow ea-eyebrow--brand" :style="{ '--reveal-delay': '60ms' }">
                        {{ $t('ea.dev.eyebrow') }}
                    </p>

                    <div
                        class="hero-fade mt-5 flex items-start gap-4 tablet:mt-6 tablet:gap-5 desktop:gap-6"
                        :style="{ '--reveal-delay': '120ms' }"
                    >
                        <div
                            class="size-14 shrink-0 overflow-hidden rounded-2xl bg-[#F2F0FF] tablet:size-[72px] tablet:rounded-[18px]
                                   desktop:size-[88px] desktop:rounded-[20px]"
                        >
                            <AppPicture
                                v-if="portrait"
                                :media="portrait"
                                :alt="developer.name"
                                loading="eager"
                                fetchpriority="high"
                                img-class="size-full object-cover"
                            />
                            <span
                                v-else
                                class="flex size-full items-center justify-center font-poppins text-[24px] font-semibold text-Violet/700
                                       tablet:text-[32px] desktop:text-[40px]"
                                aria-hidden="true"
                            >
                                {{ developer.name.charAt(0) }}
                            </span>
                        </div>

                        <div class="flex min-w-0 flex-col gap-2 tablet:pt-1.5 desktop:pt-0.5">
                            <h1 class="ea-module-heading">
                                {{ nameParts.lead }}<span class="ea-grad">{{ nameParts.accent }}</span
                                >.
                            </h1>
                            <ul class="xa-meta">
                                <li v-if="developer.country" class="flex items-center gap-1.5">
                                    <img
                                        v-if="developer.countryCode"
                                        :src="`/img/flags/${developer.countryCode}.svg`"
                                        alt=""
                                        width="18"
                                        height="12"
                                        aria-hidden="true"
                                        class="h-3 w-[18px] shrink-0 rounded-[2px]"
                                    />
                                    {{ developer.country }}
                                </li>
                                <li v-for="item in meta" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </div>

                    <p
                        class="hero-fade mt-6 font-franklin text-[16px] leading-[1.65] text-Neutral/800 tablet:mt-7 tablet:text-[18px]
                               tablet:leading-[30px]"
                        :style="{ '--reveal-delay': '190ms' }"
                    >
                        {{ statement }}
                    </p>

                    <div
                        id="dev-cta"
                        class="hero-fade mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 tablet:mt-8"
                        :style="{ '--reveal-delay': '260ms' }"
                    >
                        <AppButton :label="$t('ea.dev.cta', { name: callName })" :href="APPLY_HREF" />
                        <a v-if="developer.website" :href="developer.website" class="xa-key">
                            <EaIcon name="globe" class="size-5" />
                            <span class="px-0.5">{{ $t('ea.dev.website') }}</span>
                        </a>
                    </div>
                </div>

                <EaStatGroup
                    :stats="stats"
                    columns="quad"
                    class="hero-fade w-full desktop:w-[452px] desktop:shrink-0"
                    :style="{ '--reveal-delay': '330ms' }"
                />
            </div>
        </div>
    </section>
</template>
