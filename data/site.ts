import type { BrandLogo, DeveloperGroup, FooterLinkGroup } from '~/types/home'

// Site-wide structure: figures, trademarks, link graph and legal text.
// Anything here is either a proper noun, a number, a URL, or regulator-quoted
// legal text — none of which is translated.

/** Headline figures. Single source of truth: the accolades band and the closing
 *  banner both read `traders` from here. (The Figma file shows 7435 in one place
 *  and 7045 in the other; one metric, so one value.) */
export const SITE_STATS = {
    traders: 7435,
    trustpilotRating: 4.6,
    trustpilotReviews: 75
} as const

export const CONTACT = {
    email: 'info@easyalgos.ai',
    telegram: { label: 't.me/easyalgos', href: 'https://t.me/easyalgos' },
    youtube: { label: 'youtube.com/@easyalgosAI', href: 'https://youtube.com/@easyalgosAI' }
} as const

export const NAV_LINKS = [
    { id: 'expertAdvisors', href: '/expert-advisors' },
    { id: 'easyvps', href: '/easyvps' },
    { id: 'icprecision', href: '/icprecision' },
    { id: 'research', href: '/research' }
] as const

export const APPLY_HREF = '/apply'
export const LOGIN_HREF = '/auth/signin'

/** The partner strip under the hero headline.
 *
 *  These are their own Figma components (`logo-herobrand-*`), not the marquee's
 *  marks scaled down: they are drawn two-tone, in a grey device against a darker
 *  grey wordmark, and both tones recolour on hover. The artwork therefore lives
 *  as path data in data/heroBrandLogos.ts rather than as files — only the id and
 *  the trademark name are needed here. */
export const HERO_PARTNERS: Pick<BrandLogo, 'id' | 'label'>[] = [
    { id: 'icmarkets', label: 'IC Markets' },
    { id: 'ictrading', label: 'IC Trading' },
    { id: 'forexvps', label: 'ForexVPS.net' }
]

/** The marquee. Each mark is the trademark of its owner. Assets are all the
 *  Figma "Dark=True" logo variant — dark ink, sized for the light marquee card;
 *  "Dark=False" is a white-ink variant for a dark surface, unused here. */
export const BRANDS: BrandLogo[] = [
    { id: 'metatrader', label: 'MetaTrader', src: '/img/brands/metatrader.svg' },
    { id: 'icmarkets', label: 'IC Markets', src: '/img/brands/icmarkets.svg' },
    { id: 'ictrading', label: 'IC Trading', src: '/img/brands/ictrading.svg' },
    { id: 'forexvps', label: 'ForexVPS.net', src: '/img/brands/forexvps.svg' },
    { id: 'myfxbook', label: 'Myfxbook', src: '/img/brands/myfxbook.svg' },
    { id: 'fxblue', label: 'FX Blue', src: '/img/brands/fxblue.svg' },
    { id: 'equinix', label: 'Equinix', src: '/img/brands/equinix.svg' },
    { id: 'claude', label: 'Claude', src: '/img/brands/claude.svg' },
    { id: 'openai', label: 'OpenAI', src: '/img/brands/openai.svg' },
    { id: 'gemini', label: 'Gemini', src: '/img/brands/gemini.svg' }
]

export const FOOTER_GROUPS: FooterLinkGroup[] = [
    {
        id: 'gettingStarted',
        links: [
            { id: 'applyNow', href: APPLY_HREF },
            { id: 'howToJoin', href: '/how-to-join' },
            { id: 'howToOnboard', href: '/how-to-onboard' },
            { id: 'howToGetEasyvps', href: '/how-to-get-your-easyvps' },
            { id: 'howToStartTrading', href: '/how-to-start-trading' }
        ]
    },
    {
        id: 'support',
        links: [
            { id: 'helpCenter', href: '/help' },
            { id: 'terms', href: '/terms' },
            { id: 'privacy', href: '/privacy-policy' },
            { id: 'faq', href: '/faq' }
        ]
    },
    {
        id: 'links',
        links: [
            { id: 'login', href: LOGIN_HREF },
            { id: 'easyvps', href: '/easyvps' },
            { id: 'about', href: '/about' },
            { id: 'pricing', href: '/pricing' },
            { id: 'affiliates', href: '/affiliates' },
            { id: 'research', href: '/research' },
            { id: 'reviews', href: '/reviews' },
            { id: 'results', href: '/results' },
            { id: 'deck', href: '/deck' },
            { id: 'algoscore', href: '/algoscore' },
            { id: 'precisionAccounts', href: '/icprecision' }
        ]
    }
]

