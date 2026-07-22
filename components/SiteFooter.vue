<script setup lang="ts">
// Institutional footer: wordmark, four link columns, then the risk disclosure
// treated with the prominence a financial firm owes it.
const columns = [
    {
        title: 'Platform',
        links: [
            { label: 'Expert Advisors', href: 'https://easyalgos.ai/expert-advisors' },
            { label: 'AlgoScore', href: 'https://easyalgos.ai/algoscore' },
            { label: 'Performance', href: 'https://easyalgos.ai/results' },
            { label: 'Research', href: 'https://easyalgos.ai/research' },
        ],
    },
    {
        title: 'Membership',
        links: [
            { label: 'Apply for access', href: 'https://easyalgos.ai/' },
            { label: 'Membership terms', href: 'https://easyalgos.ai/pricing' },
            { label: 'For developers', href: 'https://easyalgos.ai/developers' },
            { label: 'Help center', href: 'https://easyalgos.ai/help' },
        ],
    },
    {
        title: 'Brokers',
        links: [
            { label: 'IC Markets', href: 'https://easyalgos.ai/' },
            { label: 'IC Trading', href: 'https://easyalgos.ai/' },
            { label: 'IC Precision', href: 'https://easy-algos-ic-precision-2.vercel.app/' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'Contact', href: 'https://easyalgos.ai/contacts' },
            { label: 'Reviews', href: 'https://easyalgos.ai/reviews' },
            { label: 'Telegram', href: 'https://easyalgos.ai/' },
            { label: 'YouTube', href: 'https://easyalgos.ai/' },
        ],
    },
]
</script>

<template>
    <footer class="border-t border-Tinted/100 bg-Tinted/25">
        <div class="eal-container pb-10 pt-16 tablet-md:pt-20">
            <div class="grid grid-cols-1 gap-12 tablet-md:grid-cols-[1.2fr_2fr] tablet-wide:gap-20">
                <div>
                    <img src="/img/easyalgos-logo.svg" alt="EasyAlgos" class="h-[22px] w-auto" width="172" height="32" />
                    <p class="mt-5 max-w-[19rem] font-franklin text-[13.5px] leading-[1.7] text-Tinted/500">
                        Algorithmic trading, held to an institutional standard.
                        Est. 2017.
                    </p>
                    <p class="eal-num mt-6 font-franklin text-[13px] text-Tinted/500">
                        <a href="mailto:info@easyalgos.ai" class="transition-colors duration-300 hover:text-Ink/950">info@easyalgos.ai</a>
                    </p>
                </div>

                <nav class="grid grid-cols-2 gap-10 tablet:grid-cols-4" aria-label="Footer">
                    <div v-for="column in columns" :key="column.title">
                        <p class="font-poppins text-[11px] font-medium uppercase tracking-[0.15em] text-Tinted/400">{{ column.title }}</p>
                        <ul class="mt-5 space-y-3">
                            <li v-for="link in column.links" :key="link.label">
                                <a :href="link.href" class="font-franklin text-[14px] text-Tinted/700 transition-colors duration-300 hover:text-Ink/950">
                                    {{ link.label }}
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <div class="mt-16 border-t border-Tinted/100 pt-8">
                <p class="font-franklin text-[12px] leading-[1.75] text-Tinted/500">
                    <strong class="font-medium text-Tinted/600">Risk disclosure.</strong>
                    Trading foreign exchange and contracts for difference on margin carries a high level of
                    risk and may not be suitable for all investors. Past performance, whether verified or
                    otherwise, is not a reliable indicator of future results. Automated strategies can and
                    do experience drawdowns and losing periods. You should not commit capital you cannot
                    afford to lose, and you should satisfy yourself that you understand the risks involved
                    before applying. EasyAlgos provides software and infrastructure; it does not provide
                    investment advice, and nothing on this page constitutes a recommendation to trade.
                </p>
                <div class="mt-8 flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
                    <p class="eal-num font-franklin text-[12.5px] text-Tinted/500">&copy; 2026 EasyAlgos. All rights reserved.</p>
                    <div class="flex items-center gap-6">
                        <a href="https://easyalgos.ai/" class="font-franklin text-[12.5px] text-Tinted/500 transition-colors duration-300 hover:text-Ink/950">Privacy</a>
                        <a href="https://easyalgos.ai/" class="font-franklin text-[12.5px] text-Tinted/500 transition-colors duration-300 hover:text-Ink/950">Terms</a>
                        <a href="https://easyalgos.ai/" class="font-franklin text-[12.5px] text-Tinted/500 transition-colors duration-300 hover:text-Ink/950">Cookies</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>
