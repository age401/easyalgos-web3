<script setup lang="ts">
// "The Model" — EasyAlgos against traditional EA sales, Figma 3281:24669.
//
// Two lists of seven, set side by side so each EasyAlgos row reads against the
// traditional row level with it. They are drawn as two very different objects,
// and that difference IS the argument:
//
//   EasyAlgos    the raised one. A 16px lavender gradient frame around a white-
//                ringed inner card, the wordmark as its title, a blue tick per
//                row. 480 wide and the full height of the comparison.
//   Traditional  the recessed one. 448 wide and inset 24px top and bottom, so it
//                reads as tucked BEHIND the EasyAlgos card; a Tinted/900 title
//                bar, a grey thumbs-down per row, fainter separators. Its left
//                edge has no stroke — it runs under the EasyAlgos card.
//
// Both are lists, which is what a screen reader should hear: two <ul>s, each
// labelled by its title. The EasyAlgos title is the logo, so its list takes an
// explicit aria-label instead.
//
// Below tablet-wide the pair stacks, EasyAlgos first, and the traditional card
// is still tucked behind — now UNDER it: flush against its bottom edge, inset
// 16 / 20 a side, top corners square, all four strokes on (360 / 600 frames).
// Type and discs shrink on a phone: 14 / 140% rows on a 32 slot.
//
// Both cards put 16px between their title and their list (the card's
// auto-layout gap) — the `mt-4` on each list — except where the file doesn't:
// the EasyAlgos card at 360 and the traditional card from tablet-wide.
//
// Stroke and fill are read off the nodes, not the design-context export (which
// flattens gradient strokes): the traditional card's stroke runs Tinted/900 ->
// #CECAE4 top to bottom, painted as a border-box layer under a transparent
// border. Figma strokes are INSIDE and CSS borders sit outside the padding box,
// so the drawn 32px side padding is 30 + the 2px border.
const EASYALGOS = ['lifetime', 'volume', 'locked', 'code', 'performance', 'focus', 'reach'] as const
const TRADITIONAL = ['oneTime', 'launches', 'piracy', 'cracked', 'marketing', 'pressure', 'userBase'] as const
</script>

