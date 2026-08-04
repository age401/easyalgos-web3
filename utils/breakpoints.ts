// Where the problem/solution section switches between its two behaviours.
//
// ONE definition, imported by both tailwind.config.ts (which turns it into the
// `pinned:` / `stacked:` variants) and the section itself (which hands it to
// matchMedia). They have to agree exactly: the CSS decides whether the stage is
// sticky and the JS decides whether anything is scrubbing it, and a layout that
// pins with nothing driving it — or drives with nothing pinned — is broken in a
// way that only shows up on one device.
//
// Width 800 rather than the old 1024: a tablet has the screen area and roughly
// the aspect ratio the composition was drawn for, and 1024 fell in the middle of
// the iPad range — 12.9" portrait is exactly 1024pt and got the pinned sequence
// while an 11" at 834pt did not. 800 puts every full-size iPad on the same side
// of the line in both orientations (the mini, at 744pt portrait, stays stacked
// until it is turned).
//
// Height 600 is not decoration. A width-only query reads a phone in landscape as
// a tablet — an iPhone Pro Max is 956pt wide that way — and a pinned stage that
// holds for nearly four viewports in a 440pt-tall window is precisely the
// experience the stacked layout exists to avoid. Anything shorter than 600 gets
// the stacked version whatever its width, including a squashed desktop window.
export const PINNED_MEDIA = '(min-width: 800px) and (min-height: 600px)'

/** The exact inverse, for the styles that belong to the stacked layout. */
export const STACKED_MEDIA = `not all and ${PINNED_MEDIA}`
