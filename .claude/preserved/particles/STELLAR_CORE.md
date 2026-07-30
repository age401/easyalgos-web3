# The Stellar core

The WebGL visual in `OldEcosystemSection` ("The old ecosystem"). Three nested
populations of monochrome grains chase an invisible orbiting target for five
seconds, brake to a standstill, and then implode into their own centre.

Its shape is **not** hand-modelled — it is a parameter set, so a new look is a
config edit rather than new code.

## Layout

```
utils/stellarCore.ts          config + geometry builder (pure math, no three.js)
components/StellarCore.vue    the three.js stage
components/OldEcosystemSection.vue   section chrome (heading, copy, dark band)
```

The split matters: `stellarCore.ts` imports no three.js and returns plain number
arrays, so geometry stays testable and auto-importable, and the WebGL layer
stays thin.

## The three populations

Each `ParticleLayer` is a cloud of grains around the origin. `rMin: 0` fills a
volume out to `rMax`, distributed by the `falloff` exponent — `1/3` spreads
points evenly through the volume, and anything higher packs them toward the
centre and thins the edge. A band with `rMin > 0` is a shell instead.

| | radius band | count | gradient | strays |
| --- | --- | --- | --- | --- |
| **Core** | 0 → 0.44 | 320 | `edgeSize 0.62`, `edgeBright 0.42` | 7, out to 1.9× |
| **Band** | 0.46 → 0.90 | 700 | `edgeSize 0.22`, `edgeBright −0.18` | 10, out to 1.45× |
| **Outer** | 0.95 → 1.32 | 520 | `edgeSize −0.30`, `edgeBright −0.34` | 14, out to 1.55× |

- **The container sphere.** A layer's `rMax` is an invisible boundary, and
  `edgeSize` / `edgeBright` are what make it legible without drawing it: both run
  `1 - edge` at the middle of the band to `1 + edge` at its boundary. Positive
  values give a stratum that is fine and dim where it is dense and coarse and
  bright where it thins — a lit shell. Negative values dissolve the silhouette
  instead. The gradients are independent of `count`, so density and grain size
  are separate decisions.
- **Outliers.** `outliers` seeds a few strays past `rMax`, out to `reach × rMax`,
  so a boundary reads as a tendency rather than a wall.
- **Determinism.** Directions come from a salted golden-angle spiral plus hash
  jitter, never `Math.random()` — the cloud is rebuilt on every mount, and one
  that reshuffled would flicker between page loads.

## Motion

- **Chasing a target.** `orbit` defines an invisible object circling the centre,
  and a layer's `follow` says how it reacts. This is what buys motion that reads
  as *alive* instead of geared: the target's angular position surges rather than
  advancing evenly (`surge` radians, `cycles` sprints per loop), and `skew` adds
  second-harmonic content so a sprint is a quick dart and a long glide rather
  than a symmetric sine swell. Each follower takes `gain` of that surge through a
  first-order lag of `lag` loops. Two strata differing only in `lag` end up on
  genuinely different velocity curves, not the same curve at two amplitudes —
  the lag cuts and delays the harmonic far harder than the fundamental.
  Followers turn about the *orbit* axis, so a surge cuts across the global
  rotation instead of just modulating it. The core runs between 0.12 and
  0.91 rad/s (a 7.7× swing) against the band's 2.0×; the outer field ignores the
  target entirely and drifts on its own axis at a flat 0.126 rad/s, which is what
  makes the inner two look like they are reacting to something.
- **Strata only rotate.** Nothing translates a layer, and the three populations
  are concentric, so the cloud turns about a centre pinned to the middle of the
  stage.
- **The sequence.** `playMs` at full speed, `brakeMs` decelerating, `holdMs` dead
  still, then `collapseMs` of every grain rushing into the centre and vanishing —
  6.79s in total. Two clocks drive it. Rotation, spin and surge all read a
  *motion clock* that decays to zero across the brake — one clock, so they arrive
  at rest together instead of each on its own schedule — while the collapse runs
  on wall time, since it has to keep moving after everything else has stopped.
  `loopMs` still sets the surge period; it just never gets to wrap.

## Rendering

One `ShaderMaterial` per stratum — three draw calls, whatever the grain count.
Grains carry their own size and brightness as vertex attributes, so the depth
shading costs nothing per frame on the CPU. Additive, `depthWrite` off, and the
scene carries no lights at all.

- **Flat treatment.** Grains are filled circles with a ~1px rim ramp (enough to
  stop small ones stair-stepping), and `levels` snaps every grain's brightness
  onto that many discrete steps. The two belong together: a flat grain with a
  continuous ramp has nothing carrying its depth. Quantisation is applied *after*
  the depth term, so depth arrives as a few bands rather than a smooth falloff.
  `color` is white, so the scale resolves to neutral greys.
- **Depth.** `depthFade` dims the back of the cloud. Additive points occlude
  nothing, so it is the only thing supplying depth once the cluster turns.
- **The collapse** is a scale toward the model origin, applied in the vertex
  shader rather than to the holder's transform — the point size has to shrink
  with it, or the cloud converges into a solid disc of full-size dots instead of
  a point. The last 14% fades out, or it ends as a knot of one-pixel dots
  (`gl_PointSize` is floored at 1).
- **Transparent clear**, so the section's own ink band shows through rather than
  the stage carrying a backdrop of its own.

## Things that will bite you

These are all load-bearing; each one was a visible bug first.

- **Outliers can't be the last N points of a layer.** `spiralDirection` walks y
  monotonically from pole to pole, so a contiguous tail drops every stray in the
  same hemisphere. They are spread across the spiral index instead.
- **The lag response is solved in closed form, not integrated.** A simulated
  follower would still be settling when the surge period wraps. Solving it
  analytically is also what makes one `lag` value per stratum enough to produce
  distinct velocity curves, since the harmonic is attenuated and delayed more
  than the fundamental for free.
- **Surge amplitude is bounded by the steady rate.** Past ~0.16 the core runs
  backwards between sprints, which reads as a wobble rather than a chase.
- **An off-centre layer and a fixed centre are the same knob.** A knot that
  drifts through the volume is exactly a knot that moves the composition's centre
  of mass around the canvas. You cannot have both.
- **The brake profile has to be rate-continuous.** It is the integral of
  `(1-u)²`, which is exactly rate-1 where playback ends and exactly 0 at the end.
  A position ease (`1-(1-u)³`) jumps the rate to 3× at the moment the brake
  starts — the cluster lurches *forward* before slowing.
- **Camera distance is derived from the stage aspect**, not fixed. Unlike a 2D
  canvas, a perspective camera doesn't rescale with its container, so a fixed
  distance overflows a narrow (mobile) stage. See `sizeStage()`.
- **three.js is imported dynamically inside `onMounted`.** Keep it that way: it
  stays out of the server bundle and off the hydration path, so the heading and
  copy render server-side as ordinary text.

## Performance

- Three draw calls; ~1540 grains.
- The render loop is gated on an IntersectionObserver and stops off-screen. The
  clock rewinds on the way out, so a one-shot piece replays when scrolled back to
  rather than returning the viewer to an empty stage.
- `prefers-reduced-motion` renders a single frame from the middle of playback.

> When measuring, use a **fresh** browser. A long-lived automated session
> degrades to ~1fps across the whole page — including with the loop stopped —
> which looks exactly like a rendering regression and is not one.

## Open

- **What happens after the implosion.** It currently holds collapsed. The
  candidates are a re-expansion into a loop, or handing off to whatever comes
  next in the section.
