<script setup lang="ts">
// Hero.
//
// LCP is the headline, not an image: nothing above the fold waits on a network
// image, the two display faces are preloaded, and the only eager raster on the
// page is the featured card's 64px avatar. The entrance is orchestrated on mount
// via `.is-loaded` (line-mask / hero-fade in main.css) so the copy reveals line
// by line without any scroll dependency.
//
// The collage is split by cost, per the hybrid decision: the six front cards are
// real DOM — crisp, hoverable, translatable, with server-rendered figures — while
// the eight veiled cards behind them are flat AVIF/WebP, because at 80% white
// veil they are unreadable texture and eight more card subtrees in the LCP path
// is the most expensive thing this page could do for the least gain.
const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))
</script>

<template>
    <section
        id="top"
        :class="['relative overflow-x-clip', { 'is-loaded': loaded }]"
    >
        <div
            class="ea-container grid grid-cols-1 items-center gap-12 pb-16 pt-12 tablet:pt-16 tablet-wide:grid-cols-[minmax(0,1fr)_auto] tablet-wide:gap-6 tablet-wide:pb-20 tablet-wide:pt-20 desktop:min-h-[calc(100vh-72px)] desktop:pb-24"
        >
            <!-- Copy -->
            <div class="max-w-[680px]">
                <h1 class="ea-h1">
                    <span class="line-mask"><span style="--reveal-delay: 60ms">{{ $t('hero.titleLine1') }}</span></span>
                    <span class="line-mask"><span style="--reveal-delay: 140ms">{{ $t('hero.titleLine2') }}</span></span>
                    <span class="line-mask">
                        <span class="ea-grad" style="--reveal-delay: 220ms">{{ $t('hero.titleLine3') }}</span>
                    </span>
                    <span class="line-mask">
                        <span style="--reveal-delay: 300ms"
                            ><span class="ea-grad">{{ $t('hero.titleLine4') }}</span>.</span
                        >
                    </span>
                </h1>

                <p class="ea-lead hero-fade mt-7 max-w-[560px] tablet-wide:mt-8" style="--reveal-delay: 420ms">
                    {{ $t('hero.leadLine1') }}<br class="hidden tablet:inline" />
                    {{ $t('hero.leadLine2') }}
                </p>

                <div class="hero-fade mt-9 flex flex-wrap items-center gap-4 tablet-wide:mt-11" style="--reveal-delay: 520ms">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                    <AppButton :label="$t('common.learnMore')" href="#how-it-works" variant="stroke" :arrow="false" />
                </div>

                <!-- Partner strip -->
                <div
                    class="hero-fade mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 tablet-wide:mt-14"
                    style="--reveal-delay: 620ms"
                >
                    <p class="ea-eyebrow !text-Neutral/400">{{ $t('hero.partners') }}</p>
                    <ul class="flex flex-wrap items-center gap-x-7 gap-y-3">
                        <li v-for="partner in HERO_PARTNERS" :key="partner.id">
                            <!-- Desaturated to sit behind the CTA in the reading
                                 order; each mark is its owner's trademark. -->
                            <img
                                :src="partner.src"
                                :alt="partner.label"
                                width="96"
                                height="26"
                                loading="lazy"
                                class="h-[26px] w-auto opacity-60 grayscale"
                            />
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Collage. Bleeds past the column on the right exactly as drawn, so
                 the last card is clipped by the viewport rather than tucked in. -->
            <div
                class="hero-fade relative flex w-full justify-center tablet-wide:block tablet-wide:w-auto"
                style="--reveal-delay: 300ms"
                role="img"
                :aria-label="$t('hero.cardsLabel')"
            >
                <div class="ea-hero-stage">
                    <div class="ea-hero-stage__inner">
                        <!-- Veiled background cards -->
                        <div
                            v-for="ghost in HERO_CARD_GHOSTS"
                            :key="ghost.id"
                            class="hero-card-in absolute rounded-[20px]"
                            :style="{
                                left: `${ghost.left}%`,
                                top: `${ghost.top}%`,
                                width: `${ghost.width}px`,
                                zIndex: ghost.z,
                                '--reveal-delay': `${ghost.delay}ms`,
                                '--card-x': '24px'
                            }"
                        >
                            <AppPicture
                                :media="mediaAsset('hero', ghost.src, ghost.width, ghost.height, { fallback: 'png' })"
                                loading="lazy"
                                fetchpriority="low"
                                img-class="h-auto w-full rounded-[20px]"
                            />
                        </div>

                        <!-- Live front cards -->
                        <div
                            v-for="(card, index) in HERO_CARDS"
                            :key="card.id"
                            class="hero-card-in absolute"
                            :style="{
                                left: `${card.left}%`,
                                top: `${card.top}%`,
                                zIndex: card.z,
                                '--reveal-delay': `${card.delay}ms`,
                                '--card-x': `${28 + index * 6}px`
                            }"
                        >
                            <EaCardFront :card="card" :eager="card.featured" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
