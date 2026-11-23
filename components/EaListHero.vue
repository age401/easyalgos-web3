<script setup lang="ts">
// Expert Advisors list - "section - Header" (Figma 3939:19335).
//
// Drawn as a 760px heading column with three stat tiles bottom-aligned on the
// right of a 1360px container. That only holds while both fit side by side:
// the tiles need 564px, and under 1280 that leaves the 48px heading less than
// 600. So below `desktop` the tiles drop UNDER the copy and stretch to the
// container. From 1024 down they are hidden altogether (Figma annotation on
// 3939:19354): the lead paragraph already says how many EAs and how long the
// records run, and the list itself starts a screen sooner without them.
//
// The entrance is the site's first-paint one (`.hero-fade` on `.is-loaded`),
// not a scroll reveal: this is the top of the page, so it should arrive with
// the page rather than wait for an observer.
//
// The three figures are derived from the published list, so the hero can never
// disagree with the cards under it.
const { t } = useI18n()

const loaded = ref(false)
onMounted(() => {
    requestAnimationFrame(() => {
        loaded.value = true
    })
})

// The heading's gradient run, in the order it cycles. The first is the one
// screen readers and reduced-motion visitors get.
const accents = computed(() => [
    t('ea.list.titleAccent'),
    t('ea.list.titleAccentCycle1'),
    t('ea.list.titleAccentCycle2')
])

const top = EXPERT_ADVISORS[0]
const longest = [...EXPERT_ADVISORS].sort((a, b) => b.monthsTotal - a.monthsTotal)[0]
const longestYears = Math.floor(longest.monthsTotal / 12)

const stats = computed(() => [
    {
        label: t('ea.list.stats.available'),
        value: { amount: EXPERT_ADVISORS.length },
        caption: t('ea.list.stats.availableCaption')
    },
    {
        label: t('ea.list.stats.topScore'),
        value: { amount: top.score },
        caption: top.name
    },
    {
        label: t('ea.list.stats.longest'),
        value: t('ea.list.stats.longestValue', { years: longestYears }),
        caption: t('ea.list.stats.longestCaption', { year: longest.startYear })
    }
])
</script>

<template>
    <section :class="['bg-white', { 'is-loaded': loaded }]">
        <div
            class="ea-container flex flex-col gap-10 pb-10 pt-12 tablet:pt-16 tablet-wide:pb-12 tablet-wide:pt-20
                   desktop:flex-row desktop:items-end desktop:justify-between desktop:gap-9 desktop:pt-24"
        >
            <div class="flex max-w-[760px] flex-col items-start">
                <!-- One <h1>: the lead, the gradient run, the tail, each on its
                     own line(s). The run scrambles out of each phrase and into
                     the next (`EaScrambleSwap`), which renders the whole
                     heading so it can reserve the height of its tallest
                     version: the content under it never moves. -->
                <h1 class="hero-fade ea-module-heading">
                    <EaScrambleSwap
                        :lead="$t('ea.list.titleLead')"
                        :phrases="accents"
                        :suffix="$t('ea.list.titlePunctuation')"
                        :tail="$t('ea.list.titleTail')"
                    />
                </h1>

                <p
                    class="hero-fade mt-5 max-w-[640px] font-franklin text-[16px] leading-[1.65] text-Neutral/800
                           tablet:mt-6 tablet:text-[18px] tablet:leading-[30px]"
                    :style="{ '--reveal-delay': '90ms' }"
                >
                    {{ $t('ea.list.lead', { years: longestYears }) }}
                </p>

                <div class="hero-fade mt-7 tablet:mt-8" :style="{ '--reveal-delay': '170ms' }">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <EaStatGroup
                :stats="stats"
                class="hero-fade w-full max-[1024px]:hidden desktop:w-[564px] desktop:shrink-0"
                :style="{ '--reveal-delay': '250ms' }"
            />
        </div>
    </section>
</template>