/** Brokers column. Proper nouns, so listed here rather than in the locale files. */
export const FOOTER_BROKERS = [
    { label: 'IC Markets', href: 'https://www.icmarkets.com/' },
    { label: 'IC Trading', href: 'https://www.ictrading.com/' }
]

/** Featured articles, two columns of four. */
export const FOOTER_ARTICLES: { id: string; href: string }[][] = [
    [
        { id: 'window', href: '/research/ai-bubble-window' },
        { id: 'bubble', href: '/research/is-there-an-ai-bubble' },
        { id: 'needsYou', href: '/research/why-ai-needs-you' },
        { id: 'reallyUsing', href: '/research/are-we-really-using-ai' }
    ],
    [
        { id: 'forecasts', href: '/research/ai-market-forecasts' },
        { id: 'notAlone', href: '/research/why-we-dont-let-ai-trade-alone' },
        { id: 'realAi', href: '/research/how-our-eas-use-real-ai' },
        { id: 'invisibleEdge', href: '/research/the-invisible-edge' }
    ]
]

/** Developers and the Expert Advisors they publish, under the footer's violet
 *  "Expert Advisors & Developers" heading. Figma 676:2259 / 676:2299.
 *
 *  The fifth entry used to sit apart as a headless `FOOTER_EXPERT_ADVISORS`
 *  list, which was a misreading: the reference heads those eight names with
 *  Wim Schrynemakers exactly like the other four developers. He is the same
 *  developer quoted in the testimonials block. */
export const FOOTER_DEVELOPERS: DeveloperGroup[] = [
    {
        name: 'ValeryTrading',
        eas: ['Waka Waka', 'Perceptrader AI', 'Golden Pickaxe', 'Sentinel AI', 'News Catcher Pro', 'Night Hunter Pro', 'Momentum AI']
    },
    { name: 'Pavel Udovichenko', eas: ['FastWay', 'MultiWay', 'Little Crazy'] },
    { name: 'Jimmy Eriksson', eas: ['Gold Atlas', 'Range Breakout EA', 'The Bitcoin Core'] },
    { name: 'Brandon Autry', eas: ['AiQ', 'BYRDI', 'Nano Machine', 'Mean Machine', 'Syna'] },
    {
        name: 'Wim Schrynemakers',
        eas: ['DayTrade Pro', 'Goldbot One', 'GoldTrade Pro', 'Luna AI', 'The Gold Reaper', 'The Orb Master', 'The Bitcoin Reaper', 'The Gold Phantom']
    }
]

// ---------------------------------------------------------------- legal ----
// Deliberately NOT in the locale files, and deliberately not translated: this is
// regulator-quoted text (CFTC Rule 4.41(b)(1) / NFA Rule 2-29) whose wording is
// prescribed, and machine-translating financial risk disclosure would change its
// legal meaning. It renders in English in every locale until a lawyer supplies
// reviewed translations, at which point it moves into the locale files.
export const LEGAL_NATURE_OF_BUSINESS = [
    'Easyalgos.ai operates as a technology provider offering Software-as-a-Service (SaaS) solutions for automated trading strategies. We do not provide financial or investment advice, portfolio management, brokerage services, or act as a financial intermediary. Users retain full control over their trading accounts and funds, and all trading activities are conducted at their own discretion and risk.'
]

