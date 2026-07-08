<script setup lang="ts">
// "Powered by" — muted wordmark strip. Text-only treatment keeps the band even;
// partner logos with binary assets already appear in the hero trust row.
const partners = ['MetaTrader', 'IC Markets', 'IC Trading', 'ForexVPS', 'Equinix', 'OpenAI', 'Gemini', 'Claude', 'MyFxBook', 'FXBlue']
</script>

<template>
    <section class="border-y border-Tinted/100 bg-Tinted/25 py-12">
        <div class="ea-container">
            <p class="ea-eyebrow" v-reveal>Powered by</p>
            <ul class="mt-7 flex flex-wrap items-center gap-x-10 gap-y-4" v-reveal="80">
                <li
                    v-for="partner in partners"
                    :key="partner"
                    class="font-poppins text-sm font-semibold uppercase tracking-[0.14em] text-Tinted/400 transition-colors duration-300 ease-smooth hover:text-Tinted/700"
                >
                    {{ partner }}
                </li>
            </ul>
        </div>
    </section>
</template>
