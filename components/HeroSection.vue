<script setup lang="ts">
// Hero.
//
// LCP is the headline, not an image: nothing above the fold waits on a network
// image, the two display faces are preloaded, and the only eager raster on the
// page is the featured card's 64px avatar. The entrance is orchestrated on mount
// via `.is-loaded` (line-mask / hero-fade / ea-hero-card in main.css) so the copy
// reveals line by line and the collage rises into place, with no scroll
// dependency — this is above the fold, there is nothing to scroll to yet.
//
// The collage is split by cost, per the hybrid decision: the seven front cards
// are real DOM — crisp, hoverable, translatable, with server-rendered figures —
// while the veiled cards behind them are flat AVIF/WebP, because at 20% strength
// they are unreadable texture and fifteen more card subtrees in the LCP path is
// the most expensive thing this page could do for the least gain.
//
// Both dispositions ship in one DOM tree. The wide and stacked layouts hold the
// same cards in the same paint order and differ only in coordinates, so each
// card carries both and CSS picks at 1025px — see data/heroCards.ts for the
// geometry and main.css for how the stage is placed, scaled and clipped.
const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))

// The collage's scale — computed here, not in CSS. It used to be
// `clamp(0.4, calc((tan(atan2(100vw,1px)) + 130) / 900), 1)` (stacked) and a
// width/height clamp of the same shape (wide): calc() can't divide a length by
// a length, and scale() needs a plain number, so tan(atan2(length, 1px)) is
// the standard trick for casting one into the other. It is NOT reliable on
// real WebKit — it first silently resolved 100cqw to zero (collage rendered
// at scale 0.144), and after switching to vw it STILL produced the wrong
// number on a real iPad: --hero-scale's own declared text was correct, but
// `transform`'s actually-applied matrix did not match it, meaning the
// arithmetic itself misfires once real WebKit evaluates it — not a matter of
// which unit feeds it. `window.innerWidth`/`innerHeight` have no such
// ambiguity, so the whole computation moved here; the formulas themselves are
// unchanged from what CSS used to compute. 136 is --ea-topbar-h +
// --ea-trustpilot-h (68 + 68) from main.css.
function computeHeroScale(): number {
    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
    const vw = window.innerWidth
    if (vw <= 1024) {
        // Stacked: a constant 65px bleed below 900 - 130 = 770px, clamped to 1
        // above it — see the "[768~]" Figma reference frame.
        return clamp((vw + 130) / 900, 0.4, 1)
    }
    // Wide: shrinks on width beyond 1800, or on height so the section still
    // fits `100vh - topbar - trustpilot` against its 932px drawn height,
    // whichever constraint bites harder.
    const widthTerm = vw / 1800
    const heightTerm = (window.innerHeight - 136) / 932
    return clamp(Math.min(widthTerm, heightTerm), 0.3, 1)
}

const heroScale = ref(1)
let resizeQueued = false
function scheduleHeroScale() {
    if (resizeQueued) return
    resizeQueued = true
    requestAnimationFrame(() => {
        resizeQueued = false
        heroScale.value = computeHeroScale()
    })
}
onMounted(() => {
    heroScale.value = computeHeroScale()
    window.addEventListener('resize', scheduleHeroScale, { passive: true })
})
onUnmounted(() => window.removeEventListener('resize', scheduleHeroScale))

/** Placement + entrance for one card, as custom properties. The layout switch is
 *  a media query rather than a second render, so both coordinate pairs go out
 *  and CSS chooses; a card missing from one layout is hidden there instead. */
function slotStyle(card: { wide: { x: number; y: number } | null; stacked: { x: number; y: number } | null; motion: { from: number; delay: number; duration: number } }) {
    return {
        '--x-wide': card.wide ? `${card.wide.x}px` : undefined,
        '--y-wide': card.wide ? `${card.wide.y}px` : undefined,
        '--x-stack': card.stacked ? `${card.stacked.x}px` : undefined,
        '--y-stack': card.stacked ? `${card.stacked.y}px` : undefined,
        '--m-from': `${card.motion.from}px`,
        '--m-delay': `${card.motion.delay}ms`,
        '--m-duration': `${card.motion.duration}ms`
    }
}
</script>

<template>
    <section id="top" :class="['ea-hero', { 'is-loaded': loaded }]" :style="{ '--hero-scale': heroScale }">
        <!-- Copy -->
        <div class="ea-hero__copy ea-container">
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
                    <p class="ea-eyebrow ea-eyebrow--bare !text-Neutral/400">{{ $t('hero.partners') }}</p>
                    <ul class="flex flex-wrap items-center gap-x-7 gap-y-3">
                        <li v-for="partner in HERO_PARTNERS" :key="partner.id">
                            <!-- Inlined, not <img>: each mark is drawn two-tone
                                 and hovering recolours both tones at once. Each
                                 is its owner's trademark. -->
                            <HeroBrandLogo :id="partner.id" :label="partner.label" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Collage. On the wide layout this wrapper collapses to `display:
             contents` and the stage is pinned to the viewport's centre line; on
             the stacked one it is the flex remainder, and clips the bottom of
             the pile. -->
        <div class="ea-hero__stage-wrap">
            <div class="ea-hero__stage" role="img" :aria-label="$t('hero.cardsLabel')">
                <!-- Veiled background cards -->
                <div
                    v-for="veil in HERO_CARDS_BLURRED"
                    :key="veil.id"
                    :class="[
                        'ea-hero-card ea-blur-card',
                        `ea-blur-card--${veil.size}`,
                        { 'ea-hero-card--wide-only': !veil.stacked, 'ea-hero-card--stacked-only': !veil.wide }
                    ]"
                    :style="{
                        ...slotStyle(veil),
                        '--bleed': `${HERO_BLURRED_ASSETS[veil.size].bleed}px`,
                        width: `${HERO_BLURRED_ASSETS[veil.size].card.width}px`,
                        height: `${HERO_BLURRED_ASSETS[veil.size].card.height}px`
                    }"
                >
                    <AppPicture
                        :media="
                            mediaAsset(
                                'hero',
                                HERO_BLURRED_ASSETS[veil.size].src,
                                HERO_BLURRED_ASSETS[veil.size].box.width,
                                HERO_BLURRED_ASSETS[veil.size].box.height,
                                { fallback: 'png' }
                            )
                        "
                        loading="lazy"
                        fetchpriority="low"
                    />
                </div>

                <!-- Live front cards -->
                <div
                    v-for="card in HERO_CARDS"
                    :key="card.id"
                    class="ea-hero-card"
                    :style="slotStyle(card)"
                >
                    <EaCardFront :card="card" :eager="card.featured" />
                </div>
            </div>
        </div>
    </section>
</template>
