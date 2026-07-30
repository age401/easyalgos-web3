# Frontend Stack & Conventions Guide (for AI building a sibling project)

> # ⚡ #1 OVERRIDING PRIORITY: PERFORMANCE
>
> **Performance is the single most important goal of this project, above everything else.**
> Every component and page you produce must be built to score as high as possible on
> **Lighthouse / PageSpeed** (Performance, and the Core Web Vitals: LCP, CLS, INP/TBT). When any
> two valid approaches conflict, **choose the faster one** — smaller bundle, less JS, less
> hydration, fewer requests, lighter DOM. This goal outranks convenience, abstraction, and
> "nice" code. Concretely it means: **hand-write components from HTML + Tailwind (no UI library),
> lazy-load everything below the fold, defer/dynamic-import heavy libs behind IntersectionObserver,
> ship minimal JS, optimize images (WebP, lazy, sized), and preload only critical fonts.** The
> detailed performance rules are in §13 — treat them as hard requirements, not suggestions.
>
> **This document is self-contained — it is the ONLY input you are given.** There is no repo
> to browse: everything you need (stack, tokens, the full `tailwind.config.js` and
> `assets/css/main.css`, the request/composable patterns, the base-component contracts) is
> inlined below. Never assume access to any other file.
>
> **Purpose.** This document fully describes the frontend stack, conventions, design
> tokens, request patterns and architecture of an existing **Nuxt 3** application
> (codename "EasyAlgos client"). A second project will be built **on top of the same
> infrastructure**. Components and pages you generate must be **copy-paste compatible**:
> the owner will move your `.vue` / `.ts` files into the existing project with **minimal
> or zero edits**.
>
> **Golden rule:** match this stack *exactly* — same package versions, same Tailwind
> tokens, same fonts, same composable architecture, same request layer, same i18n setup,
> same code style. Do **not** introduce new dependencies, new CSS frameworks, new state
> libraries, or different conventions unless explicitly told to.
>
> **Top priority — components are hand-written, NOT built from UI libraries.** Every component
> in this project is written by hand: plain semantic HTML + Tailwind utility classes + a little
> Composition-API logic. There is **no UI/component kit** (no Vuetify, PrimeVue, Element Plus,
> Naive UI, shadcn, Bootstrap, Material, Ant, etc.) and you must not add one. The reason is
> **performance**: hand-written markup ships the minimum HTML/CSS/JS, keeps the bundle tiny and
> hydration cheap, and lets us hit high Lighthouse/PageSpeed scores — a UI kit drags in styles,
> runtime and JS we don't need. The only allowed pre-built pieces are the headless/functional
> libs already in the stack (e.g. `@headlessui/vue` for accessible primitives, the carousel,
> charts, datepicker) — and even those are used sparingly. Build buttons, inputs, modals,
> dropdowns, tabs, tables, etc. yourself from the tokens and classes in this guide.
>
> **Reading note — project-local symbols.** This guide is a *description*, not a set of
> files to import. The code examples mention helpers/components that exist in the reference
> project but **will NOT exist in your build** (`CustomTransition`, `Skeleton`, `CustomBtn`,
> `formatAmount`, `currencyToSymbolMap`, `useDashboardAnalytics*`, …). Do **not** treat them
> as available imports. Treat them as **behavioral descriptions** (their API/behavior is
> spelled out in §8.1 and §6/§7): build equivalent primitives or inline the behavior, keeping
> the same prop API and the same emitted markup/classes so the result drops into the target
> project with minimal edits. The two source files reproduced verbatim in this
> doc are `tailwind.config.js` (§17) and `assets/css/main.css` (§18) — copy them as-is. The
> `public/fonts/*.woff2` binaries can't live in a text doc: they already exist in the target
> project (your components are ported *into* it), and their `@font-face` rules + paths are in
> §18 — so just reference the font families by their Tailwind class (`font-poppins`, etc.).
> Everything else is convention to reproduce.

---

## 1. Tech stack (exact versions — pin these)

Framework: **Nuxt 3.15+ / Vue 3** (Composition API only), **TypeScript 5.7**, strict mode.

```jsonc
// package.json — dependencies (replicate versions)
"@headlessui/vue": "^1.7.23",          // HEADLESS (unstyled) a11y behavior only — you still hand-style
"@nuxt/image": "^1.9.0",               // <NuxtImg> / <NuxtPicture>
"@nuxtjs/i18n": "^9.5.6",              // translations
"@nuxtjs/sitemap": "^7.2.10",
"@nuxtjs/tailwindcss": "^6.12.2",      // Tailwind v3 (NOT v4)
"@stefanobartoletti/nuxt-social-share": "^1.2.3",
"@vuelidate/core": "^2.0.3",           // form validation
"@vuelidate/validators": "^2.0.4",
"@vuepic/vue-datepicker": "^11.0.1",   // date picker (must be transpiled, see build.transpile)
"@vueuse/core": "^13.9.0",
"@vueuse/nuxt": "^13.5.0",             // useIntersectionObserver, useWindowSize, etc.
"apexcharts": "^5.12.0",               // charts (analytics)
"vue3-apexcharts": "^1.11.1",
"chart.js": "^4.4.8",                  // some legacy charts
"chartjs-adapter-date-fns": "^3.0.0",
"countries-list": "^3.1.1",
"dayjs-nuxt": "^2.1.11",               // date formatting (locales en/de/es/pt, customParseFormat)
"lucide-vue-next": "^0.577.0",         // inline icon components
"numeral": "^2.0.6",                   // number formatting
"nuxt": "^3.15.1",
"nuxt-calendly": "^0.1.21",
"nuxt-gtag": "^3.0.2",                 // Google Analytics (manual init)
"nuxt-lazy-hydrate": "^1.0.0",         // <NuxtLazyHydrate> for perf
"nuxt-lodash": "^2.5.3",               // auto-imported lodash with `_` prefix
"nuxt-typedjs": "^1.2.0",
"pdfjs-dist": "^5.5.207",
"vue3-carousel-nuxt": "^1.1.4",        // carousels
"vue3-lottie": "^3.3.1",               // Lottie animations (lazy-loaded)
"vue3-marquee": "^4.2.2",

// devDependencies
"autoprefixer": "^10.4.20",
"cssnano": "^7.0.6",                   // CSS minify via postcss
"gsap": "^3.14.2",                     // animations (dynamic import + IntersectionObserver)
"lightningcss": "^1.29.1",
"postcss": "^8.4.49",
"typescript": "^5.7.2",
"vue-tsc": "^2.2.0"
```

Do not add a state manager (no Pinia/Vuex) — state lives in `useState` composables (§7).
Do not add axios — requests go through Nuxt `$fetch` (§6).

---

## 2. Project structure

```
client/
├── assets/css/main.css        # @font-face + Tailwind layers + global utility classes
├── components/                # auto-imported (see component naming below)
│   ├── landing/  developer/  ea/  marketplace/  new-dashboard/  auth/  ...
├── composables/               # auto-imported use*.ts (the architecture core, §7)
├── data/                      # static TS data (products, etc.); data/temp = scratch (gitignored)
├── i18n/locales/              # en.json de.json es.json pt.json
├── layouts/                   # landing / dashboard / new-dashboard / auth / funnel / ...
├── middleware/                # route middleware (auth.ts, redirect.client.ts, ...)
├── pages/                     # file-based routing
├── plugins/                   # useApi.ts ($api), useNotify.ts, *.client.ts
├── public/                    # ALL static assets (fonts, icons, img, animations, videos, js)
│   ├── fonts/    *.woff2
│   ├── icons/    *.svg  (+ subfolders: ea, dashboard, new-dashboard, country-flags, ...)
│   ├── animations/ <module>/*.json   (Lottie)
│   ├── img/  videos/  banners/  downloads/  js/
├── server/api/                # Nitro server routes (proxy/caching layer, §6.4)
├── types/                     # *.ts type defs (analytics, dashboard, product, research, ...)
├── utils/                     # auto-imported helpers (format, brokers, score, error-handler)
├── nuxt.config.ts
├── tailwind.config.js
├── i18n.config.ts
└── tsconfig.json
```

---

## 3. Code style (mandatory — match exactly)

- **Indentation: 4 spaces** for every file in `/client` (`.vue`, `.ts`, `.js`, `.css`).
- **Vue 3 `<script setup lang="ts">` only.** No Options API. No `defineComponent`.
- **Auto-imports** — do **NOT** import `ref`, `computed`, `watch`, `onMounted`, `useState`,
  `useFetch`, `useRoute`, `navigateTo`, etc. Nuxt provides them globally. Same for
  composables in `composables/` and helpers in `utils/` and components.
- **Styling: Tailwind utility classes inline only.** No `<style>` blocks, no `scoped` CSS,
  no CSS-in-JS. Shared/repeated patterns go as utility classes in `assets/css/main.css`
  (see §5.4). The only exception in the repo is dynamic `v-html` content styled via the
  global `.dp`/`.research-article` classes.
- **Straight ASCII quotes only** in code (`'` `"`), never typographic/curly quotes
  (`’ “ ”`). This applies to template text, JS strings and JSON locale files.
- **No abbreviated variable names** — use full descriptive names (`performancePromise`,
  not `pba`/`tmp`/`cfg`).
- **lodash** is auto-imported with `_` prefix: `_debounce(...)`, `_cloneDeep(...)`.
  `string`-named methods are NOT prefixed; `debounce` is aliased to `debounce` too.
- TypeScript is strict but `noImplicitAny: false`. Type checking runs on build
  (`typescript.typeCheck: true`).
- **Path aliases** (`tsconfig.json`): both `~` and `@` map to the `client/` root
  (`"~": ["."]`, `"~/*": ["./*"]`, `"@": ["."]`, `"@/*": ["./*"]`). So non-auto-imported files
  are referenced as `~/utils/foo` or `@/types/bar`. `tsconfig.json` itself
  `extends "./.nuxt/tsconfig.json"` (Nuxt-generated) — keep that.
- Comments: terse, in English, only where logic is non-obvious (see the composable
  examples in §7 — that comment density is the house style).

---

## 4. Fonts — how they are wired

Four families, all self-hosted as **`.woff2`** under `public/fonts/` (never Google Fonts CDN).

**Step 1 — declare faces** in `assets/css/main.css` (top of file), `font-display: swap`:

```css
@font-face { font-display: swap; font-family: 'Poppins'; font-style: normal; font-weight: 400; src: url('/fonts/poppins-latin-400.woff2') format('woff2'); }
/* …weights 500/600/700 for Poppins; 400/500/600/700 for Rubik; 400/500/700 for Roboto; 700 for Inter */
```

Available weight files in `public/fonts/`:
`poppins-latin-{400,500,600,700}.woff2`, `rubik-latin-{400,500,600,700}.woff2`,
`roboto-latin-{400,500,700}.woff2`, `inter-latin-700.woff2`.

**Step 2 — preload the critical faces** in `nuxt.config.ts → app.head.link` (only the
above-the-fold ones — Poppins 600/700 + Roboto 400):

```ts
{ rel: 'preload', as: 'font', href: '/fonts/poppins-latin-600.woff2', type: 'font/woff2', crossorigin: 'anonymous' },
{ rel: 'preload', as: 'font', href: '/fonts/poppins-latin-700.woff2', type: 'font/woff2', crossorigin: 'anonymous' },
{ rel: 'preload', as: 'font', href: '/fonts/roboto-latin-400.woff2',  type: 'font/woff2', crossorigin: 'anonymous' },
```

**Step 3 — Tailwind family aliases** (`tailwind.config.js → theme.extend.fontFamily`).
Note the historical alias names — **use these class names in templates**:

| Tailwind class | Actual font | Usage |
|---|---|---|
| `font-poppins` | Poppins | headings, titles, buttons (default body font) |
| `font-franklin` | **Roboto** (alias name is "franklin") | body / subtitles / paragraphs |
| `font-rubik`   | Rubik | dashboard UI, auth screens |
| `font-inter`   | Inter | occasional accents |

Global default: `html, body { @apply font-poppins; }` (set in `main.css @layer base`).
Extra weights: `font-book` (400) and `font-medium` (500) are registered in `fontWeight`.

---

## 5. Tailwind — the design system (this is the heart of copy-paste compatibility)

