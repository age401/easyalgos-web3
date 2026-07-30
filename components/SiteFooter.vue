<script setup lang="ts">
// Footer.
//
// Four link columns, then the featured-article grid, then the developer/EA
// directory, then the legal blocks. Structure comes from data/site.ts and labels
// from i18n; the EA and developer names are proper nouns and stay as written.
//
// The legal text is intentionally English in every locale — it quotes CFTC Rule
// 4.41(b)(1) / NFA Rule 2-29, whose wording is prescribed, and machine-translating
// financial risk disclosure would change its legal meaning. See data/site.ts.
//
// The copyright year is evaluated at build time (the route is prerendered), so it
// is correct on every deploy instead of being a literal that goes stale.
const year = new Date().getFullYear()

const CONTACT_ITEMS = [
    { id: 'email', label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { id: 'telegram', label: CONTACT.telegram.label, href: CONTACT.telegram.href },
    { id: 'youtube', label: CONTACT.youtube.label, href: CONTACT.youtube.href }
]
</script>

<template>
    <footer data-dark-band class="ea-dark bg-Neutral/800 pt-[72px] tablet-wide:pt-[88px]">
        <div class="ea-container">
            <!-- Wordmark + contacts -->
            <div class="grid grid-cols-1 gap-8 tablet:grid-cols-2 tablet-wide:grid-cols-4 tablet-wide:gap-6">
                <a href="/" class="flex shrink-0 items-center gap-1.5 self-start" aria-label="EasyAlgos">
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

                <a
                    v-for="item in CONTACT_ITEMS"
                    :key="item.id"
                    :href="item.href"
                    :rel="item.id === 'email' ? undefined : 'noopener'"
                    :target="item.id === 'email' ? undefined : '_blank'"
                    class="ea-footer-link flex items-center gap-3 !text-Tinted/200"
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" class="shrink-0">
                        <template v-if="item.id === 'email'">
                            <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" stroke-width="1.4" />
                            <path d="m3.5 6.5 6.5 4.5 6.5-4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                        </template>
                        <template v-else-if="item.id === 'telegram'">
                            <path d="M18 3 2.6 9.1c-.7.3-.7 1.2.1 1.4l3.5 1 1.3 4c.2.7 1.1.8 1.5.2l1.9-2.6 3.6 2.7c.6.4 1.4.1 1.6-.6L18.9 4c.2-.8-.5-1.4-1.2-1.1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                            <path d="m7.5 11.5 8-5.5-5.6 6.6" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                        </template>
                        <template v-else>
                            <rect x="1.8" y="4.5" width="16.4" height="11" rx="3" stroke="currentColor" stroke-width="1.4" />
                            <path d="M8.6 7.8v4.4L12.6 10 8.6 7.8Z" fill="currentColor" />
                        </template>
                    </svg>
                    {{ item.label }}
                </a>
            </div>

            <!-- Link columns -->
            <nav
                class="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 tablet-wide:mt-20 tablet-wide:grid-cols-4"
                :aria-label="$t('footer.srNav')"
            >
                <div v-for="group in FOOTER_GROUPS" :key="group.id">
                    <h2 class="font-franklin text-[16px] leading-7 text-Tinted/500">
                        {{ $t(`footer.groups.${group.id}`) }}
                    </h2>
                    <ul class="mt-1">
                        <li v-for="link in group.links" :key="link.id">
                            <a :href="link.href" class="ea-footer-link">{{ $t(`footer.links.${link.id}`) }}</a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 class="font-franklin text-[16px] leading-7 text-Tinted/500">
                        {{ $t('footer.groups.brokers') }}
                    </h2>
                    <ul class="mt-1">
                        <li v-for="broker in FOOTER_BROKERS" :key="broker.label">
                            <a :href="broker.href" rel="noopener nofollow" target="_blank" class="ea-footer-link">
                                {{ broker.label }}
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>

            <hr class="my-14 border-Neutral/700 tablet-wide:my-16" />

            <!-- Featured articles -->
            <div>
                <h2 class="font-franklin text-[16px] leading-7 text-Tinted/500">
                    {{ $t('footer.groups.featuredArticles') }}
                </h2>
                <div class="mt-1 grid grid-cols-1 gap-x-6 tablet-wide:grid-cols-2">
                    <ul v-for="(column, index) in FOOTER_ARTICLES" :key="index">
                        <li v-for="article in column" :key="article.id">
                            <a :href="article.href" class="ea-footer-link">{{ $t(`footer.articles.${article.id}`) }}</a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr class="my-14 border-Neutral/700 tablet-wide:my-16" />

            <!-- Developer / EA directory -->
            <div>
                <h2 class="font-franklin text-[16px] leading-7 text-Violet/500">
                    {{ $t('footer.groups.developers') }}
                </h2>
                <div class="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 tablet-wide:grid-cols-4">
                    <div v-for="developer in FOOTER_DEVELOPERS" :key="developer.name">
                        <h3 class="font-franklin text-[16px] leading-7 text-Tinted/500">{{ developer.name }}</h3>
                        <ul class="mt-1">
                            <li v-for="ea in developer.eas" :key="ea">
                                <span class="ea-footer-link block">{{ ea }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-14">
                <h2 class="font-franklin text-[16px] leading-7 text-Tinted/500">
                    {{ $t('footer.groups.expertAdvisors') }}
                </h2>
                <ul class="mt-1 grid grid-cols-2 gap-x-6 tablet-wide:grid-cols-4">
                    <li v-for="ea in FOOTER_EXPERT_ADVISORS" :key="ea">
                        <span class="ea-footer-link block">{{ ea }}</span>
                    </li>
                </ul>
            </div>

            <hr class="my-14 border-Neutral/700 tablet-wide:my-16" />

            <!-- Legal -->
            <div class="tablet-wide:ml-[42%]">
                <h2 class="font-poppins text-[12px] font-medium leading-5 text-white">
                    {{ $t('footer.legal.natureTitle') }}
                </h2>
                <p
                    v-for="(paragraph, index) in LEGAL_NATURE_OF_BUSINESS"
                    :key="`nature-${index}`"
                    class="mt-3 font-franklin text-[12px] leading-[1.55] text-Neutral/400"
                >
                    {{ paragraph }}
                </p>

                <h2 class="mt-8 font-poppins text-[12px] font-medium leading-5 text-white">
                    {{ $t('footer.legal.earningsTitle') }}
                </h2>
                <p
                    v-for="(paragraph, index) in LEGAL_EARNINGS_AND_RISK"
                    :key="`earnings-${index}`"
                    class="mt-3 font-franklin text-[12px] leading-[1.55] text-Neutral/400"
                >
                    {{ paragraph }}
                </p>
            </div>

            <hr class="mt-14 border-Neutral/700 tablet-wide:mt-16" />

            <p class="py-8 text-center font-franklin text-[14px] leading-6 text-Neutral/400">
                {{ $t('footer.copyright', { year }) }}
            </p>
        </div>
    </footer>
</template>
