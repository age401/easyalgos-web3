<script setup lang="ts">
// The developer panel on the EA page - Figma "Developer" (3921:16236): a
// Tinted/25 panel with the portrait, the bio and two links on the left and
// three white stat tiles on the right.
//
// That row is 96 + 612 + 492 across, so it only holds from 1280. The parts are
// placed by grid areas (`.xa-devpanel` in main.css) and re-flow in three steps:
//
//   >= 1280px  as drawn: portrait | text | stats, the stats centred on the text.
//   600-1279   portrait beside the text, the stats in a full-width row beneath.
//   <  600px   the portrait shrinks to 64px and sits beside the NAME only, so
//              the bio gets the full width of the panel instead of a 200px
//              column next to a picture; the stats become a ledger.
//
// Bio, country and start year are published per developer. Where one is not
// published the panel does not invent it: the bio falls back to a neutral line
// built from the developer's own published figures.
import type { EaDeveloper } from '~/types/expertAdvisors'

interface Props {
    developer: EaDeveloper
}
const props = defineProps<Props>()

const { t } = useI18n()

const portrait = computed(() =>
    props.developer.avatar ? mediaAsset('expert-advisors/developers', props.developer.avatar, 96, 96) : null
)

const bio = computed(
    () => props.developer.bio ?? t('ea.dev.genericBio', { name: props.developer.name, count: props.developer.eas.length }, props.developer.eas.length)
)

const stats = computed(() => [
    {
        label: t('ea.dev.stats.count'),
        value: String(props.developer.eas.length),
        caption: t('ea.list.stats.availableCaption')
    },
    {
        label: t('ea.list.stats.topScore'),
        value: String(props.developer.topScore.score),
        caption: props.developer.topScore.name
    },
    {
        label: t('ea.dev.stats.average'),
        value: String(props.developer.averageScore),
        caption: t('ea.dev.stats.averageCaptionShort')
    }
])
</script>

<template>
    <article class="xa-devpanel rounded-[20px] bg-Tinted/25 p-6 tablet:rounded-3xl tablet:p-10">
        <div class="xa-devpanel__avatar size-16 overflow-hidden rounded-2xl bg-[#F2F0FF] tablet:size-24 tablet:rounded-[20px]">
            <AppPicture v-if="portrait" :media="portrait" :alt="developer.name" img-class="size-full object-cover" />
            <span
                v-else
                class="flex size-full items-center justify-center font-poppins text-[28px] font-semibold text-Violet/700 tablet:text-[40px]"
                aria-hidden="true"
            >
                {{ developer.name.charAt(0) }}
            </span>
        </div>

        <div class="xa-devpanel__head flex min-w-0 flex-col gap-2.5">
            <p class="xa-label">{{ $t('card.developer') }}</p>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h2 class="font-poppins text-[22px] font-semibold leading-7 tracking-[-0.24px] text-Tinted/950 tablet:text-[24px] tablet:leading-[30px]">
                    {{ developer.name }}
                </h2>
                <p v-if="developer.country" class="flex items-center gap-1.5">
                    <img
                        v-if="developer.countryCode"
                        :src="`/img/flags/${developer.countryCode}.svg`"
                        alt=""
                        width="18"
                        height="12"
                        aria-hidden="true"
                        class="h-3 w-[18px] shrink-0 rounded-[2px]"
                    />
                    <span class="xa-label">{{ developer.country }}</span>
                </p>
            </div>
        </div>

        <p class="xa-devpanel__bio font-franklin text-[15px] leading-6 text-Tinted/600">{{ bio }}</p>

        <div class="xa-devpanel__actions flex flex-wrap items-center gap-x-5 gap-y-3">
            <a v-if="developer.website" :href="developer.website" class="xa-key">
                <EaIcon name="globe" class="size-5" />
                <span class="px-0.5">{{ $t('ea.dev.website') }}</span>
            </a>
            <NuxtLink :to="EA_ROUTES.developer(developer.slug)" class="xa-link text-Blue/600 hover:text-Blue/100">
                {{ $t('ea.dev.viewProfile') }}
                <EaIcon name="arrowRight" class="size-4" />
            </NuxtLink>
        </div>

        <EaStatGroup :stats="stats" surface="white" class="xa-devpanel__stats" />
    </article>
</template>
