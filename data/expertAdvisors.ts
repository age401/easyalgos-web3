import type {
    EaBandId,
    EaDeveloper,
    EaDeveloperSeed,
    EaMonthPoint,
    EaScoreBand,
    EaSeed,
    EaYearRow,
    ExpertAdvisor
} from '../types/expertAdvisors'

// Expert Advisors - the content behind /expert-advisors, the EA pages and the
// developer pages (Figma "EasyAlgos - WEB3", page 3913:15396: the List [Cards],
// List [Compact], Expert Advisor and Developer "v2" frames).
//
// BAKED DATA, on the same terms as data/heroCards.ts: this is what the backend
// publishes daily (01:00 GMT), resolved at build time so every route prerenders
// complete - no client fetch, no skeleton, no layout shift. This module is the
// seam where that feed plugs in; the components only ever see `ExpertAdvisor`
// and `EaDeveloper`.
//
// WHAT IS DRAWN AND WHAT IS NOT. The twenty-one EAs, their developers, scores,
// growth and drawdown are the figures drawn in the two list frames. The first
// twelve also carry their drawn monthly gain and months in profit. The Gold
// Reaper carries everything on the EA frame: its description, specs, monthly
// table and equity curve. Everything else is SAMPLE data and is marked so:
//   - `monthly`, `monthsInProfit` and `monthsTotal` on the nine EAs that only
//     appear in the compact frame (flagged `// sample` below);
//   - `style`, `pairs` and `timeframe` on every EA but The Gold Reaper;
//   - every monthly table and equity curve but The Gold Reaper's, which
//     `buildRecord` generates deterministically from the headline figures so
//     that the heatmap, the chart and the card sparkline all agree with them.
// No developer bio, country or start year is invented: where the design draws
// none, the field is left out and the page says less.
//
// Plain relative imports and no auto-imported helpers on purpose: nuxt.config.ts
// imports EA_PRERENDER_ROUTES from here, and it runs outside the Nuxt runtime.

/** The publish this snapshot belongs to. Every live record ends in its month. */
export const EA_DATA_AS_OF = '2026-11-19T01:00:00Z'
const END_YEAR = 2026
const END_MONTH = 10 // November, 0-based

// Indicators/* from the WEB3 library, as drawn on the cards, the EA page's ring
// and the developer page's ranking. Listed best-first so `find` reads naturally.
export const EA_SCORE_BANDS: readonly EaScoreBand[] = [
    { id: 'excellent', min: 80, text: '#00BA38', bar: '#00DB63', ring: '#00EB8D', tint: '#F0FDF4' },
    { id: 'good', min: 60, text: '#074CFB', bar: '#4072FF', ring: '#4072FF', tint: '#EFF6FF' },
    { id: 'fair', min: 40, text: '#EE7206', bar: '#FB951E', ring: '#FB951E', tint: '#FFFBEB' },
    { id: 'poor', min: 0, text: '#DC2626', bar: '#FF1519', ring: '#FF1519', tint: '#FEF2F2' }
] as const

export function eaScoreBand(score: number): EaScoreBand {
    return EA_SCORE_BANDS.find((band) => score >= band.min) ?? EA_SCORE_BANDS[EA_SCORE_BANDS.length - 1]
}

/** Drawdown tone on the cards: the design prints 30%+ in orange and 40%+ in red. */
export function eaDrawdownTone(maxDrawdown: number): 'calm' | 'elevated' | 'high' {
    if (maxDrawdown >= 40) return 'high'
    if (maxDrawdown >= 30) return 'elevated'
    return 'calm'
}

// -------------------------------------------------------------- Developers --

const DEVELOPER_SEEDS: EaDeveloperSeed[] = [
    {
        slug: 'wim-schrynemakers',
        name: 'Wim Schrynemakers',
        givenName: 'Wim',
        countryCode: 'mt',
        country: 'Malta',
        since: 2005,
        bio: 'Developing EAs since 2005, I believe I can call myself an experienced EA trader. In creating my systems, the most attention goes to having a controlled risk and a good risk/reward ratio. I don’t believe in holy grails — long-term stability is what I try to achieve.',
        statement:
            'In creating my systems, the most attention goes to having a controlled risk and a good risk/reward ratio. I don’t believe in holy grails. Even the best systems will have losing days, weeks and months — long-term stability is what I try to achieve.',
        // PLACEHOLDER HREF. The design draws the button and names no destination;
        // a guessed URL would look authoritative and be wrong.
        website: '#',
        avatar: 'wim-schrynemakers'
    },
    { slug: 'jimmy-eriksson', name: 'Jimmy Eriksson', website: '#' },
    { slug: 'brandon-autry', name: 'Brandon Autry', website: '#' },
    { slug: 'valerytrading', name: 'ValeryTrading', website: '#' },
    { slug: 'tothemoon', name: 'ToTheMoon', website: '#' },
    { slug: 'barbaros-bulent-kortarla', name: 'Barbaros Bulent Kortarla', website: '#' }
]

