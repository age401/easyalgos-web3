<script setup lang="ts">
// Footer.
//
// Figma 676:2183. The whole thing is one 1360px column (`.ea-container`) holding
// a vertical stack whose blocks are separated by a uniform 96px at 1920 — head,
// link columns, rule, featured articles, rule, EA/developer directory, rule,
// legal, rule, copyright. Structure comes from data/site.ts and labels from i18n;
// the EA and developer names are proper nouns and stay as written.
//
// The head is TWO rows, not one four-up grid: the wordmark sits alone, and the
// three contacts sit on a second row 24px below it, sharing the same four-column
// grid as the link columns so they line up with "Getting started" / "Support" /
// "Links". The fourth slot of that second row is the locale switcher — reserved
// but not built here (see the comment on the empty cell).
//
// Type: every label in this footer is Roboto Regular 16/16 with letter-spacing
// 2% (= 0.02em). Figma reports that spacing as a PERCENT, which is why it was
// missed before — 2% of 16px is only 0.32px, but across a footer this dense the
// absence of it is visible as cramped, slightly-too-dark rows. The only text
// that is NOT 2% is the legal block and the copyright line, which are 0.
//
// Line-height is the one deliberate deviation. Figma sets 16px line-height and a
// 12px gap between rows (a 28px step) because nothing wraps in a 1920 frame. At
// 16px Roboto a 16px line-height is unreadable the moment a link DOES wrap, so
// the 4px is moved out of the gap and into the leading: `leading-5` (20px) with
// `space-y-2` (8px) is the same 28px step, and wrapped lines stay legible.
// That `leading-5` is repeated on every `<ul>`: an inline `<a>` does not set its
// own line box — the `<li>`'s strut does — so leading on the anchor alone leaves
// the rows at the inherited 24px and the step silently drifts to 32.
//
// The legal text is intentionally English in every locale — it quotes CFTC Rule
// 4.41(b)(1) / NFA Rule 2-29, whose wording is prescribed, and machine-translating
// financial risk disclosure would change its legal meaning. See data/site.ts.
//
// The copyright year is evaluated at build time (the route is prerendered), so it
// is correct on every deploy instead of being a literal that goes stale.
const year = new Date().getFullYear()

// The four footer-link components in Figma (445:1756 mail, 445:1759 telegram,
// 445:1764 youtube, 445:1842 plain text) share ONE type ramp and ONE interaction:
// Roboto Regular 16, ls 2%, and a 60ms ease-out colour change to Violet/400
// (#8B7EFF) on hover. Nothing moves — the design has no hover translate.
//
// They differ in exactly two ways, both handled in the template rather than here:
//  - resting colour: Tinted/25 for the plain links, Tinted/200 for the contacts;
//  - the mail link has NO icon. Only telegram and youtube carry one (20x20,
//    1.5px stroke in the text colour, 12px gap).
//
// These live here as class constants rather than as a shared `.ea-footer-link`
// utility because the footer needs three variants of one ramp (link, leaf,
// heading) that differ only in colour and hover — cheaper to compose from a
// shared string than to carry three near-identical utilities. The old
// `.ea-footer-link` was deleted with this change: it had leading-7, no
// letter-spacing and a white + translateX(2px) hover, none of which the Figma
// components do.
const LINK_TYPE = 'font-franklin text-[15px] leading-5 tracking-[0.02em] tablet:text-[16px]'
const LINK_HOVER = 'transition-colors duration-[60ms] ease-out hover:text-Violet/400'

/** A clickable footer link. */
const LINK = `${LINK_TYPE} ${LINK_HOVER} text-Tinted/25`
/** An EA name. Same ramp, but these are not links yet, so no hover affordance. */
const LEAF = `${LINK_TYPE} text-Tinted/25`
/** A column heading, and the developer names, which are typed as headings. */
const HEADING = `${LINK_TYPE} mb-3 text-Tinted/500`
/** The 2px rule between blocks. Figma 676:2239 — Neutral/700, full-bleed. */
const RULE = 'my-16 h-0.5 border-0 bg-Neutral/700 tablet-wide:my-24'

