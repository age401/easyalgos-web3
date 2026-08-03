import type { EaCard, EaCardBlurred } from '~/types/home'

// The hero collage.
//
// Two populations, for the reason set out in the hero component: the seven front
// cards are real DOM (crisp text, real hover, translatable labels, and figures
// that can be refreshed), the fifteen-or-sixteen behind them are flat images
// because at 20% strength nobody can read them anyway, and that many more card
// subtrees in the LCP path is the single most expensive thing this page could do.
//
// BAKED DATA. `stats[].value` mirrors what the backend publishes daily. It is
// resolved at build time (the route is prerendered, see nuxt.config) so the
// figures ship inside the HTML: no client fetch, no loading state, no layout
// shift. The daily job updates this module — or a Nitro route that replaces it —
// and rebuilds; the browser never learns these came from an API. The row labels
// beside them are static and come from i18n (`card.*`), so a card renders
// complete and legible even if a value is ever missing.
//
// GEOMETRY. Everything below is in stage px against a 900x846 box, taken
// straight from the two Figma dispositions:
//   wide     "Cards Animation [~1025]"   -> node 552:46224, used at >= 1025
//   stacked  "Cards Animation [1024~]"   -> node 552:26356, used at <= 1024
// The file's `[~N]` / `[N~]` convention reads as "N and above" / "N and below",
// which is why the frame named for 1025 is the desktop one. Both hold the same
// seven cards in the same paint order, so the switch is purely positional —
// see HeroSection.vue for how the stage itself is placed and scaled.

const STAT_TEMPLATE = (developer: string): EaCard['stats'] => [
    { key: 'accountGrowth', value: '+ 294.17 %', strong: true },
    { key: 'monthlyGain', value: '2.08 %' },
    { key: 'dailyGain', value: '0.07 %' },
    { key: 'maximumDrawdown', value: '21.96 %' },
    { key: 'monthsInProfit', value: '65 of 65' },
    { key: 'yearsTracked', value: '2019 - 2025' },
    { key: 'listPrice', value: '$Value' },
    { key: 'developer', value: developer }
]

/** Array order is paint order, back to front — the featured card is last and so
 *  sits on top of the pile in both layouts, which is how it is drawn. */
export const HERO_CARDS: EaCard[] = [
    {
        id: 'quantum-king',
        name: 'Quantum King',
        avatar: 'quantum-king',
        score: 91,
        stats: STAT_TEMPLATE('EasyAlgos'),
        ranking: 3,
        wide: { x: 0, y: 238 },
        stacked: { x: 23, y: 79 },
        motion: { from: 717, delay: 0, duration: 1095 }
    },
    {
        id: 'syna',
        name: 'Syna',
        avatar: 'syna',
        score: 91,
        stats: STAT_TEMPLATE('Brandon Autry'),
        ranking: 5,
        wide: { x: 93, y: 523 },
        stacked: { x: 245, y: 593 },
        motion: { from: 835, delay: 61, duration: 900 }
    },
    {
        // The seventh slot. Unranked in the design, and clipped by the viewport
        // in both layouts — it exists to make the pile read as deeper than six.
        id: 'quantum-athena',
        name: 'Quantum Athena',
        avatar: 'quantum-athena',
        score: 91,
        stats: STAT_TEMPLATE('Brandon Autry'),
        ranking: null,
        wide: { x: 628, y: 102 },
        stacked: { x: 756, y: 29 },
        motion: { from: 901, delay: 162, duration: 900 }
    },
    {
        id: 'gold-trader-pro',
        name: 'Gold Trader Pro',
        avatar: 'gold-trader-pro',
        score: 91,
        stats: STAT_TEMPLATE('EasyAlgos'),
        ranking: 2,
        wide: { x: 131, y: 0 },
        stacked: { x: 131, y: 241 },
        motion: { from: 859, delay: 0, duration: 900 }
    },
    {
        id: 'goldbot-one',
        name: 'Goldbot One',
        avatar: 'goldbot-one',
        score: 91,
        stats: STAT_TEMPLATE('Wim Schrynemakers'),
        ranking: 6,
        wide: { x: 551, y: 477 },
        stacked: { x: 457, y: 367 },
        motion: { from: 690, delay: 68, duration: 900 }
    },
    {
        id: 'little-crazy',
        name: 'Little Crazy',
        avatar: 'little-crazy',
        score: 91,
        stats: STAT_TEMPLATE('EasyAlgos'),
        ranking: 4,
        wide: { x: 462, y: 25 },
        stacked: { x: 608, y: 113 },
        motion: { from: 1251, delay: 0, duration: 900 }
    },
    {
        id: 'range-breakout',
        name: 'Range Breakout',
        avatar: 'range-breakout',
        score: 91,
        stats: STAT_TEMPLATE('Jimmy Eriksson'),
        featured: true,
        ranking: 1,
        wide: { x: 314, y: 246.5 },
        stacked: { x: 314, y: 0 },
        motion: { from: 769.5, delay: 111, duration: 900 }
    }
]

