<script setup lang="ts">
// Developer landing hero — Figma 3157:7881.
//
// Built on the home hero's model: the LCP is the headline, not an image; the
// entrance is orchestrated on mount via `.is-loaded` with no scroll dependency
// (this is above the fold, there is nothing to scroll to yet); and the card
// field behind the profile card is split by cost the same way the home collage
// is — the three full-strength cards are real DOM (crisp, translatable, figures
// server-rendered) while the three veiled ones are the flat AVIF/WebP the home
// hero already ships, because at that strength they are unreadable texture and
// three more card subtrees in the LCP path buys nothing.
//
// Two things are deliberately NOT carried over:
//   - no transform-scaled stage. The object on the right is a profile card with
//     three real links, so it goes fluid instead and keeps its type sizes; only
//     the decorative field keeps drawn-pixel geometry. See .ea-dev-hero* in
//     main.css and data/developerHero.ts.
//   - no per-line `.line-mask` reveal. The headline wraps around a developer's
//     name of unknown length, so its lines cannot be authored one at a time —
//     and the gradient run needs the heading to be the only transformed box
//     (see .ea-grad-run). It fades in as one block instead.
import type { DevFieldCard } from '~/types/developer'

const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))

/** The veiled slots all draw the home hero's size-B card: 136x160 of card box
 *  inside a 145x169 file, the extra being the baked Gaussian blur's bleed, which
 *  must be kept or the card gets a hard edge back. `.ea-blur-card` is the card
 *  box and hangs the oversized bitmap off it by `--bleed`. */
const VEIL = HERO_BLURRED_ASSETS.b
const veilMedia = mediaAsset('hero', VEIL.src, VEIL.box.width, VEIL.box.height, { fallback: 'png' })
const veilStyle = {
    '--bleed': `${VEIL.bleed}px`,
    width: `${VEIL.card.width}px`,
    height: `${VEIL.card.height}px`
}

/** The EA that fills a `front` slot, from the same published set the home hero
 *  reads — one source of truth for the cards and their figures. */
function frontCard(id: string | undefined) {
    return HERO_CARDS.find((card) => card.id === id)
}

/** Placement and entrance for one field card, as custom properties. Both
 *  dispositions are published and the media query in main.css picks one, so the
 *  switch costs no second render — the same arrangement the home collage uses.
 *  Positions are field px; the field itself is placed by CSS, per layout. */
function slotStyle(slot: DevFieldCard) {
    return {
        '--x-wide': `${slot.wide.x}px`,
        '--y-wide': `${slot.wide.y}px`,
        '--x-stack': `${slot.stacked.x}px`,
        '--y-stack': `${slot.stacked.y}px`,
        '--m-from': `${slot.motion.from}px`,
        '--m-delay': `${slot.motion.delay}ms`,
        '--m-duration': `${slot.motion.duration}ms`
    }
}

const cardMotionStyle = {
    '--m-from': `${DEV_HERO_CARD_MOTION.from}px`,
    '--m-delay': `${DEV_HERO_CARD_MOTION.delay}ms`,
    '--m-duration': `${DEV_HERO_CARD_MOTION.duration}ms`
}

/** Every drawn box, published to CSS as custom properties on the section root
 *  so the layout rules in main.css can read them instead of restating the
 *  numbers. Same arrangement as the home hero's `--hero-scale`: one declaration
 *  cascades to every consumer. Only the wash's y and ramp length are published:
 *  its drawn x and width are not used, for the reason in .ea-dev-hero__fade. */
const geometryStyle = {
    '--card-w': `${DEV_HERO_STAGE.width}px`,
    '--field-x': `${DEV_HERO_FIELD.x}px`,
    '--field-y': `${DEV_HERO_FIELD.y}px`,
    '--field-w': `${DEV_HERO_FIELD.width}px`,
    '--field-h': `${DEV_HERO_FIELD.height}px`,
    '--fade-y': `${DEV_HERO_FADE.y}px`,
    '--fade-h': `${DEV_HERO_FADE.height}px`
}
</script>

<template>
    <!-- The bottom padding is the drawn 96 at EVERY width, unlike the top, which
         scales down. That is not spacing taste: the wash below the pile reaches
         white exactly 96px under the card, so the section has to clip exactly
         there. Give it less and the clip lands mid-ramp and cuts a strip of
         half-washed figures off the deepest card. -->
    <section
        id="top"
        :class="['ea-dev-hero pt-14 pb-24 tablet:pt-[72px] tablet-wide:pt-24', { 'is-loaded': loaded }]"
        :style="geometryStyle"
    >
        <div class="ea-container ea-dev-hero__inner">
            <!-- Copy -->
            <div class="ea-dev-hero__copy">
                <p class="ea-eyebrow ea-eyebrow--brand hero-fade" style="--reveal-delay: 60ms">
                    {{ $t('devHero.eyebrow') }}
                </p>

                <!-- `.ea-h1` tops out at 64px only past 1921; this page draws it
                     at 64 on the 1920 frame, one step earlier than the home
                     page's headline, so the top step is promoted here rather
                     than moved on the shared scale. -->
                <i18n-t
                    keypath="devHero.title"
                    tag="h1"
                    class="ea-h1 ea-grad-run hero-fade mt-5 tablet-wide:mt-6
                           desktop-md:text-[64px] desktop-md:leading-[1.2] desktop-md:tracking-[-2px]"
                    style="--reveal-delay: 140ms"
                >
                    <template #name>
                        <span class="ea-grad-run__accent">{{ DEVELOPER.name }}</span>
                    </template>
                </i18n-t>

                <!-- The bio is published content, not UI copy — see
                     data/developerProfile.ts. -->
                <p class="ea-lead hero-fade mt-6 tablet-wide:mt-8" style="--reveal-delay: 260ms">
                    {{ DEVELOPER.bio }}
                </p>

                <!-- Figma 3186:7507. The page's one CTA, and the same Button
                     component the topbar and the closing banner run — drawn
                     Variant=Default, which is the gradient pill. -->
                <div class="hero-fade mt-10 tablet-wide:mt-12" style="--reveal-delay: 380ms">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <!-- The card, and the pile it sits on. The pile is decoration behind
                 a real object, so it is hidden from assistive tech outright
                 rather than described — nothing in it is focusable. -->
            <div class="ea-dev-hero__stage">
                <div class="ea-dev-hero__field" aria-hidden="true">
                    <div
                        v-for="slot in DEV_HERO_FIELD_CARDS"
                        :key="slot.id"
                        class="ea-dev-hero__field-card ea-dev-rise"
                        :style="slotStyle(slot)"
                    >
                        <EaCardFront v-if="slot.kind === 'front'" :card="frontCard(slot.card)!" />
                        <div v-else class="ea-blur-card ea-blur-card--b" :style="veilStyle">
                            <AppPicture :media="veilMedia" loading="lazy" fetchpriority="low" />
                        </div>
                    </div>
                </div>

                <!-- Drawn after the pile and before the card, so it washes the
                     one and leaves the other alone. -->
                <div class="ea-dev-hero__fade" aria-hidden="true" />

                <DeveloperProfileCard
                    :developer="DEVELOPER"
                    eager
                    class="ea-dev-rise relative"
                    :style="cardMotionStyle"
                />
            </div>
        </div>
    </section>
</template>