// --------------------------------------------------------------------- EAs --

const raster = (name: string, size = 256) => ({ kind: 'raster', name, size }) as const
const glyph = (name: string, width: number, height: number) => ({ kind: 'glyph', name, width, height }) as const
const letter = { kind: 'letter' } as const

const EA_SEEDS: EaSeed[] = [
    {
        slug: 'goldtrade-pro',
        name: 'GoldTrade Pro',
        developer: 'wim-schrynemakers',
        score: 88,
        image: raster('goldtrade-pro'),
        growth: 627.71,
        monthly: 5.33,
        maxDrawdown: 39.25,
        monthsInProfit: 22,
        monthsTotal: 39,
        style: 'Trend following',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'H1'
    },
    {
        slug: 'the-gold-reaper',
        name: 'The Gold Reaper',
        developer: 'wim-schrynemakers',
        score: 87,
        image: raster('the-gold-reaper'),
        growth: 341.31,
        monthly: 6.06,
        maxDrawdown: 16.78,
        monthsInProfit: 21,
        monthsTotal: 26,
        style: 'Breakout strategies',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'H1',
        description:
            'An automated breakout trading system built exclusively for gold (XAUUSD). It balances 9 complementary breakout strategies across the H1, H4 and Daily timeframes, adapting to gold’s constantly changing market conditions.',
        screenshots: ['the-gold-reaper-1', 'the-gold-reaper-2', 'the-gold-reaper-3'],
        // The table drawn on the EA frame (3921:16101), verbatim.
        monthlyReturns: {
            2026: [18.5, 3.24, 7.29, 1.12, 5.97, 9.67, -2.04, 10.5, 14.39, -3.74, 1.14, null],
            2025: [6.79, -6.63, 6.35, 19.85, 15.18, 9.85, 1.56, 2.75, 12.61, -4.57, 8.36, 4.33],
            2024: [null, null, null, null, null, null, null, null, null, -0.43, 11.34, 5.0]
        },
        // The ninety points of the drawn equity curve (3959:4669), read off its
        // path and rescaled so the last one lands on the published +341.31%.
        series: [
            0, 0.1, 7.5, 0.7, 1.7, 3.7, 11.5, 20.1, 20.9, 22.3, 31.9, 36.9, 28, 35.7, 42.1, 34, 41.2, 41.7, 38.4,
            42.8, 52.4, 56, 63.9, 73.3, 75.1, 79.6, 74, 75.1, 79.2, 87.7, 95.3, 96.7, 90.7, 93.6, 95.6, 97.3, 100.8,
            102.5, 104.4, 109.5, 114.8, 103.5, 113.1, 113.2, 119.6, 121.2, 126.7, 132.1, 139.9, 150.5, 160.3, 160.7,
            160.4, 170.7, 161.1, 164.8, 172.9, 177.9, 178, 184.4, 194.5, 197.7, 206.5, 213.2, 217.7, 227.6, 228.9,
            229.3, 237.7, 246.8, 255.8, 248.9, 253.7, 256.8, 264.2, 262.1, 269.4, 277.6, 288.1, 297.6, 308, 312.5,
            316, 326, 336.2, 325.2, 328.5, 330.8, 331.2, 341.31
        ]
    },
    {
        slug: 'range-breakout-ea',
        name: 'Range Breakout EA',
        developer: 'jimmy-eriksson',
        score: 84,
        image: raster('range-breakout-ea', 128),
        growth: 357.92,
        monthly: 6.45,
        maxDrawdown: 34,
        monthsInProfit: 16,
        monthsTotal: 25,
        style: 'Range breakout',
        pairs: 'XAUUSD, US30',
        timeframe: 'M15'
    },
    {
        slug: 'byrdi',
        name: 'BYRDI',
        developer: 'brandon-autry',
        score: 83,
        image: raster('byrdi', 128),
        growth: 19.04,
        monthly: 3.13,
        maxDrawdown: 14.32,
        monthsInProfit: 5,
        monthsTotal: 7,
        style: 'Multi-strategy',
        pairs: 'Major FX pairs',
        timeframe: 'H1'
    },
    {
        slug: 'golden-pickaxe',
        name: 'Golden Pickaxe',
        developer: 'valerytrading',
        score: 82,
        image: glyph('golden-pickaxe', 36, 31.2453),
        growth: 221.45,
        monthly: 2.7,
        maxDrawdown: 50.62,
        monthsInProfit: 40,
        monthsTotal: 71,
        style: 'Grid',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'M15'
    },
    {
        slug: 'momentum-ai',
        name: 'Momentum AI',
        developer: 'valerytrading',
        score: 82,
        image: glyph('momentum-ai', 36, 9.49721),
        growth: 59.29,
        monthly: 1.04,
        maxDrawdown: 19.91,
        monthsInProfit: 19,
        monthsTotal: 46,
        style: 'Momentum',
        pairs: 'EURUSD, GBPUSD',
        timeframe: 'H1'
    },
    {
        slug: 'nopain',
        name: 'NoPain',
        developer: 'tothemoon',
        score: 82,
        image: letter,
        growth: 2236.32,
        monthly: 5.27,
        maxDrawdown: 48.22,
        monthsInProfit: 59,
        monthsTotal: 62,
        style: 'Mean reversion',
        pairs: 'AUDCAD, NZDCAD',
        timeframe: 'M15'
    },
    {
        slug: 'sentinel-ai',
        name: 'Sentinel AI',
        developer: 'valerytrading',
        score: 78,
        image: glyph('sentinel-ai', 26.9735, 36),
        growth: 436.59,
        monthly: 1.92,
        maxDrawdown: 75.74,
        monthsInProfit: 74,
        monthsTotal: 88,
        style: 'Grid',
        pairs: 'EURUSD, GBPUSD',
        timeframe: 'M15'
    },
    {
        slug: 'daytrade-pro',
        name: 'DayTrade Pro',
        developer: 'wim-schrynemakers',
        score: 76,
        image: raster('daytrade-pro'),
        growth: 75.65,
        monthly: 1.32,
        maxDrawdown: 15.61,
        monthsInProfit: 28,
        monthsTotal: 43,
        style: 'Intraday breakout',
        pairs: 'US30, NAS100',
        timeframe: 'M5'
    },
    {
        slug: 'waka-waka',
        name: 'Waka Waka',
        developer: 'valerytrading',
        score: 76,
        image: glyph('waka-waka', 32.6038, 32.6038),
        growth: 1069.23,
        monthly: 3.73,
        maxDrawdown: 23.84,
        monthsInProfit: 67,
        monthsTotal: 74,
        style: 'Grid',
        pairs: 'AUDCAD, AUDNZD, NZDCAD',
        timeframe: 'M15'
    },
    {
        slug: 'perceptrader-ai',
        name: 'Perceptrader AI',
        developer: 'valerytrading',
        score: 75,
        image: glyph('perceptrader-ai', 26.6832, 36),
        growth: 355.29,
        monthly: 1.72,
        maxDrawdown: 21.96,
        monthsInProfit: 88,
        monthsTotal: 88,
        style: 'AI-assisted grid',
        pairs: 'AUDCAD, AUDNZD, NZDCAD',
        timeframe: 'M5'
    },
    {
        slug: 'goldbot-one',
        name: 'GoldBot One',
        developer: 'wim-schrynemakers',
        score: 75,
        image: raster('goldbot-one'),
        growth: 136.53,
        monthly: 3.71,
        maxDrawdown: 27.59,
        monthsInProfit: 15,
        monthsTotal: 24,
        style: 'Trend following',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'H1'
    },
    {
        slug: 'the-gold-phantom',
        name: 'The Gold Phantom',
        developer: 'wim-schrynemakers',
        score: 75,
        image: raster('the-gold-phantom'),
        growth: 21.92,
        monthly: 1.95, // sample
        maxDrawdown: 12.94,
        monthsInProfit: 8, // sample
        monthsTotal: 10, // sample
        style: 'Breakout strategies',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'M15'
    },
    {
        slug: 'syna',
        name: 'Syna',
        developer: 'brandon-autry',
        score: 74,
        image: letter,
        growth: 99.73,
        monthly: 2.92, // sample
        maxDrawdown: 45.99,
        monthsInProfit: 17, // sample
        monthsTotal: 24, // sample
        style: 'AI multi-agent',
        pairs: 'Major FX pairs',
        timeframe: 'H1'
    },
    {
        slug: 'news-catcher-pro',
        name: 'News Catcher Pro',
        developer: 'valerytrading',
        score: 73,
        image: glyph('news-catcher-pro', 36, 27.7425),
        growth: 197.1,
        monthly: 1.75, // sample
        maxDrawdown: 37.64,
        monthsInProfit: 45, // sample
        monthsTotal: 63, // sample
        style: 'News trading',
        pairs: 'EURUSD, GBPUSD, USDJPY',
        timeframe: 'M1'
    },
    {
        slug: 'the-bitcoin-core',
        name: 'The Bitcoin Core',
        developer: 'jimmy-eriksson',
        score: 72,
        image: raster('the-bitcoin-core', 128),
        growth: 13.89,
        monthly: 1.87, // sample
        maxDrawdown: 19.86,
        monthsInProfit: 5, // sample
        monthsTotal: 7, // sample
        style: 'Trend following',
        pairs: 'BTCUSD',
        timeframe: 'H1'
    },
    {
        slug: 'gold-atlas',
        name: 'Gold Atlas',
        developer: 'jimmy-eriksson',
        score: 71,
        image: raster('gold-atlas', 128),
        growth: 16.86,
        monthly: 1.96, // sample
        maxDrawdown: 21.55,
        monthsInProfit: 6, // sample
        monthsTotal: 8, // sample
        style: 'Swing trading',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'H4'
    },
    {
        slug: 'smart-gold-hunter',
        name: 'Smart Gold Hunter',
        developer: 'barbaros-bulent-kortarla',
        score: 71,
        image: letter,
        growth: 162.93,
        monthly: 2.72, // sample
        maxDrawdown: 14,
        monthsInProfit: 27, // sample
        monthsTotal: 36, // sample
        style: 'Scalping',
        pairs: 'XAUUSD (Gold)',
        timeframe: 'M5'
    },
    {
        slug: 'the-orb-master',
        name: 'The ORB Master',
        developer: 'wim-schrynemakers',
        score: 67,
        image: raster('the-orb-master'),
        growth: 28.03,
        monthly: 1.79, // sample
        maxDrawdown: 50.09,
        monthsInProfit: 9, // sample
        monthsTotal: 14, // sample
        style: 'Opening range breakout',
        pairs: 'US30, NAS100',
        timeframe: 'M5'
    },
    {
        slug: 'night-hunter-pro',
        name: 'Night Hunter Pro',
        developer: 'valerytrading',
        score: 64,
        image: glyph('night-hunter-pro', 36, 27.0801),
        growth: 137.15,
        monthly: 1.21, // sample
        maxDrawdown: 13.92,
        monthsInProfit: 55, // sample
        monthsTotal: 72, // sample
        style: 'Night scalping',
        pairs: 'EURUSD, GBPUSD, USDCHF',
        timeframe: 'M5'
    },
    {
        slug: 'mean-machine',
        name: 'Mean Machine',
        developer: 'valerytrading',
        score: 62,
        image: letter,
        growth: 48.2,
        monthly: 1.32, // sample
        maxDrawdown: 18.4,
        monthsInProfit: 19, // sample
        monthsTotal: 30, // sample
        style: 'Mean reversion',
        pairs: 'Major FX pairs',
        timeframe: 'M15'
    }
]

