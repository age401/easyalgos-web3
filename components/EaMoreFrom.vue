<script setup lang="ts">
// "More from {developer}" on the EA page (Figma 3962:5066): up to three of the
// developer's other EAs and the Free-access tile, on the list page's own grid.
//
// The grid is the same four / three / two / one columns as the list, and the
// tile takes whatever the cards leave of the last row - so the row is always
// full, whether the developer has three other EAs or none:
//
//   cards   4 cols      3 cols      2 cols
//   3       1 (drawn)   3 (banner)  1
//   2       2           1           2 (banner)
//   1       3           2           1
//   0       4           3           2   <- the tile alone, as a banner
//
// The spans are spelled out as literals below, not computed into a class name,
// so Tailwind's scanner can see them.
import type { EaDeveloper, ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    developer: EaDeveloper
    /** The EA this page is about, which is left out of its own "more from". */
    current: ExpertAdvisor
}
const props = defineProps<Props>()

const others = computed(() => props.developer.eas.filter((ea) => ea.slug !== props.current.slug).slice(0, 3))

const TILE_SPAN = [
    'tablet:col-span-2 tablet-wide:col-span-3 min-[1400px]:col-span-4',
    'tablet:col-span-1 tablet-wide:col-span-2 min-[1400px]:col-span-3',
    'tablet:col-span-2 tablet-wide:col-span-1 min-[1400px]:col-span-2',
    'tablet:col-span-1 tablet-wide:col-span-3 min-[1400px]:col-span-1'
] as const
</script>

<template>
    <div class="flex flex-col gap-6 tablet:gap-8">
        <header
            v-if="others.length"
            v-inview
            class="xa-in flex flex-col items-start gap-3 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-6"
        >
            <h2 class="xa-heading">
                <i18n-t keypath="ea.more.title" tag="span" scope="global">
                    <template #name>
                        <span class="ea-grad">{{ developer.name }}</span>
                    </template>
                </i18n-t>
            </h2>
            <NuxtLink
                :to="EA_ROUTES.developer(developer.slug)"
                class="xa-link shrink-0 whitespace-nowrap text-Blue/600 hover:text-Blue/100"
            >
                {{ $t('ea.more.seeAll', { count: developer.eas.length }, developer.eas.length) }}
                <EaIcon name="arrowRight" class="size-4" />
            </NuxtLink>
        </header>

        <ul
            class="xa-cards grid grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-5 tablet-wide:grid-cols-3 desktop:gap-6
                   min-[1400px]:grid-cols-4"
        >
            <li
                v-for="(ea, index) in others"
                :key="ea.slug"
                v-inview
                class="xa-in min-w-0"
                :style="{ '--reveal-delay': `${index * 70}ms` }"
            >
                <EaCard :ea="ea" />
            </li>
            <li
                v-inview
                :class="['xa-in min-w-0', TILE_SPAN[others.length]]"
                :style="{ '--reveal-delay': `${others.length * 70}ms` }"
            >
                <EaCtaTile :developer="developer" />
            </li>
        </ul>
    </div>
</template>
