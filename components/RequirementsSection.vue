<script setup lang="ts">
// "section - Requirements" — the shared module behind /for-developers'
// five joining conditions (Figma 3388:11825) and /pricing's three steps to get
// started (3507:11855). Same component in the file, different rows.
//
// A two-column module: the heading, optional lead and CTA on the left, and on
// the right one bordered panel holding the rows split by 2px rules. It is a
// list, so it is a <ul>; each row's title and explanation are a <strong> and a
// <p> inside it rather than a heading each — five h3s would outnumber the page's
// actual sections in the outline.
//
// The bubble is ForDevIconBubble, the one The Problem opens its cards with. The
// chevron here trails the title (it LEADS in The Problem).
//
// The rows sit inside the panel's 2px CSS border, which Figma draws INSIDE the
// panel, so the drawn 20 / 32 side padding is 18 / 30 here — without that the
// text column comes out 4px narrow and two descriptions wrap a line early.
//
// Stacks below tablet-wide, heading first. The columns are equal (`flex-1` each
// in the file), 60 apart. Copy lives under `${ns}.eyebrow / .title / .lead /
// .items.<id>.title|description`; the lead is drawn on /for-developers only.
interface RequirementItem {
    id: string
    /** 24px glyph under /public. */
    icon: string
    /** 16px glyph; setting it shrinks the bubble to 32px on a phone. */
    compactIcon?: string
}

defineProps<{
    ns: string
    items: readonly RequirementItem[]
    lead?: boolean
}>()
</script>

<template>
    <section class="ea-section bg-white">
        <div class="ea-container flex flex-col gap-12 tablet-wide:flex-row tablet-wide:items-start tablet-wide:gap-[60px]">
            <div class="flex-1">
                <p v-reveal class="ea-eyebrow ea-eyebrow--brand">{{ $t(`${ns}.eyebrow`) }}</p>

                <h2 v-reveal="90" class="ea-module-heading mt-6">{{ $t(`${ns}.title`) }}</h2>

                <p v-if="lead" v-reveal="180" class="ea-module-description mt-6 max-w-[640px]">
                    {{ $t(`${ns}.lead`) }}
                </p>

                <div v-reveal="260" class="mt-10 tablet-wide:mt-16">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <ul v-reveal="200" class="flex-1 list-none overflow-hidden rounded-3xl border-2 border-Tinted/100">
                <li
                    v-for="item in items"
                    :key="item.id"
                    class="flex items-start gap-4 border-b-2 border-Tinted/100 bg-white px-[18px] py-5 last:border-b-0 tablet:gap-8 tablet:px-[30px] tablet:py-6"
                >
                    <ForDevIconBubble :icon="item.icon" :compact-icon="item.compactIcon" />

                    <div class="min-w-0 max-w-[600px]">
                        <!-- Inline, not a flex row: when a title wraps on a phone
                             the chevron has to follow its last word, not float off
                             to the end of the first line. -->
                        <p class="font-poppins text-[16px] font-semibold leading-[1.4] tablet:text-[20px] tablet:leading-7 tablet:tracking-[-0.5px]">
                            <strong class="font-semibold text-Ink/950">{{ $t(`${ns}.items.${item.id}.title`) }}</strong>
                            <span class="ml-2 inline-block text-Blue/600" aria-hidden="true">›</span>
                        </p>
                        <p class="mt-2 font-franklin text-[14px] leading-[1.4] text-Tinted/700 tablet:mt-1 tablet:text-[16px]">
                            {{ $t(`${ns}.items.${item.id}.description`) }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>