<template>
    <section class="ea-section bg-white">
        <div class="ea-container">
            <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('forDevModel.eyebrow') }}</p>

            <h2 v-reveal="90" class="ea-module-heading mt-6">
                {{ $t('forDevModel.titleLead') }}
                <span class="ea-grad">{{ $t('forDevModel.titleAccent') }}</span>{{ $t('forDevModel.titleTail') }}
            </h2>

            <p v-reveal="180" class="ea-module-description mt-6 max-w-[640px]">
                {{ $t('forDevModel.lead') }}
            </p>

            <div
                v-reveal="260"
                class="mt-12 flex flex-col items-center tablet-wide:mt-16 tablet-wide:flex-row tablet-wide:items-stretch tablet-wide:justify-center"
            >
                <!-- EasyAlgos. The frame's gradient runs almost left to right
                     (92.5deg), lavender into the Tinted/400 grey. On a phone the
                     frame is 8 thick and the inner card has no white ring; the
                     rows carry their own 12 / 8 side padding so the separators
                     still run edge to edge. -->
                <div
                    class="relative z-10 flex w-full max-w-[480px] flex-col rounded-[20px] p-2 tablet:p-4"
                    style="background: linear-gradient(92.53deg, #d8daeb 0%, #bfc3e0 39.42%, #969bbf 100%)"
                >
                    <div
                        class="flex-1 overflow-hidden rounded-xl pb-6 tablet:border-4 tablet:border-white tablet:px-7 tablet:pb-5 tablet-wide:pb-9"
                        style="background: linear-gradient(-57.29deg, #f7f7fb 0%, #fff 50%)"
                    >
                        <!-- The file's "Topbar Logo" instance, 152x28 on a phone and
                             204x38 from 600: the mark and wordmark are the header's
                             own files, scaled. -->
                        <div class="flex h-[76px] items-center justify-center gap-[7px] py-6 tablet:h-[90px] tablet:gap-[9.4px] tablet:pb-4 tablet:pt-9">
                            <img src="/img/logo-mark.svg" alt="" width="36" height="36" class="h-[26.6px] w-auto tablet:h-[35.7px]" />
                            <img src="/img/logo-wordmark.svg" alt="" width="159" height="31" class="h-[23.1px] w-auto tablet:h-[31px]" />
                        </div>

                        <ul class="list-none tablet:mt-4 tablet:py-4" :aria-label="$t('forDevModel.easyalgosLabel')">
                            <li
                                v-for="(id, index) in EASYALGOS"
                                :key="id"
                                class="flex min-h-8 items-center gap-3 pl-3 pr-2 tablet:min-h-10 tablet:gap-4 tablet:px-0"
                                :class="index ? 'mt-2 border-t border-Tinted/100 pt-[7px] tablet:mt-[11px] tablet:pt-3' : ''"
                            >
                                <!-- 40px slot, 32px disc (32 / 25.6 on a phone)
                                     washed from clear to 80% at the rim, lit from
                                     above, with a 10% ring 4px (3px) wide OUTSIDE
                                     it — the file's stroke is OUTSIDE, so it is a
                                     spread shadow here and the disc keeps its full
                                     32px of wash. -->
                                <span class="grid size-8 shrink-0 place-items-center tablet:size-10" aria-hidden="true">
                                    <span
                                        class="grid size-[25.6px] place-items-center rounded-full shadow-[0_0_0_3px_rgba(98,103,143,0.1)] tablet:size-8 tablet:shadow-[0_0_0_4px_rgba(98,103,143,0.1)]"
                                        style="background: radial-gradient(70.31% 70.31% at 50% 29.69%, rgb(122 127 163 / 0) 0%, rgb(122 127 163 / 0.2) 55%, rgb(122 127 163 / 0.8) 90%)"
                                    >
                                        <img src="/img/icons/check-16.svg" alt="" width="16" height="16" class="size-[12.8px] tablet:size-4" />
                                    </span>
                                </span>
                                <span class="font-franklin text-[14px] leading-[1.4] text-Tinted/950 tablet:text-[18px] tablet:leading-[1.65]">
                                    {{ $t(`forDevModel.easyalgos.${id}`) }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Traditional. Below tablet-wide it hangs UNDER the EasyAlgos
                     card, inset 16 (20 from 600) either side with its top corners
                     square, so it reads as tucked behind it. From tablet-wide the
                     flex row stretches it to the EasyAlgos card's height and py-6
                     is the drawn 24px inset inside that. -->
                <div class="flex w-full max-w-[480px] px-4 tablet:px-5 tablet-wide:w-[448px] tablet-wide:max-w-none tablet-wide:px-0 tablet-wide:py-6">
                    <div
                        class="flex-1 overflow-hidden rounded-b-[20px] border-2 border-transparent pb-[22px] tablet-wide:rounded-bl-none tablet-wide:rounded-tr-[20px] tablet-wide:border-l-0 tablet-wide:pb-[38px]"
                        style="
                            background:
                                linear-gradient(-56.59deg, #f7f7fb 0%, #fff 50%) padding-box,
                                linear-gradient(180deg, #2f2a4a 0%, #cecae4 100%) border-box;
                        "
                    >
                        <h3
                            id="for-dev-model-traditional"
                            class="bg-Tinted/900 px-[30px] pb-4 pt-[14px] text-center font-poppins text-[20px] font-medium leading-[1.4] tracking-[-1px] text-white
                                   tablet:text-[28px] tablet:leading-[1.35] tablet-wide:pb-5 tablet-wide:pt-[26px]"
                        >
                            {{ $t('forDevModel.traditionalTitle') }}
                        </h3>

                        <ul class="mt-4 list-none tablet:px-[30px] tablet:py-4 tablet-wide:mt-0" aria-labelledby="for-dev-model-traditional">
                            <li
                                v-for="(id, index) in TRADITIONAL"
                                :key="id"
                                class="flex min-h-8 items-center gap-3 pl-[10px] pr-[6px] tablet:min-h-10 tablet:gap-4 tablet:px-0"
                                :class="index ? 'mt-2 border-t border-Tinted/50 pt-[7px] tablet:mt-[11px] tablet:pt-3' : ''"
                            >
                                <!-- Same disc at half strength: the file sets the
                                     wash layer to 50% and its rim to 60%. -->
                                <span class="grid size-8 shrink-0 place-items-center tablet:size-10" aria-hidden="true">
                                    <span
                                        class="grid size-[25.6px] place-items-center rounded-full shadow-[0_0_0_3px_rgba(98,103,143,0.1)] tablet:size-8 tablet:shadow-[0_0_0_4px_rgba(98,103,143,0.1)]"
                                        style="background: radial-gradient(70.31% 70.31% at 50% 29.69%, rgb(122 127 163 / 0) 0%, rgb(122 127 163 / 0.1) 55%, rgb(122 127 163 / 0.3) 90%)"
                                    >
                                        <img src="/img/icons/thumb-down-16.svg" alt="" width="16" height="16" class="size-[12.8px] tablet:size-4" />
                                    </span>
                                </span>
                                <span class="font-franklin text-[14px] leading-[1.4] text-Tinted/950 tablet:text-[18px] tablet:leading-[1.65]">
                                    {{ $t(`forDevModel.traditional.${id}`) }}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Centred under the pair, as drawn ("Tools" is items-center here,
                 unlike the left-aligned CTA in The Problem). -->
            <div v-reveal="340" class="mt-12 flex justify-center">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
