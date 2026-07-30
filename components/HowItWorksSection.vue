<script setup lang="ts">
// "How it works" — four steps in a horizontal scroller.
//
// Native scroll-snap rather than a carousel library: it costs no JS to operate,
// gets touch/trackpad momentum and keyboard scrolling for free, and degrades to a
// plain scrollable row if scripting fails. The only JS here reads scrollLeft to
// light the matching progress bar, and writes it when a bar is clicked.
//
// The step mockups are flat exports (they are dense dashboard UI — hundreds of
// nodes each in the design), lazy-loaded with explicit dimensions. `video` is
// undefined on every step for now, so no play affordance is rendered: an
// affordance that does nothing is worse than none.
import { STEPS } from '~/data/content'

const scroller = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
let ticking = false

function measure() {
    ticking = false
    const el = scroller.value
    if (!el) return
    // Nearest snap point to the current offset, derived from the scrollable
    // distance rather than a hard-coded card width, so it stays correct at every
    // breakpoint and gap.
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll <= 0) {
        activeIndex.value = 0
        return
    }
    const ratio = el.scrollLeft / maxScroll
    activeIndex.value = Math.round(ratio * (STEPS.length - 1))
}

function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(measure)
}

function goTo(index: number) {
    const el = scroller.value
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    el.scrollTo({ left: (maxScroll * index) / (STEPS.length - 1), behavior: 'smooth' })
}

onMounted(() => measure())
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

        <!-- Scroller. Padded with the container's gutter so the first card lines up
             with the heading while the row still runs to the viewport edge. -->
        <div
            ref="scroller"
            v-reveal="140"
            class="ea-scroller mt-12 gap-5 px-5 tablet:px-8 tablet-wide:mt-16 tablet-wide:gap-6 tablet-wide:px-10 desktop:px-[max(60px,calc((100vw-1360px)/2))]"
            @scroll.passive="onScroll"
        >
            <article
                v-for="(step, index) in STEPS"
                :key="step.id"
                class="flex w-[min(86vw,660px)] shrink-0 flex-col gap-6 rounded-3xl border-2 border-Tinted/100 bg-white p-5 pb-8 tablet-wide:p-8 tablet-wide:pb-12"
                :aria-label="`${index + 1}. ${$t(`howItWorks.steps.${step.id}.title`)}`"
            >
                <div class="ea-media ea-media-hover aspect-[596/400] w-full rounded-2xl bg-Tinted/50">
                    <AppPicture
                        :media="step.media"
                        loading="lazy"
                        sizes="(min-width: 1024px) 660px, 86vw"
                        img-class="h-full w-full rounded-2xl object-cover"
                    />
                </div>

                <div>
                    <h3 class="ea-h3">{{ $t(`howItWorks.steps.${step.id}.title`) }}</h3>
                    <p class="ea-body mt-2 max-w-[520px]">{{ $t(`howItWorks.steps.${step.id}.description`) }}</p>
                </div>
            </article>
        </div>

        <!-- Progress bars, doubling as jump targets. -->
        <div class="ea-container mt-10 flex justify-center">
            <div v-reveal="200" class="flex w-full max-w-[800px] gap-3">
                <button
                    v-for="(step, index) in STEPS"
                    :key="step.id"
                    type="button"
                    class="ea-progress flex-1"
                    :data-active="index === activeIndex"
                    :aria-label="$t('common.goToStep', { n: index + 1 })"
                    :aria-current="index === activeIndex ? 'true' : undefined"
                    @click="goTo(index)"
                />
            </div>
        </div>

        <div class="ea-container mt-14">
            <div v-reveal="120">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
