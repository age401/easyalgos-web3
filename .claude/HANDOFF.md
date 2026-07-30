# Web v3 — session handoff (2026-07-30)

## State
Branch `web-v3`, commit `d1ca5c4`, working tree clean. Builds and prerenders clean, zero console errors.
Design source: Figma `hYemTLwxenRsJG9fWsrliK`, page `✨ Website`, frame `165:2445` "Home Grid Reference" (1920×13090).

All 13 sections implemented from the design. v2 "Ledger" components deleted. Hand-written HTML + Tailwind on the
existing tokens; only new dependency is `@nuxtjs/i18n`.

## Verified numbers
FCP 124ms · CLS 0 · 19.7KB brotli HTML · fonts 52KB (5 faces) · 157KB AVIF total · three.js code-split and NOT
loaded on first view · no horizontal overflow at 390px · sticky stage confirmed pinned at desktop.

## Commands
```bash
npm run dev                  # localhost:3000
npx nuxt build               # prerenders / to .output/public
python scripts/optimize-assets.py <raw-dir>   # re-encode Figma PNGs to AVIF/WebP/JPEG triples
```
Kill any stray `nuxt preview` before rebuilding — it locks `.output` (EBUSY).

## Decisions already locked (do not re-litigate)
- **Hero cards**: hybrid. 6 foreground = real DOM, 8 veiled behind = flat AVIF. Figures come from the backend
  daily but are **baked** into the prerendered HTML — never fetched client-side.
- **Heavy mockups**: lazy AVIF/WebP, not DOM.
- **i18n**: en/de/es/pt, `strategy: 'no_prefix'`, 167 keys each, parity checked.
- **Particle section**: sticky centre-lock → text hand-off at 46% → cluster converges 56%→92%. `@converged` on
  `ParticleCluster` is the seam for the follow-on phase. Un-pins below 1024px.
- `utils/stellarCore.ts` is reused **untouched** and must stay that way. Originals in `.claude/preserved/particles/`.
- Legal disclaimers stay English in all locales, in `data/site.ts` — they quote CFTC 4.41(b)(1) / NFA 2-29.

## Blocked on Diego
1. **Per-item animations for the 9 "What you get" rows.** `visual: null` in `data/content.ts` marks each gap;
   they fall back to the dashboard export. One line each to drop in.
2. **Steps 3 & 4 have no usable Figma export.** `Animation Card 03 - Frame 1` renders clipped to 240px wide;
   `Animation Card 04 - Frame 1` renders empty (its layers are hidden in the file). Both ship as flat tinted
   placeholders. Needs a fix in Figma or the animations.
3. **Step walkthrough videos.** `video?` on `HowItWorksStep` is undefined, so no play affordance renders.

## Open questions I flagged, no answer yet
- 7435 (accolades) vs 7045 (closing banner) traders — unified to one `SITE_STATS.traders` = 7435.
- Footer "Brokers" heading sits above EA *developers* — re-headed as Developers; real brokers got their own column.
- Audience switch shows "Developers" selected on the traders page — built with Traders active instead.

## Known cosmetic follow-ups (my list, not blockers)
- Research card images and step panels are 1× only (`get_screenshot` cannot upscale). Re-export at 2× via
  `download_assets` + `defaultScale: 2` if they look soft on retina.
- MetaTrader is the one brand mark shipped as a raster (its Figma logo is ~30 separate vectors).
- Hero collage sits marginally lower/left than the drawn frame; scale steps in `.ea-hero-stage` are the dial.
- AlgoScore "Excellent / 91" pill was built from the screenshot, not measured node values — verify against Figma.

## File map
```
pages/index.vue                  assembler; hydrate-on-visible + overflow-x-clip rationale
assets/css/main.css              design system + ALL motion (.reveal/.line-mask/.ea-btn/.ea-phase/.ea-hero-stage)
tailwind.config.ts               v3 gradients, shadows, Violet ramp, Role/* chip colours
components/ParticleCluster.vue   three.js stage, converge prop
composables/usePinnedProgress.ts scroll → phase + converge contract
components/EaCardFront.vue       live hero card
data/{site,content,heroCards}.ts structure/assets only; text lives in i18n
scripts/optimize-assets.py       raster pipeline (alpha auto-crop, AVIF/WebP/JPEG)
```

## Next step
Diego picks a section to tweak. Nothing is mid-flight.
