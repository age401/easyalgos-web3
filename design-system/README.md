# EasyAlgos — Web Design System 2

Colour and typography for the marketing site and product surfaces.

**Figma library:** [EasyAlgos — Web Design System 2](https://www.figma.com/design/N9KYswH8G8z9T6wOoSMqLk/EasyAlgos---Web-Design-System-2)
· Overview · Colour · Typography · Tokens

| | |
|---|---|
| Colour primitives | 81 |
| Semantic tokens | 47 (Light + Dark) |
| Text styles | 18 |
| Paint styles | 4 gradients |
| Effect styles | 4 elevations |

## Files

| File | What it is |
|---|---|
| `tokens.json` | Source of truth, W3C Design Tokens format. Mirrors the Figma variables exactly. |
| `tokens.css` | Custom properties + the 17 `.ea-*` type classes. Import once, globally. |
| `tailwind.tokens.ts` | Theme fragment to merge into `tailwind.config.ts`. |

## The model

**Primitives** are raw values — `blue/600`, `font/size/xl`. They are published,
but they are the second choice: reach for a semantic token first and drop to a
primitive only where no role fits.

There are **two neutral ramps** and the split is intentional — do not "normalise"
one into the other.

- `neutral/*` is violet-tinted and carries light page chrome, body text and
  borders. It bottoms out at the wordmark ink `#0B1125`.
- `gray/*` is true neutral and owns the dark bands and footer, plus product
  screenshots, code surfaces, third-party embeds and monochrome media.

Known gap between them: a desaturated blue-grey like `#3E4153` (14% saturation)
fits neither — `neutral/*` runs at 25–28% and `gray/*` at 0%, so nothing lands
within ΔE 11. It stays a documented one-off on the role chips.

**Semantic tokens** are roles — `text/primary`, `bg/surface`, `action/primary`,
`feedback/danger`. They are the entire public API for colour, and every one
carries a Light and a Dark value.

**Styles** are the 17 text styles and 4 elevations, each bound to the primitives
underneath, so changing `font/size/xl` once moves everything that uses it.

Dark mode is a subtree attribute, not a parallel stylesheet:

```html
<section data-theme="dark" class="bg-canvas text-primary">…</section>
```

## Three rules

1. **Name the job, never the colour.** `text/secondary`, not `neutral/700`.
2. **12px is the floor for interface text.** Anything smaller is artwork inside a
   product screenshot and sits outside the system — that is what `font/family/data`
   (Rubik) is for.
3. **Leading and tracking follow the style, not the instance.** Don't set
   `leading-[26px]` on a paragraph; pick the style that already has it.

## What changed, and why

The system was distilled from the WEB3 home design and the Page Creator design
system. These are the mappings that change something — anything not listed is a
straight lowercase rename (`Tinted/400` → `neutral/400`, `Violet/800` → `violet/800`).

### Colour

| From | To | Why |
|---|---|---|
| `Neutral/*` (pure grey ramp) | `neutral/*` | Three ramps — `Tinted/*`, `Neutral/*`, `Ink/*` — were doing one job. One tinted neutral now. |
| `#171717` dark bands | `neutral/975` `#0B1125` | Dark surfaces become the wordmark ink. Warmer, and on-brand. |
| `Ink/950` `Ink/900` `Ink/800` | `neutral/975` `950` `900` | The v2 Ink ramp folds in. |
| `#205EFB` (`BLUE/BASE`) | `blue/600` `#285FF7` | Perceptually identical (ΔE ≈ 2). One blue. |
| `#BC78FF` `#A855F7` `PINK` | `brand/purple` `#B36DFF` | Three purples doing one job. |
| `#7373FF` (`Brand Mark/Mid`) | `brand/indigo-bright` `#7272FF` | One unit apart. |
| `#594BD7` (`Violet/550`) | `violet/700` `#5A50C9` | Same colour, two names. |
| `#F4F4FA` `#F4F5FB` `#F5F6FC` | `neutral/25` | Off-ramp near-whites. |
| `#A9B2C9` `#AAAFCD` | `neutral/300` | Strays next to `#AEB2C9`. |
| `#5D5D5D` `#F0F0F0` | `neutral/600` `neutral/50` | Left over from the pure-grey ramp. |
| `Indicators/*` · `rating/*` | `feedback/*` | Two parallel sets for one concept. |
| `Graph Segments` + `Highlights` (40) | `data/01`–`08` | Eight series is the practical limit anyone can tell apart. Soft variants come from 20% alpha. |

Two accessibility additions: `success/text` `#067A3C` (5.5:1 on white) and
`warning/text` `#B45309` (5.1:1). The fill greens and oranges are not text-safe,
and `metric/positive` needs to be.

### Type

The shipped page uses 20 distinct font sizes, several written twice in different
units. The ramp has 13.

| From | To | Note |
|---|---|---|
| `text-[10px]` `[11px]` `[13px]` | `text-xs` (12) | 12 is the floor for interface text. |
| `text-[15px]` `text-[0.9375rem]` | `text-sm` (14) or `text-base` (16) | Pick by role: label or prose. |
| `text-[22px]` | `text-xl` (24) | |
| `text-[44px]` | `text-4xl` (40) or `text-5xl` (48) | Or use `.ea-display-m`, which is fluid. |
| `text-[1rem]` `[1.25rem]` `[1.75rem]` `[2rem]` | `base` `lg` `2xl` `3xl` | Same sizes, written twice in two units. |
| `leading-[26px]` `[22px]` `[1.6]` … | ratio tokens | `leading-relaxed` = 1.6, `leading-normal` = 1.4. |
| letter-spacing absent | `tracking-tighter` … `widest` | The design tracks −1.8px at 64px; the old tokens had 0 everywhere. |

## Known gaps

Two things sit deliberately outside the system. Both were decided, not overlooked.

**Ecosystem role colours.** Six categorical identity colours — `#BC78FF` trader,
`#42DBE0` developer, `#00F070` broker, `#C9C2FF` vps, `#B1C4F1` community,
`#F1D8B1` analytics — stay as raw values. They are an identity set, not a state
set, so folding them into `feedback/*` would be wrong and folding them into
`data/*` would shift four of the six. If roles spread beyond the home page,
promote them to a `role/*` semantic group with these exact values rather than
remapping them.

**Prose weights.** `Roboto Medium`, `Roboto SemiBold` and `Roboto Bold` appear on
roughly 25 nodes of the home design. The system defines Roboto Regular for prose
and Poppins Medium for labels, so these have no mapping. Changing them means
changing families — which would alter the Trustpilot bar — so they were left
alone.

## Note on Figma line-height variables

Figma stores `LINE_HEIGHT` and `LETTER_SPACING` variables in **pixels only** — a
`160` there means 160px, not 1.6. Ratio-based leading therefore cannot be a Figma
variable. It lives in the text styles (which are Figma's typography token) and as
unitless ratios / `em` here. Don't reintroduce `font/leading/*` variables.
