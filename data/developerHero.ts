import type { DevFieldCard } from '~/types/developer'

// The developer hero's card field — Figma 3157:18611 ("Hero Image") and its
// "Background Cards" child, 3157:18612.
//
// GEOMETRY. Two boxes, both taken verbatim from the file:
//   STAGE  368x602  the profile card itself, the last item in the 1360px
//                   content row and therefore flush with its right edge.
//   FIELD  732x794  the pile behind it, hung off the stage at (-182, -96) —
//                   i.e. it bleeds 182px past the card on BOTH sides (732 =
//                   368 + 2x182, so the field is exactly symmetric about the
//                   card's centre line, which is what lets the stacked layout
//                   centre it with one `left: 50%` and no second coordinate
//                   set) and spans the section's full 794px height.
// Every coordinate below is in FIELD px, as drawn. Array order is paint order,
// back to front; the profile card is drawn after all of them, so it sits on top.
//
// MOTION. The file carries no motion export for this page — unlike the home
// hero, whose per-card timings are transcribed from node 552:24627. The values
// below are the same vocabulary applied here: one shared curve
// (HERO_MOTION_EASE), no fade and no scale, each card laid out at its final
// position and starting `from` px below it so the section's clip hides the
// travel. They run back-to-front, the veiled cards leading, so the pile
// assembles from the depths forward.
//
// A NOTE ON THE COMMENTS BELOW: every export here needs one. `mlly`'s
// `EXPORT_DECAL_RE` — which is what Nuxt's auto-import scanner runs on this
// file — carries a greedy `extraNames` group for `export const a, b`, and any
// comma inside an object literal sends it hunting across the following lines.
// The character class it hunts with allows newlines, so it swallows the NEXT
// `export const` whole and that name silently never becomes an auto-import. A
// doc comment in between contains `/` and `*`, which the class rejects, and
// stops it. Two exports here were lost to exactly that before the comments went
// in; the rest of data/ is safe only because it is commented throughout.
export const DEV_HERO_STAGE = { width: 368, height: 602 } as const

/** The pile's box, positioned relative to the stage. See the geometry note. */
export const DEV_HERO_FIELD = { x: -182, y: -96, width: 732, height: 794 } as const

/** The white wash over the bottom of the pile (Figma 3157:19060) — transparent
 *  at the top, opaque white at the bottom, so the cards dissolve into the page
 *  instead of being cut off by the section's clip.
 *
 *  `x` and `width` are recorded as drawn but are NOT what the CSS uses: the
 *  drawn rectangle is 740 wide against a 732 field and hangs 78px off its left,
 *  which covers empty field (the left-most card sits 30px inside it) and, once
 *  the copy column starts being capped at narrow widths, would reach into the
 *  copy. The wash is aligned to the field instead. `y` and `height` are used —
 *  the height being the ramp length, not the box. See .ea-dev-hero__fade. */
export const DEV_HERO_FADE = { x: -78, y: 574, width: 740, height: 220 } as const

/** The six cards behind the profile card, in paint order.
 *
 *  Two dispositions, both in field px:
 *    wide     node 3157:18612, used at >= 1160
 *    stacked  node 3191:7514,  used at <= 1159
 *  Only the x values move — every y is identical, and the field box is the same
 *  732x794 in both. The stacked layout has room on BOTH sides of the profile
 *  card rather than only to its left, so the right-hand cards slide outward to
 *  show a real edge instead of hiding behind it. */
export const DEV_HERO_FIELD_CARDS: DevFieldCard[] = [
    { id: 'veil-1', kind: 'veil', wide: { x: 451, y: 590 }, stacked: { x: 447, y: 590 }, motion: { from: 640, delay: 0, duration: 900 } },
    { id: 'veil-2', kind: 'veil', wide: { x: 114, y: 159 }, stacked: { x: 114, y: 159 }, motion: { from: 780, delay: 138, duration: 900 } },
    { id: 'veil-3', kind: 'veil', wide: { x: 453, y: 187 }, stacked: { x: 508, y: 187 }, motion: { from: 700, delay: 68, duration: 830 } },
    { id: 'front-1', kind: 'front', card: 'gold-trader-pro', wide: { x: 30, y: 235 }, stacked: { x: 30, y: 235 }, motion: { from: 860, delay: 96, duration: 900 } },
    // The design draws Gold Trader Pro twice, and this is the second instance.
    // Reproduced rather than varied because the profile card covers most of its
    // right edge — the repeat shows as a column of figures and nothing
    // identifiable. It is the card that moves furthest between the two
    // dispositions (+74px), which is what uncovers that column when stacked.
    { id: 'front-2', kind: 'front', card: 'gold-trader-pro', wide: { x: 356, y: 296 }, stacked: { x: 430, y: 296 }, motion: { from: 720, delay: 34, duration: 900 } },
    { id: 'front-3', kind: 'front', card: 'syna', wide: { x: 85, y: 575 }, stacked: { x: 111, y: 575 }, motion: { from: 900, delay: 162, duration: 900 } }
]

/** How the profile card itself enters. Same mechanics as the field cards, the
 *  shortest travel of the set: it is the front-most object and the one the eye
 *  lands on, so it settles rather than flies. */
export const DEV_HERO_CARD_MOTION = { from: 420, delay: 40, duration: 1000 } as const
