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
    /** Walkthrough clip, when one exists. Until the files land this stays
     *  undefined and the card shows `media` alone with no transport control —
     *  an affordance that does nothing is worse than none. Dropping a clip in
     *  later is a one-line change per step. */
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

/** One quote card on the dark band.
 *
 *  The four are drawn in a 2x2 grid of two widths that swap sides row to row —
 *  a wide card and a narrow one, then the narrow one and a wide one. `variant`
 *  carries that, and it also decides the card's internals: a `feature` card
 *  leads with a headline quote and sits its portrait beside the text, a
 *  `compact` card has no headline and stacks its attribution under a rule. */
export interface Testimonial {
    id: string
    /** Square portrait. */
    media: MediaAsset
    variant: 'feature' | 'compact'
    /** Whether the copy carries a short pull-quote above the body. Only the
     *  feature cards are drawn with one, but it is stated rather than derived
     *  so a card can lose its headline without changing width. */
    headline?: boolean
    /** Testimonial clip. Undefined until the files exist, and the "Watch
     *  testimonial" affordance is withheld while it is — same rule as the
     *  How-it-works steps. */
    video?: string
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

/** One of the labels floating over the particle cluster, naming an ecosystem
 *  role. Geometry is in the 760x760 box the cluster and the star map share. */
export interface RoleCard {
    id: string
    /** Centre of the card, as a percentage of the box. */
    left: number
    top: number
    /** Tailwind text colour class for the label. */
    color: string
    /** Where in the drift this card starts, as a negative CSS animation delay.
     *  Spread across the whole period so the six read as a field rather than as one
     *  shape moving. */
    delay: string
    /** Glyph, as 20x20 stroke paths — see ROLE_CARDS for why these are inline. */
    icon: string[]
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
