<script setup lang="ts">
// An EA's square thumbnail. The design draws three kinds, and all three have to
// work at every size the thumbnail appears (32px in the ranking, 44 on a card,
// 96 on the EA page, 128 on a compact tile), so nothing in here is a pixel
// value: the box comes from the call site's classes and the contents scale to it.
//
//   raster  the developer's own artwork, a pre-encoded <picture>
//   glyph   an EasyAlgos house mark, centred on the drawn blue tile at 75% of it
//   letter  no artwork published: the EA's initial on Violet/50
//
// The letter is sized in container units (`cqw`) rather than by a prop per call
// site - 48px on the 128 tile and 14px on the 32 one are the same 37.5% - which
// is why the root is an inline-size container.
import type { EaImage } from '~/types/expertAdvisors'

interface Props {
    image: EaImage
    name: string
    /** The largest box this instance is laid out at, in CSS px. It is the
     *  intrinsic size handed to the browser, so the box is reserved before any
     *  bytes arrive. */
    size?: number
    eager?: boolean
}
const props = withDefaults(defineProps<Props>(), { size: 128, eager: false })

const media = computed(() =>
    props.image.kind === 'raster' ? mediaAsset('expert-advisors', props.image.name, props.size, props.size) : null
)

// The glyph's own box as a share of the tile: every house mark is drawn inside
// a 36px square that takes up 75% of the tile, and is narrower or shorter than
// that square by its own proportions.
const glyphStyle = computed(() => {
    if (props.image.kind !== 'glyph') return undefined
    return {
        width: `${(props.image.width / 36) * 75}%`,
        height: `${(props.image.height / 36) * 75}%`
    }
})
</script>

<template>
    <span class="relative block shrink-0 overflow-hidden [container-type:inline-size]">
        <AppPicture
            v-if="media"
            :media="media"
            :loading="eager ? 'eager' : 'lazy'"
            :fetchpriority="eager ? 'high' : 'low'"
            img-class="size-full object-cover"
        />

        <span
            v-else-if="image.kind === 'glyph'"
            class="flex size-full items-center justify-center bg-gradient-to-b from-[#ECF4FF] to-[#D4E5FF]"
        >
            <img
                :src="`/img/expert-advisors/glyphs/${image.name}.svg`"
                alt=""
                :width="image.width"
                :height="image.height"
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                :style="glyphStyle"
            />
        </span>

        <!-- Violet/50 under Violet/700, as drawn on the NoPain tile. -->
        <span
            v-else
            class="flex size-full items-center justify-center bg-[#F2F0FF] font-poppins text-[37.5cqw] font-semibold leading-none text-Violet/700"
            aria-hidden="true"
        >
            {{ name.charAt(0) }}
        </span>
    </span>
</template>