// ------------------------------------------------- Sample record generator --
// Everything below this line turns a seed into a full record. For The Gold
// Reaper it only reshapes what is drawn. For the others it GENERATES the monthly
// returns - deterministically, from the slug - under three constraints, so that
// no two modules on a page can contradict each other:
//   1. exactly `monthsInProfit` of the `monthsTotal` months are positive;
//   2. the months compound to exactly the published all-time growth;
//   3. the equity curve is those same months, compounded.

/** mulberry32: tiny, fast, and identical on the server and in the browser. */
function seededRandom(seedText: string): () => number {
    let state = 2166136261
    for (let index = 0; index < seedText.length; index += 1) {
        state ^= seedText.charCodeAt(index)
        state = Math.imul(state, 16777619)
    }
    return () => {
        state = (state + 0x6d2b79f5) | 0
        let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
        mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
    }
}

const round2 = (value: number) => Math.round(value * 100) / 100
const compound = (returns: number[], scale = 1) =>
    returns.reduce((equity, monthReturn) => equity * (1 + (monthReturn * scale) / 100), 1)

function generateMonthlyReturns(seed: EaSeed): number[] {
    const random = seededRandom(seed.slug)
    const { monthsTotal, monthsInProfit, monthly, growth } = seed

    // Which months lose. Shuffled, never the first month (a record that opens on
    // a loss dips the curve below zero before it has started, which reads as a
    // rendering bug on a 52px sparkline).
    const order = Array.from({ length: monthsTotal }, (_, index) => index)
    for (let index = order.length - 1; index > 1; index -= 1) {
        const swap = 1 + Math.floor(random() * index)
        ;[order[index], order[swap]] = [order[swap], order[index]]
    }
    const losing = new Set(order.slice(monthsTotal - (monthsTotal - monthsInProfit)))

    // Losses are drawn first and left alone: a fraction of the average month,
    // which is what a losing month on a profitable record looks like.
    const losses = Array.from({ length: monthsTotal }, () => -monthly * (0.2 + random() * 0.9))
    const wins = Array.from({ length: monthsTotal }, () => 0.35 + random() * 1.9)

    // Constraint 2: find the one scale ON THE WINS that compounds to the
    // published growth. Scaling only the wins keeps the search monotonic - a
    // single scale over wins and losses together is not, once the losing months
    // outnumber the winning ones - and it cannot flip a sign, so constraint 1
    // survives it.
    const build = (scale: number) =>
        Array.from({ length: monthsTotal }, (_, index) => (losing.has(index) ? losses[index] : wins[index] * scale))
    const target = 1 + growth / 100
    let low = 0
    let high = 400
    for (let step = 0; step < 80; step += 1) {
        const middle = (low + high) / 2
        if (compound(build(middle)) < target) low = middle
        else high = middle
    }
    return build((low + high) / 2).map((value) => {
        const rounded = round2(value)
        // A month that rounds to 0.00 would print as flat.
        if (rounded === 0) return value > 0 ? 0.01 : -0.01
        return rounded
    })
}

