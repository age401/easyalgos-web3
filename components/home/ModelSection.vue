<script setup lang="ts">
// "Free isn't a trick. It's a structure." — the business model as a value-flow
// diagram: capital flows from your trading, through the broker, into the
// platform. Connector dashes drift continuously (CSS, cheap).
const nodes = [
    {
        n: '01',
        title: 'You trade',
        desc: 'Your capital stays in your own broker account. We never touch your funds — the algorithms simply trade where you already are.',
    },
    {
        n: '02',
        title: 'The broker compensates us',
        desc: 'IC Markets and IC Trading share a fraction of the spread on the volume our members generate. That is our entire revenue.',
    },
    {
        n: '03',
        title: 'We build and maintain',
        desc: 'Expert Advisors, EasyVPS infrastructure, analytics and support — funded by the partnership, not by your wallet.',
    },
]
</script>

<template>
    <section id="model" class="border-t border-Tinted/100 bg-Tinted/25 py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[640px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>How it stays free</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    Free isn't a trick.<br />
                    It's a <span class="ea-grad-text">structure</span>.
                </h2>
            </div>

            <!-- Flow -->
            <div class="mt-14 grid grid-cols-1 items-stretch gap-4 tablet-md:grid-cols-[1fr_3.5rem_1fr_3.5rem_1fr] tablet-md:gap-0">
                <template v-for="(node, i) in nodes" :key="node.n">
                    <!-- Connector (desktop: horizontal, mobile: vertical) -->
                    <div v-if="i > 0" class="centered" v-reveal="i * 160" aria-hidden="true">
                        <svg class="hidden h-6 w-full tablet-md:block" viewBox="0 0 56 24" fill="none" preserveAspectRatio="none">
                            <path class="ea-flow-dash" d="M2 12h44" stroke="#7A7FA3" stroke-width="2" stroke-linecap="round" />
                            <path d="M44 6l8 6-8 6" stroke="#7A7FA3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                        </svg>
                        <svg class="h-10 w-6 tablet-md:hidden" viewBox="0 0 24 40" fill="none">
                            <path class="ea-flow-dash" d="M12 2v28" stroke="#7A7FA3" stroke-width="2" stroke-linecap="round" />
                            <path d="M6 28l6 8 6-8" stroke="#7A7FA3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                        </svg>
                    </div>

                    <!-- Node -->
                    <article class="flex flex-col rounded-2xl border-2 border-Tinted/100 bg-white p-7" v-reveal="i * 160">
                        <div class="flex items-center justify-between">
                            <span class="font-poppins text-sm font-medium tracking-[2px] text-BLUE/BASE">{{ node.n }}</span>
                            <span v-if="i === 1" class="rounded-full bg-Tinted/25 px-2.5 py-1 font-poppins text-[10px] font-medium uppercase tracking-[0.1em] text-Tinted/500 ring-1 ring-Tinted/100">Our only revenue</span>
                        </div>
                        <h3 class="mt-5 font-poppins text-lg font-semibold text-Tinted/950">{{ node.title }}</h3>
                        <p class="mt-2.5 font-franklin text-[15px] leading-[1.6] text-Tinted/600">{{ node.desc }}</p>
                    </article>
                </template>
            </div>

            <!-- The alignment note -->
            <div class="mt-12 max-w-[720px] border-l-2 border-Blue/600 pl-6" v-reveal="200">
                <p class="font-franklin text-[17px] leading-[1.62] text-Tinted/900">
                    The alignment is the product: <strong class="font-medium">if you stop trading, we stop earning.</strong> That is why everything here &mdash; from VPS specs to risk limits &mdash; is engineered for longevity, not churn.
                </p>
            </div>
        </div>
    </section>
</template>
