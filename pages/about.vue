<script setup lang="ts">
// About Us — Figma "About Us". Scaffold: only "module Team Photo"'s image
// (3138:9174) is built so far, to tune its animation (AboutLogoMatrix).
definePageMeta({ layout: 'page' })

useSeoMeta({ title: 'EasyAlgos — About Us' })
</script>

<template>
    <section class="bg-white py-24">
        <div class="ea-container">
            <div class="max-w-[648px]">
                <AboutLogoMatrix />
            </div>
        </div>
    </section>
</template>
