<script setup lang="ts">
// "module Hero" on the EasyAlgos for Developers page — Figma 3196:7953.
//
// The pitch to EA DEVELOPERS: build once, earn on every trade. Not to be confused
// with DeveloperHero, which is the other page's hero and sells one named
// developer's EAs to traders — see pages/for-developers.vue for why the two are
// kept apart by name.
//
// Three layers, back to front:
//   1. the cube field. Drawn in Figma as a flat PNG because Figma cannot draw a
//      conveyor; here it is the real 3D scene — see ForDevHeroScene, including
//      why it is a GLB and not a video, and why none of it is in the LCP path.
//   2. a white ellipse that lifts the copy off the field. Figma exports it as an
//      SVG; it is a radial gradient, so it is one here instead of a request — and
//      as a gradient it scales with the hero instead of being pinned to the drawn
//      1114x290.
//   3. the copy, which is `PageHeading` — the SAME component the frame instances
//      (3191:11679 is an instance of page Heading, 3019:32056). So this hero is
//      that template plus a background, not a new heading built to look like one.
//
// The entrance is the shared scroll-reveal stagger PageHeading already applies.
// It needs no scroll dependency: v-reveal's observer fires immediately for
// anything already on screen, which above the fold is everything.
</script>

<template>
    <!-- The drawn frame is 1920x822 under a 68px topbar. Height comes from the
         content rather than being pinned to 822: the copy block is the tallest
         thing in it at every width, and forcing the drawn height would leave a
         band of empty field under the Trustpilot row on a phone. `min-h` keeps
         the field generous on a wide screen, where the copy alone would leave it
         shallower than drawn.

         `isolate` so the layers below stack against this section and not against
         whatever the page does; `overflow-hidden` because the cube field is a
         full-bleed canvas and the ellipse deliberately overruns the text column. -->
    <section
        id="top"
        class="relative isolate flex min-h-[560px] flex-col items-center justify-center overflow-hidden
               tablet-wide:min-h-[680px] desktop:min-h-[760px]"
    >
        <ForDevHeroScene />

        <!-- The white lift. Drawn 1114x290 centred on the 1920x822 frame, i.e.
             58% x 35% of it — kept as percentages so it tracks the hero at any
             size. `closest-side` and the stop ladder are what stop it reading as
             a hard-edged white pill over the wireframe: it has to be gone by the
             rim, and most of the falloff has to happen in the last third or the
             copy sits on a visible disc. -->
        <div
            class="pointer-events-none absolute left-1/2 top-1/2 h-[46%] w-[74%] -translate-x-1/2 -translate-y-1/2
                   tablet-wide:h-[38%] tablet-wide:w-[62%]"
            style="
                background: radial-gradient(
                    ellipse closest-side,
                    rgb(255 255 255) 0%,
                    rgb(255 255 255) 42%,
                    rgb(255 255 255 / 0.85) 62%,
                    rgb(255 255 255 / 0.45) 80%,
                    rgb(255 255 255 / 0) 100%
                );
            "
            aria-hidden="true"
        />

        <PageHeading surface="none" class="relative w-full">
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
