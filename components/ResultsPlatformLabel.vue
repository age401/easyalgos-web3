<script setup lang="ts">
// The platform cell's contents: the broker's mark, then its name.
//
// A component rather than six lines repeated in each take, because the two
// takes must render this cell identically — the whole comparison rests on the
// wide layout being the same in both, and a cell that drifts would quietly
// invalidate it.
//
// Name and mark both come from PLATFORMS, keyed by id, so they cannot disagree.
// (The artboard's row 11 is labelled "Pepperstone MT5" and carries the B2B
// Broker mark; keying by id makes that pairing impossible to express.)
import type { PlatformId } from '~/types/results'

interface Props {
    platform: PlatformId
}
const props = defineProps<Props>()

const platform = computed(() => PLATFORMS[props.platform])
</script>

<template>
    <span class="ea-results__platform">
        <!-- `alt=""`: the mark is decorative, because the name it stands for is
             the very next thing in the cell. Giving it the broker's name would
             make a screen reader say it twice.

             Explicit width/height so the row reserves the 20px before the SVG
             arrives — 20 rows each shifting by a mark's width is a CLS event,
             and lazy loading makes it a late one. -->
        <img
            :src="platform.icon"
            alt=""
            width="20"
            height="20"
            loading="lazy"
            decoding="async"
            class="ea-results__mark"
        >
        <span>{{ platform.name }}</span>
    </span>
</template>
