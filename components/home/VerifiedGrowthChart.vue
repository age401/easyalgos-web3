<script setup lang="ts">
// Verified-growth graphic. The EasyAlgos portfolio compounds (VERIFIED GROWTH);
// the typical paid EA decays through upfront fees, curve-fit decay and eventual
// abandonment (ABANDONED). The wedge between them is the cost of the old model.
// `active` (driven by the dark-band observer) triggers the draw-in animation.
// Geometry adapted from the IC Precision edge-retention chart (same system).
defineProps<{ active?: boolean }>()

const PAD_Y = 20 // headroom so the growth curve's endpoint & labels don't clip the viewBox

const verticalGrid = Array.from({ length: 12 }, (_, i) => Math.round((i * 1200) / 11))
const horizontalGrid = Array.from({ length: 8 }, (_, i) => Math.round((i * 400) / 7) + PAD_Y)

const verified = 'M0,320 C250,300 520,190 780,140 C950,107 1080,84 1193,64'
const typical = 'M0,320 C180,330 400,368 640,382 C820,392 1000,396 1193,392'
const wedge = `${verified} L 1193,392 C1000,396 820,392 640,382 C400,368 180,330 0,320 Z`

// Same cubic control points as the `typical` path above, used to solve the curve's
// y at a given x so each reference tick ends exactly on the line instead of crossing it.
const typicalSegments: [number, number][][] = [
    [[0, 320], [180, 330], [400, 368], [640, 382]],
    [[640, 382], [820, 392], [1000, 396], [1193, 392]],
]
function cubicY(seg: [number, number][], t: number) {
    const mt = 1 - t
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t
    return a * seg[0][1] + b * seg[1][1] + c * seg[2][1] + d * seg[3][1]
}
function cubicX(seg: [number, number][], t: number) {
    const mt = 1 - t
    const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t
    return a * seg[0][0] + b * seg[1][0] + c * seg[2][0] + d * seg[3][0]
}
function typicalYAtX(targetX: number) {
    const seg = typicalSegments.find((s) => targetX >= s[0][0] && targetX <= s[3][0]) ?? typicalSegments[typicalSegments.length - 1]
    let lo = 0, hi = 1
    for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2
        if (cubicX(seg, mid) < targetX) lo = mid; else hi = mid
    }
    return cubicY(seg, (lo + hi) / 2)
}

const TICK_LEN = 40
const ticks = ['UPFRONT FEES', 'CURVE-FIT DECAY', 'ABANDONED'].map((label, i) => {
    const x = [380, 700, 980][i]
    const bottom = typicalYAtX(x)
    return { x, top: bottom - TICK_LEN, bottom, labelY: bottom - TICK_LEN - 20, label }
})

// Pre-rendered markup (v-html): per-element dynamic bindings on SVG <line>/<text>
// trip Vue's hydration prop-patching (x/y/x2/y2 are read-only SVGAnimatedLength
// props). The strings are deterministic, so server and client HTML match exactly.
const tickLinesMarkup = ticks
    .map((t) => `<line x1="${t.x}" y1="${t.top.toFixed(2)}" x2="${t.x}" y2="${t.bottom.toFixed(2)}"></line>`)
    .join('')
const tickLabelsMarkup = ticks
    .map((t) => `<text x="${t.x}" y="${t.labelY.toFixed(2)}" text-anchor="middle" fill="#62678F">${t.label}</text>`)
    .join('')
const gridMarkup = [
    ...verticalGrid.map((x) => `<line x1="${x}" y1="${PAD_Y}" x2="${x}" y2="${400 + PAD_Y}"></line>`),
    ...horizontalGrid.map((y) => `<line x1="0" y1="${y}" x2="1200" y2="${y}"></line>`),
].join('')
</script>

