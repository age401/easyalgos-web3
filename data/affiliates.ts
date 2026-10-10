import { mediaAsset } from '~/utils/media'

// The Affiliates page — Figma "Home" (16:1149) in EasyAlgos Affiliates - WEB3
// (Xwelw9D6Cg9wBKI7snTnnb). Copy lives under `affiliates.*` in the locales;
// this module holds what is not copy: the hero graphic's geometry and figures,
// and the ids/order of every list on the page.

/* ------------------------------------------------------------------ Hero == */

/** A referral link's card — "Partner node" (18:6100, 21:1241, 21:1253, 21:1265).
 *  `value` is the drawn figure the count starts from; `spark` is the card's own
 *  "Revenue trace", 62x30. Where the card sits is the layout's business (see
 *  AFF_LAYOUTS), not the card's. */
export interface AffPartner {
    id: string
    ref: string
    cvr: string
    color: string
    value: number
    spark: string
    /** Where the spark-line ends, inside its 62x30 box — the point that flares
     *  when the card is credited. */
    tip: readonly [number, number]
}

export const AFF_PARTNERS: AffPartner[] = [
    {
        id: 'cyan',
        ref: '0184',
        cvr: '8.6',
        color: '#42D9FF',
        value: 3420,
        spark: 'M0 30L6.53 27.6L12.24 28.8L18.76 19.2L24.47 22.8L31.17 14.4H37.53L42.42 17L51.39 8.4L62.5 5.42',
        tip: [61, 5.7]
    },
    {
        id: 'pink',
        ref: '0097',
        cvr: '9.4',
        color: '#F068D8',
        value: 4980,
        spark: 'M0 30L6.53 27.6L12.24 28.8L18.76 19.2L24.47 22.8L31.17 14.4H37.53L42.42 17L51.39 8.4L62.5 5.42',
        tip: [61, 5.7]
    },
    {
        id: 'green',
        ref: '0316',
        cvr: '10.8',
        color: '#69E6B4',
        value: 5760,
        spark: 'M0 22.8L8 22L12.24 28.8L18.76 19.2L24.47 22.8L31.17 14.4H37.53L42.42 8L51.39 5.5L62.48 2',
        tip: [60.5, 2.5]
    },
    {
        id: 'violet',
        ref: '0421',
        cvr: '12.1',
        color: '#9D5CFF',
        value: 6840,
        spark: 'M-0.58 23.5H7.62L12 21.5L18.76 19.2L23 11.5L31.17 14.4H37.53L42.42 17L51.39 4H62.5',
        tip: [61, 4]
    }
]

/** The instruments a trade pill can show. The file draws every pill as
 *  "BTCUSD +0.84%"; live, each trade that closes is replaced by a new one on a
 *  pair drawn from this list, so the stage reads as a book of positions rather
 *  than five copies of one. Spelled as the pill prints them. */
export const AFF_PAIRS = [
    'ETHUSD',
    'BTCUSD',
    'EURUSD',
    'GBPUSD',
    'USDJPY',
    'USDCHF',
    'USDCAD',
    'AUDUSD',
    'NZDUSD',
    'AUDCAD',
    'XAUUSD'
] as const

/** What the five pills hold on the first frame. Server-rendered, so a reader
 *  without JS (or with reduced motion) still sees five different trades. */
export const AFF_OPENING_TRADES = [
    { pair: 'BTCUSD', move: 0.84 },
    { pair: 'EURUSD', move: 0.12 },
    { pair: 'XAUUSD', move: -0.31 },
    { pair: 'GBPUSD', move: 0.27 },
    { pair: 'ETHUSD', move: 1.06 }
] as const

/** One arrangement of the stage. Coordinates are in the layout's own unscaled
 *  box; AffiliateHeroGraphic picks a layout for the space it is given, then
 *  scales that box as one.
 *
 *  `partners` are top-left corners of the 222px cards. `core` is the CENTRE of
 *  the 280px network card, which is also the centre of both orbits, the halo
 *  and the traces. `trades` are top-left corners of the pills, each with the
 *  referral link it is credited to — always a card it sits near, so no
 *  commission crosses the whole stage. */
export interface AffLayout {
    width: number
    height: number
    core: { x: number; y: number }
    partners: Record<string, { x: number; y: number }>
    trades: readonly { x: number; y: number; to: string }[]
    /** Horizontal squeeze applied to the two traces (1 = as drawn). */
    traceScale: number
    /** Draw the grid as the file's two exported line sets (true), or as a CSS
     *  pattern that keeps its pitch in a box of another shape (false). */
    drawnGrid: boolean
}

