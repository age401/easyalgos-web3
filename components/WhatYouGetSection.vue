<script setup lang="ts">
// "What you get" — a nine-row accordion, with the selected row's slide beside it
// on desktop and inside it on handhelds.
//
// Rows are real <button>s inside a heading, so the list is keyboard-operable and
// announces its open state for free via aria-expanded. The open row's description
// animates on grid-template-rows 0fr -> 1fr (see .ea-solution-row in main.css),
// which is the only way to transition to an auto height without measuring in JS.
//
// Two slide slots, both always in the markup, one hidden per breakpoint in CSS.
// That is deliberate: which slot is live is a LAYOUT question, so it cannot come
// from useMediaQuery without the server and client rendering different trees.
// Only the active row carries the handheld slide, so the cost is one extra
// <picture> for the same URL the desktop panel already requested — the browser
// serves it from one fetch.
//
// Only two rows have their artwork so far; the rest fall back to the dashboard
// export so the slot is never empty while the per-item animations are
// outstanding. Dropping each one in later is a single line in data/content.ts.
import { SOLUTIONS, SOLUTIONS_FALLBACK_VISUAL } from '~/data/content'

const activeId = ref(SOLUTIONS[0]!.id)

function toggle(id: string) {
    // Always leave one row open: the slide is driven by the selection, so
    // collapsing everything would blank half the section.
    if (activeId.value !== id) activeId.value = id
}

const activeVisual = computed(() => {
    const item = SOLUTIONS.find((entry) => entry.id === activeId.value)
    return item?.visual ?? SOLUTIONS_FALLBACK_VISUAL
})
</script>

<template>
    <!-- No background of its own: the particle section's page tint is still
         resolving to white across this section, and a painted box would edge it. -->
    <section id="what-you-get" class="ea-section relative overflow-x-clip">
        <div class="ea-container-wide grid grid-cols-1 items-center gap-12 tablet-wide:grid-cols-[minmax(0,620px)_minmax(0,1fr)] tablet-wide:gap-10 desktop:gap-16">
            <!-- Left column -->
            <div>
                <SectionHeading :eyebrow="$t('whatYouGet.eyebrow')">
                    <template #title>
                        {{ $t('whatYouGet.titleLine1') }}<br />
                        <span class="ea-grad">{{ $t('whatYouGet.titleAccent') }}</span>.
                    </template>
                </SectionHeading>

                <div v-reveal="140" class="ea-solution-list mt-10 tablet-wide:mt-12">
                    <!-- Height reserve, desktop only. An invisible copy of the nine
                         title rows plus every description stacked into a single grid
                         cell, so it measures exactly (all titles + the TALLEST
                         description) — which is the tallest the real list can ever
                         get, since exactly one description is open at a time. The
                         real list is laid over it, so switching rows never moves the
                         CTA or anything below the section. Locale-proof by
                         construction: German's two-line back-testing copy reserves
                         two lines without a pixel value being written down. -->
                    <div class="ea-solution-list__reserve" aria-hidden="true">
                        <span v-for="item in SOLUTIONS" :key="item.id" class="ea-solution-row">
                            <span class="ea-solution-row__index pt-0.5">00</span>
                            <span class="block">
                                <span class="ea-solution-row__title">
                                    {{ $t(`whatYouGet.items.${item.id}.title`) }}
                                </span>
                            </span>
                        </span>
                        <span class="ea-solution-list__reserve-row">
                            <span />
                            <span class="ea-solution-list__reserve-body">
                                <span
                                    v-for="item in SOLUTIONS"
                                    :key="item.id"
                                    class="ea-body--sm block pt-1 !leading-5"
                                >
                                    {{ $t(`whatYouGet.items.${item.id}.description`) }}
                                </span>
                            </span>
                        </span>
                    </div>

                    <div class="ea-solution-list__rows">
                        <div v-for="(item, index) in SOLUTIONS" :key="item.id">
                            <!-- Handheld slot: the slide sits above its own row,
                                 pushing the rest of the list down. Figma 626:5102 /
                                 626:9308. -->
                            <Transition name="slide-reveal">
                                <div v-if="activeId === item.id" class="ea-slide-reveal tablet-wide:hidden">
                                    <!-- Clipping track, then the natural-height
                                         content: the padding has to collapse with
                                         the slide, so it goes on the inner box. -->
                                    <div>
                                        <div class="pb-4 pt-3">
                                            <SolutionSlide
                                                :media="activeVisual"
                                                :swap-key="activeId"
                                                sizes="100vw"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Transition>

                            <h3 class="m-0">
                                <button
                                    type="button"
                                    class="ea-solution-row"
                                    :aria-expanded="activeId === item.id"
                                    :aria-controls="`solution-body-${item.id}`"
                                    @click="toggle(item.id)"
                                >
                                    <span class="ea-solution-row__index pt-0.5">
                                        {{ String(index + 1).padStart(2, '0') }}
                                    </span>
                                    <span class="block">
                                        <span class="ea-solution-row__title">
                                            {{ $t(`whatYouGet.items.${item.id}.title`) }}
                                        </span>
                                        <span :id="`solution-body-${item.id}`" class="ea-solution-row__body">
                                            <span class="block">
                                                <!-- 14/20 as drawn, tighter than
                                                     .ea-body--sm's 24px prose
                                                     leading. The reserve copy
                                                     above carries the identical
                                                     override — if the two ever
                                                     diverge the height reserve
                                                     stops reserving the right
                                                     height. -->
                                                <span class="ea-body--sm block pt-1 !leading-5 !text-gray-500">
                                                    {{ $t(`whatYouGet.items.${item.id}.description`) }}
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                </button>
                            </h3>
                        </div>
                    </div>
                </div>

                <div v-reveal="220" class="mt-12">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <!-- Desktop slot. Bleeds past the column as drawn; the section clips it. -->
            <div
                v-reveal="180"
                class="relative hidden w-full tablet-wide:block tablet-wide:w-[calc(100%+8vw)] desktop:w-[calc(100%+12vw)]"
            >
                <SolutionSlide
                    :media="activeVisual"
                    :swap-key="activeId"
                    sizes="(min-width: 1280px) 1100px, 60vw"
                />
            </div>
        </div>
    </section>
</template>
