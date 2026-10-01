import type {
    HowItWorksStep,
    PricingFeature,
    PricingTier,
    PricingTierId,
    ResearchPost,
    SolutionItem,
    Testimonial,
    VpsPlan
} from '~/types/home'
import { mediaAsset } from '~/utils/media'

// Section content: ids and assets only. Every id doubles as the i18n key suffix
// its title/description is looked up under, so adding a row means one entry here
// plus one entry in each locale file — never a template edit.

/** "What you get" — nine rows, drawn in this order.
 *
 *  `visual` is the frame shown beside the open row. Only the analytics row has
 *  its artwork so far (the dashboard export); the rest are null until the
 *  per-item animations arrive, and the component falls back to the dashboard so
 *  the panel is never empty in the meantime. Dropping a visual in later is a
 *  one-line change per row. */
export const SOLUTIONS: SolutionItem[] = [
    { id: 'expertAdvisors', visual: mediaAsset('solutions', 'expert-advisors', 1100, 660) },
    { id: 'analytics', visual: mediaAsset('solutions', 'dashboard', 1100, 660) },
    { id: 'history', visual: null },
    { id: 'backtesting', visual: null },
    { id: 'easyvps', visual: null },
    { id: 'ai', visual: null },
    { id: 'forecasts', visual: null },
    { id: 'support', visual: null },
    { id: 'community', visual: null }
]

/** The row whose visual stands in for any row that has none yet. */
export const SOLUTIONS_FALLBACK_VISUAL = mediaAsset('solutions', 'dashboard', 1100, 660)

/** "How it works" — four steps in a horizontal scroller, numbered 01-04 in this
 *  order. The v3 reference opens on "Apply" and ends on the drag-and-drop step,
 *  which shifted the whole set along by one from v2.
 *
 *  Each card's mockup is a flat export standing in for a walkthrough clip;
 *  `video` stays undefined until those exist, and the card renders without a
 *  transport control rather than offering one that does nothing. */
export const STEPS: HowItWorksStep[] = [
    { id: 'apply', media: mediaAsset('steps', 'apply', 596, 400) },
    { id: 'connect', media: mediaAsset('steps', 'connect', 596, 400) },
    { id: 'vps', media: mediaAsset('steps', 'vps', 596, 400) },
    { id: 'deploy', media: mediaAsset('steps', 'deploy', 596, 400) }
]

/** Pricing. The middle tier is emphasised and takes the gradient CTA. */
export const PRICING_TIERS: PricingTier[] = [
    { id: 'starter', minimumBalance: 5000, minimumTrades: 10 },
    { id: 'pro', minimumBalance: 10000, minimumTrades: 10, featured: true },
    { id: 'elite', minimumBalance: 20000, minimumTrades: 10 }
]

const ALL_TIERS: readonly PricingTierId[] = ['starter', 'pro', 'elite']
const PRO_UP: readonly PricingTierId[] = ['pro', 'elite']
const ELITE: readonly PricingTierId[] = ['elite']

/** /pricing — "What you get", the comparison under the tier cards (Figma
 *  3507:11752), in drawn order. The EasyVPS row is not in this list: it carries a
 *  plan per tier and opens the specs panel, so the table draws it from
 *  VPS_PLANS, after `thirdParty`. Copy lives under `pricingPage.features`. */
export const PRICING_FEATURES: PricingFeature[] = [
    { id: 'portfolio', tiers: ALL_TIERS, value: 19600 },
    { id: 'licenses', tiers: ALL_TIERS },
    { id: 'thirdParty', tiers: ALL_TIERS, value: 3808 }
]
export const PRICING_FEATURES_AFTER_VPS: PricingFeature[] = [
    { id: 'analytics', tiers: ALL_TIERS },
    { id: 'telegram', tiers: ALL_TIERS },
    { id: 'remoteDesktop', tiers: PRO_UP },
    { id: 'forecasts', tiers: PRO_UP },
    { id: 'earlyAccess', tiers: ELITE },
    { id: 'exclusiveTools', tiers: ELITE },
    { id: 'setFiles', tiers: ELITE },
    { id: 'handsOff', tiers: ELITE }
]

/** The EasyVPS plan each tier comes with, and the ten lines of its specs panel
 *  (Figma 3507:10468, "sub Row"). Plan names are ForexVPS.net's own and are not
 *  translated. `os` is the file's "2022/19/16" verbatim — Windows Server
 *  2022 / 2019 / 2016. Spec labels live under `pricingPage.specs`. */
export const VPS_SPEC_ROWS = [
    'platforms',
    'cpu',
    'memory',
    'storage',
    'os',
    'locations',
    'uptime',
    'dedicatedIp',
    'allPlatforms',
    'backups'
] as const