// Only telegram and youtube are drawn with a mark; mail is text alone.
const CONTACT_ITEMS = [
    { id: 'email', label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { id: 'telegram', label: CONTACT.telegram.label, href: CONTACT.telegram.href },
    { id: 'youtube', label: CONTACT.youtube.label, href: CONTACT.youtube.href }
]
</script>

<template>
    <footer data-dark-band class="ea-dark bg-Neutral/800 py-16 tablet-wide:py-24">
        <div class="ea-container">
            <!-- Head, row 1: the wordmark, alone. -->
            <!-- `flex w-fit`, not `inline-flex`: an inline-level box sits on a
                 text baseline and drags the row's descender space into the 24px
                 gap below it. -->
            <a href="/" class="flex w-fit shrink-0 items-center gap-1.5" aria-label="EasyAlgos">
                <img src="/img/logo-mark.svg" alt="" width="22" height="22" class="h-[22px] w-[22px]" />
                <img
                    src="/img/logo-wordmark.svg"
                    alt="EasyAlgos"
                    width="93"
                    height="18"
                    class="h-[18px] w-[93px]"
                    style="filter: brightness(0) invert(1)"
                />
            </a>

            <!-- Head, row 2: the three contacts, on the same four-column grid as
                 the link columns below so they align with the group headings. -->
            <div class="mt-6 grid grid-cols-1 gap-x-6 tablet-wide:gap-x-14 gap-y-4 tablet:grid-cols-2 tablet-wide:grid-cols-4">
                <a
                    v-for="item in CONTACT_ITEMS"
                    :key="item.id"
                    :href="item.href"
                    :rel="item.id === 'email' ? undefined : 'noopener'"
                    :target="item.id === 'email' ? undefined : '_blank'"
                    :class="[LINK_TYPE, LINK_HOVER, 'inline-flex items-center gap-3 justify-self-start text-Tinted/200']"
                >
                    <!-- The mail component (445:1756) is text only — deliberately
                         no envelope mark, unlike telegram and youtube. -->
                    <svg
                        v-if="item.id !== 'email'"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        class="shrink-0"
                    >
                        <template v-if="item.id === 'telegram'">
                            <path
                                d="M18 3 2.6 9.1c-.7.3-.7 1.2.1 1.4l3.5 1 1.3 4c.2.7 1.1.8 1.5.2l1.9-2.6 3.6 2.7c.6.4 1.4.1 1.6-.6L18.9 4c.2-.8-.5-1.4-1.2-1.1Z"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linejoin="round"
                            />
                            <path d="m7.5 11.5 8-5.5-5.6 6.6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                        </template>
                        <template v-else>
                            <rect x="1.8" y="4.5" width="16.4" height="11" rx="3" stroke="currentColor" stroke-width="1.5" />
                            <path d="M8.6 7.8v4.4L12.6 10 8.6 7.8Z" fill="currentColor" />
                        </template>
                    </svg>
                    {{ item.label }}
                </a>

                <!-- The locale switcher, right-aligned in the fourth column of
                     this row (Figma 676:2197, in-place sample 687:7335). It is
                     shown at every width, unlike the cell that used to hold its
                     place — on a phone the contact rows stack and the chip simply
                     becomes the last of them, which is better than hiding the
                     only way to change language on the smallest screens. -->
                <div class="flex tablet-wide:justify-end">
                    <LanguageSelector />
                </div>
            </div>

            <!-- Link columns. The head has 32px of its own bottom padding on top
                 of the stack's 96px gap, hence the larger step here. -->
            <nav class="mt-20 grid grid-cols-2 gap-x-6 tablet-wide:gap-x-14 gap-y-10 tablet-wide:mt-32 tablet-wide:grid-cols-4" :aria-label="$t('footer.srNav')">
                <div v-for="group in FOOTER_GROUPS" :key="group.id">
                    <h2 :class="HEADING">{{ $t(`footer.groups.${group.id}`) }}</h2>
                    <ul class="space-y-2 leading-5">
                        <li v-for="link in group.links" :key="link.id">
                            <a :href="link.href" :class="LINK">{{ $t(`footer.links.${link.id}`) }}</a>
                        </li>
                    </ul>
                </div>

                <!-- Brokers. These really are brokers in the reference (IC Markets,
                     IC Trading); the EA developers have their own violet-headed
                     block further down. -->
                <div>
                    <h2 :class="HEADING">{{ $t('footer.groups.brokers') }}</h2>
                    <ul class="space-y-2 leading-5">
                        <li v-for="broker in FOOTER_BROKERS" :key="broker.label">
                            <a :href="broker.href" rel="noopener nofollow" target="_blank" :class="LINK">
                                {{ broker.label }}
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <hr :class="RULE" />

            <!-- Featured articles: one heading over two half-width columns. -->
            <div>
                <h2 :class="HEADING">{{ $t('footer.groups.featuredArticles') }}</h2>
                <div class="grid grid-cols-1 gap-x-6 tablet-wide:gap-x-14 tablet-wide:grid-cols-2">
                    <ul v-for="(column, index) in FOOTER_ARTICLES" :key="index" class="space-y-2 leading-5">
                        <li v-for="article in column" :key="article.id">
                            <a :href="article.href" :class="LINK">{{ $t(`footer.articles.${article.id}`) }}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr :class="RULE" />

            <!-- Expert Advisors & Developers. One violet heading, then a four-up
                 grid of five developers; the fifth wraps onto a second grid row,
                 which is why the row gap is the full 96px rather than a tighter
                 in-block value. -->
            <div>
                <h2 :class="[LINK_TYPE, 'mb-10 text-Violet/500']">{{ $t('footer.groups.developers') }}</h2>
                <div class="grid grid-cols-2 gap-x-6 gap-y-12 tablet-wide:grid-cols-4 tablet-wide:gap-x-14 tablet-wide:gap-y-24">
                    <div v-for="developer in FOOTER_DEVELOPERS" :key="developer.name">
                        <h3 :class="HEADING">{{ developer.name }}</h3>
                        <ul class="space-y-2 leading-5">
                            <li v-for="ea in developer.eas" :key="ea" :class="LEAF">{{ ea }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <hr :class="RULE" />

            <!-- Legal. A 800/1360 column pinned to the right edge in the reference,
                 so it reads as fine print rather than as body copy. -->
            <div class="tablet-wide:ml-auto tablet-wide:w-[58.83%]">
                <h2 class="font-franklin text-[12px] font-medium leading-4 text-white">
                    {{ $t('footer.legal.natureTitle') }}
                </h2>
                <p
                    v-for="(paragraph, index) in LEGAL_NATURE_OF_BUSINESS"
                    :key="`nature-${index}`"
                    class="mt-6 font-franklin text-[12px] leading-4 text-Neutral/300"
                >
                    {{ paragraph }}
                </p>

                <h2 class="mt-6 font-franklin text-[12px] font-medium leading-4 text-white">
                    {{ $t('footer.legal.earningsTitle') }}
                </h2>
                <p
                    v-for="(paragraph, index) in LEGAL_EARNINGS_AND_RISK"
                    :key="`earnings-${index}`"
                    class="mt-6 font-franklin text-[12px] leading-4 text-Neutral/300"
                >
                    {{ paragraph }}
                </p>
            </div>

            <hr class="mt-16 h-0.5 border-0 bg-Neutral/700 tablet-wide:mt-24" />

            <p class="mt-6 text-center font-franklin text-[14px] leading-4 text-Neutral/400">
                {{ $t('footer.copyright', { year }) }}
            </p>
        </div>
    </footer>
</template>
