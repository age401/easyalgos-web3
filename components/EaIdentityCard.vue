<script setup lang="ts">
// The EA's identity card - Figma "EA Identity" (3920:16029), drawn 400x804.
//
// Thumbnail and the large AlgoScore ring, the name and its developer, the
// description, four spec rows, the page's one primary CTA and three secondary
// links. This is where the page's <h1> lives.
//
// RESPONSIVE. The card is drawn as a 400px column and stays one - down to the
// 320px it gets beside the data column at 1024, and on a phone, where it is the
// full width. What does NOT work is that same column stretched to the 740-940px
// it gets on a tablet, where the page is a single column: a 900px-wide card
// with a 96px picture in one corner and a specs table ruled across the whole
// width reads as empty. So from 620px of its OWN width the card re-lays as two
// columns - identity, description and CTA on the left, specs on the right -
// and the name moves up beside the thumbnail. It is keyed to the card's width
// (a container query, `.xa-identity` in main.css), because "tablet" is exactly
// the range where the viewport does not tell you how wide this card is.
//
// The CTA carries `id="ea-cta"`: the page's sticky bar watches it and only
// appears once it has scrolled out of view.
import type { EaDeveloper, ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
    developer: EaDeveloper
}
const props = defineProps<Props>()

const { t, locale } = useI18n()

const avatar = computed(() =>
    props.developer.avatar ? mediaAsset('expert-advisors/developers', props.developer.avatar, 16, 16) : null
)

const liveSince = computed(() => `${eaMonthName(locale.value, props.ea.startMonth)} ${props.ea.startYear}`)

const specs = computed(() => [
    { label: t('ea.detail.specs.style'), value: props.ea.style },
    { label: t('ea.detail.specs.pairs'), value: props.ea.pairs },
    { label: t('ea.detail.specs.timeframe'), value: props.ea.timeframe },
    { label: t('ea.detail.specs.trackRecord'), value: t('ea.detail.liveSince', { date: liveSince.value }) }
])

const description = computed(
    () =>
        props.ea.description ??
        t('ea.detail.genericDescription', {
            name: props.ea.name,
            developer: props.developer.name,
            style: props.ea.style.toLowerCase(),
            pairs: props.ea.pairs,
            date: liveSince.value
        })
)
</script>

<template>
    <article class="xa-card xa-identity rounded-[20px] !border-2 p-6 tablet:rounded-3xl tablet:p-8">
        <div class="xa-identity__grid">
            <div class="xa-identity__head">
                <EaThumb :image="ea.image" :name="ea.name" :size="96" eager class="size-20 rounded-2xl tablet:size-24" />

                <div class="xa-identity__name">
                    <h1 class="font-poppins text-[26px] font-semibold leading-8 tracking-[-0.28px] text-Tinted/950 tablet:text-[28px] tablet:leading-[34px]">
                        {{ ea.name }}
                    </h1>
                    <p class="mt-1.5 flex items-center gap-1.5 font-franklin text-[13px] leading-4 text-Tinted/500">
                        <i18n-t keypath="ea.by" tag="span" scope="global">
                            <template #name>
                                <NuxtLink
                                    :to="EA_ROUTES.developer(developer.slug)"
                                    class="font-medium text-Blue/600 transition-colors duration-300 hover:text-Blue/100"
                                >
                                    {{ developer.name }}
                                </NuxtLink>
                            </template>
                        </i18n-t>
                        <AppPicture v-if="avatar" :media="avatar" img-class="size-4 rounded-[3px] object-cover" />
                    </p>
                </div>

                <EaScoreRing :score="ea.score" size="lg" animate-number class="xa-identity__ring" />
            </div>

            <p class="xa-identity__desc font-franklin text-[15px] leading-6 text-Tinted/600">
                {{ description }}
            </p>

            <dl class="xa-identity__specs font-franklin text-[13px] leading-[18px]">
                <div
                    v-for="spec in specs"
                    :key="spec.label"
                    class="flex items-start justify-between gap-4 border-t border-Tinted/50 py-3"
                >
                    <dt class="shrink-0 text-Tinted/500">{{ spec.label }}</dt>
                    <dd class="text-right font-medium text-Tinted/950">{{ spec.value }}</dd>
                </div>
            </dl>

            <div id="ea-cta" class="xa-identity__cta flex flex-col items-center gap-3">
                <AppButton :label="$t('ea.detail.cta')" :href="APPLY_HREF" class="w-full" />
                <p class="text-center font-franklin text-[12px] leading-4 text-Tinted/500">
                    {{ $t('ea.detail.ctaNote') }}
                </p>
            </div>

            <ul class="xa-identity__links flex flex-wrap gap-2">
                <li>
                    <a :href="EA_ROUTES.algoscoreEa(ea.slug)" class="xa-key">
                        <EaIcon name="algoscore" class="size-5" />
                        <span class="px-0.5">{{ $t('card.algoScore') }}</span>
                    </a>
                </li>
                <li>
                    <!-- PLACEHOLDER HREF: the design draws the button and names
                         no file. The backtest archive is per-EA published data. -->
                    <a href="#" class="xa-key">
                        <EaIcon name="cloudDownload" class="size-5" />
                        <span class="px-0.5">{{ $t('ea.detail.backtesting') }}</span>
                    </a>
                </li>
                <li>
                    <a :href="CONTACT.telegram.href" target="_blank" rel="noopener" class="xa-key">
                        <EaIcon name="telegram" class="size-5" />
                        <span class="px-0.5">Telegram</span>
                    </a>
                </li>
            </ul>
        </div>
    </article>
</template>
