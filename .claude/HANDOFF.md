# Web v3 — session handoff (2026-08-03)

## State
Branch `main`, commit `4e2644e` plus UNCOMMITTED work (below). Design source: Figma
`hYemTLwxenRsJG9fWsrliK` ("EasyAlgos - Web v3"), page `✨ Website`.

## Just finished this session — all four of Diego's "The Problem" items
Verified with **Playwright**, not the Browser pane — see "Verifying" below, this matters.

1. **StarMap retimed** (`components/StarMap.vue`, `composables/usePinnedProgress.ts`,
   `ProblemSolutionSection.vue`). The core's violet→dark swell + logo resolve now runs
   *under* the ring bloom instead of after it, so both land together at Figma t≈0.23,
   with the orbiting dots coming up on the frame that lands. "Reference 01" (small
   violet core inside full-size rings) is no longer a station — holding there was the
   single biggest cost in the section, and deleting it is where the shorter runtime
   came from. Stations moved `0.46/0.66/0.76/0.88` → `0.03/0.23/0.44/0.56`;
   `STATION_T` 0.88 → 0.56 (it must equal `T_STAGE_3`); `SOLUTION_IN` 0.54 → 0.10 so
   the solution copy arrives mid-transition; section **480vh → 380vh**; acts recut to
   `converge [0.08,0.36] / starMap [0.36,0.90]`.
   **Every keyframe kept its authored WIDTH and easing** — the core move is still 0.20
   of the timeline, the logo fade 0.10, the last transition 0.12. Only positions moved,
   so the tables still diff against `get_motion_context`. Budget now ≈70vh combined
   bloom-and-swell, ≈48vh orbit hold, ≈32vh white badge.
2. **Trustpilot leaves with the tint** (`usePageTint.ts`, `main.css`, `TrustpilotBar.vue`).
   `usePageTint` now publishes `--ea-page-tint` (the raw 0..1 fade position) alongside
   `--ea-page-bg`. No second scroll listener, so it cannot desync.
   **Fading the whole bar was the first attempt and it was wrong** — Diego saw a pale
   horizontal band sliding up the screen, because a half-transparent white slab over a
   mid-grey page is lighter than that page. There is no opacity at which it matches.
   Now split three ways: the BACKGROUND reads the same
   `var(--ea-page-bg, theme('colors.Neutral/White'))` expression html/body read, so the
   bar is the page colour by construction at every point (verified: pixel-identical
   above, inside and below the bar mid-fade); the two 1px rules ride the tint down in
   alpha so they don't become bright lines on a dark page; only the CONTENT
   (`.ea-trustpilot__inner`) uses opacity. Cheaper than the version it replaced — no
   full-bleed opacity layer compositing against a changing page colour. No
   reduced-motion carve-out on purpose: there the tint hard-swaps and the bar must swap
   with the page, not be treated as an independent animation.
3. **User Type cards built** (`data/roleCards.ts` — new, `types/home.ts`, `main.css`,
   `tailwind.config.ts`, `ProblemSolutionSection.vue`). Six cards, glyphs inlined as
   exact 20x20 stroke paths from the Figma symbols (`currentColor`, so the ink is a
   token). Fixed three things that were wrong:
   - **The bubble colour Diego flagged.** It is a PEARL: `#C5CDD5` body under a wash
     that is *transparent* at the highlight and only reaches 0.8 alpha at the rim. The
     old `ea-bubble` had the same three colours as fully opaque stops, which threw the
     base away and rendered it ~2x too dark. Verified against the reference render
     pixel-for-pixel. Same object as the star map's orbiting dots — keep them in sync.
   - **Card padding.** Figma's border is an INSIDE stroke, so `px-2.5 py-2` overshot by
     4px in both axes; `px-2 py-1.5` gives exactly Figma's 36px. (Same trap as the
     Trustpilot bar. Check `strokeAlign` before copying padding off a bordered frame.)
   - **Positions.** The old values were Figma's TOP-LEFT coordinates applied as
     centres, offsetting every card by half its own size. Now true centres; all six
     land within 0.01 box-units of Figma.
