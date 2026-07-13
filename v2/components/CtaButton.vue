<script setup lang="ts">
// Shared CTA. Variants map to the .eal-cta--* classes in main.css:
//   ink (default) — wordmark-ink fill, sheen sweep on hover
//   stroke        — quiet bordered secondary
//   white         — for dark/ink surfaces
interface Props {
    label: string;
    href: string;
    variant?: 'ink' | 'stroke' | 'white';
    arrow?: boolean;
}
const props = withDefaults(defineProps<Props>(), { variant: 'ink', arrow: true });

const variantClass = computed(() => ({
    ink: 'eal-cta--ink',
    stroke: 'eal-cta--stroke',
    white: 'eal-cta--white',
}[props.variant]));
</script>

<template>
    <a :href="href" :class="['eal-cta', variantClass]">
        <span v-if="variant === 'ink'" class="eal-cta__sheen" aria-hidden="true" />
        <span>{{ label }}</span>
        <svg v-if="arrow" class="eal-cta__arrow" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </a>
</template>