Tailwind **v3** (NOT v4). Config: `tailwind.config.js`. PostCSS pipeline: `cssnano` + `autoprefixer`.

### 5.1 Custom breakpoints — **DO NOT use default `sm/md/lg/xl/2xl`**

```js
screens: {
    mobile:        '360px',
    tablet:        '600px',
    'tablet-md':   '800px',
    'tablet-wide': '1024px',
    desktop:       '1280px',
    'desktop-md':  '1600px',
    wide:          '1920px',
}
```

Use them as prefixes: `tablet:flex`, `tablet-md:text-3.5xl`, `desktop:grid-cols-2`.
For one-off widths, arbitrary min-width queries are used too: `min-[800px]:...`.

### 5.2 Color palette (slash-named tokens — quote them in JIT: `text-BW/08`, `bg-Blue/600`)

Full Tailwind default palette is spread in first (`...colors`), then these brand tokens:

```
VIOLET            #4134BC      VIOLET/100..800  (E4E0FF → 4134BC ramp)
PURPLE            #8B7EFF      EXTRA-PURPLE     #8B23FE      PINK #B36DFF
BLUE/BASE         #205EFB      BLUE/00..06      (F1F4F9 → 074CFB ramp; +/20 +/40 alphas)
BW/00..09         white → near-black grayscale (00=#FFFFFF … 08=#1E1E1E, 09=#222128)
Neutral/100..800  E5E5E5 → 171717
Tinted/25..950     F7F7FB → 1C1833 (the new-dashboard surface ramp)
Green/10..200      F0FDF4 / ADEBC5 / 00DB63 / 00BA38   (profit/up)
Red/10..200        F1B1B1 / FEF2F2 / FF1519 / DC2626    (loss/down)
Blue/25..600       F5F8FF → 285FF7 (the "new" blue ramp used in new-dashboard)
Orange/100 #FB951E   Gray/200 #787878
error #F04438   WARNING #FF3437   dark-title #2E2E2E
```

> Two parallel blue systems exist: **legacy** `BLUE/0x` (uppercase, landing pages) and
> **new** `Blue/xxx` (mixed-case, new-dashboard). Match whichever the page you're cloning uses.

### 5.3 Other extended tokens

- **Gradients** (`backgroundImage`): `bg-blue-gradient` (+`-hover`/`-active`),
  `bg-blue-purple-gradient`, `bg-black-gradient` (+hover/active).
- **Shadows** (`boxShadow`): `shadow-primary`, `shadow-secondary`, `shadow-dropdown`,
  `shadow-notify`, `shadow-dashboard`, `shadow-pricing-card`, `shadow-card-m`, etc.
- **Radius**: `rounded-1.5xl` (.875rem), `rounded-2.5xl` (1.25rem), `rounded-4xl` (2rem),
  `rounded-5xl` (2.5rem).
- **fontSize extras**: `text-xl` (1.3125rem — overridden!), `text-3.5xl` (2rem),
  `text-3.6xl`, `text-4.5xl`, `text-6xl` (4rem).
- **lineHeight extras**: `leading-4.25`, `leading-4.5`, `leading-5.5`, `leading-11`,
  `leading-13/14/15/20`.
- **spacing extras**: `6.5`, `13`, `15`, `21`, `25`, `29`.
- **keyframes/animation**: `animate-fadeIn`, `animate-fillBlue`, `animate-hideElement`,
  `animate-icon-steps`, `animate-edgardPulse`.
- **transition**: `ease-smooth` (`cubic-bezier(.22,.61,.36,1)`), `duration-{300,500,600}`,
  `delay-{360,420}`.
- Custom utility plugin: `.contents { display: contents }`.

### 5.4 Pre-built component utility classes (in `main.css @layer utilities`)

Reuse these instead of re-styling — they guarantee visual parity:

- **Layout**: `.base-container`, `.new-base-container` (max-width + responsive padding),
  `.centered` (`flex items-center justify-center`).
- **Buttons**: `.blue-btn`, `.black-btn`, `.outline-btn`, `.dark-blue-btn`, `.violet-btn`,
  `.violet-outline-btn`, `.grey-btn`, `.dashboard-white`, and the new-dashboard family
  `.new-blue-btn` / `.new-transparent-btn` / `.new-red-btn` / `.new-transparent-blue-border-btn`
  with size modifiers `.new-btn--xs` / `.new-btn--md` / `.new-btn--lg`. Each has a
  `.disabled` variant. Add `class="blue-btn disabled"` to disable.
- **Titles**: `.landing-section-title` / `.landing-section-sub-title`,
  `.new-landing-section-title` / `.new-landing-section-subtitle`,
  `.website-page-title` / `.new-website-page-title` (+subtitle), `.auth-title` / `.auth-sub-title`,
  `.affiliate-title` / `.affiliate-subtitle`.
- **Scrollbars**: `.custom-scroll`, `.new-custom-scroll`, `.new-dashboard-custom-scroll`
  (+`--py`), `.new-dashboard-custom-horizontal-scroll`, `.hide-scrollbar`, `.select-scroll`,
  `.dashboard-select-scroll`.
- **Text gradients**: `.linear-gradient-text`, `.gradient-blue-and-purple-text`.
- **Dynamic HTML** (v-html, e.g. CMS/research articles): wrap in `.research-article` or `.dp`.

### 5.5 Vue `<Transition>` names (defined globally in `main.css`, outside layers)

`fade`, `fade-delayed`, `skeleton`, `slide`, `shift-fade`, `shift-fade-top`, `accordion`,
`modal`, `modal-fade`. Use as `<Transition name="skeleton">`. **Skeleton-first pattern:**
when loading, render the skeleton inside `<Transition name="skeleton">` first, resolve it,
then swap to chart/data. Caveat: never put a `Skeleton` component *directly* inside a
`<transition>` (its `animate-pulse` never fires `animationend` → it hangs) — wrap it in a
plain `<div>`.

---

## 6. Backend requests — the data layer

The backend is a separate **Laravel 11 / Sanctum** API. The frontend talks to it three ways.
**There is no axios.** Everything is Nuxt `$fetch`.

### 6.1 `$api` — the authenticated client (default for dashboard/user requests)

Defined in `plugins/useApi.ts`, injected as `nuxtApp.$api`. It is a `$fetch.create()` instance:

- `baseURL = <runtimeConfig.public.baseUrl origin>/api`
- `credentials: 'include'` (cookie session — Sanctum SPA auth)
- Headers: `Accept: application/json`, `Referer`.
- **CSRF**: on `POST/PUT/PATCH/DELETE` it reads the `XSRF-TOKEN` cookie and sends it as
  `X-XSRF-TOKEN`. On a `419` it re-hits `/csrf-cookie` and the caller retries.
- **Auth redirect**: on `401` it `navigateTo('/auth/signin')` (or affiliate signin).

Usage inside a composable:

```ts
const nuxtApp = useNuxtApp();
const data = await nuxtApp.$api('/performance-metrics', {
    method: 'POST',
    body: { period: periodValue.value },
});
```

> Scope (which trading account/license) is carried by the **server session**, NOT by the
> request body — do **not** send `license_id` to the backend; account activation endpoints
> set the active scope server-side.

### 6.2 `useNativeFetch<T>(path, opts)` — thin typed wrapper (composables/useNativeFetch.ts)

For simple typed `$fetch` calls against the same `/api` base (no CSRF/redirect logic):

```ts
const res = await useNativeFetch<MyType>('/some-endpoint', { method: 'GET' });
```

### 6.3 `$fetch('/api/...')` direct — for the Nitro server proxy routes (§6.4)

```ts
const data = await $fetch<MyType>('/api/widget-statistics');
```

### 6.4 Nitro server routes (`server/api/*.ts`) — caching/proxy layer

Public, cacheable, SEO/widget data is proxied through Nuxt's own server (`server/api/`)
and cached via `routeRules` in `nuxt.config.ts`:

```ts
routeRules: {
    'api/ea-stats':         { cache: { swr: false, maxAge: 3600 } },
    'api/research-articles':{ cache: { swr: true,  maxAge: 3600 } },
    // dashboards are client-only + noindex:
    '/new-dashboard/**':    { ssr: false, robots: false },
    '/auth/**':             { ssr: false, robots: false },
}
```

Use this tier for anonymous, cacheable content. Use `$api` for per-user authenticated data.

### 6.5 Errors / notifications

- `unAuthorizedErrorHandler` lives in `utils/error-handler.js` — call it in `catch`.
- A global notify plugin (`plugins/useNotify.ts`) provides toast notifications.

---

## 7. Composable architecture (THE pattern — replicate it precisely)

Business/data logic lives in `composables/use*.ts`, **never inside components**. Components
are thin: they call a composable and render. This is the single most important convention
for copy-paste compatibility.

### 7.1 Two established patterns

**(A) Simple DOM-effect / entrance composable** — takes a `Ref<HTMLElement|null>`, manages
its own lifecycle, returns reactive state or void. Reference files:
`useSectionHeaderEntrance.ts`, `useHeroRocksAnimation.ts`.

```ts
export function useSectionHeaderEntrance(el: Ref<HTMLElement | null>) {
    const visible = ref(false);
    let observer: IntersectionObserver | null = null;
    onMounted(() => { /* set up IntersectionObserver on el.value */ });
    onBeforeUnmount(() => { observer?.disconnect(); });
    return { visible };
}
```

**(B) SSR-shared data composable** — `useState` + module-level in-flight guard + `watch`.
This is the canonical pattern for anything that fetches from the backend. Reference files:
`useDashboardAnalyticsPerformance.ts`, `useWidgetStatistics.ts`, `useDashboardAnalyticsAccounts.ts`.

```ts
// composables/useExampleMetric.ts — COPY THIS SHAPE
interface ExampleMetric {
    value: number;
    label: string;
}

// Module-level in-flight guard: collapses duplicate requests fired in the same tick
// when several component instances consume this composable.
let metricPromise: Promise<ExampleMetric | null> | null = null;
let metricPromiseKey: string | null = null;

export function useExampleMetric() {
    const nuxtApp = useNuxtApp();
    // Shared scope (account/period/refresh signal) comes from one source-of-truth composable:
    const { accountValue, periodValue, scopeRefreshKey } = useDashboardAnalyticsAccounts();

    // useState => shared across SSR and every component instance on the page.
    const metric  = useState<ExampleMetric | null>('example-metric', () => null);
    const pending = useState<boolean>('example-metric-pending', () => false);

    async function loadMetric() {
        if (!accountValue.value) { metric.value = null; return; } // skip empty initial fire
        const key = `${accountValue.value}:${periodValue.value}:${scopeRefreshKey.value}`;
        if (!metricPromise || metricPromiseKey !== key) {
            metricPromiseKey = key;
            metricPromise = nuxtApp.$api('/example-metric', {
                method: 'POST',
                body: { period: periodValue.value },
            });
        }
        pending.value = true;
        try { metric.value = await metricPromise; }
        finally { metricPromise = null; metricPromiseKey = null; pending.value = false; }
    }

    // Client-only watch; immediate:true covers first mount. Watch the period + refresh
    // signal, not the account directly (account switch is funneled through scopeRefreshKey
    // after the activation request resolves).
    if (import.meta.client) {
        watch([periodValue, scopeRefreshKey], () => { void loadMetric(); }, { immediate: true });
    }

    return { metric, pending, refreshMetric: loadMetric };
}
```

Key rules of pattern (B):
- State is `useState('unique-key', () => initial)` — globally shared, SSR-safe. Pick unique keys.
- A **module-level promise guard** (`xxxPromise` + `xxxPromiseKey`) dedupes concurrent calls
  from multiple component instances mounting in the same tick.
- Fetches are **client-gated** (`if (import.meta.client)`) when they depend on a session/cookie.
- A page = a thin "assembler" that drops in self-sufficient block components. **The page does
  NOT fetch and does NOT pass data via props.** Each block calls its own composable.
- A single **source-of-truth composable** holds shared filter state (selected account, period,
  a `scopeRefreshKey` number bumped to trigger refetch). Other composables import it and
  `watch` its signals.

### 7.2 Data-heavy dashboard architecture (full rule set — inlined, reproduce this shape)

