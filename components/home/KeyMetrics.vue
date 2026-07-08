<script setup lang="ts">
// Key access metrics strip (tinted band, 4 cells with hairline dividers).
const metrics = [
    { value: '$0', label: 'License fees, subscriptions & hidden costs', gradient: true },
    { value: '0%', label: 'Commissions on your trading profits', gradient: true },
    { value: '8+', suffix: ' yrs', label: 'Third-party-verified track records', gradient: true },
    { value: '25+', label: 'Award-winning Expert Advisors', gradient: false },
]
</script>

<template>
    <section class="border-y border-Tinted/100 bg-Tinted/25">
        <div class="ea-container">
            <!-- gap-px over a Tinted/100 bg renders crisp hairline dividers between cells -->
            <div class="grid grid-cols-2 gap-px bg-Tinted/100 tablet-md:grid-cols-4">
                <div
                    v-for="(m, i) in metrics"
                    :key="m.label"
                    class="bg-Tinted/25 px-6 py-11 tablet:px-8 tablet-md:py-14"
                    v-reveal="i * 90"
                >
                    <div class="font-poppins font-bold leading-none text-[2.5rem] tablet:text-[2.75rem] text-Tinted/950"
                    ><span :class="{ 'ea-grad-text': m.gradient }">{{ m.value }}</span><span v-if="m.suffix">{{ m.suffix }}</span></div>
                    <div class="mt-4 max-w-[15rem] font-poppins text-[11px] font-medium uppercase leading-[1.5] tracking-[0.13em] text-Tinted/500">
                        {{ m.label }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
