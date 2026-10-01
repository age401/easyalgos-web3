<script setup lang="ts">
// "section - Business Model" — "Where's the catch?" (Figma 3514:16409 on the
// /pricing frames). Annotated there as a module already on the home page; the
// repo's home page carries the same story as the collapsible explainer under
// its pricing cards (PricingSection), not as this two-column module, so this is
// its first build. The right column's three intro paragraphs are that
// explainer's strings (`pricing.model.intro1-3`), word for word; the bullets
// and outro are this frame's own wording.
//
// From the frame: two equal columns 60 apart, 48 above and 96 below at
// desktop. Left: eyebrow, module heading with "catch" in the brand gradient,
// Roboto 18/30 in Neutral/800 with 8 between paragraphs, then the page CTA 48
// below. Right: 36 down, Poppins 32/36 at -2px, Roboto 16/26 in Tinted/800, the
// three bullets in 16/22 Medium beside the gradient-ring check, 32 between the
// blocks. Stacks below tablet-wide, left column first.
import { PRICING_MODEL_BULLETS } from '~/data/content'

const INTROS = ['intro1', 'intro2', 'intro3'] as const
</script>

<template>
    <section class="bg-white pb-[72px] pt-8 tablet:pb-[96px] tablet-wide:pt-12">
        <div class="ea-container flex flex-col gap-12 tablet-wide:flex-row tablet-wide:items-start tablet-wide:gap-[60px]">
            <div class="flex-1">
                <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('pricingPage.businessModel.eyebrow') }}</p>

                <h2 v-reveal="90" class="ea-module-heading mt-6">
                    {{ $t('pricingPage.businessModel.titleLead') }}
                    <span class="ea-grad">{{ $t('pricingPage.businessModel.titleAccent') }}</span>{{ $t('pricingPage.businessModel.titleEnd') }}
                </h2>

                <div v-reveal="180" class="mt-6 max-w-[640px] space-y-2 font-franklin text-[16px] leading-[1.7] text-Neutral/800 tablet:text-[18px] tablet:leading-[30px]">
                    <p>
                        {{ $t('pricingPage.businessModel.askIntro') }}<br />
                        {{ $t('pricingPage.businessModel.askQuote') }}
                    </p>
                    <!-- Roboto Medium for the drawn Bold: only 400 and 500 ship. -->
                    <p>
                        <strong class="font-medium text-[#0A0A0A]">{{ $t('pricingPage.businessModel.answer') }}</strong>{{ $t('pricingPage.businessModel.answerEnd') }}
                    </p>
                    <p>{{ $t('pricingPage.businessModel.body') }}</p>
                </div>

                <div v-reveal="260" class="mt-12">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <div v-reveal="200" class="flex-1 tablet-wide:pt-9">
                <h3 class="font-poppins text-[26px] font-medium leading-[1.2] tracking-[-1px] text-Tinted/950 tablet:text-[32px] tablet:leading-9 tablet:tracking-[-2px]">
                    {{ $t('pricingPage.businessModel.howTitle') }}
                </h3>

                <div class="mt-6 space-y-2 font-franklin text-[16px] leading-[26px] text-Tinted/800">
                    <p v-for="key in INTROS" :key="key">{{ $t(`pricing.model.${key}`) }}</p>
                </div>

                <ul class="mt-8 space-y-4 py-3">
                    <li v-for="id in PRICING_MODEL_BULLETS" :key="id" class="flex gap-4">
                        <img src="/img/icons/check-ring-20.svg" alt="" width="20" height="20" class="mt-0.5 size-5 shrink-0" />
                        <span class="font-franklin text-[16px] font-medium leading-[22px] text-Tinted/900">
                            {{ $t(`pricingPage.businessModel.bullets.${id}`) }}
                        </span>
                    </li>
                </ul>

                <p class="mt-8 font-franklin text-[16px] leading-[26px] text-Tinted/800">
                    {{ $t('pricingPage.businessModel.outro') }}
                </p>
            </div>
        </div>
    </section>
</template>