When a screen has a **shared scope** (e.g. a selected account + a time period) feeding many
independent data blocks, build it with the rules below. This is the project's proven analytics
architecture, abstracted to principles — apply it to any equivalent dashboard.

**A. Single source-of-truth composable for the scope.** One composable (e.g.
`useDashboardAccounts`) is the *only* owner of the shared scope, all in `useState` (shared across
SSR and every instance). It exposes:
- the selector models (account filter, period filter) and their resolved values
  (`accountValue`, `periodValue`);
- `scopeRefreshKey: useState<number>` — the **single "scope changed, refetch" signal**, bumped
  after an account is activated and after a manual refresh completes;
- `scopeRefreshing: useState<boolean>` — true during phase 1 of a manual refresh (see C);
- `refreshScope()` — the manual-refresh action (two phases, see C), deduped by a module promise;
- account activation logic (see C). Don't spawn a second scope state anywhere — every block reads
  from this one.

**B. Canonical block-data composable — the 8 mandatory elements** (this is pattern B of §7.1,
stated as hard rules):
1. State in `useState` with a unique string key (`dashboard-<name>` / `dashboard-<name>-pending`).
2. A **module-level in-flight guard** (`xxxPromise` + `xxxPromiseKey`, key = `account:period:refresh`)
   that collapses duplicate requests fired in the same tick by multiple instances.
3. **Early-return while the account is unresolved** (e.g. licenses still loading) — set
   `data = null` and skip the fetch, so the first empty fire never goes out.
4. **`watch([periodValue, scopeRefreshKey], load, { immediate: true })` under `import.meta.client`.**
   **Do NOT put `accountValue` in the watch** — account changes arrive via `scopeRefreshKey` (see C);
   watching the account directly starts the fetch before activation resolves → a race that returns
   the *old* account's data. `accountValue` is read only *inside* `load()` (early-return + guard key).
5. Requests go through **`nuxtApp.$api`** directly (Sanctum cookies + baseURL, §6.1).
6. **Never send the account id in the body.** The active account is resolved server-side from the
   session; the id is sent ONLY to the activation endpoint on account change. Scope-request bodies
   carry only `{ period }` (or nothing).
7. Return `pending` wrapped by a scope-aware helper (see E), not the raw ref.
8. **A block's composable is called ONLY from that block's component.** Its `watch` is bound to the
   caller's lifecycle and auto-stops on unmount — so the block fetches only while it is on screen
   (see D). Never register a block's watcher in the shared scope composable or in a layout.

> If one block needs several endpoints behind a toggle (e.g. profit/balance), don't load them all
> up front: take the mode as a reactive param, give each endpoint its own guard + `*LoadedKey`, and
> in `watch([mode, periodValue, scopeRefreshKey])` load only the active mode. The inactive endpoint
> loads lazily on first switch.

