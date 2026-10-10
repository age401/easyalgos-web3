<script setup lang="ts">
// "section - Hero" on the Affiliates page — Figma 16:1151.
//
// A dark band (Neutral/900) under the dark topbar: the copy column on the left
// at its drawn 680px, and the animated referral network beside it, which the
// frame lets run past the content column into the right gutter (the graphic is
// placed at x=732 of a 1480 container and is 844 wide). That overrun is kept:
// the graphic column is widened past its grid track and the section clips.
//
// The entrance is the home hero's: the headline reveals a line at a time out of
// `.line-mask`, everything else rises in on `.hero-fade`, both released by
// `.is-loaded` on mount — no scroll dependency, this is the first screen.
// The graphic runs its own, longer entrance alongside (see
// AffiliateHeroGraphic), timed so the cards land as the lead finishes.
//
// Drawn at 1920 only. The narrower steps are ours. From `tablet-wide` the
// graphic stays beside the copy, and where its column is too narrow for the
// drawn stage it switches to the stage stood on end (AffiliateHeroGraphic's
// `tall` layout) rather than shrinking the drawing until it cannot be read.
// Below `tablet-wide` it drops under the copy and scales as one box. The
// headline steps 40 / 52 / 48 (beside a narrower graphic column) / 64.
//
// No eyebrow: the file's "THE PROBLEM" was a leftover from the page this was
// built from, and Diego took it out.
import { AFF_HERO_PARTNERS } from '~/data/affiliates'

const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))

const LINES = ['titleLine1', 'titleLine2', 'titleLine3', 'titleLine4'] as const
</script>

<template>
    <section
        id="top"
        data-dark-band
        :class="['ea-dark relative isolate overflow-hidden bg-Neutral/900 antialiased', { 'is-loaded': loaded }]"
    >
        <div
            class="ea-container grid items-start gap-12 pb-16 pt-14 tablet:pb-20 tablet:pt-20
                   tablet-wide:grid-cols-[minmax(0,1fr)_minmax(0,400px)] tablet-wide:items-center tablet-wide:gap-10 tablet-wide:py-24
                   desktop:grid-cols-[minmax(0,680px)_minmax(0,1fr)] desktop:items-start desktop:gap-[60px] desktop:py-[128px]"
        >
            <div class="relative z-10 min-w-0">
                <h1
                    class="font-poppins text-[40px] font-medium leading-[1.2] tracking-[-1.4px] text-white
                           tablet:text-[52px] tablet:tracking-[-1.8px] tablet-wide:text-[48px]
                           desktop:text-[64px] desktop:tracking-[-2px]"
                >
                    <span
                        v-for="(key, i) in LINES"
                        :key="key"
                        class="line-mask"
                        :style="{ '--reveal-delay': `${120 + i * 90}ms` }"
                    >
                        <!-- The gradient run sits on its own line as drawn, so it
                             can take `.ea-grad` on the run itself. The mask pads
                             the line box so the descenders are not clipped. -->
                        <span v-if="i === 1"><span class="ea-grad">{{ $t(`affiliates.hero.${key}`) }}</span></span>
                        <span v-else>{{ $t(`affiliates.hero.${key}`) }}</span>
                    </span>
                </h1>

                <p
                    class="hero-fade mt-8 max-w-[680px] font-franklin text-[16px] leading-[1.65] text-Neutral/200 tablet:text-[18px]"
                    style="--reveal-delay: 520ms"
                >
                    {{ $t('affiliates.hero.lead') }}
                </p>

                <div class="hero-fade mt-10 flex flex-wrap items-center gap-2.5 tablet:mt-12" style="--reveal-delay: 620ms">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                    <AppButton :label="$t('common.logIn')" :href="LOGIN_HREF" variant="ink" :arrow="false" />
                </div>

                <!-- "#1 Algo-trading partner" and the three marks, as on the home
                     hero (HeroBrandLogo), on dark: Neutral/400 label, Neutral/200
                     separators. -->
                <div
                    class="hero-fade mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 tablet:mt-12"
                    style="--reveal-delay: 720ms"
                >
                    <p class="ea-eyebrow ea-eyebrow--bare !text-Neutral/400">{{ $t('affiliates.hero.partners') }}</p>
                    <ul class="aff-hero-partners flex items-center gap-4">
                        <template v-for="(p, i) in AFF_HERO_PARTNERS" :key="p.id">
                            <li v-if="i > 0" class="size-1 rounded-full bg-Neutral/200" aria-hidden="true" />
                            <li><HeroBrandLogo :id="p.id" :label="p.label" /></li>
                        </template>
                    </ul>
                </div>
            </div>

            <!-- Wider than its track from `tablet-wide` up: the drawn overrun into
                 the gutter (see the header comment), capped in main.css at the
                 gutter that actually exists so it never runs off the viewport. -->
            <div class="aff-hero__graphic relative min-w-0">
                <AffiliateHeroGraphic />
            </div>
        </div>
    </section>
</template>
