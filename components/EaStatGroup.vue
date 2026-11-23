<script setup lang="ts">
// A group of headline figures - label, figure, caption.
//
// One component for the four places the design draws this: the list hero's
// three tiles (3939:19345), the developer page's four (3923:16308), the
// developer panel's three on the EA page (3921:16267), and their phone forms.
//
// RESPONSIVE. The drawn tile needs about 130px to hold "LONGEST RECORD" over a
// 32px figure, and three of those do not fit a phone. Shrinking the type until
// they do leaves a 20px figure under a label that wraps, which is no longer a
// headline figure. So the group changes FORM with the width it is given - not
// with the viewport, because the same group is 452px wide in the developer
// page's desktop header and 536px wide in a tablet column:
//
//   >= 560px   the drawn tiles.
//   420-559px  the same tiles, tighter: 16px padding, 26px figure.
//   <  420px   a LEDGER: one panel, one row per figure, label and caption on
//              the left and the figure right-aligned at full size. Three rows
//              read top to bottom at a glance, and nothing wraps or shrinks.
//
// All three are the same <dl>, re-laid by grid areas in main.css (.xa-stats).
export interface EaStat {
    label: string
    /** Plain text, or a figure to count up with its own affixes. */
    value: string | { amount: number; decimals?: 0 | 1 | 2; prefix?: string; suffix?: string }
    caption: string
}

interface Props {
    stats: EaStat[]
    /** `tinted` sits on white (Tinted/25 tiles); `white` sits on a tinted panel. */
    surface?: 'tinted' | 'white'
    /** How the tiles are arranged once there is room for tiles at all. */
    columns?: 'three' | 'quad'
}
withDefaults(defineProps<Props>(), { surface: 'tinted', columns: 'three' })
</script>

<template>
    <div class="xa-stats-wrap">
        <dl :class="['xa-stats', `xa-stats--${surface}`, `xa-stats--${columns}`]">
            <div v-for="stat in stats" :key="stat.label" class="xa-stat">
                <dt class="xa-label xa-stat__label">{{ stat.label }}</dt>
                <dd class="xa-stat__value ea-num">
                    <template v-if="typeof stat.value === 'string'">{{ stat.value }}</template>
                    <EaCount
                        v-else
                        :value="stat.value.amount"
                        :decimals="stat.value.decimals"
                        :prefix="stat.value.prefix"
                        :suffix="stat.value.suffix"
                    />
                </dd>
                <dd class="xa-stat__caption">{{ stat.caption }}</dd>
            </div>
        </dl>
    </div>
</template>
