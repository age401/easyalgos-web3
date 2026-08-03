<script setup lang="ts">
// One partner mark from the strip under the hero CTA.
//
// Inline SVG rather than <img>, because the mark is two-tone and the hover
// state remaps BOTH colours (see data/heroBrandLogos.ts for why that rules out
// currentColor and an asset swap). The two fills read custom properties, so the
// hover in main.css is a variable flip — one asset, no extra request, and a real
// colour transition instead of a swap.
import { HERO_BRAND_LOGOS } from '~/data/heroBrandLogos'

interface Props {
    /** Key into HERO_BRAND_LOGOS; also the partner id. */
    id: string
    /** Company name. A trademark — announced, never translated. */
    label: string
}
const props = defineProps<Props>()

const logo = computed(() => HERO_BRAND_LOGOS[props.id])
</script>

<template>
    <svg
        v-if="logo"
        class="ea-brand-logo"
        :style="logo.accentHover ? { '--brand-accent-hover': logo.accentHover } : undefined"
        :viewBox="`0 0 ${logo.width} ${logo.height}`"
        :width="logo.width"
        :height="logo.height"
        fill="none"
        role="img"
        :aria-label="label"
    >
        <path v-for="(d, i) in logo.accent" :key="`a${i}`" :d="d" class="ea-brand-logo__accent" />
        <path v-for="(d, i) in logo.word" :key="`w${i}`" :d="d" class="ea-brand-logo__word" />
    </svg>
</template>
