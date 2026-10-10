<script setup lang="ts">
// "section - Passive Income" (22:1609) — how the program works, in three cards.
//
// From the file: 192px section rhythm; the H2 "Getting passive income for life
// with our affiliate program is this easy:" with the run in the gradient, 64
// below it to the cards; three equal cards 24 apart, 2px Tinted/100 rule, 24px
// corners, 24/32/48 padding; a 48px icon bubble, then title (Poppins SemiBold
// 20/28 at -0.5px, with a Blue/600 "›") and Roboto 16/140% Tinted/700 body.
//
// The bubble is the one /for-developers draws, so it IS that component
// (ForDevIconBubble): its 2px ring is a #F5F6FF -> #7A7FA3 gradient stroke,
// which the design-context export flattens to solid #F5F6FF. The two-tone
// glyphs inside (Tinted/600 + Blue/400) are solid strokes and ship as exported.
// The third card — the one that pays — is drawn differently: a lavender frame
// around an inset white-to-Tinted/25 panel, so the eye lands on the result.
//
// Ours: one column below `tablet-wide`.
import { AFF_STEPS } from '~/data/affiliates'
</script>

<template>
    <section class="ea-section bg-white">
        <div class="ea-container">
            <h2 v-reveal class="ea-h2 max-w-[1360px]">
                {{ $t('affiliates.steps.titleBefore') }}<span class="ea-grad">{{ $t('affiliates.steps.titleAccent') }}</span>{{ $t('affiliates.steps.titleAfter') }}
            </h2>

            <ol class="mt-12 grid gap-6 tablet-wide:mt-16 tablet-wide:grid-cols-3">
                <li
                    v-for="(step, i) in AFF_STEPS"
                    :key="step.id"
                    v-reveal="120 + i * 90"
                    :class="[
                        'overflow-hidden rounded-3xl border-2 border-Tinted/100',
                        i === AFF_STEPS.length - 1 ? 'aff-step--result p-2' : 'bg-white px-8 pb-12 pt-6'
                    ]"
                >
                    <div :class="i === AFF_STEPS.length - 1 ? 'aff-step__panel rounded-2xl px-8 pb-10 pt-4' : ''">
                        <div class="p-1 pb-4">
                            <ForDevIconBubble :icon="step.icon" />
                        </div>
                        <h3 class="flex items-center gap-2 font-poppins text-[18px] font-semibold leading-7 tracking-[-0.5px] text-[#0B1125] tablet:text-[20px]">
                            {{ $t(`affiliates.steps.items.${step.id}.title`) }}
                            <span class="text-Blue/600" aria-hidden="true">›</span>
                        </h3>
                        <p class="mt-1 max-w-[600px] font-franklin text-[16px] leading-[1.4] text-Tinted/700">
                            {{ $t(`affiliates.steps.items.${step.id}.body`) }}
                        </p>
                    </div>
                </li>
            </ol>

            <div v-reveal="200" class="mt-12">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
