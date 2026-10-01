<script setup lang="ts">
// /pricing — "section - FAQ" (Figma 3507:11753).
//
// Eyebrow, module heading, then four question rows and the Apply CTA. Each row
// is a heading wrapping a real <button>, so the list is keyboard-operable and
// announces its state; the answer collapses on `.ea-collapse` (0fr -> 1fr) and
// is `inert` while closed. Rows open independently — reading one answer should
// not snap another shut under the reader's eye.
//
// From the file: rows 12px top and bottom over a 1px Tinted/100 rule, which
// turns 2px Tinted/600 on the open row; the question Poppins Medium 16/140%; the
// answer Roboto 14/155% Neutral/500, 8 above and 16 + the row's 12 below,
// capped at 840 (the button gives up 4 of its 12 when open to make the 8). The
// chevron is the "Expand Indicator" component: a 24px disc that tints on hover,
// its 14x8 glyph flipped when open. The frame opens the second question, so
// that is the initial state here too.
//
// The column is the page container's 1360 (it was 1440 in the first frame).
import { PRICING_FAQ } from '~/data/content'

const openIds = ref(new Set<string>(['changePlan']))

function toggle(id: string) {
    const next = new Set(openIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    openIds.value = next
}
</script>

<template>
    <section class="bg-white pb-[72px] pt-[56px] tablet:pb-[96px] tablet:pt-[72px] tablet-wide:pb-[128px] tablet-wide:pt-[96px] desktop:pb-[192px]">
        <div class="ea-container">
            <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('pricingPage.faq.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-module-heading mt-6">{{ $t('pricingPage.faq.title') }}</h2>

            <div v-reveal="160" class="mt-6">
                <div
                    v-for="id in PRICING_FAQ"
                    :key="id"
                    :class="[
                        'transition-[border-color] duration-500',
                        openIds.has(id) ? 'border-b-2 border-Tinted/600' : 'border-b border-Tinted/100'
                    ]"
                >
                    <h3>
                        <button
                            :id="`faq-q-${id}`"
                            type="button"
                            :class="['group flex w-full items-start gap-5 pt-3 text-left', openIds.has(id) ? 'pb-2' : 'pb-3']"
                            :aria-expanded="openIds.has(id)"
                            :aria-controls="`faq-a-${id}`"
                            @click="toggle(id)"
                        >
                            <span class="min-w-0 flex-1 font-poppins text-[15px] font-medium leading-[1.4] text-Tinted/950 tablet:text-[16px]">
                                {{ $t(`pricingPage.faq.items.${id}.q`) }}
                            </span>
                            <span
                                class="relative grid size-6 shrink-0 place-items-center rounded-full transition-colors group-hover:bg-[rgb(105_115_175/0.1)]"
                                aria-hidden="true"
                            >
                                <span :class="['grid place-items-center transition-transform duration-300', openIds.has(id) && '-scale-y-100']">
                                    <img src="/img/icons/expand-14.svg" alt="" width="14" height="8" class="h-2 w-3.5 group-hover:hidden" />
                                    <img src="/img/icons/expand-14-hover.svg" alt="" width="14" height="8" class="hidden h-2 w-3.5 group-hover:block" />
                                </span>
                            </span>
                        </button>
                    </h3>

                    <div
                        :id="`faq-a-${id}`"
                        role="region"
                        :aria-labelledby="`faq-q-${id}`"
                        class="ea-collapse"
                        :data-open="openIds.has(id)"
                        :inert="!openIds.has(id)"
                    >
                        <div>
                            <p class="max-w-[840px] pb-7 pr-11 font-franklin text-[14px] leading-[1.55] text-Neutral/500">
                                {{ $t(`pricingPage.faq.items.${id}.a`) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-reveal="200" class="mt-12">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
