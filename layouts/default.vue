<script setup lang="ts">
// A deliberate pass-through.
//
// `app.vue` now wraps <NuxtPage> in <NuxtLayout> so that inner pages can opt
// into `layouts/page.vue`. Nuxt applies `default` to any page that does not name
// one, and the home page owns its own header, footer and skip link — it is a
// full-bleed composition, not a page inside a shell — so `default` must add
// nothing at all. Rendering the slot bare keeps pages/index.vue byte-identical
// to what it produced before layouts existed.
</script>

<template>
    <slot />
</template>
