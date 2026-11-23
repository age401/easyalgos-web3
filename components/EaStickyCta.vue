<script setup lang="ts">
// A slim call-to-action bar that docks to the bottom of the viewport once the
// page's own CTA has scrolled away.
//
// Not in the drawing - it is what the single-column layouts need. On a desktop
// the identity card is sticky, so "Get this EA for free" is on screen for the
// whole page. On a tablet or a phone the card scrolls off after the first
// screen and there are three more screens of chart, heatmap and screenshots
// with no way to act on them. This puts the same button back within reach
// without repeating it in the flow.
//
// It watches two things with one IntersectionObserver and no scroll listener:
// the real CTA (`target`), and a sentinel at the end of the page's own content.
// The bar shows only while the CTA is ABOVE the viewport and the sentinel has
// not been reached, so it never covers the button it stands in for, and it
// steps aside for the closing banner - which is a CTA of its own - and the
// footer.
//
// `inert` while hidden: it is off-screen then, and should not hold a tab stop.
interface Props {
    /** id of the in-flow CTA this bar stands in for. */
    target: string
    label: string
    /** A shorter label for phones. Falls back to `label`. */
    shortLabel?: string
    href: string
    title: string
    caption?: string
}
const props = withDefaults(defineProps<Props>(), { shortLabel: undefined, caption: undefined })

const sentinel = ref<HTMLElement | null>(null)
const pastTarget = ref(false)
const reachedEnd = ref(false)
const visible = computed(() => pastTarget.value && !reachedEnd.value)

let observer: IntersectionObserver | null = null

onMounted(() => {
    const target = document.getElementById(props.target)
    if (!target || !sentinel.value) return
    observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.target === target) {
                // Gone, and gone off the TOP: below the fold does not count.
                pastTarget.value = !entry.isIntersecting && entry.boundingClientRect.bottom < 0
            } else {
                reachedEnd.value = entry.isIntersecting || entry.boundingClientRect.top < 0
            }
        }
    })
    observer.observe(target)
    observer.observe(sentinel.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <div>
        <!-- End-of-content marker. Zero height, in the flow where this component
             is placed: the last thing in the page's own <main> content. -->
        <div ref="sentinel" aria-hidden="true" />

        <div
            :class="[
                'fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 ease-smooth',
                'tablet:px-5',
                visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-[calc(100%+16px)] opacity-0'
            ]"
            :inert="!visible"
        >
            <div
                class="mx-auto flex max-w-[720px] items-center gap-3 rounded-2xl border border-Tinted/100 bg-white/90 py-2 pl-3 pr-2
                       shadow-[0_18px_48px_-12px_rgba(28,24,51,0.28),0_2px_6px_0_rgba(28,24,51,0.06)] backdrop-blur-md tablet:gap-4 tablet:pl-4"
            >
                <slot name="media" />
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p class="truncate font-poppins text-[14px] font-semibold leading-5 text-Tinted/950">{{ title }}</p>
                    <p v-if="caption" class="truncate font-franklin text-[12px] font-medium leading-4 text-Tinted/500">
                        {{ caption }}
                    </p>
                </div>
                <!-- Two labels, one shown: "Get this EA for free" and an arrow do
                     not fit beside a name on a phone, and truncating a button
                     is worse than shortening it. -->
                <AppButton :label="shortLabel ?? label" :href="href" size="sm" :arrow="false" class="shrink-0 !px-5 tablet:!hidden" />
                <AppButton :label="label" :href="href" size="sm" class="shrink-0 max-tablet:!hidden" />
            </div>
        </div>
    </div>
</template>
