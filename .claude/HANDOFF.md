# Web v3 — session handoff (2026-08-03)

## State
Branch `main`, commit `b177fc0`, working tree clean. Dev server verified via the Browser
pane throughout (`npm run dev`, localhost:3000).
Design source: Figma `hYemTLwxenRsJG9fWsrliK` ("EasyAlgos - Web v3"), page `✨ Website`.

## Just finished this session
- **Trustpilot bar rebuilt to spec** (`components/TrustpilotBar.vue`, `public/img/brands/trustpilot.svg`,
  `assets/css/main.css`): exported star + logo SVGs from Figma (logo now includes the star mark,
  previously missing); star fill is fractional/rating-driven (4.6 → 4 full + 60% fifth) instead of
  `Math.round`; the bar's own breakpoint is **768/769**, confirmed off its Figma reference frame names
  (`Hero [1920~1025]`, `Hero [1024~769]`, `Hero [768~]`) — distinct from the hero's 1024/1025 and from
  `tablet-wide` (1024). Desktop/tablet are pixel-identical; mobile gets smaller type/stars, a bare score
  number, a relocated separator dot, and is genuinely shorter (52px vs 68px — Diego reduced mobile's
  padding). `--ea-trustpilot-h` is now a responsive custom property (52px ≤768, 68px above, declared on
  `:root` with a `min-width: 769px` override) so the hero's `100svh - topbar - trustpilot` subtraction
  tracks it automatically. **Gotcha if you touch this again:** Figma's frame borders are `INSIDE` strokes,
  so its padding numbers already include the 1px stroke; CSS adds the border outside the padding box, so
  the bar's `py` is deliberately 1px under Figma's stated 16/20 (`py-[15px]` / `min-[769px]:py-[19px]`) —
  check `strokeAlign` before copying padding off any bordered Figma frame.
- **Problem-section timing** (`composables/usePinnedProgress.ts`, `composables/usePageTint.ts`): the
  "problem" copy now fades at the midpoint of the starfield collapse (`PROBLEM_OUT` derived from
  `ACT.converge`, was a hardcoded 0.3 near the end). The page-tint-to-dark fade now waits
  (`ENTER_DELAY = 0.5` viewports) until the hero is nearly clear of the screen before starting — it used
  to begin the instant the section's top crossed the viewport bottom, while the hero still filled most of
  it — and the exit wash finishes `EXIT_LEAD = 0.5` viewports ahead of the section's own departure.
  Verified against real measured rects (not live rAF — the Browser pane being hidden throttles
  `requestAnimationFrame`, so per-frame writes can't be observed directly; the math was checked by
  sampling `getBoundingClientRect()` at fixed scroll positions instead).

## Not started — next up (Diego's request, this session)
All from the "The Problem" section, Figma `hYemTLwxenRsJG9fWsrliK`:

1. **StarMap retiming** — move the purple-dot → larger-dark-dot-with-logo transition earlier so it's
   complete by the time the orbiting mini circles appear (i.e. simultaneous with the concentric circles
   enlarging), and move `SOLUTION_IN` so the solution copy arrives *during* that transition — the goal is
   a shorter overall runtime. Touches `components/StarMap.vue` (keyframe tables, transcribed verbatim from
   `get_motion_context` — keep that shape) and `SOLUTION_IN`/`STATION_T` in `usePinnedProgress.ts`. Figma
   refs: node `527-899` ("Star Map Animation"), `536-2550` (dot sizes/colours).
2. **User Type cards** — new content, not yet built. Figma refs: base design `524-2889`; circle colour
   `524-2890` (Diego flagged this specifically — check it, don't guess); all icons `526-842` (export as
   SVGs or inline); all cards `527-898`.
3. **Card depth animation** — per `524-2841`, some cards should shrink and fade to read as moving away
   into depth, plus a slow continuous drift so the set reads as orbiting (not static).
4. Diego separately asked whether fading the Trustpilot bar during the tint transition would cost
   performance — answered no (opacity-only, can piggyback the same rAF `usePageTint` runs), but held off
   pending a re-check now that the tint timing fix above may already resolve why it was visible.

These are tracked as pending tasks in-session (#6, #7, #8) but that task list does not persist across
sessions — this file is the source of truth for what's next.

## Decisions already locked (do not re-litigate)
- Hero cards are hybrid: 7 foreground = real DOM, 15-16 veiled = flat images, baked into prerendered HTML.
- Full i18n: en/de/es/pt, `strategy: 'no_prefix'`. Font: Figma's "Inter" labels map to `font-poppins`
  sitewide — no Inter font file is loaded in this project, Poppins is the deliberate substitute.
- `utils/stellarCore.ts` reused untouched from v2; originals in `.claude/preserved/particles/`.
- The `tan(atan2(length, 1px))` CSS trick for casting length→number is **abandoned** — failed on real
  iPads two different ways, invisible to the Chromium-based in-app preview. `--hero-scale` is computed in
  JS (`HeroSection.vue`, `computeHeroScale()`) instead.
- Non-`SiteHeader` components use `min-[Npx]:` arbitrary Tailwind variants (not named screens) whenever a
  component's own Figma breakpoint doesn't land on the shared scale (`mobile/tablet/tablet-md/tablet-wide/
  desktop`) — precedent in `SiteHeader.vue` (`min-[841px]:`, `min-[1241px]:`) and now `TrustpilotBar.vue`
  (`min-[769px]:`).

## Open questions flagged, no answer yet
- 7435 (accolades) vs 7045 (closing banner) traders — unified to one `SITE_STATS.traders`.
- Footer "Brokers" heading sits above EA developers — re-headed as Developers.
- Audience switch shows "Developers" selected on the traders page — built with Traders active.

## Verifying in this environment
The Browser pane MCP tools work for DOM/CSS inspection (`javascript_tool`, `read_page`,
`read_network_requests`) even when the pane isn't visually displayed, but `computer` screenshots and
live `requestAnimationFrame` behaviour require the pane to actually be shown — check console output
before assuming a screenshot will work.

## Next step
Pick up item 1, 2, or 3 above — Diego gave them as a single request but they're independent enough to
do in any order. Nothing is mid-flight.