4. **Drift only — no depth** (`tailwind.config.ts`, `main.css`, `ProblemSolutionSection.vue`,
   `data/roleCards.ts`, `types/home.ts`). Landed after three passes, and the end state
   is much simpler than the middle ones, so don't reintroduce what was removed:
   - **Every card is drawn at full size and full opacity.** Figma draws community and
     analytics smaller (0.686 / 0.556) and fainter (0.63 / 0.38) to push them back;
     Diego saw that both static and animated and chose to drop it. The set is one flat
     plane now, separated only by the drift. A `eaDepth` scale animation existed
     briefly in between — it is gone, along with the per-card `scale`/`opacity` data.
   - **`eaFloat`** (6s vertical bob) **→ `eaOrbit`** — 8 stations round an 8.75px
     circle, 27s linear. The period is derived, not chosen: widening the circle from
     7px lengthened the path 25%, so keeping 18s would have made the drift 25% faster.
     22.5s would exactly cancel that; 27s goes past it, landing at 2.0 px/s against
     the old 2.4. **If the radius changes, the period has to move with it.**
   - Per-card phases are spread across the whole 27s period (and shuffled so
     spatially-adjacent cards are far apart in phase) — with the old 18s delays they
     all sat in the first 14% of the cycle and swung nearly in unison.
   - **Two elements per card is structural, not stylistic.** An animated `transform`
     outranks an inline one, so a single element cannot hold both the drift and the
     `translate(-50%,-50%)` that centres it — it would jump half its width off its
     mark the instant the animation started. That was the original bug: the old chip
     silently lost its centring AND its depth scale to the drift.
   - **Stroke flicker** (Diego's report; his instinct that it was the opacity was
     right). Three things fixed it: the per-card opacity is gone, a
     `backdrop-filter: blur(2px)` that was never in the Figma spec is gone (it
     re-sampled the live WebGL canvas every frame), and `.ea-chip` carries
     `will-change: transform` so the 2px rule is rasterised once and moved by the
     compositor rather than re-rasterised onto a new sub-pixel boundary each frame.
   - `motion-safe:`, not the global reduced-motion override — that clamps a running
     animation to its first keyframe, which would park every card at 3 o'clock,
     8.75px off its mark. Unapplied, they sit exactly where Figma puts them.

5. **Tablets get the pinned sequence; phones get it off a clock** (`utils/breakpoints.ts`
   — new, `composables/useTimedSequence.ts` — new, `tailwind.config.ts`,
   `ProblemSolutionSection.vue`, `usePinnedProgress.ts`, `StarMap.vue`, `main.css`).
   Diego asked why handhelds only got the starfield. Answer: a UX call from `d1ca5c4`
   ("scroll-jacking a phone is worse than the effect is good"), not perf — the WebGL
   cloud, by far the most expensive thing there, was already running. He chose to bring
   tablets in and give phones a non-scroll version.
   - **The gate is `(min-width: 800px) and (min-height: 600px)`**, defined ONCE in
     `utils/breakpoints.ts` and shared by matchMedia and Tailwind. Height is in there
     because a width-only query reads a landscape phone (956pt) as a tablet. 1024 also
     split the iPad range — 12.9" portrait got the sequence, 11" did not.
   - `pinned:` / `stacked:` are **Tailwind variants registered via a plugin, NOT
     entries in `screens`.** One object-valued screen entry disables `min-[Npx]:` and
     `max-*` for the whole project, and this codebase depends on those. Learned the
     hard way; the build fails loudly if anyone moves them back.
   - **Pinning and column count are now separate axes.** Pinning follows area
     (`pinned:`), the two-column grid still follows width (`tablet-wide:`). That leaves
     a pinned-but-single-column band (tablet portrait, short desktop windows) where
     cluster and copy share one viewport — hence the `min(560px,46svh)` cap on the
     cluster, which needs `!` because a custom variant sorts ahead of the screen
     variants and plain `tablet:max-w-[560px]` would otherwise win.
   - **`useTimedSequence`** drives the stacked layout: IntersectionObserver-triggered
     one-shot, ~4.5s, producing the same `converge`/`starMapTime` the scroll path does
     so `StarMap` and `ParticleCluster` cannot tell the difference. It stops at
     `END_T = 0.34` — mid-hold, on Figma "Reference 02" — rather than running to the
     white badge, because the badge exists only to hand over to a line that needs a
     four-viewport section to grow down. Keep END_T inside `T_HOLD_2`.
