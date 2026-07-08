<script setup lang="ts">
// Faithful EasyAlgos production footer, restyled to the design system: brand
// block + Trustpilot + award badges, link columns, Expert Advisor collections
// and the full earnings & risk disclaimer.
const columns = [
    {
        head: 'Getting started',
        links: ['Apply now', 'How to join', 'How to onboard', 'How to get your EasyVPS', 'How to start trading'],
    },
    {
        head: 'Links',
        links: ['Log-in', 'EasyVPS', 'About', 'Pricing', 'Affiliates', 'Research', 'Reviews', 'Results', 'Deck', 'AlgoScore'],
    },
    {
        head: 'Featured Articles',
        links: [
            'AI bubble or not, this window won\'t last forever',
            'Is there an AI bubble, and will it pop?',
            'Why AI needs you more than you think',
            'Are we really using AI for trading?',
            'How our AI market forecasts help you trade smarter',
            'Why we don\'t let AI trade on its own',
            'How our Expert Advisors use real AI',
            'The invisible edge behind our EAs visible results',
        ],
    },
    {
        head: 'Support',
        links: ['Help center', 'FAQs', 'Terms', 'Privacy policy'],
    },
]

const brokers = ['IC Markets', 'IC Trading']

const collections = [
    { head: 'EasyAlgos Collection', eas: ['EasyAlgos', 'EasyWaka', 'EasyAI', 'EasyGold', 'EasySentinel', 'EasyNews', 'EasyScalper', 'EasyMomentum'] },
    { head: 'Pavel Udovichenko Collection', eas: ['FastWay', 'MultiWay', 'LittleCrazy'] },
    { head: 'Bogdan Ion Puscasu Collection', eas: ['Quantum Baron', 'Quantum Bitcoin', 'Quantum StarMan', 'Quantum Emperor', 'Quantum King'] },
    { head: 'Jimmy Eriksson Collection', eas: ['Gold Atlas', 'Range Breakout EA', 'The Bitcoin Core'] },
    { head: 'Wim Schrynemakers Collection', eas: ['DayTrade Pro', 'GoldBot One', 'GoldTrade Pro', 'Luna AI', 'The Gold Reaper', 'The ORB Master', 'The Bitcoin Reaper'] },
]

const awards = ['SourceForge · Top Performer · Winter 2026', 'Slashdot · Top Performer · Winter 2026', 'TPS · High Achiever · Winter 2026']

const disclaimer = [
    'Trading foreign exchange ("forex") on margin has large potential rewards but also carries a high level of risk. You must be aware of the risks and be willing to accept them to invest in the foreign exchange ("forex") markets. Don\'t trade with money you can\'t afford to lose. No representation is being made that any account will or is likely to achieve profits or losses similar to those discussed on this website. The past performance of any trading system or methodology is not necessarily indicative of future results.',
    'Be warned that there is a possibility to lose real money if traded on a real money account, and the owners of easyalgos.ai can NOT be held accountable for any losses that may occur including from any potential software bugs/glitches or malfunctions.',
    'Easyalgos.ai and its owners assume no responsibility for errors, inaccuracies or omissions in these materials. They do not warrant the accuracy or completeness of the information, text, graphics, links or other items contained within these materials. Easyalgos.ai and its owners shall not be liable for any special, indirect, incidental, or consequential damages, including without limitation losses, lost revenues, or lost profits that may result from these materials.',
    'We assume that you are legally permitted to purchase and use our products. Making sure that you are following the global and local laws and legislations is your responsibility. We cannot be held responsible for any damages or lawsuit against you due to such regulations.',
    'All information on this website or any software and or guide purchased from this website is for educational purposes only and is not intended to provide financial advice. Any statements about profits or income, expressed or implied, do not represent a guarantee. Your actual trading may result in losses as no trading system is guaranteed. You accept full responsibility for your actions, trades, profit, or loss, and agree to hold the owner of easyalgos.ai and any authorized distributors of this information harmless in any ways. All rights reserved. The use of this website and or its contents constitutes acceptance of our disclaimer.',
]
</script>

