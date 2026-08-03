// Domain types for the v3 home page. Text never lives here — these describe
// structure (ids, assets, hrefs, figures) and each `id` doubles as the i18n key
// suffix its copy is looked up under.

/** One statistic row inside an EA card. `value` arrives from the backend and is
 *  baked into the prerendered HTML at build time; `key` is the i18n key for the
 *  static label beside it. */
export interface EaCardStat {
    key: 'accountGrowth' | 'monthlyGain' | 'dailyGain' | 'maximumDrawdown' | 'monthsInProfit' | 'yearsTracked' | 'listPrice' | 'developer'
    value: string
    /** Drawn semibold rather than medium — the account-growth headline figure. */
    strong?: boolean
}

/** A point in the collage's 900x846 stage box, in stage px. */
export interface StagePoint {
    x: number
    y: number
}

/** How one card enters, transcribed from the Figma motion export. The card is
 *  laid out at its final position and starts `from` px BELOW it, so the section's
 *  clip hides the travel; nothing fades. */
export interface EaCardMotion {
    /** Travel distance in stage px — the card's initial translateY. */
    from: number
    /** ms before the card starts moving. */
    delay: number
    /** ms the move itself takes. */
    duration: number
}

/** A foreground hero card: real DOM, so its text stays selectable, crisp and
 *  translatable, and its figures are server-rendered rather than fetched.
 *
 *  Every card carries BOTH layouts. The two dispositions hold the same seven
 *  cards in the same paint order and differ only in where each one sits, so one
 *  DOM tree serves both and the 1025px switch is a pair of custom properties
 *  rather than a second render. */
export interface EaCard {
    id: string
    /** EA display name. A product name — deliberately not translated. */
    name: string
    /** Square avatar, pre-encoded to AVIF/WebP by scripts/optimize-assets.py. */
    avatar: string
    /** AlgoScore 0-100. */
    score: number
    stats: EaCardStat[]
    /** The EA-of-the-Month slot. Exactly one card has it, always in the same
     *  place, and it is the one drawn 32px taller to carry the badge. */
    featured?: boolean
    /** Which position in the published EA ranking fills this slot once the
     *  backend supplies it. `null` for the seventh card, which the design leaves
     *  unassigned — it is clipped by the viewport in both layouts. */
    ranking: number | null
    /** Top-left in the stage box, per layout. */
    wide: StagePoint
    stacked: StagePoint
    motion: EaCardMotion
}

/** One veiled card behind the front row: a flat image at 20% strength.
 *
 *  Two source images serve all of them — the Figma layouts repeat a single
 *  "Card Blurred A" and "Card Blurred B" — so `size` picks the asset and the
 *  entry only carries placement. A slot missing from a layout is simply not
 *  drawn there; the stacked disposition uses one more card than the wide one. */
export interface EaCardBlurred {
    id: string
    size: 'a' | 'b'
    wide: StagePoint | null
    stacked: StagePoint | null
    motion: EaCardMotion
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

/** One inlined hero partner mark. Drawn two-tone, so the artwork is split by
 *  role: `accent` is the device (grey at rest, brand green on hover) and `word`
 *  is the wordmark (grey at rest, near-black on hover). Both states share the
 *  same geometry, so only the colours are state-dependent. */
export interface HeroBrandLogo {
    /** Drawn size, px. Each mark is exported tight to its artwork, so they do
     *  not share an aspect ratio and the box has to be stated per logo. */
    width: number
    height: number
    accent: string[]
    word: string[]
    /** Hover colour for the device, where the owner's green is not the shared
     *  #34E834 (ForexVPS draws its own). */
    accentHover?: string
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
