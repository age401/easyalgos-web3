<script setup lang="ts">
// A foreground EA card from the hero collage — real DOM, not an image.
//
// Rendered at its drawn 272px width and scaled as part of the collage stage
// (see HeroSection), so the type sizes here are the literal Figma values and no
// breakpoint has to restate them.
//
// The figures come in already resolved: they are baked into the prerendered HTML
// at build time from the daily backend publish (see data/heroCards.ts). The row
// labels beside them are static i18n strings, so the card is complete and
// readable on first paint with no fetch, no skeleton and no reflow.
import type { EaCard } from '~/types/home'

interface Props {
    card: EaCard
    /** The featured card is one row taller; the collage needs to know. */
    eager?: boolean
}
const props = withDefaults(defineProps<Props>(), { eager: false })

const avatar = computed(() => mediaAsset('ea', props.card.avatar, 64, 64))
</script>

<template>
    <article class="ea-card ea-card-hover flex w-[272px] flex-col p-4">
        <!-- Featured ribbon -->
        <p
            v-if="card.featured"
            class="mb-0 flex items-center gap-2 rounded-md bg-ea-ribbon px-2 py-1 font-poppins text-[11px] font-semibold leading-[17px] text-white"
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="shrink-0">
                <path d="M8 1.5 9.9 5.4l4.3.6-3.1 3 .74 4.3L8 11.25 4.16 13.3l.74-4.3-3.1-3 4.3-.6L8 1.5Z" fill="#FFE182" />
                <path d="M8 3.4l1.25 2.55 2.8.4-2.03 1.96.48 2.8L8 9.78 5.5 11.11l.48-2.8L3.95 6.35l2.8-.4L8 3.4Z" fill="#FFAA64" />
            </svg>
            {{ $t('card.eaOfTheMonth') }}
        </p>

        <!-- EA name -->
        <h3 class="py-2 font-poppins text-[12px] font-semibold leading-[18px] text-Tinted/950">
            {{ card.name }}
        </h3>

        <!-- Avatar + myfxbook chart panel -->
        <div class="flex gap-2">
            <AppPicture
                :media="avatar"
                :loading="eager ? 'eager' : 'lazy'"
                :fetchpriority="eager ? 'high' : 'low'"
                img-class="h-16 w-16 rounded-lg object-cover"
            />

            <!-- The myfxbook widget, hand-drawn: a chrome bar, a gridded plot and
                 the equity curve. Three SVG elements beat an image here — it stays
                 crisp at any scale and weighs nothing. -->
            <div class="flex-1 overflow-hidden rounded-lg bg-Tinted/50">
                <div class="h-1.5 w-full bg-Tinted/200" />
                <div class="p-1.5">
                    <svg
                        class="h-[46px] w-full rounded"
                        viewBox="0 0 156 46"
                        preserveAspectRatio="none"
                        fill="none"
                        aria-hidden="true"
                    >
                        <rect width="156" height="46" rx="4" fill="#F7F7FB" />
                        <g stroke="#E4E6F0" stroke-width="0.5">
                            <path d="M0 12h156M0 23h156M0 34h156" />
                            <path d="M12 0v46M45 0v46M78 0v46M111 0v46M144 0v46" />
                        </g>
                        <path
                            d="M3 40c8-2 13-5 20-6s12 1 18-4 11-8 17-9 11 3 17-2 11-9 17-11 12 1 18-3 10-5 15-6"
                            stroke="#FF1519"
                            stroke-width="1.1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <!-- AlgoScore -->
        <div class="mt-2 flex items-center justify-between rounded-lg bg-[#F4F4FA] py-1 pl-2 pr-[3px]">
            <span class="flex items-center gap-0.5">
                <img src="/img/logo-mark.svg" alt="" width="14" height="14" class="h-3.5 w-3.5" aria-hidden="true" />
                <span class="font-rubik text-[10px] font-medium leading-3 text-Tinted/700">{{ $t('card.algoScore') }}</span>
            </span>
            <span class="flex items-center overflow-hidden rounded">
                <span class="bg-Tinted/300 px-1.5 py-1 font-rubik text-[9px] font-medium leading-none text-white">
                    {{ $t('card.excellent') }}
                </span>
                <span class="ea-num bg-Tinted/700 px-1.5 py-1 font-rubik text-[10px] font-semibold leading-none text-white">
                    {{ card.score }}
                </span>
            </span>
        </div>

        <!-- Stat ledger -->
        <dl class="mt-1 rounded-lg bg-[#F4F4FA] px-2 py-1">
            <div
                v-for="stat in card.stats"
                :key="stat.key"
                class="flex items-center justify-between gap-2 py-[3px]"
            >
                <dt class="font-rubik text-[10px] font-medium leading-3 text-Tinted/700">
                    {{ $t(`card.${stat.key}`) }}
                </dt>
                <dd
                    :class="[
                        'ea-num shrink-0 font-rubik text-[10px] leading-3',
                        stat.highlight
                            ? 'rounded bg-Blue/600 px-1.5 py-0.5 font-semibold text-white'
                            : 'font-medium text-Tinted/700'
                    ]"
                >
                    {{ stat.value }}
                </dd>
            </div>
        </dl>
    </article>
</template>
