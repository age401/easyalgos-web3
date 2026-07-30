<script setup lang="ts">
// The one pill button, four skins (see .ea-btn* in main.css).
//
// The `primary` variant carries an oversized gradient band in a child layer: at
// rest you see its middle, and on hover the band slides so the violet travels
// through. That layer exists because animating a child's transform stays on the
// compositor, whereas animating background-position would repaint the button on
// every frame of the sweep.
//
// Renders <a> or <button> depending on whether an href is given, so a CTA that
// navigates is a real link (middle-clickable, crawlable) and one that acts is a
// real button.
interface Props {
    label: string
    href?: string
    variant?: 'primary' | 'ink' | 'stroke' | 'white'
    size?: 'md' | 'sm'
    arrow?: boolean
    type?: 'button' | 'submit'
}
const props = withDefaults(defineProps<Props>(), {
    href: undefined,
    variant: 'primary',
    size: 'md',
    arrow: true,
    type: 'button'
})

const classes = computed(() => [
    'ea-btn',
    `ea-btn--${props.variant}`,
    props.size === 'sm' ? 'ea-btn--sm' : ''
])

const isExternal = computed(() => !!props.href && /^(https?:)?\/\//.test(props.href))
</script>

<template>
    <component
        :is="href ? 'a' : 'button'"
        :href="href"
        :type="href ? undefined : type"
        :rel="isExternal ? 'noopener' : undefined"
        :target="isExternal ? '_blank' : undefined"
        :class="classes"
    >
        <span v-if="variant === 'primary'" class="ea-btn__bg" aria-hidden="true" />
        <span>{{ label }}</span>
        <svg
            v-if="arrow"
            class="ea-btn__arrow shrink-0"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M3 8h10m0 0L9 4m4 4-4 4"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    </component>
</template>
