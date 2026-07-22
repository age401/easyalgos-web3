<script setup lang="ts">
// Recap strip: the five pillars detailed elsewhere on the page (Model,
// Track record, Infrastructure, Membership, Process), restated as a single
// synthesis. Cards slide in from the sides and settle into a row once
// scrolled into view — a one-shot entrance via useRevealOnce, transform +
// opacity only, gated behind `.js` in main.css for a no-JS fallback.
const solutions = [
    { index: '01', title: 'Expert Advisors', body: 'Award-winning strategies, provided at no cost — our incentive is aligned with performance, not a sale.', from: 'left' },
    { index: '02', title: 'Track record', body: 'Eight-plus years of independently verified performance, published in full, losing months included.', from: 'left' },
    { index: '03', title: 'Infrastructure', body: 'A dedicated EasyVPS, analytics dashboard, AI forecasts and back-testing archives around every strategy.', from: 'up' },
    { index: '04', title: 'Membership', body: 'No license fees, no commissions — terms structured by account size, not by price.', from: 'right' },
    { index: '05', title: 'Process', body: 'A short application, a provisioned account, continuous review — most members trade within two days.', from: 'right' },
]

const stackRef = ref<HTMLElement | null>(null)
const { visible } = useRevealOnce(stackRef)

function offsetX(from: string) {
    if (from === 'left') return '-160px'
    if (from === 'right') return '160px'
    return '0px'
}
function offsetY(from: string) {
    return from === 'up' ? '36px' : '0px'
}
</script>

<template>
    <section class="border-t border-Tinted/100 bg-Tinted/25 py-24 tablet-md:py-32">
        <div class="eal-container">
            <div v-reveal class="mx-auto max-w-[640px] text-center">
                <p class="eal-eyebrow justify-center">The whole system</p>
                <h2 class="eal-h2 mt-6">
                    All the solutions,<br />
                    in a single ecosystem.
                </h2>
                <p class="eal-lead mx-auto mt-6 max-w-[30rem]">
                    Five pillars, one membership &mdash; nothing here is sold separately, and nothing
                    here stands alone.
                </p>
            </div>

            <div ref="stackRef" class="mt-16 overflow-x-hidden py-2 tablet-md:mt-20">
                <div class="grid grid-cols-1 gap-5 tablet-md:grid-cols-5">
                    <div
                        v-for="(item, i) in solutions"
                        :key="item.title"
                        class="stack-card rounded-2xl border border-Tinted/100 bg-white p-7"
                        :class="{ 'is-visible': visible }"
                        :style="{
                            '--stack-x': offsetX(item.from),
                            '--stack-y': offsetY(item.from),
                            '--stack-delay': `${i * 90}ms`,
                        }"
                    >
                        <p class="eal-num font-poppins text-[13px] text-Tinted/400">{{ item.index }}</p>
                        <h3 class="mt-4 font-poppins text-[16px] font-medium text-Ink/950">{{ item.title }}</h3>
                        <p class="mt-3 font-franklin text-[14px] leading-[1.6] text-Neutral/500">{{ item.body }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
