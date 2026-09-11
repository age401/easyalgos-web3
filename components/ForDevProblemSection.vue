<script setup lang="ts">
// The three questions under the developer-recruitment hero — Figma 3191:11681.
//
// Named for what it says rather than what the node is called: the frame is
// "module - How We Make It Easier For You", but its eyebrow reads THE PROBLEM and
// every word in it is a problem, not an easing. The node name looks left over from
// whatever it was duplicated from. Worth knowing when matching this against the
// file.
//
// Structurally the same opening as every module on this page — the Figma "module
// Heading" component (3109:7076) built from the semantic display styles, so
// nothing here picks a size — then the cards, then the page's one CTA.
//
// The questions are the section's argument, so they are a LIST: three items of
// the same kind, which is what a screen reader should hear. The chevron in front
// of each is drawn as a text character and stays one, inside the item rather than
// as a marker, so it travels with the line when the question wraps.
const QUESTIONS = ['one', 'two', 'three'] as const
</script>

<template>
    <!-- `.ea-section` is the drawn 192 top and bottom at desktop, on the house
         ramp down to 72 on a phone. -->
    <section class="ea-section bg-white">
        <div class="ea-container">
            <!-- The eyebrow's rule is the brand gradient here, not the dimmed
                 currentColor the section eyebrows use, and sits 8px off the label
                 instead of 12 — which is exactly what `--brand` is, added for this
                 page's hero. -->
            <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('forDevProblem.eyebrow') }}</p>

            <!-- One sentence, wrapping where the column runs out. Figma sets the
                 first run at #141414 and the last at Tinted/950 (#1c1833); both
                 take the type token's Tinted/950 here, because a two-unit
                 difference in ink mid-sentence is not a thing anyone can see and
                 encoding it would mean a second colour on the display scale. -->
            <h2 v-reveal="90" class="ea-module-heading mt-6 max-w-[1100px]">
                {{ $t('forDevProblem.titleLine1') }}
                <span class="ea-grad">{{ $t('forDevProblem.titleAccent') }}</span>
                {{ $t('forDevProblem.titleLine2') }}
            </h2>

            <p v-reveal="180" class="ea-module-description mt-6 max-w-[640px]">
                {{ $t('forDevProblem.lead') }}
            </p>

            <!-- Drawn 12px apart and equal width. `grid` rather than `flex` for
                 exactly that: three tracks of `1fr` are equal whatever is in them,
                 where flex children size to content unless every one of them is
                 told not to. One column below tablet-wide — at 1024 a third of the
                 row is too narrow for a 20px question. -->
            <ul class="mt-12 grid list-none gap-3 tablet-wide:mt-16 tablet-wide:grid-cols-3">
                <li
                    v-for="(id, index) in QUESTIONS"
                    :key="id"
                    v-reveal="240 + index * 90"
                    class="flex flex-col items-start rounded-3xl border-2 border-Tinted/100 bg-white px-8 pb-12 pt-6"
                >
                    <!-- The drawn 48px bubble: a 2px near-white ring over an
                         off-centre wash that lights it from the top left. The wash
                         is Tinted/500 at 20% falling to nothing — a gradient, not
                         an asset, so it stays crisp at any zoom.
                         #F5F6FF is a one-off drawn value; the nearest token
                         (Tinted/25, #F7F7FB) is a touch warmer and reads grey
                         against the blue-white ring beside it. -->
                    <span
                        class="mb-4 mt-1 grid size-12 place-items-center rounded-full border-2 border-[#F5F6FF]"
                        style="
                            background: radial-gradient(
                                circle at 26% 12%,
                                rgb(122 127 163 / 0) 55%,
                                rgb(122 127 163 / 0.12) 80%,
                                rgb(122 127 163 / 0.2) 100%
                            );
                        "
                    >
                        <img
                            src="/img/icons/server-config.svg"
                            alt=""
                            width="24"
                            height="24"
                            loading="lazy"
                            aria-hidden="true"
                            class="size-6"
                        />
                    </span>

                    <p class="flex gap-2 font-poppins text-[20px] font-semibold leading-7 tracking-[-0.5px] text-Ink/950">
                        <span class="w-3 shrink-0 text-Blue/600" aria-hidden="true">›</span>
                        <span>{{ $t(`forDevProblem.${id}`) }}</span>
                    </p>
                </li>
            </ul>

            <!-- Left-aligned, as drawn — the module's "Tools" row is
                 `items-start` on the full content column, so the CTA sits under
                 the first card rather than centred under all three. -->
            <div v-reveal="500" class="mt-12">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
