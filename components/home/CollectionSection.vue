<script setup lang="ts">
// "The collection" — Expert Advisors presented as fund factsheets: name,
// AlgoScore, strategy line, equity sparkline, tenure. Sparklines are
// deterministic (seeded LCG at module scope), so SSR and client agree.
interface Factsheet {
    name: string
    collection: string
    style: string
    score: string
    live: string
}

const sheets: Factsheet[] = [
    { name: 'EasyGold', collection: 'EasyAlgos Collection', style: 'Gold trend-following', score: '9.2', live: '7.1 yrs live' },
    { name: 'Quantum Emperor', collection: 'Bogdan Ion Puscasu', style: 'GBPUSD momentum', score: '8.9', live: '4.8 yrs live' },
    { name: 'The Gold Reaper', collection: 'Wim Schrynemakers', style: 'XAUUSD swing', score: '8.7', live: '3.9 yrs live' },
    { name: 'EasyAI', collection: 'EasyAlgos Collection', style: 'AI multi-pair', score: '8.8', live: '5.4 yrs live' },
    { name: 'FastWay', collection: 'Pavel Udovichenko', style: 'Session breakout', score: '8.4', live: '4.2 yrs live' },
    { name: 'Range Breakout EA', collection: 'Jimmy Eriksson', style: 'Index ranges', score: '8.5', live: '3.5 yrs live' },
]

// Seeded LCG -> 24-point upward-drifting equity path per card (viewBox 120x36).
// Rendered to a markup string (v-html): dynamic bindings on SVG <circle> trip
// Vue's hydration prop-patching (read-only SVGAnimatedLength props), and the
// string is deterministic so server and client HTML match.
function sparkline(seed: number) {
    let s = seed
    const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
    const points: string[] = []
    let y = 30
    for (let i = 0; i < 24; i++) {
        y = Math.min(32, Math.max(4, y - 1.05 + (rand() - 0.42) * 4.4))
        points.push(`${((i * 120) / 23).toFixed(1)},${y.toFixed(1)}`)
    }
    const path = 'M' + points.join(' L')
    const [endX, endY] = points[points.length - 1].split(',')
    return `<path d="${path} L120,36 L0,36 Z" fill="rgba(89,89,255,0.07)"></path>` +
        `<path d="${path}" fill="none" stroke="#285FF7" stroke-width="1.8" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>` +
        `<circle cx="${endX}" cy="${endY}" r="2.4" fill="#B36DFF"></circle>`
}
const sparks = sheets.map((_, i) => sparkline(37 + i * 101))
</script>

<template>
    <section id="collection" class="py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="flex flex-col justify-between gap-8 tablet-wide:flex-row tablet-wide:items-end">
                <div class="max-w-[640px]">
                    <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The collection</p>
                    <h2 class="ea-h2 mt-6" v-reveal="80">
                        Twenty-five algorithms.<br />
                        Zero <span class="ea-grad-text">price tags</span>.
                    </h2>
                    <p class="ea-lead mt-6 max-w-[34rem]" v-reveal="140">
                        Curated from our own lab and the developers whose commercial EAs lead the market &mdash; each one live, third-party verified and scored by AlgoScore before it reaches your account.
                    </p>
                </div>
                <div class="pb-1" v-reveal="200">
                    <a href="https://easyalgos.ai/" class="ea-textlink group text-Tinted/700">
                        <span class="relative">
                            Explore all 25+ Expert Advisors
                            <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-Tinted/400 transition-all duration-300 ease-smooth group-hover:w-full" />
                        </span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M3 8h9M8.5 4.5 12.5 8l-4 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>

            <div class="mt-12 grid grid-cols-1 gap-5 tablet-md:grid-cols-2 tablet-wide:grid-cols-3">
                <article
                    v-for="(sheet, i) in sheets"
                    :key="sheet.name"
                    class="group flex flex-col rounded-2xl border-2 border-Tinted/100 bg-white p-7 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-Tinted/200 hover:shadow-card-m"
                    v-reveal="(i % 3) * 90"
                >
                    <!-- Factsheet header -->
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <h3 class="font-poppins text-lg font-semibold leading-6 text-Tinted/950">{{ sheet.name }}</h3>
                            <p class="mt-1.5 font-poppins text-[10px] font-medium uppercase tracking-[0.12em] text-Tinted/400">{{ sheet.collection }} &middot; {{ sheet.style }}</p>
                        </div>
                        <div class="shrink-0 text-right">
                            <div class="font-poppins text-[9px] font-medium uppercase tracking-[0.14em] text-Tinted/400">AlgoScore</div>
                            <div class="mt-0.5 font-poppins text-xl font-bold leading-6"><span class="ea-grad-text">{{ sheet.score }}</span><span class="text-sm font-medium text-Tinted/300">/10</span></div>
                        </div>
                    </div>

                    <!-- Sparkline -->
                    <svg viewBox="0 0 120 36" class="mt-6 h-12 w-full" preserveAspectRatio="none" role="img" :aria-label="sheet.name + ' verified equity sparkline'" v-html="sparks[i]" />

                    <!-- Factsheet footer -->
                    <div class="mt-5 flex items-center justify-between border-t border-Tinted/100 pt-4">
                        <span class="font-poppins text-[11px] font-medium uppercase tracking-[0.1em] text-Tinted/500">{{ sheet.live }}</span>
                        <span class="flex items-center gap-1.5 font-poppins text-[11px] font-medium uppercase tracking-[0.1em] text-Tinted/500">
                            <span class="h-1.5 w-1.5 rounded-full bg-Green/200" aria-hidden="true" />
                            Verified
                        </span>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
