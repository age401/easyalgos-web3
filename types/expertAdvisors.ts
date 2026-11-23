// Domain types for the Expert Advisors pages: the list, the EA page and the
// developer page (Figma "EasyAlgos - WEB3", page 3913:15396).
//
// As in types/home.ts, UI copy never lives here. What does is CONTENT - an EA's
// name, a developer's own bio - which is published data and is deliberately not
// translated.

export type EaBandId = 'poor' | 'fair' | 'good' | 'excellent'

/** One AlgoScore band, with the Indicators/* colours the design pairs it with. */
export interface EaScoreBand {
    id: EaBandId
    /** Lowest score that still belongs to the band. */
    min: number
    /** The figure and the band word. */
    text: string
    /** Ring arcs, ranking bars and scatter dots. */
    bar: string
    /** The large ring on the EA page, which is drawn a shade brighter. */
    ring: string
    /** That ring's track. */
    tint: string
}

/** What stands in the EA's square thumbnail. The design draws three kinds. */
export type EaImage =
    /** A raster the developer supplied, pre-encoded under /img/expert-advisors. */
    | { kind: 'raster'; name: string; size: number }
    /** An EasyAlgos house glyph on the drawn blue tile. `width`/`height` are the
     *  glyph's own box inside its 36px square, which is what centres it. */
    | { kind: 'glyph'; name: string; width: number; height: number }
    /** No artwork published yet: the EA's initial on a Violet tile. */
    | { kind: 'letter' }

export interface EaDeveloperSeed {
    slug: string
    name: string
    /** What to call them in a sentence ("Get Wim's EAs"). Only set for a person
     *  whose given name is known; a studio or a handle is used whole. */
    givenName?: string
    /** ISO 3166 alpha-2, lower case, matching /img/flags/<code>.svg. */
    countryCode?: string
    country?: string
    /** The year they started building EAs. */
    since?: number
    /** Short bio: the panel on the EA page. */
    bio?: string
    /** Longer first-person statement: the developer page's lead. */
    statement?: string
    website?: string
    /** Portrait basename under /img/expert-advisors/developers. */
    avatar?: string
}

export interface EaSeed {
    slug: string
    name: string
    developer: string
    score: number
    image: EaImage
    /** All-time growth, percent. */
    growth: number
    /** Compounded average monthly gain, percent. */
    monthly: number
    /** Peak-to-valley, percent. */
    maxDrawdown: number
    monthsInProfit: number
    monthsTotal: number
    style: string
    pairs: string
    timeframe: string
    description?: string
    /** Screenshot basenames under /img/expert-advisors/inside. */
    screenshots?: string[]
    /** Drawn monthly returns, newest year first. When absent they are generated. */
    monthlyReturns?: Record<number, (number | null)[]>
    /** Drawn equity series (growth percent, evenly spaced). Generated when absent. */
    series?: number[]
}

export interface EaYearRow {
    year: number
    /** Twelve entries, Jan..Dec. null = no trading that month. */
    months: (number | null)[]
    total: number
}

export interface EaMonthPoint {
    year: number
    /** 0-based. */
    month: number
    value: number
}

export interface ExpertAdvisor extends EaSeed {
    rank: number
    band: EaScoreBand
    developerName: string
    /** 0-based month the live record starts in. */
    startYear: number
    startMonth: number
    endYear: number
    endMonth: number
    daily: number
    years: EaYearRow[]
    best: EaMonthPoint
    worst: EaMonthPoint
    winRate: number
    /** Growth percent over the whole record, evenly spaced, starting at 0. */
    series: number[]
    /** The same curve thinned out for the card sparkline. */
    spark: number[]
}

export interface EaDeveloper extends EaDeveloperSeed {
    eas: ExpertAdvisor[]
    topScore: ExpertAdvisor
    averageScore: number
    bestGrowth: ExpertAdvisor
    longestRecord: ExpertAdvisor
}