export const AFF_LAYOUTS: Record<'wide' | 'tall' | 'phone', AffLayout> = {
    /** As drawn — "Animated Graphic" (18:6044), 844x668. */
    wide: {
        width: 844,
        height: 668,
        core: { x: 422, y: 334 },
        partners: {
            cyan: { x: 0, y: 59 },
            pink: { x: 486, y: 95 },
            green: { x: 530, y: 412 },
            violet: { x: 84, y: 484 }
        },
        trades: [
            { x: 47, y: 284, to: 'cyan' },
            { x: 306, y: 188, to: 'pink' },
            { x: 397, y: 453, to: 'violet' },
            { x: 632, y: 345, to: 'green' },
            { x: 530, y: 311, to: 'pink' }
        ],
        traceScale: 1,
        drawnGrid: true
    },
    /** Ours: the same network stood on end, for a column beside the copy that is
     *  too narrow for the drawn stage to read at its scale. Two cards above the
     *  core and two below, staggered so each pair still reads as a cluster, the
     *  trades in the gaps, the traces squeezed across the middle. Two 222px
     *  cards and a 16px gutter set the width. */
    tall: {
        width: 460,
        height: 700,
        core: { x: 230, y: 350 },
        partners: {
            cyan: { x: 0, y: 16 },
            pink: { x: 238, y: 92 },
            green: { x: 238, y: 520 },
            violet: { x: 0, y: 598 }
        },
        trades: [
            { x: 36, y: 130, to: 'cyan' },
            { x: 296, y: 204, to: 'pink' },
            { x: 40, y: 470, to: 'violet' },
            { x: 300, y: 640, to: 'green' },
            { x: 130, y: 212, to: 'cyan' }
        ],
        traceScale: 460 / 844,
        drawnGrid: false
    },
    /** As drawn, for phones, where the stage is cropped at both sides: the left
     *  REF card and its trade are brought in off the edge so the crop does not
     *  cut them. */
    phone: {
        width: 844,
        height: 668,
        core: { x: 422, y: 334 },
        partners: {
            cyan: { x: 68, y: 59 },
            pink: { x: 486, y: 95 },
            green: { x: 530, y: 412 },
            violet: { x: 96, y: 484 }
        },
        trades: [
            { x: 84, y: 284, to: 'cyan' },
            { x: 306, y: 188, to: 'pink' },
            { x: 397, y: 453, to: 'violet' },
            { x: 600, y: 345, to: 'green' },
            { x: 530, y: 311, to: 'pink' }
        ],
        traceScale: 1,
        drawnGrid: true
    }
}

/** The network total on the "Revenue core" card (18:6045). */
export const AFF_CORE_TOTAL = 24860.4

/** "Market trace" (21:1338): the path exactly as exported. Its 900x220 export
 *  box carries a 14px-blur glow margin; `x0` is where the drawn line starts and
 *  `cy` the middle of its box, which is what a layout aligns on the core. */
export const AFF_MARKET_TRACE = {
    d: 'M28.107 187.085L90.8042 180.335L122.635 191.135L167.97 158.735L211.376 169.535L251.888 129.035L294.329 145.235L331.947 100.685L367.636 115.535L414.9 75.0347L459.27 83.1347L497.853 48.0347L539.33 72.3347L582.736 42.6347L622.283 58.8347L672.441 29.1347L716.811 50.7347L761.181 45.3347L804.587 80.4347L840.276 64.2347L872.107 72.3347',
    x0: 28.107,
    cy: 110.13
} as const

/** "Compared Trend trace" (21:1343), same arrangement. */
export const AFF_COMPARED_TRACE = {
    d: 'M0 1C72.6233 1 107 277.94 185.5 277.94C264 277.94 274.791 83.1695 330.73 83.1695C386.67 83.1695 467.144 304 517.195 304C567.247 304 594.726 165.339 643.795 165.339C692.865 165.339 721.326 246.528 759.6 246.528C797.874 246.528 818.484 83.1695 844 83.1695',
    x0: 0,
    cy: 152
} as const

/** The partner strip under the CTA — the same three marks as the home hero. */
export const AFF_HERO_PARTNERS = [
    { id: 'icmarkets', label: 'IC Markets' },
    { id: 'ictrading', label: 'IC Trading' },
    { id: 'forexvps', label: 'ForexVPS.net' }
] as const

/* ------------------------------------------------------------- Sections == */

export const AFF_METRICS = ['share', 'paid', 'active'] as const

export const AFF_STEPS = [
    { id: 'apply', icon: '/img/affiliates/icons/square-pen.svg' },
    { id: 'share', icon: '/img/affiliates/icons/waypoints.svg' },
    { id: 'earn', icon: '/img/affiliates/icons/handshake.svg' }
] as const

/** Commission bands, left to right — "0 - 50K", "50 - 250K", "+250K" USD. */
export const AFF_BANDS = ['0 - 50K', '50 - 250K', '+250K'] as const

