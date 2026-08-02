<script setup lang="ts">
// The one pill button, four skins (see .ea-btn* in main.css). The variants map
// to the Figma "Button" component (node 458:1310): primary = Default,
// stroke = White BG + Stroke, white = White BG, ink = Dark BG. Each carries the
// component's default / hover / pressed states via :hover and :active.
//
// The `primary` variant carries an oversized gradient band in a child layer: at
// rest you see its right end, and on hover the band slides so the violet left
// end travels through. That layer exists because animating a child's transform
// stays on the compositor, whereas animating background-position would repaint
// the button on every frame of the sweep.
//
// Renders <a> or <button> depending on whether an href is given, so a CTA that
// navigates is a real link (middle-clickable, crawlable) and one that acts is a
// real button.
interface Props {
    label: string
    href?: string
    variant?: 'primary' | 'ink' | 'stroke' | 'white'
    /** md is the page's CTA; sm and xs are the topbar's (42px and 36px pills). */
    size?: 'md' | 'sm' | 'xs'
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

// Spelled out rather than interpolated so the class names exist as literals in
// the source for Tailwind's content scanner to find.
const SIZE_CLASS = { md: '', sm: 'ea-btn--sm', xs: 'ea-btn--xs' } as const

const classes = computed(() => ['ea-btn', `ea-btn--${props.variant}`, SIZE_CLASS[props.size]])

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
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
        >
            <!-- Geometry from the Figma component's exported "Icon" asset. -->
            <path
                d="M3 8H12M8.5 4.5L12.5 8L8.5 11.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    </component>
</template>
