<script setup lang="ts">
// Eyebrow + heading + lead, with the staggered scroll-in every section shares.
//
// The title is a slot rather than a prop because the gradient run lands on a
// different line in each section ("...was in different places." ends on it,
// "You don't pay, you qualify." opens on it) — encoding that as props would mean
// a flag per permutation. The stagger is applied here so the rhythm is identical
// everywhere: eyebrow, then title 90ms later, then lead.
interface Props {
    eyebrow?: string
    /** Inverts the eyebrow for the #171717 bands. */
    invert?: boolean
    align?: 'left' | 'center'
    /** Heading level — one <h1> per page, so sections pass 2 (the default). */
    level?: 1 | 2
}
const props = withDefaults(defineProps<Props>(), {
    eyebrow: undefined,
    invert: false,
    align: 'left',
    level: 2
})

const headingTag = computed(() => `h${props.level}`)
</script>

<template>
    <div :class="['flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start']">
        <p
            v-if="eyebrow"
            v-reveal
            :class="['ea-eyebrow', { 'ea-eyebrow--invert': invert }]"
        >
            {{ eyebrow }}
        </p>

        <component
            :is="headingTag"
            v-reveal="90"
            :class="[
                level === 1 ? 'ea-h1' : 'ea-h2',
                eyebrow ? 'mt-6 tablet-wide:mt-9' : '',
                // Important: .ea-h2 bakes in text-Tinted/950 via @apply, and a
                // plain `text-white` utility is the same specificity — which of
                // the two wins then depends on stylesheet order. Force it.
                invert ? '!text-white' : ''
            ]"
        >
            <slot name="title" />
        </component>

        <div
            v-if="$slots.lead"
            v-reveal="180"
            :class="['mt-6 tablet-wide:mt-8', align === 'center' ? 'mx-auto' : '']"
        >
            <slot name="lead" />
        </div>

        <div v-if="$slots.actions" v-reveal="260" class="mt-10 tablet-wide:mt-12">
            <slot name="actions" />
        </div>
    </div>
</template>
