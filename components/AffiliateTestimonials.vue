<script setup lang="ts">
// "section - Affiliate Testimonials" (48:1564) — partner quotes on the
// Neutral/800 band, as a row of 600px cards that runs off the right edge.
//
// From the file: eyebrow "Don't just take our word for it" and a white H2, 64
// down to the row; cards 600x340, 2px Neutral/600 rule, 20px corners, 40px
// padding, a 128px portrait over the name (Roboto 14 Tinted/50) and role
// (Roboto 13 Neutral/300) beside a 400px quote (Roboto 16/24 Neutral/50) and a
// low-key "Affiliate's website ›" link; 20 between cards; the card that does
// not fit is drawn at 30% opacity. Then a four-band position control (Neutral/700
// under Neutral/500, max 800 wide, 48 above) and the Apply CTA 48 below.
//
// It is the review strip's mechanism, minus its loop and autoplay: a native
// snap scroller (useSnapScroller) with mouse drag (useDragScroll) and the
// shared position bands, one per card. Three quotes are not enough to loop
// without the same face appearing twice on screen. The 30% card is "any card
// not fully in view", measured with an IntersectionObserver on the scroller,
// so it is right at every width rather than only at 1920.
//
// "Affiliate's website" has no destination in the file yet, so it renders only
// when an entry carries an `href` — no dead links.
import { AFF_TESTIMONIALS } from '~/data/affiliates'

const scroller = ref<HTMLElement | null>(null)
const drag = useDragScroll(scroller)
const { position, activeIndex, onScroll, goTo } = useSnapScroller(scroller, () => AFF_TESTIMONIALS.length)

/** Which cards are fully on screen. */
const inView = ref<boolean[]>(AFF_TESTIMONIALS.map((_, i) => i < 2))
let io: IntersectionObserver | null = null

onMounted(() => {
    const root = scroller.value
    if (!root) return
    io = new IntersectionObserver(
        (entries) => {
            const next = [...inView.value]
            for (const entry of entries) {
                const i = Number((entry.target as HTMLElement).dataset.index)
                next[i] = entry.intersectionRatio > 0.9
            }
            inView.value = next
        },
        { root, threshold: [0, 0.9, 1] }
    )
    Array.from(root.children).forEach((child) => io!.observe(child))
})

onBeforeUnmount(() => io?.disconnect())
</script>

<template>
    <section data-dark-band class="ea-dark ea-section bg-Neutral/800 antialiased">
        <div class="ea-container">
            <SectionHeading :eyebrow="$t('affiliates.testimonials.eyebrow')" invert>
                <template #title>{{ $t('affiliates.testimonials.title') }}</template>
            </SectionHeading>
        </div>

        <ul
            ref="scroller"
            v-reveal="120"
            class="ea-reviews aff-quotes mt-12 tablet-wide:mt-16"
            role="region"
            tabindex="0"
            :aria-label="$t('affiliates.testimonials.title')"
            @scroll.passive="onScroll"
            @pointerdown="drag.onPointerDown"
            @pointermove="drag.onPointerMove"
            @pointerup="drag.onPointerUp"
            @pointercancel="drag.onPointerUp"
            @click.capture="drag.onClickCapture"
        >
            <li
                v-for="(item, i) in AFF_TESTIMONIALS"
                :key="item.id"
                :data-index="i"
                class="shrink-0 transition-opacity duration-500"
                :class="inView[i] ? 'opacity-100' : 'opacity-30'"
            >
                <figure
                    class="grid h-full w-[var(--ea-review-w)] gap-6 rounded-[20px] border-2 border-Neutral/600 p-6
                           tablet:grid-cols-[128px_minmax(0,1fr)] tablet:gap-10 tablet:p-[38px] tablet-wide:min-h-[340px]"
                >
                    <figcaption class="flex items-center gap-4 tablet:flex-col tablet:items-start tablet:gap-[21px]">
                        <AppPicture
                            :media="item.media"
                            loading="lazy"
                            img-class="size-16 rounded-lg object-cover grayscale tablet:size-32 tablet:rounded-xl"
                        />
                        <span>
                            <span class="block font-franklin text-[14px] font-medium leading-[18px] text-Tinted/50">
                                {{ $t(`affiliates.testimonials.items.${item.id}.name`) }}
                            </span>
                            <span class="mt-0.5 block font-franklin text-[13px] leading-4 text-Neutral/300">
                                {{ $t(`affiliates.testimonials.items.${item.id}.role`) }}
                            </span>
                        </span>
                    </figcaption>
                    <div class="flex max-w-[400px] flex-col gap-4">
                        <blockquote class="font-franklin text-[15px] leading-6 tracking-[0.01em] text-Neutral/50 tablet:text-[16px]">
                            &ldquo;{{ $t(`affiliates.testimonials.items.${item.id}.quote`) }}&rdquo;
                        </blockquote>
                        <a
                            v-if="item.href"
                            :href="item.href"
                            rel="noopener"
                            target="_blank"
                            class="inline-flex items-center gap-2 self-start font-poppins text-[12px] font-medium leading-[1.4] text-Neutral/300 transition-colors hover:text-white"
                        >
                            {{ $t('affiliates.testimonials.website') }}
                            <span aria-hidden="true">›</span>
                        </a>
                    </div>
                </figure>
            </li>
        </ul>

        <div class="ea-container">
            <div class="mx-auto mt-12 max-w-[800px] pb-6">
                <ScrollPositionBands
                    tone="dark"
                    :count="AFF_TESTIMONIALS.length"
                    :position="position"
                    :active-index="activeIndex"
                    :label-for="(n) => $t('affiliates.testimonials.goTo', { n })"
                    @select="goTo"
                />
            </div>
            <div v-reveal="200" class="mt-12">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
