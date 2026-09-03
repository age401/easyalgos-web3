<script setup lang="ts">
// One Trustpilot review. Figma 885:2325 — a tinted outer shell holding a
// near-white inner card, the same two-part arrangement as the pricing tiers,
// which is why the shell reuses that gradient family (`bg-ea-review-shell`).
//
// ------------------------------------------------------- The border trap --
// The other bordered cards in this project subtract their rule from the drawn
// padding (`p-[38px]` for a drawn 40, and see `.ea-chip` in main.css), because
// Figma measured those from OUTSIDE the inside-stroke. This card is the other
// case, and it was checked rather than assumed: Figma's Content frame is 408
// wide and its children are 356, so the inset is 26 a side — 24 of padding
// measured from inside a 2px stroke. CSS `border-2 p-[24px]` on a border-box
// element lands the content at exactly 26 too, so the drawn numbers go in
// unmodified here. Copying the p-[38px] habit across would have been 4px wrong.
//
// ------------------------------------------------------------- The height --
// Fixed, not stretched. The cards ride a marquee track that is `items-center`,
// so they cannot rely on a flex parent to equalise them, and the drawn 358px is
// what the content adds up to anyway: 26+36+44+30 of header rows, 104 of body
// at the 4-line clamp, 34 of footer, plus 48 padding and 4 border, plus the
// shell's 32. Shorter reviews leave slack at the bottom exactly as drawn — the
// content is top-aligned, not spread.
//
// The footer slot is always laid out even when there is no link, which is what
// keeps a linkless card the same height as a linked one. Figma draws it the same
// way: four of the five cards carry the slot with its text layer hidden.
//
// WIDTH comes from `--ea-review-w`, set per breakpoint by `.ea-reviews` in
// main.css (78vw / 400 / 440). It is not restated here because the scroller
// derives its mobile centring padding from the same variable, and a second copy
// of the number is a second thing to keep in step. The 440px fallback keeps the
// card sane if it is ever dropped outside that scroller.
//
// The height stays fixed and is padding-driven, so it holds at any width: the
// 4-line body clamp caps the tallest row, and everything else is fixed.
import type { TrustpilotReview } from '~/types/home'

const props = defineProps<{ review: TrustpilotReview }>()

const { locale, t } = useI18n()

// '2026-05-06' through `new Date()` is parsed as UTC midnight, which renders as
// the PREVIOUS day for any reader west of Greenwich. Built in local time so the
// date on the card is the date in the data.
const published = computed(() => {
    const [year, month, day] = props.review.date.split('-').map(Number)
    return new Date(year, month - 1, day)
})

// Formatted through Intl directly rather than through i18n's `d()`, which would
// need a named `datetimeFormats` entry — and this project has nowhere live to
// put one: the root i18n.config.ts is never loaded (nuxt.config.ts sets no
// `vueI18n`, and @nuxtjs/i18n 9 looks under i18n/ for it), which is also why the
// `missingWarn: false` in there does not actually silence anything. Doing it
// here keeps the card working regardless of whether that wiring gets fixed.
//
// SHORT month, matching the drawn "Jul 1, 2026" — so each locale reorders the
// same three fields: "6. Mai 2026", "6 may 2026", "6 de mai. de 2026".
// Recomputed on `locale` so the language selector reformats these live.
const publishedLabel = computed(() =>
    new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'short', day: 'numeric' }).format(published.value)
)

// One sentence carrying everything the star row and the meta line say visually.
// Without it a screen reader gets the author, then five unlabelled boxes.
const srSummary = computed(() =>
    t('trustpilotReviews.srSummary', {
        author: props.review.author,
        rating: props.review.rating,
        date: publishedLabel.value
    })
)
</script>

<template>
    <article
        class="h-[342px] w-[var(--ea-review-w,440px)] shrink-0 rounded-[20px] bg-ea-review-shell p-[12px] tablet:h-[358px] tablet:p-[16px]"
    >
        <div class="flex h-full w-full flex-col rounded-[12px] border-2 border-white bg-surface p-[20px] tablet:p-[24px]">
            <p class="w-full truncate pb-[4px] font-poppins text-[16px] font-medium leading-[22px] text-gray-700">
                {{ review.author }}
            </p>

            <!-- The whole card announced once, then the visual meta row and the
                 stars are both hidden from the accessibility tree. -->
            <p class="sr-only">{{ srSummary }}</p>

            <div
                class="flex w-full items-start justify-between pb-[12px] font-franklin text-[14px] font-normal leading-[24px] text-secondary"
                aria-hidden="true"
            >
                <!-- The bullet is drawn as its own text layer between the country
                     and the count, so it drops with the country rather than
                     leaving a dangling dot on a profile that has no flag. -->
                <span class="flex min-w-0 items-center gap-[4px] truncate">
                    <template v-if="review.country">
                        <span>{{ review.country }}</span>
                        <span>•</span>
                    </template>
                    <span>{{ $t('trustpilotReviews.count', { count: review.reviewCount }, review.reviewCount) }}</span>
                </span>
                <span class="shrink-0 whitespace-nowrap pl-2">{{ publishedLabel }}</span>
            </div>

            <TrustpilotStars :rating="review.rating" class="pb-[20px] [--ea-star:24px]" />

            <blockquote class="min-w-0">
                <p class="w-full truncate pb-[8px] font-franklin text-[16px] font-medium leading-[22px] text-neutral-900">
                    {{ review.title }}
                </p>
                <!-- Four lines at 26px is the 104px the tallest drawn body
                     occupies; the clamp's own ellipsis replaces the "…" the
                     Figma text layers carry inline. -->
                <p class="line-clamp-4 font-franklin text-[16px] font-normal leading-[26px] text-secondary">
                    {{ review.body }}
                </p>
            </blockquote>

            <!-- Always present, so a card without a permalink keeps the height of
                 one that has it. pt is the drawn 12; the row is the drawn 34. -->
            <div class="flex h-[34px] w-full shrink-0 items-center justify-end pt-[12px]">
                <!-- A plain <a>, not NuxtLink, exactly as SiteFooter does for
                     these paths: this project ships only pages/index.vue, so
                     handing /reviews to the router just logs "No match found". -->
                <a
                    v-if="review.url"
                    :href="review.url"
                    class="font-franklin text-[14px] font-medium leading-[18px] tracking-[0.14px] text-neutral-800 underline decoration-transparent underline-offset-2 transition-colors duration-300 hover:decoration-neutral-300"
                    :aria-label="$t('trustpilotReviews.readFullFrom', { author: review.author })"
                >
                    {{ $t('trustpilotReviews.readFull') }}
                </a>
            </div>
        </div>
    </article>
</template>
