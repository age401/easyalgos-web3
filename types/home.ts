// Domain types for the v3 home page. Text never lives here — these describe
// structure (ids, assets, hrefs, figures) and each `id` doubles as the i18n key
// suffix its copy is looked up under.

/** One statistic row inside an EA card. `value` arrives from the backend and is
 *  baked into the prerendered HTML at build time; `key` is the i18n key for the
 *  static label beside it. */
export interface EaCardStat {
    key: 'accountGrowth' | 'monthlyGain' | 'dailyGain' | 'maximumDrawdown' | 'monthsInProfit' | 'yearsTracked' | 'listPrice' | 'developer'
    value: string
    /** Renders the value in the profit green + a tinted pill (account growth). */
    highlight?: boolean
}

/** A foreground hero card: real DOM, so its text stays selectable, crisp and
 *  translatable, and its figures are server-rendered rather than fetched. */
export interface EaCard {
    id: string
    /** EA display name. A product name — deliberately not translated. */
    name: string
    /** Square avatar, pre-encoded to AVIF/WebP by scripts/optimize-assets.mjs. */
    avatar: string
    /** AlgoScore 0-100. */
    score: number
    stats: EaCardStat[]
    /** Marks the featured card, which carries the gradient ribbon. */
    featured?: boolean
    /** Placement of the card in the hero collage, as a percentage of the stage
     *  box, plus its drawn width. Percentages rather than pixels so the whole
     *  arrangement scales with the stage instead of needing a breakpoint each. */
    left: number
    top: number
    width: number
    /** Stacking order within the collage. */
    z: number
    /** Entrance delay, ms. */
    delay: number
}

/** A background card: a flat image, veiled and pushed back. */
export interface EaCardGhost {
    id: string
    src: string
    width: number
    height: number
    left: number
    top: number
    z: number
    delay: number
}

/** One row of the "What you get" accordion. */
export interface SolutionItem {
    id: string
    /** The visual shown beside the row while it is open. Null until the
     *  per-item animations are supplied. */
    visual: MediaAsset | null
}

/** A pre-encoded raster with both modern and fallback encodings. Explicit
 *  intrinsic dimensions on every one of these is what keeps CLS at zero. */
export interface MediaAsset {
    avif: string
    webp: string
    fallback: string
    width: number
    height: number
    /** Decorative visuals pass an empty alt and are hidden from the a11y tree;
     *  anything meaningful sets an i18n key here instead. */
    altKey?: string
}

export interface HowItWorksStep {
    id: string
    media: MediaAsset
    /** Walkthrough clip, when one exists. */
    video?: string
}

export interface PricingTier {
    id: string
    /** Minimum account balance, in whole dollars. */
    minimumBalance: number
    minimumTrades: number
    /** The middle tier is the emphasised one and takes the gradient CTA. */
    featured?: boolean
}

export interface Testimonial {
    id: string
    /** Square portrait or brand tile. */
    media: MediaAsset
    /** Brand tiles are logos, not people — rendered without the portrait mask. */
    isBrand?: boolean
}

export interface ResearchPost {
    id: string
    href: string
    media: MediaAsset
}

export interface BrandLogo {
    id: string
    /** Trademark of its owner; the label is the company name, never translated. */
    label: string
    src: string
}

export interface FooterLinkGroup {
    id: string
    /** i18n key suffixes under footer.links, in drawn order. */
    links: { id: string; href: string }[]
}

/** A developer and the Expert Advisors they publish. Proper nouns throughout. */
export interface DeveloperGroup {
    name: string
    eas: string[]
}
