<script setup lang="ts">
// Developer page - "section - Portfolio" (Figma 3924:16280): the portfolio at a
// glance (risk/return plot beside the AlgoScore ranking), then the developer's
// EAs as cards.
//
// AT A GLANCE. Drawn 896 + 440. The ranking keeps its 440px and the plot takes
// the rest from 1280 up; below that they stack, plot first, and each fills the
// column. The two panels share one `active` EA, so hovering a row in the
// ranking lights its dot in the plot and the other way round.
//
// CARDS. The list page's grid, four shown and the rest behind "Load more", as
// drawn. Four is a full row at four columns and two rows at two, but at THREE
// columns it would strand one card on a row of its own, so while the list is
// collapsed the fourth card is hidden across exactly that range - and the
// button's count is rendered once per case so it always matches what is on
// screen. No JS decides this: the server and the client render the same four.
import type { EaDeveloper } from '~/types/expertAdvisors'

interface Props {
    developer: EaDeveloper
}
const props = defineProps<Props>()

const active = ref<string | null>(null)

const INITIAL = 4
const expanded = ref(false)
const total = computed(() => props.developer.eas.length)
const visible = computed(() => (expanded.value ? props.developer.eas : props.developer.eas.slice(0, INITIAL)))
const remaining = computed(() => Math.max(0, total.value - INITIAL))
/** One more is hidden at three columns, when there IS a fourth card to hide
 *  and hiding it leaves a full row. */
const hidesFourth = computed(() => !expanded.value && total.value > INITIAL - 1 && visible.value.length === INITIAL)
const remainingAtThree = computed(() => remaining.value + (hidesFourth.value ? 1 : 0))

</script>

<template>
    <section class="bg-Tinted/25 pb-16 pt-10 tablet:pt-14 tablet-wide:pb-24 tablet-wide:pt-16 desktop:pb-32">
        <div class="ea-container flex flex-col gap-12 tablet-wide:gap-16">
            <div
                v-inview
                class="xa-in grid grid-cols-1 gap-4 tablet-wide:gap-5 desktop:grid-cols-[minmax(0,1fr)_440px] desktop:gap-6"
            >
                <EaRiskReturn v-model:active="active" :eas="developer.eas" />
                <EaScoreRanking v-model:active="active" :eas="developer.eas" />
            </div>

            <div class="flex flex-col gap-6 tablet:gap-8">
                <header
                    v-inview
                    class="xa-in flex flex-col items-start gap-2 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-6"
                >
                    <h2 class="xa-heading">
                        <i18n-t keypath="ea.dev.portfolio.title" tag="span" scope="global">
                            <template #name>
                                <span class="ea-grad">{{ developer.name }}</span>
                            </template>
                        </i18n-t>
                    </h2>
                    <p class="shrink-0 font-franklin text-[12px] font-medium leading-[14px] text-Tinted/500 tablet:pb-1.5">
                        {{ $t('ea.dev.portfolio.sorted') }}
                    </p>
                </header>

                <TransitionGroup
                    tag="ul"
                    name="xa-list"
                    class="xa-cards grid grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-5 tablet-wide:grid-cols-3 desktop:gap-6
                           min-[1400px]:grid-cols-4"
                >
                    <li
                        v-for="(ea, index) in visible"
                        :key="ea.slug"
                        v-inview
                        :class="[
                            'xa-in min-w-0',
                            hidesFourth && index === INITIAL - 1 ? 'tablet-wide:max-[1399px]:hidden' : ''
                        ]"
                        :style="{ '--reveal-delay': `${(index % 4) * 70}ms` }"
                    >
                        <EaCard :ea="ea" />
                    </li>
                </TransitionGroup>

                <div v-if="!expanded && remainingAtThree > 0" :class="['flex justify-center pt-2', remaining === 0 ? 'max-tablet-wide:hidden min-[1400px]:hidden' : '']">
                    <button type="button" class="ea-btn ea-btn--stroke !h-[60px] !text-Tinted/900 hover:!text-Tinted/700" @click="expanded = true">
                        <span class="tablet-wide:max-[1399px]:hidden">{{ $t('ea.list.loadMore', { count: remaining }) }}</span>
                        <span class="hidden tablet-wide:max-[1399px]:inline">{{ $t('ea.list.loadMore', { count: remainingAtThree }) }}</span>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
