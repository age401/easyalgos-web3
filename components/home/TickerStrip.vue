<script setup lang="ts">
// Performance tape: infinitely scrolling strip of Expert Advisor chips with
// month-to-date figures. The list renders twice; the CSS track slides -50%
// for a seamless loop (pauses on hover, disabled by reduced-motion).
const chips = [
    { name: 'EasyGold', value: '+3.1% MTD', up: true },
    { name: 'Quantum Emperor', value: '+2.4% MTD', up: true },
    { name: 'EasyAI', value: '+1.8% MTD', up: true },
    { name: 'The Gold Reaper', value: '+2.9% MTD', up: true },
    { name: 'FastWay', value: '+1.2% MTD', up: true },
    { name: 'EasyScalper', value: '-0.4% MTD', up: false },
    { name: 'Range Breakout EA', value: '+2.1% MTD', up: true },
    { name: 'The Bitcoin Core', value: '+4.6% MTD', up: true },
    { name: 'GoldTrade Pro', value: '+1.7% MTD', up: true },
    { name: 'EasySentinel', value: '+0.9% MTD', up: true },
    { name: 'Luna AI', value: '+2.2% MTD', up: true },
    { name: 'EasyMomentum', value: '+1.4% MTD', up: true },
]
</script>

<template>
    <section class="ea-tape border-y border-Tinted/100 bg-Tinted/25 py-4" aria-label="Expert Advisor month-to-date performance">
        <div class="ea-tape__track">
            <div v-for="copy in 2" :key="copy" class="flex items-center" :aria-hidden="copy === 2 ? 'true' : undefined">
                <div v-for="chip in chips" :key="copy + chip.name" class="flex items-center">
                    <span class="flex items-center gap-2.5 px-7">
                        <span :class="['h-1.5 w-1.5 rounded-full', chip.up ? 'bg-Green/200' : 'bg-Red/200']" aria-hidden="true" />
                        <span class="whitespace-nowrap font-poppins text-[13px] font-semibold text-Tinted/900">{{ chip.name }}</span>
                        <span :class="['whitespace-nowrap font-franklin text-[13px] tabular-nums', chip.up ? 'text-Green/200' : 'text-Red/200']">{{ chip.value }}</span>
                    </span>
                    <span class="h-1 w-1 rounded-full bg-Tinted/200" aria-hidden="true" />
                </div>
            </div>
        </div>
    </section>
</template>
