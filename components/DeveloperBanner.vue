<script setup lang="ts">
// The invite banner under the developer hero — Figma 3157:7247.
//
// Two nested boxes, which is the same construction as the pricing row and the
// Trustpilot reviews: a tinted outer shell (16px of it, all round) holding a
// near-white inner card with a 2px white stroke. The shell's wash is the
// `ea-cta-shell` token, where its relationship to the other two is written up.
//
// The heading takes the developer's name as a parameter and paints it in the
// brand gradient, anchored to the whole heading exactly as the hero's H1 is —
// see `.ea-grad-run` in main.css for why that is not `.ea-grad`.
</script>

<template>
    <section class="py-10 tablet:py-14 tablet-wide:py-16">
        <div class="ea-container">
            <div v-reveal class="rounded-[20px] bg-ea-cta-shell p-4">
                <!-- The white stroke is an inset ring, not a border: Figma draws
                     it inside the box, so a border would add its 4px to the
                     shell's height and push the drawn 372px band to 376. -->
                <div
                    class="flex flex-col items-center overflow-hidden rounded-xl bg-Tinted/25
                           px-5 py-8 text-center ring-2 ring-inset ring-white tablet:px-8"
                >
                    <!-- Drawn at 28/1.35/-1px, which is one step BELOW `.ea-h2`'s
                         smallest — this is an invite, not a section heading — so
                         the three steps are written out here rather than added to
                         the shared display scale for a single call site.
                         `text-balance` stands in for the drawn line break, which
                         cannot be hard-coded around a name of unknown length. -->
                    <i18n-t
                        keypath="devBanner.title"
                        tag="h2"
                        class="ea-grad-run max-w-[560px] text-balance font-poppins text-[22px] font-medium
                               leading-[1.35] tracking-[-0.7px] text-[#1E1E1E]
                               tablet:text-[25px] tablet:tracking-[-0.9px]
                               tablet-wide:text-[28px] tablet-wide:tracking-[-1px]"
                    >
                        <template #name>
                            <span class="ea-grad-run__accent">{{ DEVELOPER.name }}</span>
                        </template>
                    </i18n-t>

                    <div class="pt-4">
                        <AppButton :label="$t('devBanner.cta')" :href="APPLY_HREF" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
