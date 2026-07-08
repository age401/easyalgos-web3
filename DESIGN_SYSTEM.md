# EasyAlgos Design System

> **Version 1.0 — July 2026.** Derived from the IC Precision landing page (Figma:
> "IC Precision", node 238-2662), promoted to the ecosystem-level system for
> easyalgos.ai. Utility classes are renamed `icp-*` → `ea-*`; every token value is
> unchanged, so the two projects stay copy-paste compatible. Written to be ported
> into Figma as variables / text styles / components (see §9).

---

## 1. Creative direction

**Corporate-financial, Mercury-bank-adjacent.** The site should read like a
financial institution that happens to be excellent at software — not like a
trading-signal vendor.

Principles:

- **White is the brand color.** Light surfaces dominate; color is spent only on
  one gradient accent word per headline, the primary CTA, and data visualizations.
- **Hairlines over shadows.** Structure comes from 1–2px `Tinted/100` borders and
  hairline dividers (`gap-px` over a `Tinted/100` background). Shadows are reserved
  for floating elements (CTAs, framed panels).
- **Data is decoration.** Wherever a competitor would put an illustration, we put
  an instrument: an equity curve, a metrics strip, a verification badge.
- **One dark moment.** Exactly one section per page (the verified-results band)
  flips the whole page background to near-black on scroll. It is the page's
  signature; never use two.
- **Editorial restraint.** Short headline lines (2–3 words each), flat −2px
  tracking, one gradient accent per heading. Body copy is sober and specific.

---

## 2. Color

Tokens live in [tailwind.config.ts](tailwind.config.ts) (slash-named — quote them in JIT:
`text-Tinted/950`, `bg-Blue/600`). The working palette for marketing pages:

### 2.1 Surfaces & text (the "Tinted" ramp — primary neutral)

| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | Page background, cards |
| `Tinted/25` | `#F7F7FB` | Tinted bands, card fills, hover fills |
| `Tinted/50` | `#F0F1F7` | Pressed fills, pill borders |
| `Tinted/100` | `#E4E6F0` | **Hairlines, card borders, dividers** |
| `Tinted/200` | `#C9CCDD` | Secondary-CTA border |
| `Tinted/300` | `#AEB2C9` | Hero eyebrow text, chart "typical" line |
| `Tinted/400` | `#9499B6` | Caption text, uppercase micro-labels |
| `Tinted/500` | `#7A7FA3` | Metric captions, footer micro-labels |
| `Tinted/600` | `#62678F` | Muted body, chart tick labels |
| `Tinted/700` | `#51567A` | Card body text, icon strokes |
| `Tinted/800` | `#433E68` | Dark label on white CTA |
| `Tinted/900` | `#2F2A4A` | Emphasis body text |
| `Tinted/950` | `#1C1833` | **Headings, default body color** |

### 2.2 Brand accents

| Token | Hex | Usage |
|---|---|---|
| `BLUE/BASE` | `#205EFB` | Card index numbers, gradient start |
| `Blue/600` | `#285FF7` | Focus rings, nav hover underline |
| `Blue/400` | `#5481F9` | Checklist dots |
| `PINK` | `#B36DFF` | Gradient end (violet) |
| `VIOLET/400` | `#8B7EFF` | Dark-band chart headers |
| `Cyan/Edge` | `#45D7FF` | Dark-band chart highlight line/dot |
| `Blue/Pale` | `#D2DFFE` | Pale sub-phrase on gradient banner |
| `Green/200` | `#00BA38` | Live dots, verification markers |
| `Neutral/800` | `#171717` | Dark-band page background |
| `Neutral/600` | `#404040` | Lead paragraph text (`.ea-lead`) |
| `Neutral/400` | `#737373` | Eyebrow text (default variant) |

### 2.3 Gradients (never re-derive — copy exactly)

| Name | Definition | Usage |
|---|---|---|
| Brand text | `linear-gradient(125.7deg, #205EFB 8.3%, #5959FF 46.7%, #B36DFF 91.7%)` | `.ea-grad-text` accent words |
| CTA background | `linear-gradient(134deg, #B36DFF 10.8%, #205EFB 50%, #5959FF 69.6%, #B36DFF 89.2%)` at 200% width, `translateX(-50%)` | `.ea-cta--primary` (animates on X) |
| Banner | `linear-gradient(131deg, #205EFB 8%, #5959FF 47%, #B36DFF 92%)` + cyan radial top-right + deep-blue radial bottom-left | `.ea-cta-banner`, Popular plan frame |
| Panel frame | `linear-gradient(100.3deg, #F6F7FF 0%, #E7E9F9 39.423%, #F2F3FF 100%)` | Framed-panel card background (§6.4) |
| Chart line (dark) | `#45D6FF → #5572FF → #AD6AFF` (userSpaceOnUse, horizontal) | Verified/precision curve on dark |
| Chart line (light) | `#205EFB → #5959FF → #B36DFF` (horizontal) | Hero equity curve on light |

