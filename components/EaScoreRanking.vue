<script setup lang="ts">
// "AlgoScore ranking" - the developer's EAs, best score first (Figma
// 3924:16345): rank, thumbnail, name over a score bar, and the score.
//
// Each row is a link to the EA. The bar is the score out of 100 in the band's
// colour and fills in as the panel arrives, staggered down the list.
//
// A row is built from a fixed rank, a fixed 32px thumbnail, a fixed score and
// one flexible middle, so it has no breakpoints of its own: it is the same row
// at 440px beside the plot and at 280px on a phone, with the name truncating
// only if it truly has to.
//
// `active` is shared with the risk/return plot. On a phone the plot's dots
// carry these same rank numbers instead of names, which makes this list the
// plot's legend - hence the two-digit rank is always shown.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    eas: readonly ExpertAdvisor[]
}
defineProps<Props>()
const active = defineModel<string | null>('active', { default: null })

const twoDigits = (value: number) => String(value).padStart(2, '0')
</script>

<template>
    <section class="xa-panel flex h-full flex-col gap-4">
        <header class="flex flex-col gap-1.5">
            <h2 class="xa-title">{{ $t('ea.dev.ranking.title') }}</h2>
            <p class="font-franklin text-[13px] leading-[18px] text-Tinted/500">{{ $t('ea.dev.ranking.lead') }}</p>
        </header>

        <ol class="flex flex-col" @mouseleave="active = null">
            <li v-for="(ea, index) in eas" :key="ea.slug" :class="index > 0 ? 'border-t border-Tinted/50' : ''">
                <NuxtLink
                    :to="EA_ROUTES.ea(ea.slug)"
                    :class="[
                        'xa-rank -mx-2 flex items-center gap-3 rounded-xl px-2 py-[11px] transition-colors duration-300',
                        active === ea.slug ? 'bg-Tinted/25' : ''
                    ]"
                    @mouseenter="active = ea.slug"
                    @focus="active = ea.slug"
                    @blur="active = null"
                >
                    <span class="ea-num w-[18px] shrink-0 font-poppins text-[12px] leading-4 text-Violet/700">{{ twoDigits(index + 1) }}</span>
                    <EaThumb :image="ea.image" :name="ea.name" :size="32" class="size-8 rounded-lg" />
                    <span class="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span class="truncate font-poppins text-[14px] font-semibold leading-[18px] text-Tinted/950">{{ ea.name }}</span>
                        <span class="block h-1 overflow-hidden rounded-sm bg-Tinted/50" aria-hidden="true">
                            <span
                                class="xa-bar block h-full rounded-sm"
                                :style="{ width: `${ea.score}%`, backgroundColor: ea.band.bar, '--xa-bar-delay': `${350 + index * 90}ms` }"
                            />
                        </span>
                    </span>
                    <span class="ea-num w-7 shrink-0 text-right font-poppins text-[16px] font-semibold leading-5" :style="{ color: ea.band.text }">
                        {{ ea.score }}
                    </span>
                </NuxtLink>
            </li>
        </ol>
    </section>
</template>
