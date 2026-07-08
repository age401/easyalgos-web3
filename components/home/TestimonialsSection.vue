<script setup lang="ts">
// "The stories" — quote cards. The IC Markets endorsement leads as a wide,
// tinted feature card; member stories follow in the standard card style.
const featured = {
    quote: 'After over a decade working inside top brokers, EasyAlgos\' Expert Advisors show one of the highest survivability rates I have seen in retail algorithmic trading.',
    name: 'Angus Walker',
    role: 'Head of Trading · IC Markets',
}

const stories = [
    {
        quote: 'After 10 years of inconsistent results with manual trading, EasyAlgos gave me steady returns I could actually plan around.',
        name: 'Pedro',
        role: 'Salesman · Spain',
    },
    {
        quote: 'EasyAlgos made trading simpler than any software I have tried. Around 2.5% monthly returns, without touching a chart.',
        name: 'Lam',
        role: 'Retired · Hong Kong',
    },
    {
        quote: 'After losing money with other EAs, I finally found steady profits. I am averaging almost 5% a month.',
        name: 'Ioannis',
        role: 'IT · Greece',
    },
    {
        quote: 'EasyAlgos gave me exactly what I needed: peace of mind and steady growth. The verified records were what convinced me.',
        name: 'Vivek',
        role: 'Institutional banker · Dubai',
    },
]
</script>

<template>
    <section id="stories" class="bg-white py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[640px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The stories</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    Traders who<br />
                    made the <span class="ea-grad-text">switch</span>.
                </h2>
            </div>

            <div class="mt-12 grid grid-cols-1 gap-6 tablet-md:grid-cols-2 tablet-wide:grid-cols-4">
                <!-- Featured: institutional endorsement -->
                <figure
                    class="flex flex-col justify-between rounded-2xl border-2 border-Tinted/100 bg-Tinted/25 p-8 tablet-md:col-span-2"
                    v-reveal
                >
                    <blockquote class="font-poppins text-[1.25rem] font-medium leading-[1.55] tracking-[-0.3px] text-Tinted/900 tablet:text-[1.375rem]">
                        &ldquo;{{ featured.quote }}&rdquo;
                    </blockquote>
                    <figcaption class="mt-8">
                        <div class="font-poppins text-sm font-semibold text-Tinted/950">{{ featured.name }}</div>
                        <div class="mt-1 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-Tinted/400">{{ featured.role }}</div>
                    </figcaption>
                </figure>

                <!-- Member stories -->
                <figure
                    v-for="(story, i) in stories"
                    :key="story.name"
                    :class="[
                        'flex flex-col justify-between rounded-2xl border-2 border-Tinted/100 bg-white p-8',
                        i >= 2 ? 'tablet-wide:col-span-2' : '',
                    ]"
                    v-reveal="(i + 1) * 80"
                >
                    <blockquote class="font-franklin text-base leading-[1.65] text-Tinted/700">
                        &ldquo;{{ story.quote }}&rdquo;
                    </blockquote>
                    <figcaption class="mt-8">
                        <div class="font-poppins text-sm font-semibold text-Tinted/950">{{ story.name }}</div>
                        <div class="mt-1 font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-Tinted/400">{{ story.role }}</div>
                    </figcaption>
                </figure>
            </div>
        </div>
    </section>
</template>