---

## 3. Typography

Self-hosted `.woff2` only ([public/fonts/](public/fonts)), `font-display: swap`.
Preload Poppins 600/700 + Roboto 400.

| Tailwind class | Font | Role |
|---|---|---|
| `font-poppins` | Poppins (400/500/600/700) | Headings, labels, buttons, numbers — the default |
| `font-franklin` | Roboto (400/500/700) — historical alias name | Body copy, quotes, links |

### 3.1 Type scale (marketing pages)

| Style | Spec | Class / recipe |
|---|---|---|
| **H1 / Hero** | Poppins Medium, 40→52→68px by breakpoint, lh 1.135, tracking −2px | inline (see HeroSection) |
| **H2 / Section** | Poppins Medium, 32→40→48px, lh 1.111, tracking **flat −2px at every size** | `.ea-h2` |
| **H3 / Card title** | Poppins SemiBold 22/32, tracking −0.5px, `#0B1125` | inline |
| **Banner H2** | Poppins SemiBold, 36→48→60px, lh 1.06, tracking −0.02em, white | inline (ClosingCta) |
| **Lead** | Roboto Regular 17px, lh 1.62, `Neutral/600` | `.ea-lead` |
| **Body** | Roboto Regular 15–16px, lh 1.6–1.65, `Tinted/600–700` | inline |
| **Eyebrow** | Poppins Regular 12/12, uppercase, tracking 2.5344px, + 16×1px rule | `.ea-eyebrow` |
| **Micro-label** | Poppins Medium 10–11px, uppercase, tracking 0.1–0.18em, `Tinted/400–500` | inline |
| **Metric figure** | Poppins Bold 40–44px, lh 1 | inline (KeyMetrics) |
| **Pull quote** | Poppins Medium 22–26px, lh 1.5, tracking −0.5px, `Tinted/900` | inline (ProblemSection) |

Rules: max one `.ea-grad-text` accent per heading; break headlines into 2–3-word
lines with `<br/>` (or `line-mask` spans in the hero); straight ASCII quotes in
code, `&ldquo;/&rdquo;` entities in rendered quotes.

---

## 4. Layout & spacing

- **Container**: `.ea-container` — max-width `1248px + 6rem`, padding `20/32/48px`
  by breakpoint.
- **Breakpoints** (never use Tailwind defaults): `mobile 360` / `tablet 600` /
  `tablet-md 800` / `tablet-wide 1024` / `desktop 1280` / `desktop-md 1600` / `wide 1920`.
- **Section rhythm**: `py-20 tablet-md:py-28` (dark band: `py-24 tablet-md:py-32`).
  Header → content gap: `mt-12`. Heading → lead: `mt-6`. Eyebrow → heading: `mt-6`.
- **Two-column editorial split**: `grid tablet-wide:grid-cols-2 gap-12/16` — heading
  left, copy + card right (right column gets `border-t border-Tinted/100 pt-8`).
- **Radii**: cards `rounded-2xl` (16px); framed panels `rounded-[20px]` outer /
  `rounded-xl` inner; CTAs `rounded-full`; stat cells `rounded-lg`.
- **Hairline dividers**: `grid gap-px bg-Tinted/100` with opaque cells — crisper
  than borders for metric strips and step rows.

---

## 5. Motion

Timing function everywhere: `ease-smooth` = `cubic-bezier(.22,.61,.36,1)`.

