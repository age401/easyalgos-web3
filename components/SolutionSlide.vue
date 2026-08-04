<script setup lang="ts">
// One "What you get" slide: the container, not the artwork.
//
// The split matters. Everything that makes this read as a floating pane — the
// 24px corners, the tint behind it and the five stacked ambient shadows — lives
// here in CSS; the source images are flat, edge-to-edge panels of pure content.
// The earlier exports had the shadows baked into the bitmap, which left the
// artwork sitting inside its own box with a second shadow under it. Figma
// 626:5098 (container) / 626:3607 (content).
//
// Content will eventually be video for several rows, which is the other half of
// the reason: a <video> can drop straight in beside AppPicture without any of
// the framing having to be redrawn per asset.
import type { MediaAsset } from '~/types/home'

interface Props {
    media: MediaAsset
    /** Responsive hint for the artwork; the slot differs per breakpoint. */
    sizes?: string
    /** Cross-fade key. Defaults to the asset path, which is right unless two
     *  rows legitimately share one export. */
    swapKey?: string
}
const props = withDefaults(defineProps<Props>(), { sizes: undefined, swapKey: undefined })
const key = computed(() => props.swapKey ?? props.media.avif)
</script>

<template>
    <!-- Outer box casts the shadow, inner frame clips the artwork to the corners.
         See .ea-slide in main.css for why that cannot be one element. -->
    <div class="ea-slide">
        <div class="ea-slide__frame">
            <Transition name="swap" mode="out-in">
                <AppPicture
                    :key="key"
                    :media="media"
                    loading="lazy"
                    :sizes="sizes"
                    class="block h-full w-full"
                    img-class="h-full w-full object-cover object-left-top"
                />
            </Transition>
        </div>
    </div>
</template>