/** A year's figure is the SUM of its months, not their compound: that is how the
 *  drawn table adds up (2026 reads +66.04%, which is the eleven months summed). */
const yearTotal = (months: number[]) => round2(months.reduce((sum, value) => sum + value, 0))

/** Month `offset` months after the record's first, as { year, month }. */
function monthAt(startYear: number, startMonth: number, offset: number) {
    const absolute = startYear * 12 + startMonth + offset
    return { year: Math.floor(absolute / 12), month: absolute % 12 }
}

function buildYears(seed: EaSeed, startYear: number, startMonth: number): { years: EaYearRow[]; flat: number[] } {
    if (seed.monthlyReturns) {
        const years = Object.keys(seed.monthlyReturns)
            .map(Number)
            .sort((a, b) => b - a)
            .map((year) => {
                const months = seed.monthlyReturns![year]
                const traded = months.filter((value): value is number => value !== null)
                return { year, months, total: yearTotal(traded) }
            })
        const flat = [...years]
            .reverse()
            .flatMap((row) => row.months.filter((value): value is number => value !== null))
        return { years, flat }
    }

    const flat = generateMonthlyReturns(seed)
    const byYear = new Map<number, (number | null)[]>()
    flat.forEach((value, offset) => {
        const { year, month } = monthAt(startYear, startMonth, offset)
        if (!byYear.has(year)) byYear.set(year, Array.from({ length: 12 }, () => null))
        byYear.get(year)![month] = value
    })
    const years = [...byYear.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([year, months]) => {
            const traded = months.filter((value): value is number => value !== null)
            return { year, months, total: yearTotal(traded) }
        })
    return { years, flat }
}