export const LEGAL_EARNINGS_AND_RISK = [
    'Trading foreign exchange ("forex") on margin has large potential rewards but also carries a high level of risk. You must be aware of the risks and be willing to accept them to invest in the foreign exchange ("forex") markets. Don\'t trade with money you can\'t afford to lose. No representation is being made that any account will or is likely to achieve profits or losses similar to those discussed on this website. The past performance of any trading system or methodology is not necessarily indicative of future results.',
    '*CFTC RULE 4.41(b)(1)/NFA RULE 2-29 - SIMULATED OR HYPOTHETICAL PERFORMANCE RESULTS HAVE CERTAIN INHERENT LIMITATIONS. UNLIKE THE RESULTS SHOWN IN AN ACTUAL PERFORMANCE RECORD, THESE RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, BECAUSE THESE TRADES HAVE NOT ACTUALLY BEEN EXECUTED, THESE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY. SIMULATED OR HYPOTHETICAL TRADING PROGRAMS IN GENERAL ARE ALSO SUBJECT TO THE FACT THAT THEY ARE DESIGNED WITH THE BENEFIT OF HINDSIGHT.',
    'NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE BEING SHOWN. NO REPRESENTATION IS BEING MADE THAT ANY PERSON WILL OR IS LIKELY TO ACHIEVE PROFITS OR LOSSES SIMILAR TO THOSE SHOWN. IN FACT, THERE ARE FREQUENTLY SHARP DIFFERENCES BETWEEN HYPOTHETICAL PERFORMANCE RESULTS AND THE ACTUAL RESULTS SUBSEQUENTLY ACHIEVED BY ANY PARTICULAR TRADING PROGRAM.',
    'IN ADDITION, HYPOTHETICAL TRADING DOES NOT INVOLVE FINANCIAL RISK, AND NO HYPOTHETICAL TRADING RECORD CAN COMPLETELY ACCOUNT FOR THE IMPACT OF FINANCIAL RISK IN ACTUAL TRADING. FOR EXAMPLE, THE ABILITY TO WITHSTAND LOSSES OR TO ADHERE TO A PARTICULAR TRADING PROGRAM IN SPITE OF TRADING LOSSES ARE MATERIAL POINTS WHICH CAN ALSO ADVERSELY AFFECT ACTUAL TRADING RESULTS. THERE ARE NUMEROUS OTHER FACTORS RELATED TO THE MARKETS IN GENERAL OR TO THE IMPLEMENTATION OF ANY SPECIFIC TRADING PROGRAM WHICH CANNOT BE FULLY ACCOUNTED FOR IN THE PREPARATION OF HYPOTHETICAL PERFORMANCE RESULTS AND ALL OF WHICH CAN ADVERSELY AFFECT ACTUAL TRADING RESULTS.',
    'Be warned that there is a possibility to lose real money if traded on a real money account, and the owners of easyalgos.ai can NOT be held accountable for any losses that may occur including from any potential software bugs/glitches or malfunctions.',
    'Easyalgos.ai and its owners assume no responsibility for errors, inaccuracies or omissions in these materials. They do not warrant the accuracy or completeness of the information, text, graphics, links or other items contained within these materials. Easyalgos.ai and its owners shall not be liable for any special, indirect, incidental, or consequential damages, including without limitation losses, lost revenues, or lost profits that may result from these materials.',
    'We assume that you are legally permitted to purchase and use our products. Making sure that you are following the global and local laws and legislations is your responsibility. We cannot be held responsible for any damages or lawsuit against you due to such regulations.',
    'All information on this website or any software and or guide purchased from this website is for educational purposes only and is not intended to provide financial advice. Any statements about profits or income, expressed or implied, do not represent a guarantee. Your actual trading may result in losses as no trading system is guaranteed. You accept full responsibility for your actions, trades, profit, or loss, and agree to hold the owner of easyalgos.ai and any authorized distributors of this information harmless in any ways. All rights reserved. The use of this website and or its contents constitutes acceptance of our disclaimer.'
]
