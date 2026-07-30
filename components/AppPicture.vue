<script setup lang="ts">
// <picture> over a pre-encoded AVIF/WebP/PNG triple.
//
// Always renders explicit width/height so the browser reserves the box from the
// first layout pass — this is the whole CLS story for the page. `loading` and
// `fetchpriority` are props rather than defaults-with-overrides so every call
// site has to state its intent: exactly one image above the fold should ever be
// eager.
import type { MediaAsset } from '~/types/home'

interface Props {
    media: MediaAsset
    /** Empty string marks the image decorative; it is then hidden from the
     *  accessibility tree entirely. */
    alt?: string
    loading?: 'lazy' | 'eager'
    fetchpriority?: 'high' | 'low' | 'auto'
    /** Responsive hint. Omit for images whose box never changes. */
    sizes?: string
    imgClass?: string
}
const props = withDefaults(defineProps<Props>(), {
    alt: '',
    loading: 'lazy',
    fetchpriority: 'auto',
    sizes: undefined,
    imgClass: 'h-auto w-full'
})

const decorative = computed(() => props.alt === '')
</script>

<template>
    <picture>
        <source :srcset="media.avif" :sizes="sizes" type="image/avif" />
        <source :srcset="media.webp" :sizes="sizes" type="image/webp" />
        <img
            :src="media.fallback"
            :alt="alt"
            :width="media.width"
            :height="media.height"
            :loading="loading"
            :fetchpriority="fetchpriority"
            :aria-hidden="decorative ? 'true' : undefined"
            decoding="async"
            :class="imgClass"
        />
    </picture>
</template>
