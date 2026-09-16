<script setup lang="ts">
// "module Hero" on the EasyAlgos for Developers page — Figma 3196:7953.
//
// The pitch to EA DEVELOPERS: build once, earn on every trade. Not to be confused
// with DeveloperHero, which is the other page's hero and sells one named
// developer's EAs to traders — see pages/for-developers.vue for why the two are
// kept apart by name.
//
// Four layers, back to front:
//   1. the ripple orbit field — concentric rings radiating from behind the
//      headline, pulsed outward on a slow cadence. See ForDevHeroField, and
//      utils/rippleField.ts for the design's own numbers.
//
//      It REPLACES the wireframe cube conveyor that used to be here, which Figma
//      drew as a flat PNG (3205:25371) and which this codebase played as the real
//      3D scene. That component is still in the tree as ForDevHeroScene, with its
//      GLB and its optimiser, and putting it back is this one line — nothing else
//      in the hero was built around either of them.
//   2. a radial fade that lifts the copy off the field, in the same role as the
//      white ellipse Figma exports as an SVG (which is why it is a gradient here
//      rather than a request): it scales with the hero instead of being pinned to
//      the drawn 1114x290. Its geometry is now the handoff's, tuned against this
//      hero's real copy over this field.
//   3. a vertical fade at the top and bottom edges, which the ellipse never
//      needed — the rings are the first thing in this hero with any reason to run
//      into the topbar's border or into the module below.
//   4. the copy, which is `PageHeading` — the SAME component the frame instances
//      (3191:11679 is an instance of page Heading, 3019:32056). So this hero is
//      that template plus a background, not a new heading built to look like one.
//
// The entrance is the shared scroll-reveal stagger PageHeading already applies.
// It needs no scroll dependency: v-reveal's observer fires immediately for
// anything already on screen, which above the fold is everything.
</script>

<template>
    <!-- The drawn frame is 1920x822 under a 68px topbar. What is held here is not
         that height but the VIEWPORT: the hero and the bar above it fill the
         screen between them. `.ea-fordev-hero` is that subtraction — it is in
         main.css rather than an arbitrary class because it needs the `vh`/`svh`
         fallback pair, which is two declarations of one property; see the comment
         on it for why `dvh` is not what this wants.

         It is a MINIMUM, not a height. Where the copy is taller than the screen —
         a short landscape window, a large text size — the section grows with it,
         and `py` is what keeps the copy off the seams when it does. Below that it
         is inert, because flex centring has already placed the block.

         `isolate` so the layers below stack against this section and not against
         whatever the page does; `overflow-hidden` because the field is a
         full-bleed canvas and the fades deliberately overrun the text column.

         The section paints no ground of its own, which is what the field needs:
         it draws on transparency, and the page's white shows through it. Both
         fades below are that same white for the same reason — a wash in any other
         tone would band against it. -->
    <section
        id="top"
        class="ea-fordev-hero relative isolate flex flex-col items-center justify-center
               overflow-hidden py-10 tablet-wide:py-14 desktop:py-16"
    >
        <ForDevHeroField />

        <!-- The white lift, and the one layer of this that is not optional: the
             rings run straight under the headline, and this is the whole of what
             keeps it crisp.
             Centred on the FIELD's centre (50%, 45%) rather than on the box, so
             the densest part of the wash sits over the densest part of the field.
             The two percentages are radii, not a size, so the ellipse is about
             90% of the hero wide by the time it reaches transparent — most of the
             falloff happening in the last third is what stops it reading as a
             white disc laid over the rings. -->
        <div
            class="pointer-events-none absolute inset-0"
            style="
                background: radial-gradient(
                    58% 44% at 50% 45%,
                    rgb(255 255 255 / 0.94) 0%,
                    rgb(255 255 255 / 0.8) 42%,
                    rgb(255 255 255 / 0) 78%
                );
            "
            aria-hidden="true"
        />

        <!-- And the seams. The field has no reason of its own to stop at the
             edges of the section, so it is faded out at both: a ring crossing the
             topbar's border, or carrying on into the module below, reads as a
             mistake rather than as depth. -->
        <div
            class="pointer-events-none absolute inset-0"
            style="
                background: linear-gradient(
                    180deg,
                    rgb(255 255 255 / 0.9) 0%,
                    rgb(255 255 255 / 0) 16%,
                    rgb(255 255 255 / 0) 84%,
                    rgb(255 255 255 / 0.95) 100%
                );
            "
            aria-hidden="true"
        />

        <!-- `flush` because the section centres this rather than stacking it: the
             template's drawn 96-above / 64-below is what gives a heading air at
             the top of an inner page, and here it would only push the block off
             the centre the flex box just put it on. -->
        <PageHeading surface="none" flush class="relative w-full">
            <template #title>
                {{ $t('forDevHero.titleLine1') }}<br />
                <span class="ea-grad">{{ $t('forDevHero.titleLine2') }}</span>
            </template>

            <template #lead>
                {{ $t('forDevHero.lead') }}
            </template>

            <!-- Drawn 48 above and 96 below, which is wider than PageHeading's own
                 actions gap — the block below it is a rating strip rather than the
                 end of the section, and it needs the air. Both buttons are the
                 shared Button component at its drawn variants: Default for the
                 gradient pill, White BG + Stroke for the secondary.

                 `demoHref` is APPLY_HREF for now because the frame draws "Book a
                 demo" with nowhere to go yet — flagged rather than invented. -->
            <template #actions>
                <div class="flex flex-col items-center pt-3 tablet-wide:pt-6">
                    <div class="flex flex-wrap items-center justify-center gap-4">
                        <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                        <AppButton
                            :label="$t('forDevHero.bookDemo')"
                            :href="APPLY_HREF"
                            variant="stroke"
                            :arrow="false"
                        />
                    </div>

                    <div class="pt-14 tablet-wide:pt-[96px]">
                        <TrustpilotRating />
                    </div>
                </div>
            </template>
        </PageHeading>
    </section>
</template>