/** Constraint 3: the curve is the months, compounded - four points a month,
 *  with a little seeded travel inside each so it does not read as a staircase. */
function buildSeries(seed: EaSeed, flat: number[]): number[] {
    if (seed.series) return seed.series
    const random = seededRandom(`${seed.slug}:curve`)
    const series = [0]
    let equity = 1
    for (const monthReturn of flat) {
        const next = equity * (1 + monthReturn / 100)
        for (let step = 1; step <= 4; step += 1) {
            const progress = step / 4
            const along = equity * Math.pow(next / equity, progress)
            const wobble = step === 4 ? 0 : (random() - 0.5) * Math.abs(next - equity) * 0.9
            series.push(round2((along + wobble - 1) * 100))
        }
        equity = next
    }
    series[series.length - 1] = seed.growth
    return series
}

/** Thin a curve to at most `count` points, always keeping both ends. */
function thin(series: number[], count: number): number[] {
    if (series.length <= count) return series
    return Array.from({ length: count }, (_, index) => {
        const position = (index / (count - 1)) * (series.length - 1)
        return series[Math.round(position)]
    })
}

function extreme(years: EaYearRow[], pick: (a: number, b: number) => boolean): EaMonthPoint {
    let found: EaMonthPoint | null = null
    for (const row of years) {
        row.months.forEach((value, month) => {
            if (value === null) return
            if (!found || pick(value, found.value)) found = { year: row.year, month, value }
        })
    }
    return found ?? { year: END_YEAR, month: END_MONTH, value: 0 }
}

