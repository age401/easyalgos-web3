<script setup lang="ts">
// "Requirements" — the five conditions for joining, Figma 3388:11825. The
// module itself is RequirementsSection, shared with /pricing; this is
// /for-developers' rows and its lead.
//
// Every row takes the check-circle glyph, with the 16px cut for the 32px phone
// bubble the 360 frame draws (check-circle-16.svg keeps the 2px stroke).
const REQUIREMENTS = ['performance', 'reviews', 'original', 'backtesting', 'support'].map((id) => ({
    id,
    icon: '/img/icons/check-circle.svg',
    compactIcon: '/img/icons/check-circle-16.svg'
}))
</script>

<template>
    <RequirementsSection ns="forDevRequirements" :items="REQUIREMENTS" lead />
</template>
