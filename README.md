# easyalgos-web3

Alternative redesigns of the [easyalgos.ai](https://easyalgos.ai/) home page,
seeded by
[EasyAlgos-ICPrecision-2](https://github.com/age401/EasyAlgos-ICPrecision-2)
(Mercury-bank-like: white surfaces, hairline structure, one gradient accent,
data-as-decoration).

Each version is a **self-contained Nuxt app** in its own folder, so any
number of designs can be run and previewed side by side.

## Versions

- **[v1/](v1/)** — "living financial documents": every module is a financial
  artifact turned instrument. Extends the IC Precision `ea-*` design system
  (see [v1/DESIGN_SYSTEM.md](v1/DESIGN_SYSTEM.md)).
- **[v2/](v2/)** — "The Ledger": an institutional redesign in a paper/ink
  private-bank voice (see [v2/README.md](v2/README.md)).

## Develop

Each folder has its own `package.json` — install and run independently:

```bash
cd v1 && npm install && npm run dev   # http://localhost:3000
cd v2 && npm install && npm run dev   # http://localhost:3001
```

### Preview both at once

`.claude/launch.json` has one entry per version (distinct `cwd` and `port`),
so Claude Code can start them all simultaneously for side-by-side preview.

### Adding a v3 (or later)

1. Create a new top-level folder (`v3/`) with its own Nuxt app.
2. Add an entry to `.claude/launch.json` with that `cwd` and an unused port.
3. Add it to the **Versions** list above.
