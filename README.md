# EasyAlgos home — "The Ledger"

An institutional redesign of the easyalgos.ai home page. Nuxt 3 + Tailwind v3,
built to the conventions of `PROJECT_STACK_GUIDE_FOR_AI.md` (EasyAlgos client
stack): hand-written components, inline Tailwind with the library tokens,
custom breakpoints, no UI kit, performance-first.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## The concept

EasyAlgos presented as a financial institution rather than a SaaS funnel —
the voice and posture of a private bank (reference: Mercury), applied to the
existing brand library (Poppins / Roboto, EasyAlgos tokens).

- **Palette.** Paper white + `Tinted/25` surfaces, hairline rules
  (`Tinted/100`), and a deep ink navy (`Ink/950 #0B1125`) lifted from the
  wordmark itself. One blue accent (`Blue/600`) reserved for data and links.
  No violet/purple gradient motifs — the page's single gradient is a hairline
  rule in the closing panel.
- **Typography.** Poppins Medium with tight tracking for display; Roboto for
  prose; tabular numerals (`.eal-num`) for every figure.
- **Layout language.** Ledger rows, rate cards, filing-index eyebrows
  (`01 / The model`), statement documents — bank paperwork as a design system.
- **Voice.** Declarative, unhurried, no exclamation marks. The qualification
  thresholds are framed as a private-bank minimum — the exclusivity carries
  the credibility. "Free" is explained by disclosing the business model, not
  by shouting it.

## Motion (mechanics carried over from IC Precision, re-skinned)

- `v-reveal` directive — IntersectionObserver fade/rise with stagger delays
- Line-mask hero headline reveal on load (`.is-loaded`)
- `useDarkBand` — whole-page background shift (white → ink) while the track
  record and old-ecosystem sections hold the viewport; the header inverts with it
- `useRevealOnce` — one-shot entrance that never replays on scroll-back
  (the solutions cards)
- A hand-rolled three.js scene for the Stellar core particle cluster —
  dynamically imported client-side, paused off-screen, see
  [STELLAR_CORE.md](STELLAR_CORE.md)
- SVG equity-curve draw-in gated on the dark band (`pathLength` normalised)
- Hero statement sparkline draws once after full page load
  (`usePlayOnceAfterLoad`)
- All motion respects `prefers-reduced-motion`; hidden states gate behind the
  `.js` html class so no-JS renders everything visible

## Page structure

`pages/index.vue` is a thin assembler; every section is self-contained:

| Section | Content |
| --- | --- |
| `HeroSection` | Statement headline + member-statement document visual |
| `OldEcosystemSection` | The old ecosystem — dark band + the Stellar core WebGL cluster ([STELLAR_CORE.md](STELLAR_CORE.md)) |
| `SolutionsStackSection` | The whole system — five pillar cards that slide in from the sides |
| `ProofStrip` | Four figures, annual-report style |
| `ModelSection` | 01 / The model — why access is free (aligned incentives) |
| `TrackRecordSection` | 02 / The record — dark band + verified equity chart |
| `InfrastructureSection` | 03 / The infrastructure — six ledger rows |
| `MembershipSection` | 04 / Membership — rate card + shared terms |
| `ProcessSection` | 05 / The procedure — three steps |
| `VoicesSection` | 06 / In their words — two references |
| `ClosingSection` | Ink panel, single gradient hairline, final CTA |
| `SiteFooter` | Link columns + prominent risk disclosure |

## Expert Advisors

`/expert-advisors`, `/expert-advisors/<ea>` and `/expert-advisors/developers/<developer>`
(Figma "EasyAlgos - WEB3", page `3913:15396`, the four "v2" frames). All three
use `layouts/page.vue` and are prerendered from `data/expertAdvisors.ts`.

| Route | Page | Modules |
| --- | --- | --- |
| `/expert-advisors` | `pages/expert-advisors/index.vue` | `EaListHero`, `EaListSection` (toolbar, card and compact views, pager) |
| `/expert-advisors/<ea>` | `pages/expert-advisors/[slug].vue` | `EaIdentityCard`, `EaKpiStrip`, `EaTrackRecord`, `EaMonthlyHeatmap`, `EaInsideGallery`, `EaDeveloperPanel`, `EaMoreFrom`, `EaStickyCta` |
| `/expert-advisors/developers/<developer>` | `pages/expert-advisors/developers/[slug].vue` | `EaDeveloperHero`, `EaPortfolio` (`EaRiskReturn`, `EaScoreRanking`, cards) |

Shared pieces: `EaCard`, `EaTile`, `EaScoreRing`, `EaSparkline`, `EaThumb`,
`EaStatGroup`, `EaCtaTile`, `EaCount`, `EaIcon`; `useEaList` (list state);
`utils/eaFormat.ts` (figures, axes, paths); `plugins/inview.ts` (`v-inview`).
Styles are the `xa-` block in `assets/css/main.css`.

- **Data.** `data/expertAdvisors.ts` is the seam for the daily publish. Its header
  comment lists exactly which figures are drawn in Figma and which are generated
  sample data; the generator keeps the heatmap, the chart and the card sparkline
  consistent with the headline figures.
- **Responsive.** Modules re-lay by the width they are given (container queries),
  not the viewport, because the same module sits in a 936px column on a wide
  desktop, a 600px one at 1024 and a 280px one on a phone. Each component's
  header comment states its forms and the width each one starts at.
- **Motion.** Entrances hang off `.xa-in`, a class in the server markup, revealed
  by `v-inview`. Rings sweep, sparklines and the chart wipe in, bars fill, scatter
  dots pop, all keyed to that one class and all off under
  `prefers-reduced-motion`.
- **Assets.** Thumbnails, the developer portrait and the screenshots are encoded
  by `scripts/optimize-assets.py` into `public/img/expert-advisors/`.
- The old single-developer page at `/developer` is retired and redirects to the
  list.