/** The veiled cards. Listed in the wide layout's paint order; the one slot the
 *  wide disposition does not use is last. Where a card moves a long way between
 *  the two layouts it is because the dispositions are independently composed —
 *  nothing animates across the breakpoint, so the pairing is free. */
export const HERO_CARDS_BLURRED: EaCardBlurred[] = [
    { id: 'v1', size: 'b', wide: { x: 727, y: 47 }, stacked: { x: 419, y: 343 }, motion: { from: 1492, delay: 221, duration: 601 } },
    { id: 'v2', size: 'b', wide: { x: 324, y: 659 }, stacked: { x: 324, y: 659 }, motion: { from: 711, delay: 34, duration: 900 } },
    { id: 'v3', size: 'b', wide: { x: 721, y: 665 }, stacked: { x: 721, y: 665 }, motion: { from: 294, delay: 138, duration: 900 } },
    { id: 'v4', size: 'b', wide: { x: 764, y: 452 }, stacked: { x: 764, y: 452 }, motion: { from: 838, delay: 68, duration: 900 } },
    { id: 'v5', size: 'a', wide: { x: 233, y: 160 }, stacked: { x: 233, y: 57 }, motion: { from: 855, delay: 189, duration: 900 } },
    { id: 'v6', size: 'a', wide: { x: 609, y: 390 }, stacked: { x: 609, y: 390 }, motion: { from: 827, delay: 273, duration: 900 } },
    { id: 'v7', size: 'a', wide: { x: 684, y: 523 }, stacked: { x: 684, y: 523 }, motion: { from: 890, delay: 93, duration: 900 } },
    { id: 'v8', size: 'a', wide: { x: 475, y: 626 }, stacked: { x: 475, y: 626 }, motion: { from: 772, delay: 138, duration: 900 } },
    { id: 'v9', size: 'a', wide: { x: 490, y: 202 }, stacked: { x: 615, y: 14 }, motion: { from: 892, delay: 68, duration: 753 } },
    { id: 'v10', size: 'a', wide: { x: 403, y: 490 }, stacked: { x: 361, y: 490 }, motion: { from: 459, delay: 29, duration: 655 } },
    { id: 'v11', size: 'a', wide: { x: 38, y: 533 }, stacked: { x: 38, y: 533 }, motion: { from: 722, delay: 0, duration: 769 } },
    { id: 'v12', size: 'b', wide: { x: 526, y: 93 }, stacked: { x: 526, y: 75 }, motion: { from: 1133, delay: 254, duration: 900 } },
    { id: 'v13', size: 'b', wide: { x: 370, y: 63 }, stacked: { x: 370, y: 63 }, motion: { from: 1251, delay: 48, duration: 900 } },
    { id: 'v14', size: 'b', wide: { x: 38, y: 121 }, stacked: { x: 38, y: 121 }, motion: { from: 788, delay: 189, duration: 690 } },
    { id: 'v15', size: 'b', wide: { x: 662, y: 76 }, stacked: { x: 39, y: 34 }, motion: { from: 1360, delay: 138, duration: 900 } },
    // Stacked-only. The wide disposition has no counterpart, so its motion is
    // not in the export either; it borrows the timing of the card nearest it.
    { id: 'v16', size: 'a', wide: null, stacked: { x: 127, y: 683 }, motion: { from: 890, delay: 93, duration: 900 } }
]

/** The collage's drawn box, in px. Every coordinate above is relative to it, and
 *  the stage renders at exactly this size and is transform-scaled as one unit. */
export const HERO_STAGE = { width: 900, height: 846 } as const

/** A regular front card. The featured one is 32px taller for its badge. */
export const HERO_CARD_SIZE = { width: 272, height: 321, featuredHeight: 353 } as const

/** The two veiled assets. `bleed` is the transparent margin the export carries
 *  on every side: the source has a Gaussian layer blur baked in (no CSS filter
 *  can reproduce it without also smearing the shadow), so the file is bigger
 *  than the card and has to be drawn offset by `bleed` to land the card box on
 *  its coordinate. See scripts/optimize-assets.py. */
export const HERO_BLURRED_ASSETS = {
    a: { src: 'blurred-a', card: { width: 188, height: 220 }, box: { width: 195, height: 227 }, bleed: 3.5 },
    b: { src: 'blurred-b', card: { width: 136, height: 160 }, box: { width: 145, height: 169 }, bleed: 4.5 }
} as const

/** The entrance easing, from the Figma motion export (node 552:24627). One
 *  curve for every card; only the delay and duration differ. */
export const HERO_MOTION_EASE = 'cubic-bezier(0.793, 0, 0.664, 1)'
