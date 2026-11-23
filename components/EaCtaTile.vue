<script setup lang="ts">
// The dark "Free access" tile that closes a row of EA cards - Figma "CTA tile"
// (3962:5185), drawn 322x329 in the fourth column beside three cards.
//
// It is a grid item like the cards, so it takes whatever is left of the row.
// Beside three cards on a wide screen that is one column and it is the drawn
// tile: copy stacked over the button, pinned to the bottom. When it has a whole
// row to itself (three cards at a three-column width, or a developer with no
// other EAs) it would be a 329px-tall slab with four lines of text in one
// corner, so from 560px of its own width it turns into a BANNER: copy on the
// left, button on the right, half the height. Container query, `.xa-cta-tile`.
//
// The glow is the one piece of decoration here that is not in the drawing: two
// blurred brand-colour orbs drifting slowly behind the copy, so the page's last
// call to action is not a flat rectangle. Transform-only, paused when motion is
// reduced, and well under the text's contrast floor.
import type { EaDeveloper } from '~/types/expertAdvisors'

interface Props {
    developer: EaDeveloper
}
defineProps<Props>()
</script>

<template>
    <aside class="xa-cta-tile relative h-full overflow-hidden rounded-[20px] bg-Tinted/900">
        <span class="xa-cta-tile__orb xa-cta-tile__orb--a" aria-hidden="true" />
        <span class="xa-cta-tile__orb xa-cta-tile__orb--b" aria-hidden="true" />

        <div class="xa-cta-tile__inner relative">
            <div class="flex flex-col gap-3">
                <p class="xa-label !text-Violet/300">{{ $t('ea.more.eyebrow') }}</p>
                <p class="font-poppins text-[20px] font-medium leading-7 tracking-[-0.22px] text-white tablet:text-[22px] tablet:leading-[30px]">
                    {{ $t('ea.more.pitch', { name: developer.name, count: developer.eas.length }, developer.eas.length) }}
                </p>
            </div>
            <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" class="xa-cta-tile__button" />
        </div>
    </aside>
</template>
