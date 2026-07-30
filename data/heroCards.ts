import type { EaCard, EaCardGhost } from '~/types/home'

// The hero collage.
//
// Two populations, for the reason set out in the hero component: the six front
// cards are real DOM (crisp text, real hover, translatable labels, and figures
// that can be refreshed), the eight behind them are flat images because at 80%
// white veil nobody can read them anyway and 8 x ~40 nodes of unreadable markup
// in the LCP path is the single most expensive thing this page could do.
//
// BAKED DATA. `stats[].value` mirrors what the backend publishes daily. It is
// resolved at build time (the route is prerendered, see nuxt.config) so the
// figures ship inside the HTML: no client fetch, no loading state, no layout
// shift. The daily job updates this module — or a Nitro route that replaces it —
// and rebuilds; the browser never learns these came from an API. The row labels
// beside them are static and come from i18n (`card.*`), so a card renders
// complete and legible even if a value is ever missing.

/** Positions are percentages of the collage stage, not pixels: the stage is
 *  drawn at its Figma size and scaled as one unit (--hero-scale), so the whole
 *  arrangement keeps its exact proportions at every width instead of needing a
 *  breakpoint per card. Reference box: x 1178-2066, y 67-933 of the 1920x1004
 *  hero frame. */

const STAT_TEMPLATE = (developer: string): EaCard['stats'] => [
    { key: 'accountGrowth', value: '+ 294.17 %', highlight: true },
    { key: 'monthlyGain', value: '2.08 %' },
    { key: 'dailyGain', value: '0.07 %' },
    { key: 'maximumDrawdown', value: '21.96 %' },
    { key: 'monthsInProfit', value: '65 of 65' },
    { key: 'yearsTracked', value: '2019 - 2025' },
    { key: 'listPrice', value: '$Value' },
    { key: 'developer', value: developer }
]

export const HERO_CARDS: EaCard[] = [
    {
        id: 'quantum-king',
        name: 'Quantum King',
        avatar: 'quantum-king',
        score: 91,
        stats: STAT_TEMPLATE('EasyAlgos'),
        left: 0,
        top: 28.4,
        width: 30.6,
        z: 20,
        delay: 460
    },
    {
        id: 'syna',
        name: 'Syna',
        avatar: 'syna',
        score: 91,
        stats: STAT_TEMPLATE('Brandon Autry'),
        left: 10.5,
        top: 56.5,
        width: 30.6,
        z: 21,
        delay: 540
    },
    {
        id: 'gold-trader-pro',
        name: 'Gold Trader Pro',
        avatar: 'gold-trader-pro',
        score: 91,
        stats: STAT_TEMPLATE('EasyAlgos'),
        left: 22.9,
        top: 0,
        width: 30.6,
        z: 22,
        delay: 400
    },
    {
        id: 'goldbot-one',
        name: 'Goldbot One',
        avatar: 'goldbot-one',
        score: 91,
        stats: STAT_TEMPLATE('Wim Schrynemakers'),
        left: 55.7,
        top: 62.7,
        width: 30.6,
        z: 23,
        delay: 620
    },
    {
        id: 'range-breakout',
        name: 'Range Breakout',
        avatar: 'range-breakout',
        score: 91,
        stats: STAT_TEMPLATE('Jimmy Eriksson'),
        featured: true,
        left: 36.7,
        top: 29.8,
        width: 30.6,
        z: 25,
        delay: 320
    },
    {
        id: 'little-crazy',
        name: 'Little Crazy',
        avatar: 'little-crazy',
        score: 91,
        stats: STAT_TEMPLATE('Pavel Udovichenko'),
        left: 69.4,
        top: 3.9,
        width: 30.6,
        z: 24,
        delay: 700
    }
]

/** The veiled cards behind the front row. Drawn at 2x and encoded to AVIF/WebP;
 *  intrinsic dimensions are the 1x design size so the browser reserves the right
 *  box before the bytes land. */
export const HERO_CARD_GHOSTS: EaCardGhost[] = [
    { id: 'g1', src: 'ghost-lg-a', width: 187, height: 219, left: 26.2, top: 19.4, z: 10, delay: 760 },
    { id: 'g2', src: 'ghost-sm-a', width: 136, height: 160, left: 11.4, top: 14.9, z: 11, delay: 800 },
    { id: 'g3', src: 'ghost-sm-b', width: 136, height: 160, left: 41.7, top: 8.2, z: 12, delay: 840 },
    { id: 'g4', src: 'ghost-lg-b', width: 187, height: 219, left: 55.2, top: 24.2, z: 13, delay: 880 },
    { id: 'g5', src: 'ghost-sm-c', width: 136, height: 160, left: 59.2, top: 11.7, z: 14, delay: 920 },
    { id: 'g6', src: 'ghost-lg-c', width: 187, height: 219, left: 46.9, top: 57.5, z: 15, delay: 960 },
    { id: 'g7', src: 'ghost-lg-d', width: 187, height: 219, left: 62.4, top: 46.9, z: 16, delay: 1000 },
    { id: 'g8', src: 'ghost-sm-d', width: 136, height: 160, left: 36.5, top: 77.0, z: 17, delay: 1040 }
]

/** The collage's drawn box, in px. The stage renders at exactly this size and is
 *  scaled; every percentage above is relative to it. */
export const HERO_STAGE = { width: 888, height: 866 } as const