| Pattern | Mechanics |
|---|---|
| **Scroll reveal** | `v-reveal` / `v-reveal="120"` directive ([plugins/reveal.ts](plugins/reveal.ts)): fade + 18px rise, 0.8s, staggered ~70–90ms per sibling. Gated behind `.js` on `<html>` so no-JS renders everything. |
| **Hero entrance** | `.is-loaded` on the section (one rAF after mount): `line-mask` clip-reveals per headline line (80ms stagger), `hero-fade` for everything else (0→560ms delays). |
| **Chart draw-in** | `.ea-chart.is-active`: lines draw via `pathLength="1"` dash offset (1.7s), then wedge → ticks → labels → dots fade in (1.0→1.5s delays); endpoint gets a looping `chartPulse`. |
| **Dark band** | [useDarkBand](composables/useDarkBand.ts) (rAF-driven geometry check, central 32% strip of viewport) toggles section + whole-page (`.is-dark-band`) background, 1300ms. Drives the chart's `active` prop. |
| **Primary CTA** | Two layers slide on X: gradient bg (200% wide) and white shine (300% wide); button lifts −2px with a blue glow shadow. Animate `transform` only, never gradient stops. |
| **CTA arrow** | Lottie `/lottie/apply-arrow.json`, rests at frame 45, loops draw/erase on hover, settles back at frame 45 on leave. Static SVG fallback. |
| **Reduced motion** | Global `prefers-reduced-motion` override collapses all animation/transitions and forces reveal states visible. |

---

## 6. Components

### 6.1 Eyebrow (`.ea-eyebrow`)
Rule + tracked uppercase label. Variants: default (grey rule), `--accent`
(blue→violet gradient rule — standard for section headers), `--hero` (Tinted/100
rule + Tinted/300 text), `--invert` (for dark/gradient surfaces).

### 6.2 CTA button (`CtaButton.vue`, `.ea-cta`)
Pill, h-56 (sm: h-48). Variants: `primary` (animated gradient + shine),
`white` (on gradient banner), `white-stroke` (secondary on white). Props:
`label, href, variant, size, arrow, newTab`. Primary carries the Lottie arrow.

### 6.3 Pill tag (`.ea-pill`)
32px pill, `Tinted/25` fill + `Tinted/50` border, isologo + 12px medium label.
Used for membership/eligibility claims ("Free for qualifying traders").

### 6.4 Framed panel card (the "hardware" card)
Outer: `rounded-[20px] p-4`, panel-frame gradient (§2.3), soft drop shadow
`0 20px 40px -28px rgba(47,42,74,0.25)`. Inner: `rounded-xl border-2 border-white`
+ `bg-Tinted/25` (or `bg-white/70`). Used by: hero track-record panel,
"what traders kept paying for" card, checklists. This is the signature EasyAlgos
container for anything instrument-like.

### 6.5 Bento feature card (WhatYouGet)
6-col grid, cards span 2/3/4/6, `min-h-[254px]`, `border-2 border-Tinted/100`,
white or `Tinted/25` (tint ≈ every third card). Top row: index number
(`text-BLUE/BASE`, tracking 2px) + icon bubble. Bottom: 22px SemiBold title +
Roboto 16/26 body. Icon bubble: `.ea-feature-icon-bubble` (48px SVG-baked
gradient ring) with a 32px line icon (stroke `#51567A` 1.6, secondary detail
`#C9CCDD`, often dashed — see [public/icons/home/](public/icons/home)).

### 6.6 Metrics strip (KeyMetrics)
Full-bleed `Tinted/25` band with `border-y`; 2→4 hairline-divided cells.
Figure: Poppins Bold 40–44px, gradient text for emphasized values. Caption:
11px uppercase micro-label, max-w-15rem.

### 6.7 Quote cards (TestimonialsSection)
4-col grid. Featured (institutional) card: span 2, `bg-Tinted/25`, Poppins Medium
20–22px quote. Member cards: white, Roboto 16px quote. Footer: name (14px
SemiBold) + role micro-label. Pull-quote variant (ProblemSection): borderless,
`border-t` rule above, 22–26px Poppins Medium with one gradient accent.

### 6.8 Plan card (PricingSection)
White card `border-2 border-Tinted/100 rounded-2xl p-8`. Figure = **required
balance** (Poppins Bold 40px, tracking −1px), never a price. Caption micro-label,
Roboto desc, hairline-topped checkmark list (`bullet-checkmark.svg` 24px),
full-width CTA pinned bottom. Popular plan: wrapped in banner-gradient
`p-[2px] rounded-[18px]` frame, `shadow-pricing-card`, gradient "POPULAR" pill,
primary CTA (others get `white-stroke`).

### 6.9 Steps row (HowToJoin)
Single bordered `rounded-2xl` container, 3 hairline-divided cells. Index:
Poppins Bold 44px `Blue/600`. Only the first step carries a CTA.