**C. Reactivity / refresh model** — the key invariant is **"activate on the backend first, fetch
blocks second."** So account changes are NOT watched by blocks directly; they flow through
`scopeRefreshKey`:
- **Account change:** `watch(accountValue)` in the scope composable → `POST /activate-connection
  { connection_id }` → and only in the response's `.then` (never earlier) `scopeRefreshKey++`. All
  dependent blocks (mounted ones) then refetch against the now-active session. (Why: if blocks
  watched `accountValue`, their requests would fire in the same tick as activation, in parallel,
  before it resolves → the session-scoped backend returns the old account's data.)
- **Period change:** blocks watch `periodValue` directly — no activation needed.
- **Manual refresh button (two phases, no re-activation):**
  - *Phase 1 — backend recompute:* `scopeRefreshing = true`; call the recompute endpoint (e.g.
    `GET /update-all-statistic`). Deduped by a module promise so rapid clicks / multiple consumers
    fire it once.
  - *Phase 2 — refetch:* `scopeRefreshKey++` in `finally` — **after the response, success OR
    error** (a failed recompute must not block the refetch). All dependents refetch.

**D. A block's requests live only while the block is mounted.** `scopeRefreshKey` is shared, but
the *watchers* on it are not — each lives in a block composable called only from that block's
component (rule B.8), so its `watch` stops on unmount (`keepAlive` is not used). Consequence: a
scope change on subpage X bumps `scopeRefreshKey`, but a block that only exists on subpage Y does
**not** fire — its watcher isn't mounted; it refetches via `{ immediate: true }` when you navigate
back and it remounts. This is how you avoid firing requests for blocks not on the current page:
keep the watcher in the block composable, never in shared/layout code. (Same principle for a
balance/summary call: put it in its own composable consumed only by bars that actually show it, so
it doesn't fire on screens that don't.)

**E. Scope-aware loading (skeleton-through-refetch).** A helper
(`useScopeLoading(blockPending)` → `computed(() => blockPending.value || scopeRefreshing.value)`)
wraps every block's pending. Each block returns this computed (not the raw ref) so its skeleton
stays visible continuously across BOTH refresh phases (phase 1 = `scopeRefreshing`, phase 2 = the
block's own `pending`). The handoff is flicker-free: on `scopeRefreshKey++` the block watchers set
their own `pending=true` before the refresh `.finally` clears `scopeRefreshing` (Vue flush-job
ordering). Render skeleton first, swap to data after (§5.5).

**F. New subpage checklist:** (1) page = grid + blocks only, no data fetching, no data props;
(2) blocks are components with meaningful `<Page><Block>` names; (3) data in a per-block composable
per B; (4) scope read ONLY from the source-of-truth composable; (5) Tailwind + custom breakpoints,
no `<style>`; (6) 4-space indent, `<script setup lang="ts">`, auto-imports; (7) text via `$t()`;
(8) heavy libs (charts/Lottie) behind `ClientOnly` + a fallback skeleton.

**G. Endpoint conventions:** scope endpoints are `POST` with body `{ period }` or empty; a couple
of reads (`/user-licenses`, the recompute) are `GET`; "empty" (no active account / no data) comes
back as `[]`. The account id goes only to the activation endpoint, never to scope requests.

---

## 8. Components — naming, auto-import, lazy loading

- Components in `components/` are **auto-imported by path-derived PascalCase name**. A file at
  `components/landing/NewHero.vue` is used as `<LandingNewHero />` (folder prefix + filename),
  EXCEPT folders configured with `pathPrefix: false` (`components/dashboard`,
  `components/affiliate-dashboard`) whose components are used by bare filename.
- **Lazy hydrate / lazy load for perf**: prefix with `Lazy` to defer the JS chunk
  (`<LazyLandingHiw />`), and/or wrap heavy below-the-fold blocks in `<NuxtLazyHydrate :when-idle>`
  / `:when-visible`. The landing page lazy-loads nearly every section this way.
- **Heavy libs** (Lottie via `vue3-lottie`, GSAP) must be **dynamically imported behind an
  IntersectionObserver** — never eagerly in the top-level bundle (Hero modules are the only
  allowed eager exception).
- A typical component header:

```vue
<script setup lang="ts">
interface Props {
    title: string;
    variant?: 'blue' | 'violet';
}
const props = withDefaults(defineProps<Props>(), { variant: 'blue' });
const emit = defineEmits<{ (e: 'select', id: number): void }>();
const { metric, pending } = useExampleMetric();   // composable holds the logic
</script>

<template>
    <section class="new-base-container">
        <h2 class="new-landing-section-title">{{ $t('example.title') }}</h2>
        <!-- 4-space indent, inline Tailwind only, custom breakpoints -->
    </section>
</template>
```

---

### 8.1 Base UI primitives — described, not imported

The reference project ships a layer of reusable base components (single-word or `Custom*` /
`Dashboard*` / `New*` names, auto-imported). **Your build won't have them** — reproduce
equivalents with the **same prop API and the same class output** so ported markup matches.
Below is the contract (props → behavior) of the ones that show up in examples and that any
form/dashboard UI will need. Re-create them once in your project and reuse them.

- **Transition wrapper** (ref name `CustomTransition`): thin wrapper around Vue `<Transition>`.
  Props: `name: 'fade' | 'slide' | 'accordion' | 'modal' | 'skeleton' | 'modal-fade'`
  (default `'fade'` — these transition classes live in `main.css`, §5.5/§18), `appear: boolean`
  (default `true`), `transitionEnabled: boolean` (default `true`; when `false` the transition is
  disabled, used to suppress per-item animation in long lists for perf). Single child only.
  *Substitute:* a plain `<Transition name="skeleton">` works identically since the CSS is shared.

- **Skeleton** (`Skeleton`): pulsing placeholder block. Props: `height` (Tailwind class,
  default `'h-3'`), `width` (default `'w-32'`), `className` (string|object). Renders a
  `bg-…/rounded animate-pulse` `<div>`. **Gotcha:** never place it *directly* inside a
  `<transition>` — wrap in a plain `<div>` (its `animate-pulse` never fires `animationend`).

- **Button** (`CustomBtn`): props `label: string`, `type: 'button'|'submit'|'reset'`
  (default `'button'`), `variant: 'primary'|'outline'|'icon'|'black'|'dashboard-white'|'grey'|'dark-blue'|'violet'|'violet-outline'`
  (default `'primary'`), `disabled: boolean`. Each `variant` maps to the matching `main.css`
  button class (`primary`→`.blue-btn`, `outline`→`.outline-btn`, `black`→`.black-btn`,
  `violet`→`.violet-btn`, etc.; `disabled` adds the `.disabled` modifier). The newer
  new-dashboard buttons use the `.new-*-btn` + `.new-btn--{xs,md,lg}` classes directly in markup.

- **Text input** (`CustomInput`): floating-label input. Props include `label`,
  `type: 'text'|'password'|'number'|'calendar'|'email'`, `modelValue` (v-model), `name`,
  `validation` (a Vuelidate field object), `variant: 'default'|'landing'`, `disabled`,
  `placeholder`. Emits `togglePasswordVisibilityHandler`. Validation is **Vuelidate**
  (`@vuelidate/core` + `@vuelidate/validators`) — that's the form-validation convention.

- **Select / dropdown** (`CustomSelect`): props `label`, `options` (array of `{label,value,…}`),
  `modelValue`, `type: 'select'|'dropdown'|'dashboard'|'phoneCode'|'market-forecast-select'|'multiple'`,
  `position: 'top'|'bottom'`, `disabled`. `'multiple'` is a multi-select with chips. Dashboard
  variants (`DashboardSelect`, `DashboardDropdown`, `DashboardMultiDropdown`) are the
  new-dashboard styling of the same idea.

- **Modal** (`CustomModal` / `NewCustomModal`): props `modelValue`/`isOpen` (boolean),
  `type: 'default'|'small'|'video'|'imageViewer'|'funnel'|'marketing'|'textReview'`. Uses the
  `modal` / `modal-fade` transition. Teleports to body, traps scroll.

- **Checkbox / Radio** (`CustomCheckbox`, `CustomRadio`): `label`, `modelValue`,
  `type: 'default'|'multiple'`, `validation`.

- **Icons** (`SvgIcon`): renders an inline `<svg>` from a `name` key out of an internal map of
  raw path strings, color-driven by currentColor/props (used for the help-center / nav icon set).
  This is the pattern for **inline, recolorable** icons that aren't from lucide. For one-off
  static icons, reference the SVG by URL (`/icons/...`, §9); for general colorable icons use
  `lucide-vue-next` (§9). Pick whichever the cloned screen uses.

- **Other reusable primitives present** (recreate as needed, same idea): `CustomTable`,
  `CustomPagination` / `NewCustomPagination`, `CustomDatepicker` (wraps `@vuepic/vue-datepicker`),
  `CustomTextarea`, `CustomDragAndDrop`, `CustomLoader` / `CustomLineLoader`, `CustomNotification`
  (toasts, driven by the `useNotify` plugin), `Countdown`, `VideoPlayer`, `ImageViewer` /
  `NewImageViewer`, `Popup`, `CookieBanner`, `TickerMessage`, the `ProductCard*` family,
  `RenderComponentLazy` (perf-deferred render).

**Helper utilities referenced in examples** (in `utils/`, auto-imported — reproduce the behavior):
- `formatAmount(n)` — formats a number as a grouped money string (thousands separators, fixed
  decimals).
- `currencyToSymbolMap` — a `Record<currencyCode, symbol>` map (e.g. `'USD' → '$'`).
- A source-of-truth composable (`useDashboardAnalyticsAccounts`) holding shared scope state
  (selected account, period, a `scopeRefreshKey` bumped to trigger refetch). Per-block data
  composables import it and `watch` its signals — see §7 for the full pattern. Reproduce one
  such shared-state composable per app rather than threading state through props.

> The rule of thumb: your generated component's **template/markup and class names** should be
> identical to what the target project expects; the helper/component *identifiers* it calls are
> conventions described here, to be re-created on your side (or resolved on port-in).

---

## 9. Images, icons, media

- **All static assets live in `public/`**, never in `assets/` (only `assets/css/main.css` lives there).
- **Raster images**: use `<NuxtImg>` (from `@nuxt/image`) with `loading="lazy"`, prefer WebP,
  set explicit `width`/`height`. Above-the-fold LCP image may use `fetchpriority="high"`;
  everything else `loading="lazy"` + `fetchpriority="low"`.
- **SVG icons (static)**: stored under `public/icons/` (with subfolders: `ea/`, `dashboard/`,
  `new-dashboard/`, `country-flags/`, `currencies/`, `brokers/`, `developers-page/`, …).
  Referenced by URL in `<img>` / `<NuxtImg>` `src="/icons/foo.svg"` or as CSS
  `background: url('/icons/...')`. Example tokens already present: `/icons/close_icon.svg`,
  `/icons/bell.svg`, `/icons/new-dashboard/search.svg`, `/icons/google_icon.svg`.
- **Inline/colorable icons**: use **`lucide-vue-next`** components, e.g.
  `import { Bell } from 'lucide-vue-next'` → `<Bell class="w-5 h-5 text-Tinted/900" />`
  (used in `new-dashboard/SidebarItem.vue`, `AnnouncementBanner.vue`).
- **Lottie**: JSON files under `public/animations/<module-name>/`, played via `vue3-lottie`
  (dynamic import + IntersectionObserver).
- Long-term cache headers are set in `nuxt.config.ts` for `/icons/**`, `/img/**`, `/fonts/**`,
  `/animations/**`, `/videos/**`, `/_nuxt/**`.

---

## 10. i18n (translations)

- Module: `@nuxtjs/i18n` v9, **`strategy: 'no_prefix'`** (deliberate — single-URL, no
  `/de/` path segments; do NOT propose a multilingual-SEO/prefixed-route migration).
- `defaultLocale: 'en'`, browser detection disabled (always defaults to `en`).
- Locale files: **`i18n/locales/{en,de,es,pt}.json`**. When you add a key, add it to **ALL
  four** files (translated). Config is `legacy: false` (Composition API i18n).
- In templates use `$t('namespace.key')`; in script use `const { t } = useI18n()`.
- **No hard-coded user-facing text** in templates — every string goes through `$t()` with a
  matching key in all locale JSONs. Keep keys namespaced by feature.
- Keep straight ASCII quotes in JSON values. Brand terms stay literal and **untranslated**
  (e.g. product/brand names like "AlgoScore").
- `dayjs` is configured for locales `en/de/es/pt` with `customParseFormat`.

---

## 11. Layouts, middleware, routing

- **Layouts** (`layouts/`): `landing`, `dashboard`, `new-dashboard`, `auth`, `funnel`,
  `help-center`, `onboarding`, `new-onboarding`. A page selects one via
  `definePageMeta({ layout: 'new-dashboard' })`. Shared per-section setup (e.g. a single
  `fetchUser()` call for all `/new-dashboard/**`) is done **in the layout**, once — pages
  don't re-fetch the user.
- **Middleware** (`middleware/`): `auth.ts`, `auth-affiliate.ts`, `deny-access.ts`,
  `redirect.client.ts`, `production-guard.ts`, etc. Apply via
  `definePageMeta({ middleware: ['auth'] })`. `.client.ts` suffix = client-only.
- **routeRules** control SSR/robots/caching per path (see §6.4). Dashboards are
  `ssr: false, robots: false`. Marketing/SEO pages are SSR with `robots: true`.
- **Runtime config**: read public env via `useRuntimeConfig().public.*` (baseUrl, API keys,
  feature flags like `useMockApi`). Never hard-code secrets/URLs — add to
  `runtimeConfig.public` + `.env`.
- **Per-page meta / SEO / head**: set the layout, middleware and any static route flags with
  `definePageMeta({ layout, middleware })` at the top of the page. For `<title>`, meta and
  social tags use Nuxt's `useSeoMeta({ title, description, ogImage, … })` (or `useHead({...})`
  for raw `<link>`/`<script>`/preloads). Marketing/SEO pages are SSR; canonical URLs and
  `robots` are handled via `routeRules` (§6.4) — don't duplicate robots logic in the page.
  i18n note: with `no_prefix` strategy there is one URL per page (no `/de/` variants), so
  canonical/SEO is single-URL.

---

## 12. Types

Domain types live in `types/*.ts` (`analytics.ts`, `dashboard.ts`, `new-dashboard.ts`,
`product.ts`, `research.ts`, `auth.ts`, `landing.ts`, `main.ts`, …). Define new domain
interfaces there and import them, or co-locate small interfaces in the composable that owns
them (as in the §7 example). Keep them strict-mode clean.

---

## 13. Performance rules (TOP priority in this project)

High Lighthouse / PageSpeed scores are a primary goal. When generating pages/components:

0. **Hand-write components from HTML + Tailwind — never reach for a UI library.** This is the
   single biggest performance lever: no kit means no extra CSS/JS/runtime, the smallest possible
   bundle and cheap hydration. (See the Golden-rule note at the top.)
1. Lazy-load everything below the fold: `Lazy`-prefixed components + `<NuxtLazyHydrate>`
   (`when-idle` / `when-visible`).
2. Heavy libs (Lottie, GSAP, charts) → dynamic `import()` gated by `IntersectionObserver`.
3. Images: WebP, explicit dimensions, `loading="lazy"`, `fetchpriority` set intentionally;
   only the LCP element is eager.
4. Preload only the critical fonts (§4). `font-display: swap`.
5. Minimal JS — don't pull in a dependency for something small; prefer native + VueUse.
6. CSS code-splitting is on (`vite.build.cssCodeSplit`), CSS minified via cssnano.
7. Skeleton-first loading transitions (§5.5) for any async block.

---

## 14. What NOT to do (to stay copy-paste compatible)

- ❌ Don't use a UI/component library — **hand-write every component** from HTML + Tailwind
  (the project's #1 performance rule; no Vuetify/PrimeVue/Element/shadcn/Bootstrap/Material/Ant…).
- ❌ Don't add new npm dependencies (esp. UI kits, CSS frameworks, axios, Pinia).
- ❌ Don't use default Tailwind breakpoints (`sm/md/lg/xl/2xl`) — use the custom ones (§5.1).
- ❌ Don't write `<style>`/`scoped` CSS — inline Tailwind + shared classes in `main.css`.
- ❌ Don't use the Options API or `defineComponent`.
- ❌ Don't manually `import` auto-imported APIs/composables/components.
- ❌ Don't hard-code user-facing text — use `$t()` and add keys to all 4 locale files.
- ❌ Don't put assets in `assets/` — everything static goes in `public/`.
- ❌ Don't fetch data inside pages or pass block data via props — use the composable pattern.
- ❌ Don't send `license_id`/scope in request bodies — scope is server-session-based.
- ❌ Don't use typographic/curly quotes or abbreviated variable names.

---

## 15. Quick checklist for every component/page you hand off

- [ ] `<script setup lang="ts">`, 4-space indent, no manual imports of Nuxt/auto APIs.
- [ ] Styling = inline Tailwind with custom breakpoints + existing `main.css` utility classes.
- [ ] Colors/fonts/shadows/radii use the tokens in §4–§5 (e.g. `font-poppins text-BW/08 bg-Blue/600`).
- [ ] All text via `$t()`; keys added to `en/de/es/pt.json`.
- [ ] Data logic in a `use*.ts` composable (pattern A or B), not in the component.
- [ ] Backend calls via `$api` (auth) / `useNativeFetch` / server-route `$fetch` — never axios.
- [ ] Assets referenced from `/public` (`/icons/...`, `/img/...`); icons = SVG URL or lucide-vue-next.
- [ ] Heavy/below-fold = `Lazy` + `NuxtLazyHydrate` + IntersectionObserver-gated libs.
- [ ] Straight ASCII quotes, full descriptive variable names, no `<style>` blocks.

---

## 16. Appendix — real reference pairs (study these shapes, reproduce the structure)

These are **actual files from the reference project**, lightly trimmed — shown as canonical
*shape templates*, not files to import. Mirror their structure, indentation and class output;
recreate any project-local symbols they call (don't copy them as live imports).
The identifiers they call (`CustomTransition`, `Skeleton`, `formatAmount`, `currencyToSymbolMap`,
`useDashboardAnalytics*`) are project-local conventions described in §8.1/§6/§7 — recreate
equivalents on your side; don't assume they exist.

### 16.1 Pattern A — DOM-effect composable + its component (entrance-on-scroll)

**`composables/useSectionHeaderEntrance.ts`** — takes a `Ref<HTMLElement|null>`, sets up an
IntersectionObserver, returns reactive class state, cleans up on unmount. (Note: this older
file imports Vue APIs explicitly; new files may rely on auto-imports instead — both work.)

```ts
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

type UseSectionHeaderEntranceOptions = {
    triggerOffsetPx?: number;
    threshold?: number;
    childSelector?: string;
    enteredClass?: string;
    exitedClass?: string;
};

const DEFAULT_CHILD_SELECTOR = '[data-sh-badge],[data-sh-title],[data-sh-subtitle]';

export function useSectionHeaderEntrance(
    rootRef: Ref<HTMLElement | null>,
    options: UseSectionHeaderEntranceOptions = {},
) {
    const isEntered = ref(false);
    let observer: IntersectionObserver | null = null;

    const triggerOffsetPx = options.triggerOffsetPx ?? -180;
    const threshold = options.threshold ?? 0;
    const childSelector = options.childSelector ?? DEFAULT_CHILD_SELECTOR;
    const enteredClass = options.enteredClass ?? 'opacity-100 translate-y-0';
    const exitedClass = options.exitedClass ?? 'opacity-0 translate-y-10';
    const stateClass = computed(() => (isEntered.value ? enteredClass : exitedClass));

    const reset = () => {
        const root = rootRef.value;
        if (!root) return;
        const children = Array.from(root.querySelectorAll<HTMLElement>(childSelector));
        children.forEach((child) => { child.style.transition = 'none'; });
        isEntered.value = false;
        void root.offsetHeight; // force reflow so the next enter transition replays
        children.forEach((child) => { child.style.removeProperty('transition'); });
    };

    onMounted(() => {
        const root = rootRef.value;
        if (!root) return;
        if (typeof IntersectionObserver === 'undefined') { isEntered.value = true; return; }

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const el = entry.target as HTMLElement;
                if (entry.isIntersecting) {
                    if (!isEntered.value) isEntered.value = true;
                    return;
                }
                if (!isEntered.value) return;
                const rect = el.getBoundingClientRect();
                if (rect.top >= window.innerHeight) reset(); // exited below viewport → replay
            });
        }, { threshold: [0, threshold], rootMargin: `0px 0px ${triggerOffsetPx}px 0px` });

        observer.observe(root);
    });

    onBeforeUnmount(() => { observer?.disconnect(); observer = null; });

    return { isEntered, stateClass, reset };
}
```

**Component using it** (excerpt from `components/landing/WhatYouGet.vue`) — the component is
thin: it owns the template refs, the composable owns the behavior:

```vue
<script setup lang="ts">
const sectionHeaderRef = ref<HTMLElement | null>(null);
// composable returns the class to bind; component just wires the ref + applies the class
const { stateClass: headerEntranceStateClass } = useSectionHeaderEntrance(sectionHeaderRef);
</script>

<template>
    <div ref="sectionRef" class="relative bg-white">
        <div ref="sectionHeaderRef" data-section-header class="flex flex-col gap-8">
            <span data-sh-badge :class="headerEntranceStateClass"
                  class="transition-transform-opacity duration-500 ease-smooth">{{ $t('...') }}</span>
            <h2 data-sh-title :class="headerEntranceStateClass" class="new-landing-section-title">…</h2>
            <p data-sh-subtitle :class="headerEntranceStateClass" class="new-landing-section-subtitle">…</p>
        </div>
    </div>
</template>
```

### 16.2 Pattern B — data composable (`useState` + in-flight guard + `watch`) + its block component

**`composables/useDashboardAnalyticsPerformance.ts`** — fetches via `$api`, shares state via
`useState`, dedupes concurrent calls, refetches on scope/period change:

```ts
// Performance metrics for the analytics Overview page (POST /performance-metrics, empty body).
// Re-fetches when the selected account changes or the scope bar's refresh is pressed
// (via scopeRefreshKey from the accounts composable).

interface PerformanceMetrics {
    netProfit: number;  gain: number;
    maxDrawdownPercent: number;  maxDrawdown: number;  startBalance: number;
    gainMonthly: number;  avgMonthlyProfit: number;
    gainDaily: number;  avgDailyProfit: number;
}

// Client-only in-flight guard: collapse duplicate requests fired in the same tick when
// several component instances consume this composable.
let performancePromise: Promise<PerformanceMetrics | null> | null = null;
let performancePromiseKey: string | null = null;

export function useDashboardAnalyticsPerformance() {
    const nuxtApp = useNuxtApp();
    const { accountValue, periodValue, scopeRefreshKey } = useDashboardAnalyticsAccounts();

    const performance = useState<PerformanceMetrics | null>('dashboard-analytics-performance', () => null);
    const pending = useState<boolean>('dashboard-analytics-performance-pending', () => false);

    async function loadPerformance() {
        if (!accountValue.value) { performance.value = null; return; } // skip empty initial fire
        const key = `${accountValue.value}:${periodValue.value}:${scopeRefreshKey.value}`;
        if (!performancePromise || performancePromiseKey !== key) {
            performancePromiseKey = key;
            performancePromise = nuxtApp.$api('/performance-metrics', {
                method: 'POST',
                body: { period: periodValue.value },
            });
        }
        pending.value = true;
        try { performance.value = await performancePromise; }
        finally { performancePromise = null; performancePromiseKey = null; pending.value = false; }
    }

    // Watch periodValue + scopeRefreshKey, NOT accountValue (account switches are funneled
    // through scopeRefreshKey, bumped only after /activate-license resolves). immediate:true
    // covers first mount.
    if (import.meta.client) {
        watch([periodValue, scopeRefreshKey], () => { void loadPerformance(); }, { immediate: true });
    }

    return {
        performance,
        pending: useDashboardAnalyticsScopeLoading(pending), // mixes in the global refresh signal
        refreshPerformance: loadPerformance,
    };
}
```

**`components/new-dashboard/analytics/OverviewPerformance.vue`** — the block component. Pure
render: pulls state from composables, formats, shows skeleton-first, no props/fetching:

```vue
<template>
    <div class="grid gap-1.5 grid-cols-3 tablet-md:gap-3">
        <div
            v-for="card in cards"
            :key="card.label"
            class="bg-white rounded-lg px-3 pt-2.5 pb-2 flex flex-col shadow-card-m
            tablet-md:rounded-2xl tablet-md:px-5 tablet-md:py-4"
        >
            <span class="text-[10px] leading-3 font-medium uppercase text-Tinted/500 mb-1">
                {{ card.label }}
            </span>
            <!-- Skeleton-first: render skeleton while loading, swap to value after -->
            <CustomTransition name="skeleton">
                <Skeleton v-if="isLoading" height="h-[18px] tablet-md:h-[22px]" width="!w-16" className="tablet-md:mb-[2px]" />
                <span v-else
                      class="text-sm font-semibold leading-[18px] tablet-md:text-lg tablet-md:leading-5.5 tablet-md:mb-[2px]"
                      :class="card.valueClass">{{ card.value }}</span>
            </CustomTransition>
            <CustomTransition name="skeleton">
                <Skeleton v-if="isLoading" height="h-[14px] tablet-md:h-4" width="!w-12" />
                <span v-else class="text-[10px] leading-[14px] font-medium text-Tinted/500 tablet-md:text-xs">{{ card.sub }}</span>
            </CustomTransition>
        </div>
    </div>
</template>

<script setup lang="ts">
import currencyToSymbolMap from "~/utils/currencyToSymbolMap";

const { t } = useI18n();
const { performance, pending } = useDashboardAnalyticsPerformance();
const { accountBalance } = useDashboardAnalyticsBalance();

// Loading = request in flight OR metrics not fetched yet (null before first fetch / while
// licenses load). Skeleton shows first, real values after.
const isLoading = computed(() => pending.value || performance.value === null);

const currencySymbol = computed(() => currencyToSymbolMap[accountBalance.value?.currency ?? ''] ?? '');

function fmtCur(v: number | undefined): string { return `${currencySymbol.value}${formatAmount(v ?? 0)}`; }
function fmtPct(v: number | undefined): string { const n = v ?? 0; return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`; }
function toneClass(v: number | undefined): string {
    const n = v ?? 0;
    if (n > 0) return 'text-Green/200';
    if (n < 0) return 'text-Red/200';
    return 'text-Tinted/900';
}

const cards = computed(() => {
    const p = performance.value;
    return [
        { label: t('new_dashboard_analytics_component.net_profit'),  value: fmtCur(p?.netProfit), sub: fmtPct(p?.gain), valueClass: toneClass(p?.netProfit) },
        { label: t('new_dashboard_analytics_component.max_drawdown'), value: `${(p?.maxDrawdownPercent ?? 0).toFixed(2)}%`, sub: fmtCur(p?.maxDrawdown), valueClass: 'text-Tinted/900' },
        { label: t('new_dashboard_analytics_component.initial_balance'), value: fmtCur(p?.startBalance), sub: t('new_dashboard_analytics_component.at_start_of_period'), valueClass: 'text-Tinted/900' },
        // …more cards
    ];
});
</script>
```

**What to notice in this pair (these are the rules, embodied):**
- The component imports **only** a non-auto-imported util (`currencyToSymbolMap`); `computed`,
  `useI18n`, the composables and `formatAmount` are all auto-imported.
- Zero data fetching and zero data-props in the component — it consumes composables directly.
- Money/percent tone uses brand tokens (`text-Green/200` / `text-Red/200` / `text-Tinted/900`).
- Custom breakpoint `tablet-md:` and pre-built `shadow-card-m`.
- Every label/sub goes through `t(...)`.
- Skeleton-first via `<CustomTransition name="skeleton">` (the project's transition wrapper).

---

## 17. Appendix — FULL `tailwind.config.js` (verbatim — ship this file as-is)

The sibling project should use **this exact config file**. Section 5 is a human summary;
this is the source of truth with every token value. Copy it verbatim.

```js
 /** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
    content: [
        './pages/**/*.{vue,js}',
        './components/**/*.{vue,js}',
        './layouts/**/*.{vue,js}',
        './server/**/*.{js,ts}',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
        './assets/css/main.css',
        './data/**/*.{ts,js}',
    ],
    theme: {
        screens: {
            mobile: '360px',
            tablet: '600px',
            'tablet-md': '800px',
            'tablet-wide': '1024px',
            desktop: '1280px',
            'desktop-md': '1600px',
            wide: '1920px',
        },
        colors: {
            ...colors,
            'VIOLET': '#4134BC',
            'VIOLET/100': '#E4E0FF',
            'VIOLET/200': '#C9C2FF',
            'VIOLET/300': '#AFA3FF',
            'VIOLET/400': '#8B7EFF',
            'VIOLET/500': '#7D73EA',
            'VIOLET/600': '#7469D7',
            'VIOLET/700': '#5A50C9',
            'VIOLET/800': '#4134BC',
            'PURPLE': '#8B7EFF',
            'EXTRA-PURPLE': '#8B23FE',
            'BLUE/BASE': '#205EFB',
            'BLUE/00': '#F1F4F9',
            'BLUE/01': '#DEE1EF',
            'BLUE/02': '#ACBCF0',
            'BLUE/03': '#7A96F2',
            'BLUE/04': '#4871F3',
            'BLUE/05': '#285FF7',
            'BLUE/05/20': 'rgba(32, 94, 251, 0.2)',
            'BLUE/05/40': 'rgba(32, 94, 251, 0.4)',
            'BLUE/06': '#074CFB',
            'BW/00': '#FFFFFF',
            'BW/01': '#F0F0F0',
            'BW/02': '#D2D2D2',
            'BW/03': '#B4B4B4',
            'BW/04': '#969696',
            'BW/05': '#696969',
            'BW/06': '#4B4B4B',
            'BW/07': '#2D2D2D',
            'BW/08': '#1E1E1E',
            'BW/09': '#222128',
            'error': '#F04438',
            'dark-title': '#2E2E2E',
            'PINK': '#B36DFF',
            'WARNING': '#FF3437',
            'Neutral/100': '#E5E5E5',
            'Neutral/300': '#A3A3A3',
            'Neutral/400': '#737373',
            'Neutral/500': '#525252',
            'Neutral/600': '#404040',
            'Neutral/700': '#262626',
            'Neutral/800': '#171717',
            'Tinted/25': '#F7F7FB',
            'Tinted/50': '#F0F1F7',
            'Tinted/100': '#E4E6F0',
            'Tinted/200': '#C9CCDD',
            'Tinted/300': '#AEB2C9',
            'Tinted/400': '#9499B6',
            'Tinted/500': '#7A7FA3',
            'Tinted/600': '#62678F',
            'Tinted/700': '#51567A',
            'Tinted/800': '#433E68',
            'Tinted/900': '#2F2A4A',
            'Tinted/950': '#1C1833',
            'Green/10': '#F0FDF4',
            'Green/50': '#ADEBC5',
            'Green/100': '#00DB63',
            'Green/200': '#00BA38',
            'Blue/25': '#F5F8FF',
            'Blue/50': '#EBF1FF',
            'Blue/100': '#074CFB',
            'Blue/200': '#A6BFFD',
            'Blue/400': '#5481F9',
            'Blue/500': '#3D71F8',
            'Blue/600': '#285FF7',
            'Red/10': '#F1B1B1',
            'Red/50': '#FEF2F2',
            'Red/100': '#FF1519',
            'Red/200': '#DC2626',
            'Gray/200': '#787878',
            'Orange/100': '#FB951E',
        },
        extend: {
            fontFamily: {
                poppins: ['"Poppins"', 'ui-serif', 'system-ui'],
                franklin: ['"Roboto"', 'sans-serif', 'system-ui'],
                rubik: ['"Rubik"', 'sans-serif', 'system-ui'],
                inter: ['"Inter"', 'sans-serif', 'system-ui'],
            },
            fontWeight: {
                book: 400,
                medium: 500,
            },
            backgroundImage: {
                'blue-gradient': 'linear-gradient(to bottom, #074CFB 0%, #205EFB 100%)',
                'blue-gradient-hover': 'linear-gradient(to bottom, #074CFB 0%, #0F3FBA 100%)',
                'blue-gradient-active': 'linear-gradient(to bottom, #0037C1 0%, #0B359F 100%)',
                'blue-purple-gradient': 'linear-gradient(to right, #205EFB 0%, #B36DFF 100%)',
                'black-gradient': 'linear-gradient(to bottom, #4B4B4B 0%, #1E1E1E 100%)',
                'black-gradient-hover': 'linear-gradient(to bottom, #696969 0%, #4B4B4B 100%)',
                'black-gradient-active': 'linear-gradient(to bottom, #969696 0%, #696969 100%)',
            },
            boxShadow: {
                'primary': '0px 16px 20px 0px rgba(63, 97, 235, 0.16)',
                'secondary': '0px 8px 10px 0px rgba(63, 97, 235, 0.08)',
                'dropdown': '0px 30px 30px 0px rgba(3, 63, 255, 0.1)',
                'notify': '0 5px 5px -3px rgba(0, 0, 0, 0.04), 0 32px 64px -12px rgba(28, 24, 51, 0.14)',
                'dashboard': '0px 143px 40px 0px rgba(76, 113, 154, 0), 0px 92px 37px 0px rgba(76, 113, 154, 0.01), 0px 52px 31px 0px rgba(76, 113, 154, 0.04), 0px 6px 13px 0px rgba(76, 113, 154, 0.08), 0px -20px 40px 2px rgba(76, 113, 154, 0.03)',
                'affiliate-card': '0px 30px 40px 0px rgba(3, 63, 255, 0.05)',
                'affiliate-review-card': '0px 20px 40px 0px rgba(3, 63, 255, 0.15)',
                'marketplace-product-card': '0px 30px 120px 0px rgba(0, 0, 0, 0.1)',
                'dashboard-card': '0 -20px 40px 2px rgba(76, 113, 154, 0.03), 0 6px 13px 0 rgba(76, 113, 154, 0.08), 0 52px 31px 0 rgba(76, 113, 154, 0.04), 0 92px 37px 0 rgba(76, 113, 154, 0.01), 0 143px 40px 0 rgba(76, 113, 154, 0)',
                'stories-card': '0 8px 8px 0 rgba(44, 20, 74, 0.05)',
                'pricing-card': '0 24px 60px 0 rgba(192, 191, 243, 0.6)',
                'product-card-mobile': '0 -16px 20px 0 rgba(65, 65, 65, 0.08)',
                'result-table': '0 40px 60px 0 rgba(192, 191, 243, 0.4)',
                'model-table': '0 30px 60px 0 rgba(92, 50, 166, 0.02), 0 20px 60px 0 rgba(192, 191, 243, 0.34), 0 0 30px 0 rgba(157, 156, 213, 0.12)',
                'card-m': '0 16px 16px 0 rgba(84, 107, 197, 0.04), 0 8px 6px 0 rgba(84, 107, 197, 0.04)',
            },
            borderRadius: {
                '1.5xl': '.875rem',
                '2.5xl': '1.25rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            lineHeight: {
                '3.5': '.875rem',
                '4.25': '1.0625rem',
                '4.5': '1.125rem',
                '5.5': '1.375rem',
                '11': '3rem',
                '13': '4rem',
                '14': '4.5rem',
                '15': '4.875rem',
                '20': '6rem',
            },
            fontSize: {
                'xl': '1.3125rem',
                '3.5xl': '2rem',
                '3.6xl': '2.125rem',
                '4.5xl': '2.625rem',
                '6xl': '4rem',
            },
            spacing: {
                '6.5': '1.625rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '21': '5.5rem',
                '25': '6.25rem',
                '29': '7.5rem',
            },
            whiteSpace: {
                'break-spaces': 'break-spaces',
            },
            keyframes: {
                fillBlue: {
                    '0%': { height: '0%', backgroundColor: '#205EFB' },
                    '100%': { height: '100%', backgroundColor: '#205EFB' },
                },
                hide: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'icon-steps': {
                    to: { transform: 'translateX(-60px)' },
                },
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(2px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                edgardPulse: {
                    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
                    '50%': { transform: 'translate(-50%, -50%) scale(1.12)', opacity: '0.85' },
                }
            },
            width: {
                'fill-available': '-webkit-fill-available',
            },
            height: {
                'd-full': '100dvh',
                'fill-available': '-webkit-fill-available',
            },
            animation: {
                fillBlue: 'fillBlue 300ms ease-in-out forwards',
                hideElement: 'hide 300ms ease-in-out forwards',
                'icon-steps': 'icon-steps 1.5s steps(5) infinite',
                fadeIn: 'fadeIn 0.15s ease-out',
                edgardPulse: 'edgardPulse 5s ease-in-out infinite',
            },
            blur: {
                '120': '120px',
            },
            borderWidth: {
                '1': '1px',
            },
            scale: {
                '65': '0.65',
                '95': '.95',
            },
            transitionDuration: {
                300: '300ms',
                500: '500ms',
                600: '600ms',
            },
            transitionDelay: {
                360: '360ms',
                420: '420ms',
            },
            transitionProperty: {
                'transform-opacity': 'transform, opacity',
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(.22,.61,.36,1)',
            },
        },
        plugins: [
            function ({ addUtilities }) {
                addUtilities({
                    '.contents': {
                        display: 'contents',
                    },
                })
            }
        ]
    }
}
```

> Note: the full palette is `...colors` (every default Tailwind color) **plus** the brand
> tokens above. So `text-red-500`, `bg-slate-100`, etc. also work alongside `text-BW/08`.
> The `@font-face` declarations and all the shared `@layer utilities` classes (buttons,
> containers, titles, scrollbars, transitions — §5.4/§5.5) live in `assets/css/main.css`;
> ship that file alongside this config for full visual parity. It is reproduced verbatim in §18.

---

## 18. Appendix — FULL `assets/css/main.css` (verbatim — ship this file as-is)

This is the global stylesheet, registered via `css: ['~/assets/css/main.css']` in
`nuxt.config.ts`. It holds: the `@font-face` declarations (§4), the Tailwind layer imports,
the `@layer base` resets, every shared `@layer utilities` class (containers, all button
variants, titles, scrollbars, text gradients, carousel/pagination skins, the
`.research-article` / `.dp` dynamic-HTML styles, ApexCharts overrides) and the global Vue
`<Transition>` classes (§5.5). Copy it verbatim — without it the button/title/transition
classes referenced throughout the components will not exist.

```css
@font-face {
    font-display: swap;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/poppins-latin-400.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 500;
    src: url('/fonts/poppins-latin-500.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 600;
    src: url('/fonts/poppins-latin-600.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 700;
    src: url('/fonts/poppins-latin-700.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Rubik';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/rubik-latin-400.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Rubik';
    font-style: normal;
    font-weight: 500;
    src: url('/fonts/rubik-latin-500.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Rubik';
    font-style: normal;
    font-weight: 600;
    src: url('/fonts/rubik-latin-600.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Rubik';
    font-style: normal;
    font-weight: 700;
    src: url('/fonts/rubik-latin-700.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/roboto-latin-400.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    src: url('/fonts/roboto-latin-500.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: url('/fonts/roboto-latin-700.woff2') format('woff2');
}

@font-face {
    font-display: swap;
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    src: url('/fonts/inter-latin-700.woff2') format('woff2');
}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    html,
    body {
        width: 100%;
        height: 100%;
        min-height: 100%;
        scroll-behavior: smooth;
        @apply font-poppins;
    }

    #__nuxt {
        height: 100%;
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        @apply appearance-none m-0;
    }

    input[type="number"] {
        @apply appearance-none;
    }
}

@layer utilities {
    .custom-textarea:not(:placeholder-shown):not([readonly]) ~ label {
        @apply delay-500;
    }

    .base-container {
        @apply w-full mx-auto;

        @media (min-width: theme('screens.desktop')) {
            @apply max-w-[1460px] px-2.5;
        }
    }

    .new-base-container {
        @apply w-full mx-auto;

        @media (min-width: theme('screens.desktop')) {
            @apply max-w-[1540px] px-15;
        }
    }

    .centered {
        @apply flex items-center justify-center;
    }

    .landing-section-title {
        @apply font-poppins text-4xl font-bold leading-10 text-BW/08 text-center;

        @media (min-width: theme('screens.tablet')) {
            @apply text-5xl leading-14;
        }
    }

    .landing-section-sub-title {
        @apply font-franklin text-lg font-book leading-7 text-BW/06 text-center;
    }

    .ReviewsPagination {
        --vc-pgn-active-color: theme('colors.PURPLE');
        --vc-pgn-background-color: theme('colors.BW/01');
        --vc-pgn-border-radius: theme('borderRadius.full');
        --vc-pgn-height: theme('spacing.2');
        --vc-pgn-width: theme('spacing.2');
    }

    .CarouselSlideGap.carousel__slide--active {
        padding-left: theme('spacing.1') !important;
        padding-right: theme('spacing.1') !important;
    }

    .CarouselSlideGap.carousel__slide--prev {
        padding-right: theme('spacing.2') !important;
    }

    .CarouselSlideGap.carousel__slide--next {
        padding-left: theme('spacing.2') !important;
    }

    .CapitalSafePagination {
        --vc-pgn-active-color: theme('colors.BLUE/05');
        --vc-pgn-background-color: #D9D9D9;
        --vc-pgn-border-radius: theme('borderRadius.3xl');
        --vc-pgn-height: theme('spacing.1');
        --vc-pgn-width: 3.875rem;

        @media (min-width: 1024px) {
            .carousel__pagination-item {
                width: 25%;

                &:has(.carousel__pagination-button--active) {
                    width: 50%;
                }

                &:first-child {
                    & > .carousel__pagination-button {
                        padding-left: 0 !important;
                    }
                }

                &:last-child {
                    & > .carousel__pagination-button {
                        padding-left: 0 !important;
                    }
                }
            }

            .carousel__pagination-button {
                padding-left: 6px;
                padding-right: 6px;
                width: 100%;

                &:after {
                    width: 100%;
                }

                &:focus-visible {
                    outline: none;
                }
            }
        }
    }

    .ProductPagination {
        position: absolute;
        bottom: 16px;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        background: white;
        padding: 16px 20px !important;
        width: 344px;
        height: 74px;
        border-radius: 20px;
        border: 2px solid #DEE1EF;

        & > li {
            border-radius: 50% !important;

            & > button {
                width: 36px;
                height: 36px;
                border-radius: 50% !important;
                opacity: .7;

                &::after {
                    display: none;
                }

                &.carousel__pagination-button--active {
                    width: 42px !important;
                    height: 42px !important;
                    background-size: 42px !important;
                    outline: 3px solid #285FF7;
                    opacity: 1 !important;
                }
            }

            &:nth-child(1) {
                & > button {
                    background: url("/icons/landing/easysentinel.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(2) {
                & > button {
                    background: url("/icons/landing/easyai.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(3) {
                & > button {
                    background: url("/icons/landing/easywaka.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(4) {
                & > button {
                    background: url("/icons/landing/easygold.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(5) {
                & > button {
                    background: url("/icons/landing/easymomentum.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(6) {
                & > button {
                    background: url("/icons/landing/easynews.svg");
                    background-size: 36px;
                }
            }

            &:nth-child(7) {
                & > button {
                    background: url("/icons/landing/easyscalper.svg");
                    background-size: 36px;
                }
            }
        }
    }

    .blue-btn {
        @apply font-poppins py-[.625rem] px-[2.5rem] rounded-4xl font-semibold bg-blue-gradient text-sm leading-4 tracking-[.00875rem] h-[48px] w-full text-BW/00 shadow-primary hover:bg-blue-gradient-hover active:bg-blue-gradient-active;
    }

    .blue-btn.disabled {
        @apply !shadow-none !cursor-not-allowed !bg-red-500 opacity-50 active:bg-blue-gradient-hover !pointer-events-none;
    }

    .black-btn {
        @apply font-poppins py-[.625rem] px-[2.5rem] rounded-4xl font-semibold bg-black-gradient text-sm leading-4 tracking-[.00875rem] h-[48px] w-full text-BW/00 shadow-primary hover:bg-black-gradient-hover active:bg-black-gradient-active;
    }

    .outline-btn {
        @apply font-poppins py-[.625rem] px-[2.5rem] rounded-4xl font-semibold bg-BW/00 text-sm leading-4 tracking-[.00875rem] h-[60px] w-[188px] text-BLUE/06 border-[2px] border-BLUE/02 shadow-secondary hover:bg-[#E8EDFF] active:bg-[#CAD5FF];
    }

    .outline-btn.disabled {
        @apply !text-BW/03 !border-BW/01 !shadow-none pointer-events-none !cursor-not-allowed;
    }

    .dashboard-white {
        @apply font-rubik px-2 rounded-lg font-medium bg-BW/00 text-sm desktop:text-[.9375rem] leading-4.25 desktop:leading-4.5 h-9 w-full
        text-PURPLE hover:bg-[#E8EDFF] hover:text-VIOLET active:bg-[#CAD5FF] active:text-VIOLET;
    }

    .grey-btn {
        @apply font-rubik py-px px-2 text-sm font-normal text-[#4A425E] h-8 w-full rounded-2xl bg-[#E8EEF9] flex items-center gap-2 leading-[1.0625rem] -tracking-[.0175rem] hover:bg-[#DBE4F6] active:bg-[#C4D4F2];
    }

    .dashboard-white.disabled {
        @apply text-BW/02 hover:bg-BW/00 hover:text-BW/02 active:bg-BW/00 active:text-BW/02 cursor-not-allowed;
    }

    .disabled {
        @apply cursor-not-allowed;
    }

    .dark-blue-btn {
        @apply font-poppins py-2 px-[2.5rem] rounded-lg font-semibold bg-[#2132A3] text-sm leading-4 tracking-[.00875rem] h-[42px] w-full text-BW/00 shadow-primary hover:bg-blue-gradient-hover active:bg-blue-gradient-active;
    }

    .violet-btn {
        @apply font-poppins py-[.625rem] px-[2.5rem] rounded-lg font-medium bg-VIOLET/400 text-sm leading-4 tracking-[.00875rem] w-full text-BW/00 hover:bg-[#5446D1] active:bg-[#3F33A8] transition-[background-color,color] duration-300 ease-in-out;
    }

    .violet-btn.disabled {
        @apply !shadow-none !cursor-not-allowed !bg-VIOLET/100 !pointer-events-none;
    }

    .violet-outline-btn {
        @apply font-poppins py-[.625rem] px-[2.5rem] rounded-lg font-medium bg-transparent text-sm leading-4 tracking-[.00875rem] ring-2 ring-VIOLET/400 w-full text-VIOLET/700 hover:bg-VIOLET/100 hover:ring-VIOLET/700 hover:text-VIOLET/700 active:bg-VIOLET/200 active:ring-[#3F33A8] active:text-[#3F33A8] transition-[background-color,color,box-shadow] duration-300 ease-in-out;
    }
    .violet-outline-btn.disabled {
        @apply !shadow-none !cursor-not-allowed !ring-VIOLET/200 !text-VIOLET/200 !pointer-events-none;
    }

    .new-blue-btn {
        @apply bg-Blue/600 text-white hover:bg-Blue/400 shadow-[0_-2px_2px_0_#0000000D,0_1px_2px_0_#0000000D] active:shadow-[0_0_0_1px_#FFFFFF,0_0_0_2px_#FFFFFF,0_0_0_4px_#285FF733];
    }

    .new-blue-btn.disabled {
        @apply !bg-Blue/200 !shadow-[0_-2px_0_0_#0000000D,0_1px_2px_0_#0000000D] hover:!bg-Blue/200 active:!shadow-[0_-2px_2px_0_#0000000D,0_1px_2px_0_#0000000D] !cursor-not-allowed;
    }

    .new-transparent-btn {
        @apply bg-white text-Tinted/900 border-2 border-Tinted/100 hover:bg-Tinted/25 shadow-[inset_0_-3px_0_0_#0000000D,0_1px_2px_0_#0000000D] active:shadow-[0_0_0_1px_#FFFFFF,0_0_0_2px_#FFFFFF,0_0_0_4px_#285FF733];
    }

    .new-transparent-btn.disabled {
        @apply border-Tinted/50 hover:!bg-white !cursor-not-allowed;
    }

    .new-red-btn {
        @apply bg-Red/100 text-white hover:bg-Red/200 shadow-[inset_0_-3px_0_0_#0000000D,0_1px_2px_0_#0000000D] active:shadow-[0_0_0_1px_#FFFFFF,0_0_0_2px_#FFFFFF,0_0_0_4px_#285FF733];
    }

    .new-red-btn.disabled {
        @apply !bg-Red/10 !cursor-not-allowed hover:!bg-Red/10 active:!shadow-[inset_0_-3px_0_0_#0000000D,0_1px_2px_0_#0000000D];
    }

    .new-transparent-blue-border-btn {
        @apply bg-white text-Blue/600 border-2 border-Blue/200 hover:bg-Tinted/25 shadow-[inset_0_-3px_0_0_#0000000D,0_1px_2px_0_#0000000D] active:shadow-[0_0_0_1px_#FFFFFF,0_0_0_2px_#FFFFFF,0_0_0_4px_#285FF733];
    }

    .new-transparent-blue-border-btn.disabled {
        @apply !bg-white !cursor-not-allowed !text-Tinted/300 !border-Tinted/50 hover:!bg-white active:!bg-white active:!shadow-[inset_0_-3px_0_0_#0000000D,0_1px_2px_0_#0000000D];
    }

    .new-btn--xs.new-transparent-btn {
        @apply py-1;
    }

    .new-btn--md.new-transparent-btn {
        @apply py-2;
    }

    .new-btn--lg.new-transparent-btn {
        @apply py-2.5;
    }

    .new-btn--xs {
        @apply text-xs rounded-lg px-2 py-1.5 gap-1;
    }

    .new-btn--xs > img {
        @apply w-4 h-4;
    }

    .new-btn--md > img,
    .new-btn--lg > img {
        @apply w-5 h-5;
    }

    .new-btn--md {
        @apply text-sm rounded-xl py-2.5 px-3 gap-1;
    }

    .new-btn--lg {
        @apply text-sm rounded-xl px-4 py-[14px] gap-1.5;
    }

    .custom-product-carousel {
        & > .carousel__viewport {
            padding-bottom: 100px !important;
        }

        &__card {
            position: relative;
            z-index: 1;

            &::after {
                content:"";
                width: 80%;
                height: 100%;
                position: absolute;
                left: 50%;
                border-radius: 20px;
                transform: translate(-50%, 0);
                z-index: -1;
            }

            &.custom-blur {
                &::after {
                    will-change: filter, transform;
                    bottom: -30px;
                    filter: blur(30px);
                    -webkit-filter: blur(30px);
                    background-color: rgba(192,191,243,.8);

                    @media (min-width: theme('screens.tablet')) {
                        bottom: -40px;
                        filter: blur(40px);
                        -webkit-filter: blur(40px);
                    }
                }
            }
        }
    }

    .custom-scroll {
        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: theme('colors.BLUE/01');
            border-radius: 4px;
        }

        &::-webkit-scrollbar-track {
            background-color: theme('colors.BLUE/00');
            border-radius: 4px;
            margin-bottom: 1.4375rem;
        }
    }

    .new-custom-scroll {
        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: theme('colors.BLUE/01');
            border-radius: 4px;
        }

        &::-webkit-scrollbar-track {
            background-color: theme('colors.BLUE/00');
            border-radius: 4px;
        }
    }

    .new-dashboard-custom-scroll {
        &::-webkit-scrollbar {
            width: 14px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: theme('colors.Tinted/100');
            border-radius: 2px;
            border-right: 8px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background-color: #1C18330D;
            border-radius: 2px;
            border-right: 8px solid transparent;
            background-clip: padding-box;
        }
    }

    .new-dashboard-custom-scroll--py {
        &::-webkit-scrollbar {
            width: 14px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: theme('colors.Tinted/100');
            border-radius: 2px;
            border-right: 8px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background-color: #1C18330D;
            border-radius: 2px;
            margin-top: .5rem;
            margin-bottom: .5rem;
            border-right: 8px solid transparent;
            background-clip: padding-box;
        }
    }

    .new-dashboard-custom-horizontal-scroll {
        &::-webkit-scrollbar {
            height: 36px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: theme('colors.Tinted/100');
            border-radius: 2px;
            border-top: 16px solid transparent;
            border-bottom: 16px solid transparent;
            background-clip: padding-box;
        }

        &::-webkit-scrollbar-track {
            background-color: theme('colors.Tinted/50');
            border-radius: 2px;
            margin-left: .5rem;
            margin-right: .5rem;
            border-top: 16px solid transparent;
            border-bottom: 16px solid transparent;
            background-clip: padding-box;
        }
    }

    .hide-scrollbar {
        -ms-overflow-style: none;   /* IE/Edge */
        scrollbar-width: none;      /* Firefox */

        &::-webkit-scrollbar {
            display: none;          /* Chrome/Safari */
        }
    }

    .select-scroll {
        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #8E8E8E;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-track {
            background-color: transparent;
            border-radius: 4px;
            margin-top: .5rem;
            margin-bottom: .5rem;
        }
    }

    .dashboard-select-scroll {
        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #E4E6F0;
            border-radius: 4px;
        }

        &::-webkit-scrollbar-track {
            background-color: #1C18330D;
            border-radius: 4px;
        }
    }

    .select-scroll--multiple {
        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #AABAEE;
            border-radius: 999px;
        }

        &::-webkit-scrollbar-track {
            background-color: #E8EEF9;
            border-radius: 999px;
        }
    }

    .auth-title {
        @apply font-rubik text-[1.75rem] tablet:text-3.6xl font-bold leading-[2.0625rem] tablet:leading-10 text-BW/08 text-center;
    }

    .auth-sub-title {
        @apply font-rubik text-base leading-5.5 tablet:text-lg font-normal tablet:leading-[1.3125rem] text-BW/05 text-center;
    }

    .website-page-title {
        @apply capitalize font-poppins text-[28px] text-BW/08 leading-9 font-medium text-center mb-[3.625rem] desktop:mb-8 desktop:text-6xl desktop:leading-15 desktop:font-normal;
    }

    .new-website-page-title {
        @apply font-poppins text-[28px] text-[#141414] leading-9 font-medium text-center tablet-md:text-[42px] tablet-md:leading-[56px] desktop:text-[56px] desktop:leading-14;
    }

    .new-website-page-subtitle {
        @apply font-franklin text-base text-[#383838] leading-6 font-normal text-center tablet-md:text-BW/06 tablet-md:text-lg tablet-md:leading-7 desktop:text-xl desktop:leading-7;
    }

    .terms-section {
        @apply capitalize text-base leading-6 text-BW/08 font-medium;
    }

    .terms-h {
        @apply capitalize text-sm leading-6 text-BW/08 font-medium mt-6 mb-1;
    }

    .terms-p {
        @apply text-sm leading-6 text-BW/06 font-normal;
    }


    .help-center__label {
        @apply font-poppins text-xl leading-[1.625rem] font-medium text-BW/08 mb-5 wide:mb-6;
    }

    .help-center__description {
        @apply font-franklin text-base leading-6 font-normal text-BW/07;
    }

    .help-center__block {
        @apply mb-12 last:mb-0;
    }

    .help-center__list {
        @apply flex flex-col gap-3;
    }

    .help-center__list-mt {
        @apply mt-2;
    }

    .help-center__list-item {
        @apply flex flex-col gap-3;
    }

    .help-center__list-item--number {
        @apply list-decimal list-inside;
    }

    .help-center__list-item--disc {
        @apply list-disc list-inside;
    }

    .help-center__list-item--circle {
        @apply list-[circle] list-inside;
    }

    .help-center__list-item--square {
        @apply list-[square] list-inside;
    }

    .help-center__list-item--alpha {
        @apply list-[lower-alpha] list-inside;
    }

    .help-center__list-item--pl {
        @apply pl-3;
    }

    .help-center__link {
        @apply text-BLUE/04 underline decoration-dotted;
    }

    .gradient-blue-and-purple-text {
        @apply bg-[linear-gradient(45deg,_#205EFB_0%,_#B36DFF_100%)] bg-clip-text text-transparent;
    }

    .affiliate-title {
        @apply mx-auto text-center text-BW/08 font-medium text-3xl leading-10 desktop:text-4xl desktop:leading-[3.375rem] capitalize w-full max-w-[68rem];
    }

    .affiliate-subtitle {
        @apply mx-auto font-franklin text-center text-BW/06 font-normal text-xl leading-7 w-full max-w-[43.75rem];
    }

    .affiliate-carousel-slide {
        &.carousel__slide {
            opacity: 0;
        }

        &.carousel__slide--sliding {
            transition: 0.5s;
        }

        &.carousel__slide--active,
        &.carousel__slide--next,
        &.carousel__slide--prev {
            opacity: 1;
            position: relative;
        }

        &.carousel__slide--active {
            z-index: 10;
        }

        &.carousel__slide--next {
            transform: rotateY(0) scale(0.65) translateX(0px) !important;

            @media (min-width: 600px) {
                transform: rotateY(0) scale(0.65) translateX(-60px) !important;
            }

            @media (min-width: 900px) {
                transform: rotateY(0) scale(0.65) translateX(-110px) !important;
            }

            @media (min-width: 1024px) {
                transform: rotateY(0) scale(0.65) translateX(-200px) !important;
            }
        }

        &.carousel__slide--prev {
            transform: rotateY(0) scale(0.65) translateX(0px) !important;

            @media (min-width: 600px) {
                transform: rotateY(0) scale(0.65) translateX(60px) !important;
            }

            @media (min-width: 900px) {
                transform: rotateY(0) scale(0.65) translateX(110px) !important;
            }

            @media (min-width: 1024px) {
                transform: rotateY(0) scale(0.65) translateX(200px) !important;
            }
        }
    }

    .affiliate-carousel-pagination {
        position: absolute;
        bottom: 0;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        & > .carousel__pagination-item {
            background: #D1D9F0 !important;
            border-radius: 50% !important;

            & > button {
                width: 8px;
                height: 8px;
                border-radius: 50% !important;

                &::after {
                    display: none;
                }

                &.carousel__pagination-button--active {
                    border: none !important;;
                    width: 8px !important;
                    height: 8px !important;
                    background: #8B7EFF !important;
                }
            }
        }
    }

    .research-article {
        @apply text-base font-normal text-BW/06 leading-6;

        & > p {
            @apply mb-4 font-franklin text-base text-BW/06 leading-6 last:mb-0;

            & > br:first-child,
            & > br:last-child {
                @apply hidden;
            }

            &:has(+ br) {
                @apply mb-0;
            }

            &:empty {
                display: none;
            }

            &:has(+ figure) {
                @apply mb-0;
            }

            &:has(+ h1),
            &:has(+ h2),
            &:has(+ h3),
            &:has(+ h4),
            &:has(+ h5),
            &:has(+ h6) {
                @apply mb-12;
            }

            &:has(+ ul),
            &:has(+ ol) {
                @apply mb-4;
            }

            & > a {
                @apply text-inherit !bg-transparent text-[#4134BC] decoration-[#4134BC] font-bold;
            }
        }

        & > h1,
        & > h2 {
            @apply font-poppins text-BW/08 font-semibold text-[1.75rem] leading-9 mb-5;
        }

        & > h3,
        & > h4,
        & > h5,
        & > h6 {
            @apply font-poppins text-BW/08 font-semibold text-xl leading-7 mb-4;
        }

        & > figure {
            @apply centered overflow-hidden rounded-xl my-[4.5rem];
        }

        & > ul {
            @apply flex flex-col gap-3 font-franklin list-disc marker:text-BLUE/04 list-outside text-BW/06 mb-12 pl-[1.125rem];
        }

        & > ol {
            @apply flex flex-col gap-3 font-franklin list-decimal list-outside marker:text-BW/07 marker:font-semibold mb-12 pl-[1.125rem];
        }
    }

    .ticker-enter-active {
        @apply origin-left transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(.22,.61,.36,1)];
    }

    .ticker-enter-from {
        @apply opacity-0 scale-x-0;
    }

    .ticker-enter-to {
        @apply opacity-100 scale-x-100;
    }

    .ticker-leave-active {
        @apply origin-left transition-[transform,opacity] duration-[500ms] ease-[cubic-bezier(.22,.61,.36,1)];
    }

    .ticker-leave-to {
        @apply opacity-0 scale-x-95;
    }

    .note-icon,
    .note-text {
        @apply opacity-100 translate-y-0;
    }

    .ticker-enter-from .note-icon,
    .ticker-enter-from .note-text {
        @apply opacity-0 translate-y-1;
    }

    .ticker-enter-active .note-icon {
        @apply transition-[opacity,transform] duration-[300ms] delay-[360ms] ease-out;
    }
    .ticker-enter-active .note-text {
        @apply transition-[opacity,transform] duration-[300ms] delay-[420ms] ease-out;
    }

    .note:hover .close {
        @apply opacity-100 transition-opacity duration-[300ms] ease-in-out;
    }

    @media (prefers-reduced-motion: reduce) {
        .ticker-enter-active,
        .ticker-leave-active,
        .ticker-enter-active .note-icon,
        .ticker-enter-active .note-text {
            @apply transition-none;
        }
    }

    .linear-gradient-text {
        @apply bg-gradient-to-r from-[#205EFB] to-[#B36DFF] bg-clip-text text-transparent;
    }

    .product-card-navigation {
        &.carousel__prev {
            @apply left-3 min-[800px]:left-[calc(50%-(600px/2)-3rem)] min-[1024px]:left-[calc(50%-(800px/2)-3rem)] desktop:left-[calc(50%-(920px/2)-3rem)] -translate-x-1/2;
        }

        &.carousel__next {
            @apply right-3 min-[800px]:right-[calc(50%-(600px/2)-3rem)] min-[1024px]:right-[calc(50%-(800px/2)-3rem)] desktop:right-[calc(50%-(920px/2)-3rem)] translate-x-1/2;
        }
    }

    .new-landing-section-title {
        @apply text-[#141414] font-medium text-center text-2xl leading-8 tablet-md:text-3.5xl tablet-md:leading-[42px] tablet-wide:font-normal tablet-wide:text-[42px] tablet-wide:leading-[60px];
    }

    .new-landing-section-subtitle {
        @apply font-franklin text-BW/06 font-normal text-center text-base leading-5.5 tablet-md:text-lg tablet-md:leading-[26px] tablet-wide:leading-7;
    }

    /* NewHero background wrapper - responsive width with DPR compensation */
    .hero__bg-wrapper {
        width: 768px;
    }

    @media (min-width: 768px) {
        .hero__bg-wrapper {
            width: 1440px;
        }
    }

    @media (min-width: 1440px) {
        .hero__bg-wrapper {
            width: 2560px;
        }
    }

    @media (min-width: 2561px) {
        .hero__bg-wrapper {
            width: 7040px;
        }
    }

    @media (min-width: 3441px) {
        .hero__bg-wrapper {
            width: 7680px;
        }
    }

    /* Compensation for Windows zoom 125% (-webkit-device-pixel-ratio: 1.25) */
    @media (min-width: 2561px) and (-webkit-device-pixel-ratio: 1.25) {
        .hero__bg-wrapper {
            width: calc(7040px / 1.25);
        }
    }

    @media (min-width: 3441px) and (-webkit-device-pixel-ratio: 1.25) {
        .hero__bg-wrapper {
            width: calc(7680px / 1.25);
        }
    }

    /* Article content styles — .dp for dynamic HTML content */
    .dp h2 {
        font-family: Poppins, sans-serif;
        font-size: 1.55rem;
        font-weight: 700;
        color: #111;
        margin-top: 0;
        margin-bottom: 0.5rem;
    }

    .dp h3 {
        font-family: Poppins, sans-serif;
        font-size: 1.05rem;
        font-weight: 600;
        color: #111;
        margin-top: 2rem;
        margin-bottom: 0.5rem;
    }

    .dp p {
        margin-bottom: 1rem;
        color: #444;
        line-height: 1.8;
        font-size: 14.5px;
    }

    .dp a {
        color: #205EFB;
        text-decoration: none;
    }

    .dp a:hover {
        text-decoration: underline;
    }

    .dp strong {
        font-weight: 600;
        color: #111;
    }

    .dp ul,
    .dp ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
        color: #444;
        line-height: 1.85;
        font-size: 14.5px;
    }

    .dp ul {
        list-style: disc;
    }

    .dp ol {
        list-style: decimal;
    }

    .dp li {
        margin-bottom: 0.45rem;
    }

    .dp blockquote {
        border-left: 3px solid #205EFB;
        padding: 0.6rem 1rem;
        margin: 1rem 0;
        background: #f5f8ff;
        border-radius: 0 6px 6px 0;
        color: #555;
        font-size: 14px;
    }

    .dp code {
        background: #f0f4ff;
        color: #205EFB;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 0.85em;
        font-family: monospace;
    }

    .dp img {
        max-width: 100%;
        width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1rem 0;
        display: block;
    }

    .dp iframe {
        max-width: 100%;
        border: none;
        border-radius: 8px;
    }

    .dp .yt-facade {
        position: relative;
        width: 100%;
        max-width: 100%;
        margin: 1rem 0;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        aspect-ratio: 16 / 9;
        background: #000;
    }

    .dp .yt-facade img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        margin: 0;
        border-radius: 0;
    }

    .dp .yt-facade__play {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 68px;
        height: 48px;
        background: rgba(23, 23, 23, 0.8);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dp .yt-facade--active {
        aspect-ratio: auto;
        padding-bottom: 56.25%;
        height: 0;
        cursor: default;
    }

    .dp .yt-facade--active iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
    }

}

.shift-fade-enter-active,
.shift-fade-leave-active {
    transition: all .5s ease;
    position: relative;
}

.shift-fade-enter-from {
    opacity: 0;
    transform: translateY(100%);
}

.shift-fade-leave-active {
    position: absolute;
}

.shift-fade-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.shift-fade-move {
    transition: transform .5s ease;
}

.shift-fade-top-enter-active,
.shift-fade-top-leave-active {
    transition: all 0.5s ease;
}

.shift-fade-top-enter-from {
    opacity: 0;
    transform: translateY(-100%);
}

.shift-fade-top-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

.shift-fade-top-move {
    transition: transform 0.5s ease;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-delayed-enter-active {
    transition: opacity 0.5s ease 0.5s;
}

.fade-delayed-leave-active {
    transition: opacity 0.5s ease;
}

.fade-delayed-enter-from,
.fade-delayed-leave-to {
    opacity: 0;
}

.skeleton-enter-active,
.skeleton-leave-active {
    transition: opacity 0.6s ease-in-out;
}

.skeleton-enter-from,
.skeleton-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(150%);
    opacity: 0;
}

.accordion-enter-active,
.accordion-leave-active {
    transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out;
    overflow: hidden;
}

.accordion-enter-from {
    max-height: 0;
    opacity: 0;
}

.accordion-enter-to {
    max-height: 100vh;
    opacity: 1;
}

.accordion-leave-from {
    max-height: 100vh;
    opacity: 1;
}

.accordion-leave-to {
    max-height: 0;
    opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
    transition: opacity .5s ease, transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(1.1);
}

.modal-enter-to,
.modal-leave-from {
    opacity: 1;
    transform: scale(1);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity .5s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
    opacity: 1;
}

/* ApexCharts custom tooltip (OverviewGrowthChart): strip the library's default
   container frame so the inline-Tailwind tooltip fully controls its own border,
   radius, shadow and background. Scoped to .growth-chart so other charts keep
   their defaults. ApexCharts injects its own <style> at runtime, hence !important. */
.growth-chart .apexcharts-tooltip {
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
}

/* No focus/selection outline on click (bar charts focus the SVG/series and the
   browser draws a contour around the first element). */
.growth-chart :focus,
.growth-chart :focus-visible {
    outline: none !important;
}

/* ApexCharts draws a stroke contour around the click-selected column; we don't
   use selection, so force every bar to have no stroke. */
.growth-chart .apexcharts-bar-area {
    stroke-width: 0 !important;
    stroke: transparent !important;
}

/* Hover crosshair: exact 2px dashed "4 6" line in Tinted/200. ApexCharts'
   stroke.dashArray option only accepts a single number, so the 4/6 pattern is
   set here. */
.growth-chart .apexcharts-xcrosshairs {
    stroke: #C9CCDD !important;
    stroke-width: 2 !important;
    stroke-dasharray: 4 6 !important;
    fill: transparent !important;
}

/* X-axis labels: anchor to the LEFT edge of the tick instead of centering on it
   (ApexCharts has no native align option for the x-axis; it sets
   text-anchor:middle). Only for the horizontal case — labels are horizontal from
   tablet-wide (1024px) up; below that they're rotated (-45/-90), where
   left-anchoring would misplace them. */
@media (min-width: 1024px) {
    .growth-chart .apexcharts-xaxis-label {
        text-anchor: start !important;
    }
}

/* Category bar charts (e.g. Monthly returns): center the X labels under the bar
   instead of the left-anchored default used by the datetime area charts. */
.growth-chart-x-center .apexcharts-xaxis-label {
    text-anchor: middle !important;
}

/* Currency/instrument icon inside notification title_html (rendered via v-html,
   so scoped styles and Tailwind classes don't reach it). The backend inlines its
   own width/height on the <img>, so !important is required to force the canonical
   14x14 render size regardless of what the backend sends. */
.pair-icon {
    width: 14px !important;
    height: 14px !important;
}
```
```
