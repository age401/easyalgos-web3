<script setup lang="ts">
// "How it works" — four numbered steps in a horizontal scroller (Figma 641:7060).
//
// Native scroll-snap rather than a carousel library: it costs no JS to operate,
// gets touch/trackpad momentum and keyboard scrolling for free, and degrades to a
// plain scrollable row if scripting fails. The only JS here reads scrollLeft to
// place the progress indicator, and writes it when a band is clicked.
//
// The row is padded on the LEFT ONLY, by the .ea-container gutter, so the first
// card lines up with the section title while the row runs to the viewport edge
// and the next card peeks in. That is literally what the design draws: the
// "Cards" frame is 1640 wide at the 1920 reference, which is 1920 minus the
// 280px gutter — gutter to right edge, nothing more.
//
// `scroll-padding-left` has to match that gutter. Snap alignment is measured
// against the SNAPPORT, not the padding box, so without it every card after the
// first would snap flush to the viewport edge instead of to the gutter — the row
// would step out of alignment with the heading the moment you scrolled.
//
// A consequence of 660px cards inside a 1360px column: the scroll distance is
// shorter than the card run, so at wide viewports the last card can never reach
// the gutter. Positions are therefore derived from the cards' own offsets
// CLAMPED to the scrollable distance, and the final band is claimed outright at
// the end of the scroll — clicking band 4 must land somewhere the scroller can
// actually rest, or snapping would immediately drag it back and the indicator
// would disagree with the view.
import { STEPS } from '~/data/content'

const scroller = ref<HTMLElement | null>(null)

/** Continuous position through the steps, 0..STEPS.length-1. Fractional while
 *  the row is mid-drag — the indicator reads it directly, so dragging the
 *  scroller drags the indicator rather than waiting for a snap to settle. */
const position = ref(0)
const activeIndex = computed(() => Math.round(position.value))

/** Set once on mount. Governs whether clicks animate the scroll and whether a
 *  clip ever starts on its own. */
const reducedMotion = ref(false)

let ticking = false

/** Where each card sits in the scroll range, clamped to what is reachable.
 *  Measured off the DOM rather than computed from a card width so it stays
 *  correct at every breakpoint and gap without restating either here. */
function snapTargets(el: HTMLElement): number[] {
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const first = el.firstElementChild as HTMLElement | null
    if (!first) return STEPS.map(() => 0)
    return Array.from(el.children).map((child) =>
        Math.min(Math.max(0, (child as HTMLElement).offsetLeft - first.offsetLeft), max)
    )
}

function measure() {
    ticking = false
    const el = scroller.value
    if (!el) return
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    if (max <= 0) {
        position.value = 0
        return
    }
    const x = el.scrollLeft
    const targets = snapTargets(el)

    // Piecewise-linear between the reachable card positions. A zero-width span
    // means that card is pinned at the end alongside its neighbour; it is
    // stepped over rather than divided by.
    let p = 0
    for (let i = 0; i < targets.length - 1; i++) {
        const span = targets[i + 1] - targets[i]
        if (span <= 0) {
            if (x >= targets[i + 1]) p = i + 1
            continue
        }
        if (x <= targets[i + 1]) {
            p = i + (x - targets[i]) / span
            break
        }
        p = i + 1
    }
    // At the far end the last step is the one on screen, whatever the arithmetic
    // above concluded from the clamped targets.
    if (x >= max - 1) p = targets.length - 1
    position.value = p
}

function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(measure)
}

function goTo(index: number) {
    const el = scroller.value
    if (!el) return
    el.scrollTo({ left: snapTargets(el)[index] ?? 0, behavior: reducedMotion.value ? 'auto' : 'smooth' })
}

// ------------------------------------------------------------------ video --
// Every step CAN carry a walkthrough clip; none does yet. Where `video` is
// undefined the card renders the still alone and no transport control at all —
// an affordance that does nothing is worse than none. Dropping a clip in later
// is one line in data/content.ts and nothing here changes.
const videos = ref<(HTMLVideoElement | null)[]>([])
const isPlaying = ref<boolean[]>(STEPS.map(() => false))
const clipProgress = ref<number[]>(STEPS.map(() => 0))

function setVideo(index: number, el: unknown) {
    videos.value[index] = (el as HTMLVideoElement | null) ?? null
}

function onTimeUpdate(index: number, event: Event) {
    const el = event.target as HTMLVideoElement
    clipProgress.value[index] = el.duration > 0 ? el.currentTime / el.duration : 0
}

function toggle(index: number) {
    const el = videos.value[index]
    if (!el) return
    // play() rejects when the gesture is not trusted or the file is missing;
    // there is nothing to recover, and an unhandled rejection in the console is
    // worse than a control that did not take.
    if (el.paused) void el.play().catch(() => {})
    else el.pause()
}

/** Only the card in view plays. Under reduced motion nothing plays unprompted —
 *  the control still works, it just has to be asked. */
watch(activeIndex, (index) => {
    videos.value.forEach((el, i) => {
        if (!el) return
        if (i === index && !reducedMotion.value) void el.play().catch(() => {})
        else el.pause()
    })
})

onMounted(() => {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    measure()
})
</script>