const VPS_INCLUDED = { uptime: true, dedicatedIp: true, allPlatforms: true, backups: true }

export const VPS_PLANS: VpsPlan[] = [
    {
        tier: 'starter',
        name: 'CORE',
        value: 450,
        specs: { platforms: '1-3', cpu: '2x', memory: '4 GB', storage: '100 GB', os: '2022/19/16', locations: 22, ...VPS_INCLUDED }
    },
    {
        tier: 'pro',
        name: 'EDGE',
        value: 660,
        specs: { platforms: '3-6', cpu: '4x', memory: '6 GB', storage: '150 GB', os: '2022/19/16', locations: 22, ...VPS_INCLUDED }
    },
    {
        tier: 'elite',
        name: 'PRIME',
        value: 900,
        specs: { platforms: '6+', cpu: '6x', memory: '8 GB', storage: '200 GB', os: '2022/19/16', locations: 22, ...VPS_INCLUDED }
    }
]

/** /pricing FAQ (Figma 3507:11753), drawn order. Copy under `pricingPage.faq`. */
export const PRICING_FAQ = ['freeTrial', 'changePlan', 'cancellation', 'invoice'] as const

/** The three steps of the /pricing Requirements module (Figma 3507:11855). */
export const PRICING_REQUIREMENTS = [
    { id: 'qualify', icon: '/img/icons/check-list.svg' },
    { id: 'connect', icon: '/img/icons/square-arrow-up.svg' },
    { id: 'amazed', icon: '/img/icons/check-circle.svg' }
] as const

/** Testimonials — four quote cards, drawn in this order across a 2x2 grid whose
 *  two card widths swap sides on the second row (feature, compact / compact,
 *  feature). All four are portraits now; the v2 brand tile is gone. */
export const TESTIMONIALS: Testimonial[] = [
    { id: 'icmarkets', media: mediaAsset('people', 'angus-walker', 280, 280), variant: 'feature', headline: true },
    { id: 'forexvps', media: mediaAsset('people', 'kim-shearer', 200, 200), variant: 'compact' },
    { id: 'algotradingspace', media: mediaAsset('people', 'petko-alexsandrov', 200, 200), variant: 'compact' },
    { id: 'developer', media: mediaAsset('people', 'wim-schrynemakers', 280, 280), variant: 'feature', headline: true }
]

/** /for-developers' pair (Figma 3282:31975) — both drawn as feature cards with a
 *  192px portrait and no headline, the first in the narrow track. The portraits
 *  are the file's own black-and-white exports (632 image fills, encoded 2x of
 *  192), not the colour Bogdan portrait /developer uses. Copy lives under
 *  `forDevTestimonials.items`. */
export const FOR_DEV_TESTIMONIALS: Testimonial[] = [
    { id: 'bogdan', media: mediaAsset('people', 'bogdan-ion-puscasu-bw', 192, 192), variant: 'feature', width: 'narrow' },
    { id: 'paveludo', media: mediaAsset('people', 'paveludo', 192, 192), variant: 'feature', width: 'wide', indent: true }
]

/** /for-developers "The Edge" (Figma 3295:10242) — five cards in a snap
 *  scroller, drawn in this order. Panels are 2x rasters of the 416x400 slot
 *  (scripts/optimize-assets.py). Copy lives under `forDevEdge.cards.<id>`. */
export const FOR_DEV_EDGE = [
    { id: 'referrals', media: mediaAsset('for-developers', 'edge-referrals', 416, 400) },
    { id: 'rebates', media: mediaAsset('for-developers', 'edge-ib-rebates', 416, 400) },
    { id: 'ai', media: mediaAsset('for-developers', 'edge-ai', 416, 400) },
    { id: 'dashboard', media: mediaAsset('for-developers', 'edge-dashboard', 416, 400) },
    { id: 'support', media: mediaAsset('for-developers', 'edge-remote-support', 416, 400) }
] as const

/** The three "win" rows inside the pricing section's free-model explainer. Ids
 *  are i18n key suffixes under `pricing.model.bullets`. */
export const PRICING_MODEL_BULLETS = ['traders', 'developers', 'brokers'] as const

export const RESEARCH_POSTS: ResearchPost[] = [
    { id: 'dashboard', href: '/research/dashboard-upgrade', media: mediaAsset('research', 'dashboard-upgrade', 421, 248) },
    { id: 'window', href: '/research/ai-bubble-window', media: mediaAsset('research', 'ai-window', 421, 248) },
    { id: 'bubble', href: '/research/is-there-an-ai-bubble', media: mediaAsset('research', 'ai-bubble', 421, 248) }
]
