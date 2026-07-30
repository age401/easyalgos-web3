import type { HowItWorksStep, PricingTier, ResearchPost, SolutionItem, Testimonial } from '~/types/home'
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

/** "How it works" — four steps in a horizontal scroller.
 *  Each card's mockup is a flat export; `video` stays undefined until the
 *  walkthrough clips exist, and the card renders without a play affordance
 *  rather than offering one that does nothing. */
export const STEPS: HowItWorksStep[] = [
    { id: 'connect', media: mediaAsset('steps', 'connect', 596, 400) },
    { id: 'vps', media: mediaAsset('steps', 'vps', 596, 400) },
    { id: 'deploy', media: mediaAsset('steps', 'deploy', 596, 400) },
    { id: 'results', media: mediaAsset('steps', 'results', 596, 400) }
]

/** Pricing. The middle tier is emphasised and takes the gradient CTA. */
export const PRICING_TIERS: PricingTier[] = [
    { id: 'starter', minimumBalance: 5000, minimumTrades: 10 },
    { id: 'pro', minimumBalance: 10000, minimumTrades: 10, featured: true },
    { id: 'elite', minimumBalance: 20000, minimumTrades: 10 }
]

/** Testimonials. The ICMarkets entry is a brand tile rather than a portrait, so
 *  it renders on its own dark plate instead of as a photo. */
export const TESTIMONIALS: Testimonial[] = [
    { id: 'icmarkets', media: mediaAsset('people', 'icmarkets-tile', 128, 128), isBrand: true },
    { id: 'forexvps', media: mediaAsset('people', 'kim-shearer', 128, 128) },
    { id: 'developer', media: mediaAsset('people', 'wim-schrynemakers', 128, 128) }
]

export const RESEARCH_POSTS: ResearchPost[] = [
    { id: 'dashboard', href: '/research/dashboard-upgrade', media: mediaAsset('research', 'dashboard-upgrade', 421, 248) },
    { id: 'window', href: '/research/ai-bubble-window', media: mediaAsset('research', 'ai-window', 421, 248) },
    { id: 'bubble', href: '/research/is-there-an-ai-bubble', media: mediaAsset('research', 'ai-bubble', 421, 248) }
]
