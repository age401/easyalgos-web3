<script setup lang="ts">
// Infinite brand marquee.
//
// The track holds the logo set twice and animates to exactly -50% of its own
// width, so the second copy lands where the first began and the seam never shows.
// Pure CSS transform on one element: no JS, no scroll listener, and the browser
// keeps it on the compositor. Keeps scrolling on hover by design — only
// `prefers-reduced-motion` stops it (main.css), leaving a static row.
//
// The duplicate copy is aria-hidden so a screen reader hears the list once.
</script>

<template>
    <div class="ea-section--tight bg-white">
        <div class="ea-marquee" v-reveal>
            <ul class="ea-marquee__track" aria-label="Partners and integrations">
                <li
                    v-for="brand in BRANDS"
                    :key="brand.id"
                    class="flex h-[76px] w-[220px] shrink-0 items-center justify-center rounded-md border-2 border-neutral-25 px-14 transition-colors duration-300 hover:bg-[#F5F6FC] tablet-wide:h-[88px] tablet-wide:w-[270px] tablet-wide:px-[60px]"
                >
                    <img
                        :src="brand.src"
                        :alt="brand.label"
                        width="150"
                        height="40"
                        loading="lazy"
                        class="h-7 w-auto max-w-full tablet-wide:h-10"
                    />
                </li>
            </ul>
            <ul class="ea-marquee__track" aria-hidden="true">
                <li
                    v-for="brand in BRANDS"
                    :key="`${brand.id}-echo`"
                    class="flex h-[76px] w-[220px] shrink-0 items-center justify-center rounded-md border-2 border-neutral-25 px-14 transition-colors duration-300 hover:bg-[#F5F6FC] tablet-wide:h-[88px] tablet-wide:w-[270px] tablet-wide:px-[60px]"
                >
                    <img :src="brand.src" alt="" width="150" height="40" loading="lazy" class="h-7 w-auto max-w-full tablet-wide:h-10" />
                </li>
            </ul>
        </div>
    </div>
</template>