<template>
    <div :class="['ea-chart', { 'is-active': active }]">
        <!-- Header -->
        <div class="mb-5 flex items-center justify-between">
            <span class="font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-VIOLET/400">Verified performance</span>
            <span class="font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-VIOLET/400">Since 2017</span>
        </div>

        <svg viewBox="0 0 1200 440" class="w-full" preserveAspectRatio="none" role="img" aria-label="Verified growth since 2017: the EasyAlgos portfolio compounds while the typical paid Expert Advisor decays and is abandoned.">
            <defs>
                <linearGradient id="verifiedGrad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#45D6FF" />
                    <stop offset="0.5" stop-color="#5572FF" />
                    <stop offset="1" stop-color="#AD6AFF" />
                </linearGradient>
                <linearGradient id="wedgeGrad" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#6B55E9" stop-opacity="0.24" />
                    <stop offset="1" stop-color="#5E5CC8" stop-opacity="0" />
                </linearGradient>
                <filter id="lineGlow" x="-10%" y="-60%" width="120%" height="220%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            <!-- Grid -->
            <g class="chart-grid" stroke="#1C1A24" v-html="gridMarkup" />

            <!-- Lost-potential wedge -->
            <path class="chart-wedge" :d="wedge" fill="url(#wedgeGrad)" />

            <!-- Decay ticks: end exactly on the Typical curve, never cross it -->
            <g class="chart-tick" stroke="#5C549F" stroke-width="4" v-html="tickLinesMarkup" />

            <!-- Typical (decaying) line -->
            <path class="chart-line chart-line--secondary" :d="typical" fill="none" stroke="#AEB2C9" stroke-width="4" stroke-linecap="round" pathLength="1" />

            <!-- Verified (compounding) line -->
            <path class="chart-line" :d="verified" fill="none" stroke="url(#verifiedGrad)" stroke-width="6" stroke-linecap="round" filter="url(#lineGlow)" pathLength="1" />

            <!-- End markers -->
            <g class="chart-dot">
                <circle class="chart-pulse" cx="1193" cy="64" r="7" fill="#49D8FF" />
                <circle cx="1193" cy="64" r="7" fill="#49D8FF" filter="url(#lineGlow)" />
                <circle cx="1193" cy="392" r="5.5" fill="#171717" stroke="#AEB2C9" stroke-width="3" />
            </g>

            <!-- Labels -->
            <g class="chart-label" font-family="Poppins, sans-serif" font-size="12" font-weight="500" letter-spacing="1.5">
                <text x="0" y="8" fill="#AEB2C9" font-weight="400" letter-spacing="2">GROWTH</text>
                <text x="1193" y="32" text-anchor="end" font-size="14" font-weight="600" letter-spacing="2" fill="#49D8FF">VERIFIED GROWTH</text>
                <g v-html="tickLabelsMarkup" />
                <text x="1193" y="368" text-anchor="end" font-size="14" font-weight="600" letter-spacing="2" fill="#AEB2C9">THE TYPICAL PAID EA</text>
            </g>
        </svg>

        <!-- Axis -->
        <div class="flex items-center justify-between border-t-2 border-[#332E43] py-3 font-poppins text-sm font-semibold uppercase tracking-[0.14em] text-Tinted/300">
            <span>2017</span>
            <span>Time &rsaquo;</span>
            <span>Today</span>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-x-12 gap-y-2 border-t-2 border-[#332E43] py-3 font-poppins text-sm font-semibold uppercase tracking-[0.14em] text-[#6A7198]">
            <span class="flex items-center gap-2">
                <span class="h-2.5 w-4 rounded" style="background: linear-gradient(90deg,#45D6FF,#5572FF,#AD6AFF)" aria-hidden="true" />
                EasyAlgos portfolio
            </span>
            <span class="flex items-center gap-2">
                <span class="h-2.5 w-4 rounded bg-Tinted/300" aria-hidden="true" />
                Typical paid EA
            </span>
            <span class="flex items-center gap-2">
                <span class="h-2.5 w-4 rounded" style="background: linear-gradient(122deg,#413C72,rgba(65,60,114,0.2))" aria-hidden="true" />
                Lost potential
            </span>
        </div>
    </div>
</template>
