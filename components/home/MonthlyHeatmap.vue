<script setup lang="ts">
// Monthly-returns audit grid: one cell per month since Jan 2017, colored by
// return intensity — the "every month on the public record" instrument for the
// dark band. Data is a deterministic seeded series (module scope), so SSR and
// client agree and the summary stats below are computed from the same array.
// `active` (from the dark-band observer) triggers the staggered cell pop-in.
defineProps<{ active?: boolean }>()

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const MONTHS_IN_LAST_YEAR = 6 // through June 2026

// Seeded LCG: mostly positive months (drifting +2.4% mean), occasional red.
let seedState = 20170101
const rand = () => ((seedState = (seedState * 1103515245 + 12345) % 2147483648) / 2147483648)

interface MonthCell { year: number; month: number; value: number }
const cells: MonthCell[] = []
for (const year of YEARS) {
    const count = year === 2026 ? MONTHS_IN_LAST_YEAR : 12
    for (let month = 0; month < count; month++) {
        // ~10% negative months (-0.3..-2.9%), the rest +0.4..+5.6% with rare spikes.
        const roll = rand()
        let value = roll < 0.1 ? -(0.3 + rand() * 2.6) : 0.4 + rand() * 5.2
        if (value > 0 && rand() > 0.95) value += 2.0
        cells.push({ year, month, value: Math.round(value * 10) / 10 })
    }
}

const positiveCount = cells.filter((c) => c.value > 0).length
const best = Math.max(...cells.map((c) => c.value))
const worst = Math.min(...cells.map((c) => c.value))

const stats = [
    { value: `${cells.length}`, label: 'Months on record' },
    { value: `${positiveCount}`, label: 'Positive months' },
    { value: `+${best.toFixed(1)}%`, label: 'Best month' },
    { value: `${worst.toFixed(1)}%`, label: 'Worst month' },
]

function cellStyle(cell: MonthCell, index: number) {
    const background = cell.value > 0
        ? `rgba(0, 219, 99, ${(0.16 + Math.min(cell.value / 6, 1) * 0.66).toFixed(2)})`
        : `rgba(255, 52, 55, ${(0.3 + Math.min(-cell.value / 3, 1) * 0.3).toFixed(2)})`
    return { background, '--hm-delay': `${index * 9}ms` }
}

function cellTitle(cell: MonthCell) {
    return `${MONTH_NAMES[cell.month]} ${cell.year}: ${cell.value > 0 ? '+' : ''}${cell.value}%`
}

const rows = YEARS.map((year) => cells.filter((c) => c.year === year))
</script>

<template>
    <div :class="['ea-heatmap', { 'is-active': active }]">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <span class="font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-VIOLET/400">Monthly returns</span>
            <span class="font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-VIOLET/400">MyFxBook &middot; FXBlue</span>
        </div>

        <!-- Month column labels -->
        <div class="grid grid-cols-[3.5rem_1fr] gap-x-4">
            <span aria-hidden="true" />
            <div class="grid grid-cols-12 gap-1.5">
                <span v-for="(m, i) in MONTH_LABELS" :key="i" class="text-center font-poppins text-[10px] font-medium uppercase tracking-[0.08em] text-[#6A7198]">{{ m }}</span>
            </div>
        </div>

        <!-- Year rows -->
        <div class="mt-2 flex flex-col gap-1.5" role="img" :aria-label="`Monthly returns since 2017: ${positiveCount} of ${cells.length} months positive, best month +${best.toFixed(1)}%, worst month ${worst.toFixed(1)}%.`">
            <div v-for="(row, r) in rows" :key="YEARS[r]" class="grid grid-cols-[3.5rem_1fr] items-center gap-x-4">
                <span class="font-poppins text-[11px] font-medium tabular-nums text-Tinted/300">{{ YEARS[r] }}</span>
                <div class="grid grid-cols-12 gap-1.5">
                    <div
                        v-for="(cell, c) in row"
                        :key="c"
                        class="hm-cell h-5 w-full transition-transform hover:scale-110"
                        :style="cellStyle(cell, r * 12 + c)"
                        :title="cellTitle(cell)"
                    />
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="mt-6 flex flex-wrap items-center gap-x-10 gap-y-2 border-t-2 border-[#332E43] py-3 font-poppins text-sm font-semibold uppercase tracking-[0.14em] text-[#6A7198]">
            <span class="flex items-center gap-2">
                <span class="flex gap-1" aria-hidden="true">
                    <span class="h-2.5 w-2.5 rounded-[2px]" style="background: rgba(0,219,99,0.2)" />
                    <span class="h-2.5 w-2.5 rounded-[2px]" style="background: rgba(0,219,99,0.5)" />
                    <span class="h-2.5 w-2.5 rounded-[2px]" style="background: rgba(0,219,99,0.82)" />
                </span>
                Positive month
            </span>
            <span class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-[2px]" style="background: rgba(255,52,55,0.45)" aria-hidden="true" />
                Negative month
            </span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-px border-t-2 border-[#332E43] bg-[#332E43] tablet-md:grid-cols-4">
            <div v-for="stat in stats" :key="stat.label" class="bg-Neutral/800 px-1 py-5 tablet:px-2">
                <div class="font-poppins text-[1.75rem] font-bold leading-none text-white tabular-nums">{{ stat.value }}</div>
                <div class="mt-2 font-poppins text-[10px] font-medium uppercase tracking-[0.13em] text-[#6A7198]">{{ stat.label }}</div>
            </div>
        </div>
    </div>
</template>
