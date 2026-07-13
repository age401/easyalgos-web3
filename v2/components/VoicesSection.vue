<script setup lang="ts">
// Two testimonies, treated like references rather than reviews. Restraint is
// the point — a wall of five-star cards would undo the rest of the page.
const voices = [
    {
        quote:
            'After twelve years around institutional desks, what convinced me was not the returns — it was that they publish the losing months. That is how a serious operation behaves.',
        name: 'Marcus H.',
        detail: 'Member since 2021 · Elite',
    },
    {
        quote:
            'EasyAlgos made algorithmic trading feel like custody rather than a purchase. The infrastructure was ready before I was, and the numbers I see are the numbers everyone sees.',
        name: 'Sofia R.',
        detail: 'Member since 2023 · Pro',
    },
]
</script>

<template>
    <section class="bg-Tinted/25 py-24 tablet-md:py-32">
        <div class="eal-container">
            <p v-reveal class="eal-eyebrow"><b>06</b><span aria-hidden="true">/</span>In their words</p>

            <div class="mt-12 grid grid-cols-1 gap-10 tablet-md:grid-cols-2 tablet-md:gap-16">
                <figure
                    v-for="(voice, i) in voices"
                    :key="voice.name"
                    v-reveal="i * 140"
                    class="border-l-2 border-Ink/950 pl-7 tablet:pl-9"
                >
                    <blockquote class="font-poppins text-[1.25rem] font-normal leading-[1.5] tracking-[-0.3px] text-Ink/950 tablet:text-[1.375rem]">
                        &ldquo;{{ voice.quote }}&rdquo;
                    </blockquote>
                    <figcaption class="mt-7">
                        <p class="font-poppins text-[14px] font-medium text-Ink/950">{{ voice.name }}</p>
                        <p class="eal-num mt-1 font-franklin text-[13px] text-Tinted/500">{{ voice.detail }}</p>
                    </figcaption>
                </figure>
            </div>

            <p v-reveal class="mt-14 border-t border-Tinted/100 pt-7 font-franklin text-[13.5px] text-Tinted/500">
                4,000+ members trade with EasyAlgos.
                <a href="https://easyalgos.ai/" class="font-medium text-Ink/950 underline decoration-Tinted/200 underline-offset-4 transition-colors duration-300 hover:decoration-Ink/950">Read independent reviews on Trustpilot</a>.
            </p>
        </div>
    </section>
</template>
