<script setup lang="ts">
// "The Edge" — five advantages in a horizontal scroller, Figma 3295:10242.
//
// The same mechanism as HowItWorksSection, on purpose: native scroll-snap, the
// row padded on the LEFT ONLY by the .ea-container gutter so the first card sits
// under the heading and the rest run off the right edge, and one travelling fill
// over five bands that is both progress read-out and jump control. The drawn
// "Cards" frame is 1640 wide at 1920 — gutter to viewport edge, nothing more.
// Scroll maths is useSnapScroller's (the How-it-works logic, lifted out for the
// review strip), so nothing here restates a card width.
//
// Cards are 480 wide with 40 between them and a 416x400 panel. Figma strokes
// are INSIDE, CSS borders outside the padding box, so the drawn 32px padding is
// 30 + the 2px border and the panel lands on its 416.
//
// The row ENDS on the page margin too: a trailing spacer (the ::after below)
// leaves the normal side padding — 60 at desktop, 40 / 32 / 20 down the ramp —
// after the last card, so scrolled to the end it does not sit on the viewport
// edge. The spacer is the padding MINUS the flex gap, because the gap is also
// laid between the last card and it; on a phone the 20px gap alone is the
// padding and the spacer is zero wide. A pseudo-element rather than
// padding-right, which a flex scroller does not reliably add to its scroll
// width, and rather than a DOM node, which useSnapScroller would count as a card.
//
// A mouse can drag the row (useDragScroll); touch and trackpads scroll it
// natively, as they always did.
//
// The panels are rasters exported from the file at 2x — the frames are named
// "img Animation Card", so motion may follow, and the <div> they sit in is the
// slot a clip or canvas would take over without moving anything.
import { FOR_DEV_EDGE } from '~/data/content'

const scroller = ref<HTMLElement | null>(null)
const { position, activeIndex, onScroll, goTo } = useSnapScroller(scroller, () => FOR_DEV_EDGE.length)
const drag = useDragScroll(scroller)
</script>

<template>
    <section class="ea-section overflow-x-clip bg-white">
        <div class="ea-container">
            <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('forDevEdge.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-module-heading mt-6">
                {{ $t('forDevEdge.titleLead') }}
                <span class="ea-grad">{{ $t('forDevEdge.titleAccent') }}</span>{{ $t('forDevEdge.titleTail') }}
            </h2>

            <p v-reveal="180" class="ea-module-description mt-6 max-w-[640px]">
                {{ $t('forDevEdge.lead') }}
            </p>
        </div>

        <!-- Gutter padding and scroll-padding are one expression; see
             HowItWorksSection for why `100%` and not `100vw`. -->
        <div
            ref="scroller"
            v-reveal="240"
            role="region"
            tabindex="0"
            :aria-label="$t('forDevEdge.eyebrow')"
            class="ea-scroller ea-scroller--drag mt-12 gap-5 pl-5 scroll-pl-5 tablet:pl-8 tablet:scroll-pl-8 tablet-wide:mt-16 tablet-wide:gap-6 tablet-wide:pl-10
                   tablet-wide:scroll-pl-10 desktop:gap-10 desktop:pl-[max(60px,calc((100%-1360px)/2))]
                   desktop:scroll-pl-[max(60px,calc((100%-1360px)/2))]
                   after:block after:w-0 after:shrink-0 after:content-[''] tablet:after:w-3 tablet-wide:after:w-4 desktop:after:w-5"
            @scroll.passive="onScroll"
            @pointerdown="drag.onPointerDown"
            @pointermove="drag.onPointerMove"
            @pointerup="drag.onPointerUp"
            @pointercancel="drag.onPointerUp"
            @click.capture="drag.onClickCapture"
            @dragstart.prevent
        >
            <article
                v-for="card in FOR_DEV_EDGE"
                :key="card.id"
                class="flex w-[min(86vw,480px)] shrink-0 flex-col gap-6 rounded-3xl border-2 border-Tinted/100 bg-white
                       p-5 pb-8 tablet-wide:p-[30px] tablet-wide:pb-[46px]"
            >
                <div class="ea-media aspect-[416/400] w-full overflow-hidden rounded-xl bg-Tinted/50">
                    <AppPicture
                        :media="card.media"
                        loading="lazy"
                        sizes="(min-width: 1024px) 416px, 86vw"
                        img-class="h-full w-full object-cover"
                    />
                </div>

                <div>
                    <h3 class="flex items-start gap-2">
                        <img src="/img/icons/chevrons-right.svg" alt="" width="20" height="28" class="shrink-0" aria-hidden="true" />
                        <!-- 16 / 140% and 14 / 140%, 8 apart, at 360 AND 600; the
                             drawn 20/28 over 16/26, 4 apart, from tablet-wide. -->
                        <span
                            class="font-poppins text-[16px] font-semibold leading-[1.4] text-Ink/950
                                   tablet-wide:text-[20px] tablet-wide:leading-7 tablet-wide:tracking-[-0.5px]"
                        >
                            {{ $t(`forDevEdge.cards.${card.id}.title`) }}
                        </span>
                    </h3>
                    <p class="mt-2 font-franklin text-[14px] leading-[1.4] text-Tinted/700 tablet-wide:mt-1 tablet-wide:text-[16px] tablet-wide:leading-[26px]">
                        {{ $t(`forDevEdge.cards.${card.id}.description`) }}
                    </p>
                </div>
            </article>
        </div>

        <!-- Five bands: 152 wide, 10 apart, in an 800 frame — the same control
             as How it works, one more band. -->
        <div class="ea-container mt-12 flex justify-center">
            <div v-reveal="280" class="relative -my-[10px] flex w-full max-w-[800px] gap-[10px] py-[10px]">
                <button
                    v-for="(card, index) in FOR_DEV_EDGE"
                    :key="card.id"
                    type="button"
                    class="relative h-1 flex-1 rounded-[1px] bg-Tinted/50 before:absolute before:inset-x-0
                           before:-inset-y-[10px] before:content-['']"
                    :aria-label="$t('common.goToStep', { n: index + 1 })"
                    :aria-current="index === activeIndex ? 'true' : undefined"
                    @click="goTo(index)"
                />
                <span
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-y-[10px] left-0 w-[calc((100%-40px)/5)] rounded-[1px]
                           bg-Tinted/200 will-change-transform"
                    :style="{ '--p': position, transform: 'translateX(calc(var(--p) * (100% + 10px)))' }"
                />
            </div>
        </div>

        <!-- Left-aligned, 72 under the bands (24 of nav padding + 48). -->
        <div class="ea-container mt-[72px]">
            <div v-reveal="120">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
