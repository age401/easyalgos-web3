<script setup lang="ts">
// "Inside the EA" - the screenshot strip (Figma 3921:16576): three 184px-tall
// captures of the EA's settings dialogs, side by side.
//
// Side by side holds while each is at least ~200px wide. Below that (a phone,
// and the 600px data column at 1024 with a longer set) the strip becomes a
// snap-scrolling rail: each capture takes 78% of the width, so the edge of the
// next one is always showing and the row reads as scrollable without an arrow.
// Keyed to the strip's own width - `.xa-shots` in main.css.
//
// The captures are settings windows full of 9px text, which at 284px wide is
// decoration. So each one opens in a lightbox at its native 920px, where it can
// actually be read. That is a native <dialog>: it brings the focus trap, Escape
// and the backdrop for free, and costs no library.
interface Props {
    name: string
    shots: string[]
}
const props = defineProps<Props>()

const dialog = ref<HTMLDialogElement | null>(null)
const active = ref(0)

// 920x600 native; the thumbnails declare the drawn slot's proportions.
const media = computed(() => props.shots.map((shot) => mediaAsset('expert-advisors/inside', shot, 920, 600)))

function open(index: number) {
    active.value = index
    dialog.value?.showModal()
}
function close() {
    dialog.value?.close()
}
function step(direction: 1 | -1) {
    active.value = (active.value + direction + props.shots.length) % props.shots.length
}
function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
}
/** A click on the backdrop lands on the <dialog> itself, not on its content. */
function onDialogClick(event: MouseEvent) {
    if (event.target === dialog.value) close()
}
</script>

<template>
    <section class="xa-panel flex flex-col gap-5">
        <h2 class="xa-title">{{ $t('ea.detail.inside.title') }}</h2>

        <div class="xa-shots-wrap">
            <ul class="xa-shots xa-noscroll">
                <li v-for="(shot, index) in media" :key="shot.webp" class="xa-shots__item">
                    <button
                        type="button"
                        class="xa-shot group relative block w-full overflow-hidden rounded-xl"
                        :aria-label="$t('ea.detail.inside.open', { name, index: index + 1, total: media.length })"
                        @click="open(index)"
                    >
                        <AppPicture
                            :media="shot"
                            img-class="h-[184px] w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                        />
                        <span
                            class="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-[rgba(28,24,51,0.5)] to-transparent to-50% p-2.5
                                   opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                            aria-hidden="true"
                        >
                            <span class="rounded-lg bg-white/95 px-2 py-1 font-poppins text-[11px] font-medium leading-4 text-Tinted/900">
                                {{ $t('ea.detail.inside.enlarge') }}
                            </span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>

        <dialog
            ref="dialog"
            class="xa-lightbox"
            :aria-label="$t('ea.detail.inside.title')"
            @click="onDialogClick"
            @keydown="onKeydown"
        >
            <div class="relative flex max-h-[92svh] flex-col gap-3">
                <AppPicture
                    :key="active"
                    :media="media[active]"
                    :alt="$t('ea.detail.inside.alt', { name, index: active + 1 })"
                    loading="eager"
                    img-class="xa-lightbox__image max-h-[80svh] w-auto max-w-full rounded-xl object-contain"
                />
                <div class="flex items-center justify-between gap-3">
                    <p class="ea-num font-poppins text-[13px] font-medium leading-4 text-white/80">
                        {{ active + 1 }} / {{ media.length }}
                    </p>
                    <div class="flex items-center gap-2">
                        <template v-if="media.length > 1">
                            <button type="button" class="xa-key !px-2.5" :aria-label="$t('common.previous')" @click="step(-1)">
                                <EaIcon name="chevronLeft" class="size-4" />
                            </button>
                            <button type="button" class="xa-key !px-2.5" :aria-label="$t('common.next')" @click="step(1)">
                                <EaIcon name="chevronRight" class="size-4" />
                            </button>
                        </template>
                        <button type="button" class="xa-key" @click="close">
                            {{ $t('common.close') }}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    </section>
</template>
