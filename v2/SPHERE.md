# The fractured sphere

The WebGL visual in `ProblemSphereSection` ("The old ecosystem"). A sphere
broken into plates, rotating slowly, with six labelled trust concerns pinned to
individual plates.

Its shape is **not** hand-modelled — it is a parameter set over a baked fracture
pattern, so new looks are a preset rather than new code.

## Layout

```
utils/sphereFragments.ts   generated Voronoi cells (16/32/48/80) — do not hand-edit
utils/sphereVariants.ts    presets + geometry builders (pure math, no three.js)
utils/sphereLabels.ts      label copy + "which cell does this label sit on"
components/ProblemSphere.vue      the three.js stage (takes a variant)
components/ProblemSphereSection.vue   section chrome (heading, copy, dark band)
pages/sphere-lab.vue       internal noindex page to compare variants
scripts/gen-sphere-multi.mjs      re-bakes sphereFragments.ts
```

The split matters: `sphereVariants.ts` imports no three.js and returns plain
number arrays, so geometry stays testable and auto-importable, and the WebGL
layer stays thin.

## The knobs

| Knob | Effect |
| --- | --- |
| `cells` | Which baked pattern (16, 32, 48, 80) |
| `inset` | Shrink each plate toward its centre. `1` = plates touch; below opens gaps |
| `thickness` | Extrude inward — plates become slabs rather than infinitely thin caps |
| `explode` | Outward offset, always positive, varied per plate |
| `radialSpread` | **Signed** offset — plates ride out *and* sink in |
| `drift` | Per-plate tumble amplitude. `0` keeps them still |
| `noise` | Fractal radial displacement — a rough, rocky skin |
| `jagged` | Ragged plate borders instead of clean n-gons |
| `flatten` | Collapse each plate onto one plane (one normal per plate) |
| `core` | Opaque inner sphere, so plates can stay thin |
| `subdiv` | Triangle subdivision before displacement (needs `thickness: 0`) |
| `edges` | Draw the fracture lines |
| `light` | Per-variant ambient/key/fill override |

## Presets

| id | Look |
| --- | --- |
| `more-shards` | 80 cells, fine fracture web |
| `separation` | Inset + extruded, visible gaps and lit side walls |
| `exploded-drift` | Plates thrown outward at varying distance, tumbling |
| `surface-noise` | Subdivided and displaced — a cracked rock |
| `combination` | Denser fracture, slabs, slight drift, rough skin |
| `fractured-shell` | **Current default.** Torn-edged flat plates seated at different depths, no gaps, no strokes, read purely by light |

Compare them at **`/sphere-lab`** (unlinked, `noindex`).

Change what the home page uses via `DEFAULT_VARIANT_ID` in `sphereVariants.ts`.

## Re-baking the fracture pattern

```bash
npm run gen:sphere
```

Only needed to change cell counts or the seed distribution. The output is
committed; the app never computes it. The script is deterministic — re-running
it without edits produces no diff.

## Things that will bite you

These are all load-bearing; each one was a visible bug first.

- **Fan a curved cap and it reads as a cone.** Triangulating a plate from its
  centre out to a boundary that follows the sphere gives every triangle a
  slightly different normal, which flat-shades into a radiating star. `flatten`
  collapses the plate onto a single plane so it takes one clean value.
- **Jitter must depend on position only.** `jagged` moves boundary points
  sideways. With `inset: 1` neighbouring plates *share* those points, so the
  nudge is derived purely from a point's coordinates, never from which cell is
  asking — otherwise neighbours disagree and the shell tears open.
- **Edge lines must follow the surface they sit on.** A straight chord between
  two ring corners sinks beneath a subdivided-and-displaced face, and the
  fracture lines silently vanish. Edge loops are walked at the same subdivision
  resolution as the face.
- **`core` must clear the lowest plate underside** — `(1 - radialSpread) -
  thickness` — or it pokes through a sunken plate.
- **Camera distance is derived from the stage aspect**, not fixed. Unlike a 2D
  canvas, a perspective camera doesn't rescale with its container, so a fixed
  distance overflows a narrow (mobile) stage. See `sizeStage()`.
- **three.js is imported dynamically inside `onMounted`.** Keep it that way: it
  stays out of the server bundle and off the hydration path, and the heading,
  copy and every label render server-side as ordinary text.

## Performance

- Variants without per-plate motion merge into **one mesh + one LineSegments**,
  so 80 plates cost the same draw calls as 16. Only `drift` variants build
  per-plate objects.
- The render loop is gated on an IntersectionObserver and stops off-screen.
- `prefers-reduced-motion` renders a single fixed pose with all labels visible.
- Measured ~75fps on the default preset.

> When measuring, use a **fresh** browser. A long-lived automated session
> degrades to ~1fps across the whole page — including with the sphere's loop
> stopped — which looks exactly like a rendering regression and is not one.

## Open

- **Label density on narrow screens.** At some rotations the six labels crowd
  near the top on a 375px viewport. They're clamped so they never cause
  horizontal scroll, but a mobile-specific treatment (fewer labels, or a larger
  stage) is still wanted.
