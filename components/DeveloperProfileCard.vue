<script setup lang="ts">
// The developer's profile card — Figma 3157:9103.
//
// Drawn 368x602 with a 320px square portrait, and rendered at exactly that on
// the wide layout. Below 1160px it goes FLUID rather than transform-scaled: the
// portrait tracks the card's width via aspect-square, and everything else keeps
// its drawn type size, so the name, the location and the three outbound links
// stay legible and stay tappable on a phone. That is the deliberate difference
// from the home hero's collage, where the cards are decoration and are scaled as
// one unit — this card is the content of the page.
//
// Everything on it is baked data (see data/developerProfile.ts): no fetch, no
// skeleton, no reflow. The only translated string is the "Developer website"
// label; the two service wordmarks are trademarks and are drawn as their own
// committed SVGs.
import type { DeveloperProfile } from '~/types/developer'

interface Props {
    developer: DeveloperProfile
    /** The card is the largest thing above the fold on this page, so its
     *  portrait is the one image that should ever be eager here. */
    eager?: boolean
}
const props = withDefaults(defineProps<Props>(), { eager: false })

// 320x320 is both the drawn slot and the size of the image fill uploaded to
// Figma, so this asset is 1x — see the note in scripts/optimize-assets.py.
const portrait = computed(() => mediaAsset('people', props.developer.avatar, 320, 320))
</script>

<template>
    <article
        class="flex w-full flex-col items-start gap-8 overflow-clip rounded-2xl bg-white p-6
               ring-2 ring-inset ring-Tinted/100
               shadow-[0_16px_16px_0_rgba(84,107,197,0.04),0_6px_8px_0_rgba(84,107,197,0.04)]"
    >
        <!-- Portrait. Square by aspect ratio rather than a fixed 320px box, so
             the card can go fluid without the image letterboxing. -->
        <div class="w-full overflow-clip rounded-2xl">
            <AppPicture
                :media="portrait"
                :alt="developer.name"
                :loading="eager ? 'eager' : 'lazy'"
                :fetchpriority="eager ? 'high' : 'low'"
                img-class="aspect-square w-full object-cover"
            />
        </div>

        <div class="flex w-full flex-col gap-8">
            <div class="flex w-full flex-col gap-3">
                <!-- 4px of optical lead-in above the role label, as drawn. -->
                <div class="flex w-full flex-col gap-0.5 pt-1">
                    <!-- BLUE/04 -->
                    <p class="font-poppins text-[12px] font-bold uppercase leading-3 text-[#4871F3]">
                        {{ $t('devCard.role') }}
                    </p>
                    <!-- BW/08 -->
                    <h2 class="font-poppins text-[24px] font-semibold leading-8 text-[#1E1E1E]">
                        {{ developer.name }}
                    </h2>
                </div>

                <p class="flex items-center gap-3">
                    <img
                        :src="`/img/flags/${developer.flag}.svg`"
                        alt=""
                        width="24"
                        height="16"
                        aria-hidden="true"
                        class="h-4 w-6 shrink-0 rounded-[3px]"
                    />
                    <!-- BW/04 -->
                    <span class="font-franklin text-[13px] font-medium leading-[14px] text-[#969696]">
                        {{ developer.location }}
                    </span>
                </p>
            </div>

            <!-- Outbound links. Wraps to two rows at the drawn 320px column,
                 which is what makes the card 602px tall rather than 550. -->
            <ul class="flex flex-wrap items-start gap-3">
                <li v-for="link in developer.links" :key="link.id">
                    <a
                        :href="link.href"
                        class="flex h-10 items-center justify-center gap-1 overflow-hidden rounded-xl
                               border-2 border-Tinted/100 bg-white px-3 py-1.5 text-Tinted/900
                               shadow-[0_1px_2px_0_rgba(0,0,0,0.05),inset_0_-3px_0_0_rgba(0,0,0,0.05)]
                               transition-colors duration-300 hover:border-Tinted/200"
                    >
                        <!-- Both glyphs are the exported Figma paths, inlined so
                             they take the button's own ink and recolour with it.
                             The globe marks the developer's own site; the chain
                             link marks a third-party profile. -->
                        <svg
                            v-if="link.id === 'website'"
                            class="size-5 shrink-0"
                            viewBox="0 0 20 20"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M1.66667 10C1.66667 12.2101 2.54464 14.3298 4.10744 15.8926C5.67025 17.4554 7.78986 18.3333 10 18.3333M1.66667 10C1.66667 7.78986 2.54464 5.67025 4.10744 4.10744C5.67025 2.54464 7.78986 1.66667 10 1.66667M1.66667 10H18.3333M10 18.3333C12.2101 18.3333 14.3298 17.4554 15.8926 15.8926C17.4554 14.3298 18.3333 12.2101 18.3333 10M10 18.3333C7.8602 16.0865 6.66667 13.1027 6.66667 10C6.66667 6.89728 7.8602 3.91346 10 1.66667M10 18.3333C12.1398 16.0865 13.3333 13.1027 13.3333 10C13.3333 6.89728 12.1398 3.91346 10 1.66667M18.3333 10C18.3333 7.78986 17.4554 5.67025 15.8926 4.10744C14.3298 2.54464 12.2101 1.66667 10 1.66667"
                                stroke="currentColor"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <svg v-else class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path
                                d="M7.5 14.1667H5.83333C4.72826 14.1667 3.66846 13.7277 2.88706 12.9463C2.10565 12.1649 1.66667 11.1051 1.66667 10C1.66667 8.89493 2.10565 7.83512 2.88706 7.05372C3.66846 6.27232 4.72826 5.83333 5.83333 5.83333H7.5M12.5 5.83333H14.1667C15.2717 5.83333 16.3315 6.27232 17.1129 7.05372C17.8943 7.83512 18.3333 8.89493 18.3333 10C18.3333 11.1051 17.8943 12.1649 17.1129 12.9463C16.3315 13.7277 15.2717 14.1667 14.1667 14.1667H12.5M6.66667 10H13.3333"
                                stroke="currentColor"
                                stroke-width="1.66667"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                        <img
                            v-if="link.logo"
                            :src="link.logo.src"
                            :alt="link.logo.label"
                            :width="link.logo.width"
                            :height="link.logo.height"
                            class="shrink-0"
                            :style="{ width: `${link.logo.width}px`, height: `${link.logo.height}px` }"
                        />
                        <span v-else class="whitespace-nowrap px-0.5 font-franklin text-[14px] font-medium leading-[1.4]">
                            {{ $t(`devCard.${link.id}`) }}
                        </span>
                    </a>
                </li>
            </ul>
        </div>
    </article>
</template>