const developerName = (slug: string) => DEVELOPER_SEEDS.find((developer) => developer.slug === slug)?.name ?? slug

function buildRecord(seed: EaSeed, rank: number): ExpertAdvisor {
    const start = monthAt(END_YEAR, END_MONTH, -(seed.monthsTotal - 1))
    const { years, flat } = buildYears(seed, start.year, start.month)
    const series = buildSeries(seed, flat)
    return {
        ...seed,
        rank,
        band: eaScoreBand(seed.score),
        developerName: developerName(seed.developer),
        startYear: start.year,
        startMonth: start.month,
        endYear: END_YEAR,
        endMonth: END_MONTH,
        // The compounded daily equivalent of the monthly figure: 6.06% a month
        // is 0.20% a day, which is the pair drawn on the EA frame.
        daily: round2((Math.pow(1 + seed.monthly / 100, 1 / 30) - 1) * 100),
        years,
        best: extreme(years, (a, b) => a > b),
        worst: extreme(years, (a, b) => a < b),
        winRate: Math.round((seed.monthsInProfit / seed.monthsTotal) * 100),
        series,
        spark: thin(series, 36)
    }
}

/** Every EA, best AlgoScore first - the order both list frames are drawn in.
 *  Ties keep the drawn order, which `sort` guarantees by being stable. */
export const EXPERT_ADVISORS: readonly ExpertAdvisor[] = [...EA_SEEDS]
    .sort((a, b) => b.score - a.score)
    .map((seed, index) => buildRecord(seed, index + 1))

export function findExpertAdvisor(slug: string): ExpertAdvisor | undefined {
    return EXPERT_ADVISORS.find((ea) => ea.slug === slug)
}

export const EA_DEVELOPERS: readonly EaDeveloper[] = DEVELOPER_SEEDS.map((seed) => {
    const eas = EXPERT_ADVISORS.filter((ea) => ea.developer === seed.slug)
    const by = (pick: (ea: ExpertAdvisor) => number) => [...eas].sort((a, b) => pick(b) - pick(a))[0]
    return {
        ...seed,
        eas,
        topScore: by((ea) => ea.score),
        averageScore: Math.round(eas.reduce((sum, ea) => sum + ea.score, 0) / eas.length),
        bestGrowth: by((ea) => ea.growth),
        longestRecord: by((ea) => ea.monthsTotal)
    }
})

export function findEaDeveloper(slug: string): EaDeveloper | undefined {
    return EA_DEVELOPERS.find((developer) => developer.slug === slug)
}

/** How many EAs sit in each band - the figures on the toolbar's filter. */
export const EA_BAND_COUNTS: Record<EaBandId, number> = EXPERT_ADVISORS.reduce(
    (counts, ea) => {
        counts[ea.band.id] += 1
        return counts
    },
    { excellent: 0, good: 0, fair: 0, poor: 0 } as Record<EaBandId, number>
)

// ------------------------------------------------------------------ Routes --
// One place for every path these pages link to, so the day a route moves there
// is a single line to change.
export const EA_ROUTES = {
    list: '/expert-advisors',
    ea: (slug: string) => `/expert-advisors/${slug}`,
    developer: (slug: string) => `/expert-advisors/developers/${slug}`,
    // The Algoscore sub-product's own pages. They live on the `algoscore-site`
    // branch and are not part of this one, so on this branch alone these two
    // resolve to the 404 page; they are written to its route scheme so they
    // connect the moment the two are merged.
    algoscore: '/algoscore',
    algoscoreEa: (slug: string) => `/algoscore/ea/${slug}`
} as const

export const EA_PRERENDER_ROUTES: string[] = [
    EA_ROUTES.list,
    ...EXPERT_ADVISORS.map((ea) => EA_ROUTES.ea(ea.slug)),
    ...EA_DEVELOPERS.map((developer) => EA_ROUTES.developer(developer.slug))
]
