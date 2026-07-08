# easyalgos-web3

Redesign of the [easyalgos.ai](https://easyalgos.ai/) home page in the
corporate-financial aesthetic seeded by
[EasyAlgos-ICPrecision-2](https://github.com/age401/EasyAlgos-ICPrecision-2)
(Mercury-bank-like: white surfaces, hairline structure, one gradient accent,
data-as-decoration).

- **Stack**: Nuxt 3 + Tailwind v3 (`@nuxtjs/tailwindcss`), hand-written
  components only — no UI kit (see the seed's `PROJECT_STACK_GUIDE_FOR_AI.md`).
- **Design system**: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — tokens, type scale,
  motion and component inventory. Utilities are the IC Precision `icp-*` classes
  promoted to `ea-*` with identical values.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run generate   # static build
```

Page assembly: [pages/index.vue](pages/index.vue) → self-contained sections in
[components/home/](components/home).