### 6.10 Partners strip (PartnersStrip)
`Tinted/25` band, eyebrow "Powered by", text-only uppercase wordmarks
(14px SemiBold, tracking 0.14em, `Tinted/400`, hover → `Tinted/700`).

### 6.11 Charts (VerifiedGrowthChart / hero panel)
SVG, `preserveAspectRatio="none"`, viewBox 1200×440 (dark) / 560×300 (light).
Two-line thesis: gradient hero line (6px, glow filter) vs grey `#AEB2C9`
comparison line (4px); gradient wedge between = the cost of the alternative.
Reference ticks solved to sit exactly on the comparison curve (cubic-bezier
y-at-x bisection), labels in Poppins 12/500 tracking 1.5. Axis + legend rows:
`border-t-2 #332E43`, Poppins 14px SemiBold uppercase.
**Implementation note:** v-for'd SVG `<line>/<text>` with dynamic bindings break
Nuxt hydration (read-only `SVGAnimatedLength` props) — pre-render repeated
primitives to a deterministic markup string and inject with `v-html`.

### 6.12 Dark band (VerifiedResults)
Section + whole page flip to `Neutral/800` while the band is in the viewport's
central strip; content fades in with the flip; H2 forced `!text-white`, body
`Tinted/100`. Hosts exactly one chart.

### 6.13 Gradient banner (ClosingCta)
Full-width `.ea-cta-banner`, centered 800px column: white uppercase kicker
(tracking 0.25em), banner H2 with `Blue/Pale` sub-phrase, white body 18px at 85%,
white CTA + underline-on-hover textlink.

### 6.14 Header / Footer
Header: sticky, 68px, `bg-white/85 backdrop-blur`, hairline bottom; centered nav
with 20px underline-grow hover; Log in + sm primary CTA + flag button.
Footer: `Tinted/25`, 12-col (brand block spans 4 + four 2-col link columns),
Trustpilot row, award badge pills, EA collections in a 5-col block, then a white
disclaimer band (12px Roboto, `Tinted/400`).

---

## 7. Iconography & imagery

- **Feature icons**: 32×32 line icons, stroke 1.6 round-capped, primary `#51567A`,
  secondary `#C9CCDD` (dashes `4 8` or `4 4`). New icons must follow this recipe
  (see feature-07/08 for hand-drawn examples).
- **Bullets**: `bullet-checkmark.svg` (positive) / `bullet-hidden-costs.svg`
  (negative), 40px in framed panels, 24px in plan lists.
- **Logos**: partner logos as supplied PNGs at ~17–19px height, 70% opacity,
  separated by 4px dot markers. Never recolor partner marks.
- **No stock imagery.** Visual interest comes from data panels and charts.

---

## 8. Voice & editorial rules

- Institutional confidence, zero hype: "third-party-verified", "since 2017",
  "zero cost of access" — never "🚀 free money".
- Name the business model plainly (broker-compensated) — transparency *is* the pitch.
- Headlines state a thesis; the section proves it with an instrument or a list.
- Numbers do the persuading: `$0`, `0%`, `8+ yrs`, `25+`.
- Required-balance framing for plans ("$5,000 required account balance"), never
  price framing.

---

## 9. Figma migration map

| Code | Figma |
|---|---|
| §2 color tokens | Variables → collections `Tinted`, `Blue`, `Brand`, `Neutral`, `Semantic` (names match Tailwind keys) |
| §2.3 gradients | Styles → `Gradient/Text`, `Gradient/CTA`, `Gradient/Banner`, `Gradient/PanelFrame`, `Gradient/ChartDark`, `Gradient/ChartLight` |
| §3.1 type scale | Text styles → `H1/Hero`, `H2/Section`, `H3/Card`, `Lead`, `Body`, `Eyebrow`, `Micro`, `Metric`, `Quote` |
| §4 radii/shadows | Variables `radius/*`; effect styles `shadow/cta`, `shadow/panel`, `shadow/pricing` |
| §6 components | Components: `Button/CTA` (variant × size props), `Tag/Pill`, `Card/FramedPanel`, `Card/Feature`, `Card/Quote`, `Card/Plan`, `Strip/Metrics`, `Strip/Partners`, `Band/Dark`, `Banner/Gradient`, `Nav/Header`, `Footer` |
| §5 motion | Prototype notes per component (smart-animate 800ms, custom cubic ≈ ease-smooth) |

Existing library note: these tokens are already the EasyAlgos Figma library
values (verified against the IC Precision file's variables), so migration is
mostly *renaming/organizing*, not redrawing.