<template>
    <footer class="border-t border-Tinted/100 bg-Tinted/25">
        <div class="ea-container py-16 tablet-md:py-20">
            <div class="grid grid-cols-2 gap-x-8 gap-y-12 tablet-md:grid-cols-12">
                <!-- Brand block -->
                <div class="col-span-2 tablet-md:col-span-4">
                    <img src="/img/easyalgos-logo.svg" alt="EasyAlgos" class="h-7 w-auto" width="172" height="32" />
                    <a href="mailto:info@easyalgos.ai" class="mt-5 inline-block font-franklin text-sm text-Tinted/700 transition-colors hover:text-Blue/600">info@easyalgos.ai</a>

                    <div class="mt-4 flex items-center gap-3">
                        <a href="https://t.me/easyalgos" aria-label="Telegram" class="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-Tinted/100 transition-colors hover:bg-Blue/25">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#62678F" aria-hidden="true"><path d="M21.9 4.3 18.7 19c-.2 1-.9 1.2-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.7 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5l18.3-7c.9-.3 1.6.2 1.4 1.1Z"/></svg>
                        </a>
                        <a href="https://youtube.com/@easyalgosAI" aria-label="YouTube" class="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-Tinted/100 transition-colors hover:bg-Blue/25">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#62678F" aria-hidden="true"><path d="M23 12s0-3.2-.4-4.7c-.2-.9-.9-1.5-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4c-.8.2-1.5.8-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4c.8-.2 1.5-.8 1.7-1.7C23 15.2 23 12 23 12ZM9.8 15.3V8.7l6 3.3-6 3.3Z"/></svg>
                        </a>
                    </div>

                    <!-- Trustpilot -->
                    <div class="mt-6 flex items-center gap-2">
                        <span class="font-poppins text-sm font-semibold text-Tinted/900">Trustpilot</span>
                        <span class="flex items-center gap-0.5">
                            <span v-for="s in 5" :key="s" class="flex h-4 w-4 items-center justify-center bg-[#00B67A]">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.5 1.6 6.7L12 16.9 5.8 20.6l1.6-6.7L2.2 9.4l6.9-.6L12 2Z"/></svg>
                            </span>
                        </span>
                    </div>

                    <!-- Award badges -->
                    <ul class="mt-5 flex flex-col gap-2">
                        <li v-for="award in awards" :key="award" class="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-Tinted/100">
                            <span class="h-2 w-2 rounded-full bg-gradient-to-br from-Blue/400 to-VIOLET/400" aria-hidden="true" />
                            <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.08em] text-Tinted/500">{{ award }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Link columns -->
                <div v-for="col in columns" :key="col.head" class="tablet-md:col-span-2">
                    <h3 class="font-poppins text-sm font-semibold text-Tinted/900">{{ col.head }}</h3>
                    <ul class="mt-4 flex flex-col gap-2.5">
                        <li v-for="link in col.links" :key="link">
                            <a href="#" class="font-franklin text-[13px] leading-snug text-Tinted/600 transition-colors hover:text-Blue/600">{{ link }}</a>
                        </li>
                        <template v-if="col.head === 'Links'">
                            <li class="mt-1 font-poppins text-[11px] font-medium uppercase tracking-[0.1em] text-Tinted/400">Brokers</li>
                            <li v-for="b in brokers" :key="b">
                                <a href="#" class="font-franklin text-[13px] text-Tinted/600 transition-colors hover:text-Blue/600">{{ b }}</a>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>

            <!-- Expert Advisor collections -->
            <div class="mt-12 border-t border-Tinted/100 pt-8">
                <h3 class="font-poppins text-sm font-semibold text-Tinted/900">Expert Advisors</h3>
                <div class="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 tablet:grid-cols-2 tablet-wide:grid-cols-5">
                    <div v-for="collection in collections" :key="collection.head">
                        <h4 class="font-poppins text-[11px] font-medium uppercase tracking-[0.1em] text-Tinted/400">{{ collection.head }}</h4>
                        <ul class="mt-3 flex flex-col gap-2">
                            <li v-for="ea in collection.eas" :key="ea">
                                <a href="#" class="font-franklin text-[13px] text-Tinted/600 transition-colors hover:text-Blue/600">{{ ea }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Disclaimer -->
        <div class="border-t border-Tinted/100 bg-white">
            <div class="ea-container py-10">
                <p class="font-poppins text-xs font-semibold uppercase tracking-[0.14em] text-Tinted/500">Earnings &amp; Risk Disclaimer</p>
                <div class="mt-4 flex flex-col gap-3">
                    <p v-for="(para, i) in disclaimer" :key="i" class="max-w-[1100px] font-franklin text-[12px] leading-[1.7] text-Tinted/400">{{ para }}</p>
                </div>
                <p class="mt-6 font-franklin text-[12px] text-Tinted/500">Copyright &copy; 2026. All rights reserved.</p>
            </div>
        </div>
    </footer>
</template>