<template>
    <section id="how-it-works" class="ea-section overflow-x-clip bg-white">
        <div class="ea-container">
            <SectionHeading :eyebrow="$t('howItWorks.eyebrow')">
                <template #title>
                    {{ $t('howItWorks.titleLine1') }}<br />
                    <span class="ea-grad">{{ $t('howItWorks.titleAccent') }}</span>.
                </template>
            </SectionHeading>
        </div>

        <!-- Left padding and scroll-padding are the same expression: the
             .ea-container gutter, which past 1360px is half the leftover width.
             Keep the two in step or the cards drift off the heading.
             `100%`, NOT `100vw`: 100vw counts the scrollbar and .ea-container
             centres inside the content box, so the vw form sits the cards ~7px
             right of the title on any platform with a classic scrollbar. -->
        <div
            ref="scroller"
            v-reveal="140"
            role="region"
            tabindex="0"
            :aria-label="$t('howItWorks.eyebrow')"
            class="ea-scroller mt-16 gap-5 pl-5 scroll-pl-5 tablet:pl-8 tablet:scroll-pl-8 tablet-wide:gap-6 tablet-wide:pl-10
                   tablet-wide:scroll-pl-10 desktop:gap-10 desktop:pl-[max(60px,calc((100%-1360px)/2))]
                   desktop:scroll-pl-[max(60px,calc((100%-1360px)/2))]"
            @scroll.passive="onScroll"
        >
            <!-- 30px padding, not the 32 Figma states: the card's 2px stroke is
                 drawn INSIDE in Figma, so it eats into that padding, whereas a
                 CSS border sits outside the padding box. 2 + 30 = the drawn 32,
                 and the media panel lands on its 596px. -->
            <article
                v-for="(step, index) in STEPS"
                :key="step.id"
                class="flex w-[min(86vw,660px)] shrink-0 flex-col gap-6 rounded-3xl border-2 border-Tinted/100 bg-white
                       p-5 pb-8 tablet-wide:p-[30px] tablet-wide:pb-[46px]"
                :aria-label="`${index + 1}. ${$t(`howItWorks.steps.${step.id}.title`)}`"
            >
                <div class="ea-media ea-media-hover aspect-[596/400] w-full rounded-xl bg-Tinted/100">
                    <AppPicture
                        :media="step.media"
                        loading="lazy"
                        sizes="(min-width: 1280px) 596px, 86vw"
                        img-class="h-full w-full rounded-xl object-cover"
                    />

                    <!-- The clip sits over the still and uses it as its poster, so
                         the box never changes and nothing shifts when it decodes. -->
                    <video
                        v-if="step.video"
                        :ref="(el) => setVideo(index, el)"
                        :src="step.video"
                        :poster="step.media.fallback"
                        class="absolute inset-0 h-full w-full rounded-xl object-cover"
                        muted
                        playsinline
                        preload="metadata"
                        @play="isPlaying[index] = true"
                        @pause="isPlaying[index] = false"
                        @timeupdate="onTimeUpdate(index, $event)"
                    />
                    <PlaybackControl
                        v-if="step.video"
                        class="absolute bottom-5 right-5"
                        :playing="isPlaying[index]"
                        :progress="clipProgress[index]"
                        :label="$t('common.playVideo')"
                        @click="toggle(index)"
                    />
                </div>

                <div>
                    <h3 class="flex items-center gap-2">
                        <!-- Spoken as "1. Apply" from the card's own label; the
                             glyphs would otherwise be read out as "zero one". -->
                        <span
                            class="ea-num font-poppins text-[1.25rem] font-semibold leading-5 transition-colors duration-500"
                            :class="index === activeIndex ? 'text-Blue/600' : 'text-Tinted/300'"
                            aria-hidden="true"
                        >
                            {{ String(index + 1).padStart(2, '0') }}
                        </span>
                        <span class="ea-h3">{{ $t(`howItWorks.steps.${step.id}.title`) }}</span>
                    </h3>
                    <p class="ea-body mt-1">{{ $t(`howItWorks.steps.${step.id}.description`) }}</p>
                </div>
            </article>
        </div>

        <!-- Four bands: jump targets and a progress read-out at once.
             The travelling fill is ONE element sliding over the track, not four
             bars taking turns being dark — a colour swap reads as a blink where
             the design reads as movement. Its transform is driven straight from
             scroll position, so a drag moves it 1:1 and a click rides the smooth
             scroll; there is no CSS transition to lag behind either, and reduced
             motion falls out of it for free (the click stops animating, so the
             fill stops travelling and simply lands). -->
        <div class="ea-container mt-12 flex justify-center">
            <!-- The 10px of vertical padding is hit area for a 4px control, and is
                 cancelled by the matching negative margin so it never shows up in
                 the section's rhythm. -->
            <div v-reveal="200" class="relative -my-[10px] flex w-full max-w-[800px] gap-[10px] py-[10px]">
                <button
                    v-for="(step, index) in STEPS"
                    :key="step.id"
                    type="button"
                    class="relative h-1 flex-1 rounded-[1px] bg-Tinted/50 before:absolute before:inset-x-0
                           before:-inset-y-[10px] before:content-['']"
                    :aria-label="$t('common.goToStep', { n: index + 1 })"
                    :aria-current="index === activeIndex ? 'true' : undefined"
                    @click="goTo(index)"
                />
                <!-- inset-y-[10px] reproduces the track's own 4px height inside the
                     padded hit area. The width is one band of four separated by
                     three 10px gaps; the translate percentage then resolves
                     against that same width, so one step is exactly band + gap. -->
                <span
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-y-[10px] left-0 w-[calc((100%-30px)/4)] rounded-[1px]
                           bg-Tinted/200 will-change-transform"
                    :style="{ '--p': position, transform: 'translateX(calc(var(--p) * (100% + 10px)))' }"
                />
            </div>
        </div>

        <!-- Left-aligned, not centred: the button's frame fills the 1360 column
             and sits its child at x=0 (Figma 641:8209). -->
        <div class="ea-container mt-[72px]">
            <div v-reveal="120">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
