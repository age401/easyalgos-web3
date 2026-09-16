<script setup lang="ts">
// Page heading — Figma component "page Heading" (node 3019:32056), as instanced
// on the Results artboard at 3033:14188.
//
// This is the TEMPLATE for the top of every inner page, and it is a template
// rather than a one-off because it is built entirely from the design system's
// SEMANTIC type styles: `Display/Semantic/Module Eyebrow`, `Module Heading` and
// `Module Description`, which reach the markup as .ea-module-eyebrow /
// .ea-module-heading / .ea-module-description. Nothing here picks a size. Change
// what those three styles resolve to and every page heading follows, which is
// the whole reason for having semantic tokens instead of `text-[48px]`.
//
// The Figma component exposes a single "Content" slot, so this does too: title
// and lead are slots, not props, because the brand gradient lands on a different
// run of words on every page ("...could look like" takes none, the hero's
// "without paying for them" takes the lot) and encoding that as props means a
// flag per permutation. Same reasoning as SectionHeading.
//
// Metrics, from the artboard: 96 above / 64 below at desktop, the heading and
// lead separated by 24, and the lead capped at 640 so it breaks into the four
// short centred lines that are drawn rather than one 1360px slab. Horizontal
// padding is `.ea-container`'s, which is already the drawn 60px gutter.
interface Props {
    /** Optional. Hidden on the Results artboard, present on the component. */
    eyebrow?: string
    align?: 'center' | 'left'
    /** A page heading is the page's <h1> by default. Pass 2 where the page
     *  already has one above it. */
    level?: 1 | 2
    /** `white` paints the ground, which is what an inner page wants. `none`
     *  leaves it transparent, for a hero that has something of its own behind the
     *  copy — the developer-recruitment hero puts a ripple field back there. Only
     *  the FILL changes: the drawn padding and the type scale are the template and
     *  stay whichever way this goes. */
    surface?: 'white' | 'none'
    /** Drops the template's vertical padding — the one thing that can take it off.
     *
     *  The drawn 96/64 is what gives a heading air at the TOP of a page. In a box
     *  that CENTRES it, which is what the full-height developer-recruitment hero
     *  does, that job belongs to the box, and the asymmetry works against it: 96
     *  above against 64 below leaves the copy sitting 16px low of the centre it
     *  was just centred on. The type scale is still the template either way. */
    flush?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    eyebrow: undefined,
    align: 'center',
    level: 1,
    surface: 'white',
    flush: false
})

const headingTag = computed(() => `h${props.level}`)
</script>

<template>
    <section
        :class="[
            surface === 'white' ? 'bg-white' : '',
            flush
                ? ''
                : 'pt-14 pb-10 tablet:pt-[72px] tablet:pb-12 tablet-wide:pt-[88px] tablet-wide:pb-14 desktop:pt-24 desktop:pb-16'
        ]"
    >
        <div
            :class="[
                'ea-container flex flex-col',
                align === 'center' ? 'items-center text-center' : 'items-start'
            ]"
        >
            <p v-if="eyebrow" v-reveal class="ea-module-eyebrow mb-5">{{ eyebrow }}</p>

            <component :is="headingTag" v-reveal="90" class="ea-module-heading">
                <slot name="title" />
            </component>

            <!-- 640px, and `max-w-full` under it so the cap never wins on a
                 narrow viewport where the container is already tighter. -->
            <div
                v-if="$slots.lead"
                v-reveal="180"
                :class="[
                    'ea-module-description mt-6 max-w-[640px]',
                    align === 'center' ? 'mx-auto' : ''
                ]"
            >
                <slot name="lead" />
            </div>

            <div v-if="$slots.actions" v-reveal="260" class="mt-8 tablet-wide:mt-10">
                <slot name="actions" />
            </div>
        </div>
    </section>
</template>
