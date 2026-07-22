<script setup lang="ts">
// Internal comparison page for the fractured-sphere treatments. Not linked
// from anywhere and explicitly noindex'd — it exists so the variants can be
// judged side by side before one is promoted onto the home page.
const selected = ref(SPHERE_VARIANTS[SPHERE_VARIANTS.length - 1].id)
const variant = computed(() => getVariant(selected.value))

useHead({
    title: 'Sphere variants — internal comparison',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
    bodyAttrs: { class: 'antialiased' },
})
</script>

<template>
    <div class="min-h-screen bg-Ink/950">
        <div class="eal-container py-12">
            <p class="eal-eyebrow eal-eyebrow--invert">Internal</p>
            <h1 class="eal-h2 mt-4 !text-white">Fractured sphere &mdash; variants</h1>
            <p class="mt-4 max-w-[38rem] font-franklin text-[15px] leading-[1.65] text-Tinted/300">
                Five procedural treatments of the same baked Voronoi fracture. Geometry rebuilds on
                switch; everything else &mdash; lighting, labels, camera fit &mdash; is identical
                between them.
            </p>

            <!-- Switcher -->
            <div class="mt-8 flex flex-wrap gap-2">
                <button
                    v-for="option in SPHERE_VARIANTS"
                    :key="option.id"
                    type="button"
                    :aria-pressed="option.id === selected"
                    :class="[
                        'rounded-full border px-4 py-2 font-poppins text-[13px] font-medium transition-colors duration-300',
                        option.id === selected
                            ? 'border-white bg-white text-Ink/950'
                            : 'border-white/25 text-white/70 hover:border-white/50 hover:text-white',
                    ]"
                    @click="selected = option.id"
                >
                    {{ option.name }}
                </button>
            </div>

            <!-- Active variant read-out -->
            <div class="mt-6 border-t border-white/10 pt-5">
                <p class="font-poppins text-[15px] font-medium text-white">{{ variant.name }}</p>
                <p class="mt-1.5 max-w-[38rem] font-franklin text-[13.5px] leading-[1.6] text-Tinted/300">
                    {{ variant.blurb }}
                </p>
                <dl class="eal-num mt-4 flex flex-wrap gap-x-7 gap-y-2 font-franklin text-[12.5px] text-Tinted/400">
                    <div class="flex gap-1.5"><dt>cells</dt><dd class="text-white/80">{{ variant.cells }}</dd></div>
                    <div class="flex gap-1.5"><dt>inset</dt><dd class="text-white/80">{{ variant.inset }}</dd></div>
                    <div class="flex gap-1.5"><dt>thickness</dt><dd class="text-white/80">{{ variant.thickness }}</dd></div>
                    <div class="flex gap-1.5"><dt>explode</dt><dd class="text-white/80">{{ variant.explode }}</dd></div>
                    <div class="flex gap-1.5"><dt>drift</dt><dd class="text-white/80">{{ variant.drift }}</dd></div>
                    <div class="flex gap-1.5"><dt>noise</dt><dd class="text-white/80">{{ variant.noise ? `${variant.noise.amp} @ ${variant.noise.freq}` : 'none' }}</dd></div>
                    <div class="flex gap-1.5"><dt>subdiv</dt><dd class="text-white/80">{{ variant.subdiv }}</dd></div>
                </dl>
            </div>

            <div class="mt-6">
                <ProblemSphere :variant="variant" />
            </div>
        </div>
    </div>
</template>