6. **The copy handover plays on the stacked layout too** (`useTimedSequence.ts`,
   `usePinnedProgress.ts`, `ProblemSolutionSection.vue`, `main.css`). This REVERSES the
   previous pass, which read both groups in sequence on the grounds that a timed
   crossfade would swap text out from under someone mid-read — Diego asked for the
   handover and the objection turned out not to apply, because putting the two groups
   in one cell makes the section **699px on a 390x844 phone, so it fits on one screen**
   and the reader is looking at the cluster and the copy together when it plays.
   - Both groups now share one grid cell on BOTH layouts (`col-start-1 row-start-1`,
     unconditional). The row sizes to the taller of the two, so the swap moves nothing
     and no min-height is needed on the stacked side.
   - `phase` is the shared vocabulary: both composables export it, `phaseState` lives
     in the component where the two are merged. `SOLUTION_IN` is exported from
     `usePinnedProgress` and imported by `useTimedSequence` — it is a position on the
     star map timeline, so it means the same thing on either clock. The timed path has
     no phase 2: nothing releases, so the solution is where the piece rests.
   - `LEAD_MS` went 250 → 900. It is not a pause before the visual any more: the
     problem copy is on stage through it and starts leaving at the collapse midpoint,
     so lead + half the collapse is the entire time anyone gets to read it.
     **Lengthen this first if the handover ever feels rushed.**
   - Measured on a phone: problem holds to ~1.4s, leaves on the collapse, gap while the
     rings bloom, solution arrives ~3.5s mid-core-transition, both at rest by ~4.2s —
     the same order the scrubbed version plays.
   - **Fixed a latent bug this would have made worse.** Under reduced motion the
     scrolled path drives phase to 2, so BOTH groups become `past`, and the
     reduced-motion block forces `past`/`pending` visible — with the two sharing a grid
     cell that printed the two headings on top of each other (verified: both in cell
     1/1). That block now also resets `grid-area` and spaces them, so reduced motion
     gets two readable stacked groups on either layout.
   - `usePinnedProgress` now takes `enabled` too, so it stops keeping a scroll
     listener alive on phones for an answer nobody reads.
   - **`StarMap`'s orbit rAF is now gated on visibility as well as `dotOpacity`.**
     It has to be: the stacked layout parks the piece with the dots at full opacity,
     so without the gate a phone turns twelve circles forever after the reader has
     scrolled away. Note the observer is attached from a `watch` on the template ref,
     not in `onMounted` — everything here is inside `<ClientOnly>`, whose slot does
     not exist yet at mount, and observing a null ref fails silently.

## NOT MINE — in the working tree, needs a decision
- `components/HeroBrandLogo.vue` has an added comment claiming `.attr` modifiers on
  `viewBox`/`width`/`height` are load-bearing — but **the template still has plain
  `:viewBox` etc, so the fix itself is absent** and the comment is currently false.
  The bug is real and live: 3 Vue hydration warnings per logo, 9 on the home page.
  Looks like a spawned side-session that stopped halfway. Either finish it or drop it.
- `.claude/launch.json` gained a `web-alt` entry on port 3100, same origin.

## Decisions already locked (do not re-litigate)
- Hero cards are hybrid: 7 foreground = real DOM, 15-16 veiled = flat images, baked into
  prerendered HTML.
- Full i18n: en/de/es/pt, `strategy: 'no_prefix'`. Font: Figma's font labels map to
  `font-poppins` sitewide. Cards run ~7px wider than Figma because Poppins sets wider
  than Roboto — expected, the box math is right.
- `utils/stellarCore.ts` reused untouched from v2; originals in `.claude/preserved/particles/`.
- The `tan(atan2(length, 1px))` CSS trick is **abandoned** — `--hero-scale` is computed
  in JS (`HeroSection.vue`, `computeHeroScale()`).
- Non-`SiteHeader` components use `min-[Npx]:` arbitrary variants when a component's own
  Figma breakpoint misses the shared scale.

## Open questions flagged, no answer yet
- 7435 (accolades) vs 7045 (closing banner) traders — unified to one `SITE_STATS.traders`.
- Footer "Brokers" heading sits above EA developers — re-headed as Developers.
- Audience switch shows "Developers" selected on the traders page — built with Traders active.

## Verifying in this environment — READ THIS FIRST
The Browser pane reports `document.visibilityState === 'hidden'`, which means **no
frames are produced**: `requestAnimationFrame` never fires, IntersectionObserver never
delivers, and therefore the lazy-hydrated sections below the hero **never hydrate**.
Nothing scroll-driven can be observed there. `javascript_tool` is still fine for
synchronous DOM/CSS checks (computed styles, stylesheet inspection, static geometry).

Use the **Playwright MCP server** for anything scroll-driven — it runs a real browser
that produces frames, so hydration, IO, rAF and the whole choreography work. Pattern
that worked: `browser_resize` → `browser_navigate` → one `browser_evaluate` that scrolls
with `behavior: 'instant'` (the page sets `scroll-behavior: smooth`, so a plain
`scrollTo` silently animates and reads back 0), `await sleep(~150ms)` per sample, and
returns a table. To measure rest positions, inject `.ea-chip { animation: none }` first.

## Next step
Nothing mid-flight in my work. The tree is uncommitted so Diego can review the diff;
the HeroBrandLogo question above wants answering before anything is committed.