/** Tiers top to bottom as drawn: the best deal first. `shares` lines up with
 *  AFF_BANDS. */
export const AFF_TIERS = [
    { id: 'vip', reach: '500K+', shares: [40, 45, 50], featured: true },
    { id: 'tier2', reach: '50K-250K', shares: [25, 30, 35], featured: false },
    { id: 'tier1', reach: '0-50K', shares: [10, 15, 20], featured: false }
] as const

/** The "7 Reasons" atom (Image, 41:2248): the seven orbits of its "Layer 2"
 *  export, kept as drawn, and where on them its twelve dots sit. Every dot is on
 *  one of the three heavy orbits (4, 5, 6); `at` is how far along that path it
 *  is drawn, as a fraction of the path's length — measured off the export, so
 *  the dots start exactly where Figma puts them and travel from there. */
export const AFF_ATOM_ORBITS = [
    { d: 'M10.1374 279.87C-19.5426 266.95 21.6274 201.47 102.087 133.61C182.547 65.75 271.837 21.21 301.517 34.13C331.197 47.05 290.027 112.53 209.567 180.39C129.107 248.25 39.8174 292.79 10.1374 279.87Z', stroke: '#E4E6F0', width: 1 },
    { d: 'M277.967 303.3C246.497 310.87 166.297 251.5 98.8374 170.7C31.3874 89.9 2.21742 18.27 33.6874 10.7C65.1574 3.13 145.357 62.5 212.817 143.3C280.277 224.1 309.447 295.74 277.977 303.3H277.967Z', stroke: '#E4E6F0', width: 1 },
    { d: 'M33.6874 303.3C2.21742 295.73 31.3874 224.1 98.8474 143.3C166.297 62.5 246.497 3.13 277.967 10.7C309.437 18.27 280.267 89.9 212.807 170.7C145.347 251.5 65.1574 310.87 33.6774 303.3H33.6874Z', stroke: '#E4E6F0', width: 1 },
    { d: 'M301.517 279.87C271.837 292.79 182.547 248.25 102.087 180.39C21.6274 112.53 -19.5426 47.05 10.1374 34.13C39.8174 21.21 129.107 65.75 209.567 133.61C290.027 201.47 331.197 266.95 301.517 279.87Z', stroke: '#E4E6F0', width: 1 },
    { d: 'M155.827 313C186.275 313 210.957 243.156 210.957 157C210.957 70.8436 186.275 1 155.827 1C125.38 1 100.697 70.8436 100.697 157C100.697 243.156 125.38 313 155.827 313Z', stroke: '#C9CCDD', width: 2 },
    { d: 'M21.3974 292.1C-9.29258 281.82 26.0074 213 100.247 138.38C174.497 63.77 259.557 11.62 290.257 21.9C320.947 32.18 285.647 101 211.407 175.62C137.167 250.23 52.0974 302.38 21.4074 292.1H21.3974Z', stroke: '#C9CCDD', width: 2 },
    { d: 'M290.257 292.1C259.567 302.38 174.497 250.23 100.257 175.62C26.0074 101 -9.29258 32.18 21.3974 21.9C52.0874 11.62 137.157 63.77 211.397 138.38C285.637 212.99 320.947 281.82 290.247 292.1H290.257Z', stroke: '#C9CCDD', width: 2 }
] as const

export const AFF_ATOM_DOTS = [
    { orbit: 6, at: 0.03 },
    { orbit: 5, at: 0.0378 },
    { orbit: 5, at: 0.6092 },
    { orbit: 4, at: 0.4353 },
    { orbit: 6, at: 0.3727 },
    { orbit: 6, at: 0.4171 },
    { orbit: 6, at: 0.7232 },
    { orbit: 4, at: 0.9376 },
    { orbit: 6, at: 0.9153 },
    { orbit: 5, at: 0.7136 },
    { orbit: 5, at: 0.1554 },
    { orbit: 4, at: 0.5821 }
] as const

export const AFF_REASONS = ['everyTrade', 'lifetime', 'highest', 'trackRecords', 'free', 'vps', 'flexible'] as const

/** Testimonial carousel (61:1780), in drawn order. `href` is "Affiliate's
 *  website", which the file draws without a destination yet — left undefined
 *  so no dead link renders. */
export const AFF_TESTIMONIALS = [
    { id: 'sommer', media: mediaAsset('people', 'michael-sommer-bw', 128, 128), href: undefined },
    { id: 'ameed', media: mediaAsset('people', 'hossam-ameed-bw', 128, 128), href: undefined },
    { id: 'petko', media: mediaAsset('people', 'petko-alexsandrov', 128, 128), href: undefined }
] as const

export const AFF_FAQ = ['whoCanJoin', 'howCommissions', 'rate', 'payment', 'minimum', 'lifetime'] as const
