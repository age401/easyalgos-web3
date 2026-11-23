<script setup lang="ts">
// The EA page's KPI strip - Figma "KPIs" (3920:16086): six tiles in a row.
//
// Six across needs 146px a tile to hold "+341.31%" at 22px, i.e. a 936px
// column. The data column is only that wide from a 1400px viewport up, so the
// strip re-lays by its OWN width (`.xa-kpis` in main.css):
//
//   >= 880px   six across, as drawn.
//   520-879px  three by two.
//   <  520px   two across, with the two tiles that carry the page's headline
//              spanning the row: all-time growth leads at a larger size, and
//              AlgoScore closes it with the ring, the band and the rank side by
//              side. The four plain figures pair up between them.
//
// That last arrangement is not "the grid, narrower": a ten-character growth
// figure ("+2,236.32%") does not fit half a phone at any legible size, so it
// gets the full width and the emphasis it has in the reading order anyway.
import type { ExpertAdvisor } from '~/types/expertAdvisors'

interface Props {
    ea: ExpertAdvisor
}
const props = defineProps<Props>()

const { locale } = useI18n()

const since = computed(() => `${eaMonthName(locale.value, props.ea.startMonth)} ${props.ea.startYear}`)
</script>

<template>
    <div class="xa-kpis-wrap">
        <dl class="xa-kpis">
            <div class="xa-kpi xa-kpi--lead">
                <dt class="xa-label">{{ $t('ea.card.allTimeGrowth') }}</dt>
                <dd :class="['xa-kpi__value ea-num', ea.growth < 0 ? '!text-Red/200' : '!text-Green/200']">
                    {{ eaPercent(ea.growth, { sign: true }) }}
                </dd>
                <dd class="xa-kpi__caption">{{ $t('ea.detail.kpi.since', { date: since }) }}</dd>
            </div>

            <div class="xa-kpi">
                <dt class="xa-label">{{ $t('card.monthlyGain') }}</dt>
                <dd class="xa-kpi__value ea-num">{{ eaPercent(ea.monthly) }}</dd>
                <dd class="xa-kpi__caption">{{ $t('ea.detail.kpi.compounded') }}</dd>
            </div>

            <div class="xa-kpi">
                <dt class="xa-label">{{ $t('card.dailyGain') }}</dt>
                <dd class="xa-kpi__value ea-num">{{ eaPercent(ea.daily) }}</dd>
                <dd class="xa-kpi__caption">{{ $t('ea.detail.kpi.compounded') }}</dd>
            </div>

            <div class="xa-kpi">
                <dt class="xa-label">{{ $t('ea.detail.kpi.maxDrawdown') }}</dt>
                <dd class="xa-kpi__value ea-num">{{ eaPercent(ea.maxDrawdown) }}</dd>
                <dd class="xa-kpi__caption">{{ $t('ea.detail.kpi.peakToValley') }}</dd>
            </div>

            <div class="xa-kpi">
                <dt class="xa-label">{{ $t('card.monthsInProfit') }}</dt>
                <dd class="xa-kpi__value ea-num">
                    {{ $t('ea.detail.kpi.ofMonths', { profit: ea.monthsInProfit, total: ea.monthsTotal }) }}
                </dd>
                <dd class="h-1 w-full max-w-[110px] overflow-hidden rounded-sm bg-Tinted/100" aria-hidden="true">
                    <span
                        class="xa-bar block h-full rounded-sm bg-Green/100"
                        :style="{ width: `${(ea.monthsInProfit / ea.monthsTotal) * 100}%` }"
                    />
                </dd>
            </div>

            <!-- Hidden on a phone: the identity card above already leads with the ring. -->
            <div class="xa-kpi xa-kpi--score max-tablet:hidden">
                <dt class="xa-label">{{ $t('card.algoScore') }}</dt>
                <dd class="flex items-center gap-2.5">
                    <EaScoreRing :score="ea.score" size="md" />
                    <span class="xa-kpi__verdict">
                        <span class="xa-label" :style="{ color: ea.band.text }">{{ $t(`ea.band.${ea.band.id}`) }}</span>
                        <!-- Figma "Tag", solid: the rank chip. -->
                        <span
                            class="ea-num whitespace-nowrap rounded-full bg-Tinted/50 px-2 py-1.5 font-poppins text-[11px] font-medium leading-3 text-Tinted/800"
                        >
                            {{ $t('ea.score.rank', { rank: ea.rank, total: EXPERT_ADVISORS.length }) }}
                        </span>
                    </span>
                </dd>
            </div>
        </dl>
    </div>
</template>
