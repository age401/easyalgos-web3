<script setup lang="ts">
// "Requirements" — the five conditions for joining, Figma 3388:11825.
//
// A two-column module: the heading, lead and CTA on the left, and on the right
// one bordered panel holding the five requirements as rows split by 2px rules.
// It is a list, so it is a <ul>; each row's title and explanation are a <strong>
// and a <p> inside it rather than a heading each — five h3s would outnumber the
// page's actual sections in the outline.
//
// The bubble is ForDevIconBubble, the one The Problem opens its cards with. The
// chevron here trails the title (it LEADS in The Problem).
//
// The rows sit inside the panel's 2px CSS border, which Figma draws INSIDE the
// panel, so the drawn 20 / 32 side padding is 18 / 30 here — without that the
// text column comes out 4px narrow and two descriptions wrap a line early.
//
// Stacks below tablet-wide, heading first. The columns are equal (`flex-1` each
// in the file), 60 apart.
const REQUIREMENTS = ['performance', 'reviews', 'original', 'backtesting', 'support'] as const
</script>

<template>
    <section class="ea-section bg-white">
        <div class="ea-container flex flex-col gap-12 tablet-wide:flex-row tablet-wide:items-start tablet-wide:gap-[60px]">
            <div class="flex-1">
                <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t('forDevRequirements.eyebrow') }}</p>

                <h2 v-reveal="90" class="ea-module-heading mt-6">{{ $t('forDevRequirements.title') }}</h2>

                <p v-reveal="180" class="ea-module-description mt-6 max-w-[640px]">
                    {{ $t('forDevRequirements.lead') }}
                </p>

                <div v-reveal="260" class="mt-10 tablet-wide:mt-16">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <ul v-reveal="200" class="flex-1 list-none overflow-hidden rounded-3xl border-2 border-Tinted/100">
                <li
                    v-for="id in REQUIREMENTS"
                    :key="id"
                    class="flex items-start gap-4 border-b-2 border-Tinted/100 bg-white px-[18px] py-5 last:border-b-0 tablet:gap-8 tablet:px-[30px] tablet:py-6"
                >
                    <!-- 32px on a phone, as the 360 frame draws it; 48 from 600. -->
                    <ForDevIconBubble icon="/img/icons/check-circle.svg" compact-icon="/img/icons/check-circle-16.svg" />

                    <div class="min-w-0 max-w-[600px]">
                        <!-- Inline, not a flex row: when a title wraps on a phone
                             the chevron has to follow its last word, not float off
                             to the end of the first line. -->
                        <p class="font-poppins text-[16px] font-semibold leading-[1.4] tablet:text-[20px] tablet:leading-7 tablet:tracking-[-0.5px]">
                            <strong class="font-semibold text-Ink/950">{{ $t(`forDevRequirements.items.${id}.title`) }}</strong>
                            <span class="ml-2 inline-block text-Blue/600" aria-hidden="true">›</span>
                        </p>
                        <p class="mt-2 font-franklin text-[14px] leading-[1.4] text-Tinted/700 tablet:mt-1 tablet:text-[16px]">
                            {{ $t(`forDevRequirements.items.${id}.description`) }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
