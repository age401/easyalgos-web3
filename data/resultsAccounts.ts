import type { Platform, PlatformId, ResultsAccount, ResultsColumn } from '~/types/results'

// The "Client's Accounts" ledger — Figma "module - Results table" (node
// 3039:14223), transcribed row for row.
//
// Two figures are DERIVED rather than transcribed (see `accountGrowth` /
// `totalProfit` below), because the artboard's own numbers disagree with its
// balances on row 6: IC Trading goes 10,000 -> 14,800, which is +48%, and the
// cell reads "+ 8%". Every other row checks out, so the artboard has one typo
// rather than a different formula. Deriving both makes that class of drift
// impossible once this is fed by the real API.

/** The platforms an account can be held with. Marks are 20x20 SVGs exported
 *  from Figma "Platform Icons @20" (node 3115:7991); each is the trademark of
 *  its owner.
 *
 *  A row references a platform by id, so its mark and its label come from this
 *  one record. That is not tidiness for its own sake: on the artboard, row 11 is
 *  labelled "Pepperstone MT5" and carries the B2B Broker mark. Keying by id
 *  makes that pairing unrepresentable. */
export const PLATFORMS: Record<PlatformId, Platform> = {
    'pepperstone': { name: 'Pepperstone MT5', icon: '/img/platforms/pepperstone.svg' },
    'icmarkets': { name: 'ICMarkets', icon: '/img/platforms/icmarkets.svg' },
    'binance': { name: 'Binance', icon: '/img/platforms/binance.svg' },
    'ox-securities': { name: 'OX Securities', icon: '/img/platforms/ox-securities.svg' },
    'fusion-markets': { name: 'Fusion Markets', icon: '/img/platforms/fusion-markets.svg' },
    'ic-trading': { name: 'IC Trading', icon: '/img/platforms/ic-trading.svg' },
    'exness': { name: 'Exness', icon: '/img/platforms/exness.svg' },
    'rannforex': { name: 'Rannforex', icon: '/img/platforms/rannforex.svg' },
    'eightcap': { name: 'Eightcap', icon: '/img/platforms/eightcap.svg' },
    'bybit': { name: 'Bybit', icon: '/img/platforms/bybit.svg' },
    // Drawn in the icon set and shipped with it, but no row uses it — see the
    // note above about row 11.
    'b2b-broker': { name: 'B2B Broker', icon: '/img/platforms/b2b-broker.svg' },
    'vantage': { name: 'Vantage', icon: '/img/platforms/vantage.svg' },
    'atcbrokers': { name: 'ATCBrokers', icon: '/img/platforms/atcbrokers.svg' },
    'puprime': { name: 'PUPrime', icon: '/img/platforms/puprime.svg' },
    'switch-markets': { name: 'Switch Markets', icon: '/img/platforms/switch-markets.svg' },
    'blueberry-markets': { name: 'Blueberry Markets', icon: '/img/platforms/blueberry-markets.svg' }
}

/** Panel-level facts: when the ledger was last refreshed, and the two figures in
 *  the scarcity line under the CTA. */
export const RESULTS_META = {
    /** Drawn as "06-04-2025 11:27 AM GMT +00" — an instant, held in UTC so the
     *  prerendered HTML and the hydrated client can never format it differently. */
    updatedAt: '2025-04-06T11:27:00Z',
    spotsRemaining: 1753,
    spotsTotal: 5000
} as const

/** Column order, alignment and the width each one survives down to.
 *
 *  `hideUntil` is only consumed by the Reveal take — the Ledger take shows all
 *  seven at every width and scrolls instead. The two ranks below are the whole
 *  editorial argument of the Reveal take, so they are worth stating plainly:
 *
 *    always      rank, platform, account growth
 *                Who, and did it work. The minimum that still answers the
 *                question the page asks.
 *    >= 800      + current balance, total profit
 *                The size of the outcome, once there is room for it. 800 and
 *                not 600: at 600 the panel has ~488px of usable width, and
 *                five columns of financial data inside it means "Pepperstone
 *                MT5" gets 93px and truncates. A column that has to be
 *                ellipsised is not a column that has earned its place.
 *    >= 1024     + connected since, initial balance
 *                The provenance columns. They are what makes the other five
 *                credible, but they are the last thing anyone reads. */
export const RESULTS_COLUMNS: ResultsColumn[] = [
    { id: 'rank', align: 'center', hideUntil: '' },
    { id: 'platform', align: 'left', hideUntil: '' },
    { id: 'connected', align: 'center', hideUntil: 'hidden tablet-wide:table-cell' },
    { id: 'initial', align: 'right', hideUntil: 'hidden tablet-wide:table-cell' },
    { id: 'current', align: 'right', hideUntil: 'hidden tablet-md:table-cell' },
    { id: 'growth', align: 'right', hideUntil: '' },
    { id: 'profit', align: 'right', hideUntil: 'hidden tablet-md:table-cell' }
]

export const RESULTS_ACCOUNTS: ResultsAccount[] = [
    { id: 'a01', platform: 'pepperstone', connectedOn: '2023-09-04', initial: 20000, current: 44000, currency: 'USD' },
    { id: 'a02', platform: 'icmarkets', connectedOn: '2023-11-01', initial: 15000, current: 22200, currency: 'USD' },
    { id: 'a03', platform: 'binance', connectedOn: '2024-02-08', initial: 20000, current: 33400, currency: 'USD' },
    { id: 'a04', platform: 'ox-securities', connectedOn: '2023-11-02', initial: 20000, current: 29600, currency: 'USD' },
    { id: 'a05', platform: 'fusion-markets', connectedOn: '2023-06-16', initial: 25000, current: 37000, currency: 'USD' },
    { id: 'a06', platform: 'ic-trading', connectedOn: '2023-11-15', initial: 10000, current: 14800, currency: 'USD' },
    { id: 'a07', platform: 'exness', connectedOn: '2023-11-04', initial: 15000, current: 33000, currency: 'USD' },
    { id: 'a08', platform: 'rannforex', connectedOn: '2024-01-03', initial: 30000, current: 93000, currency: 'USD' },
    { id: 'a09', platform: 'eightcap', connectedOn: '2023-09-18', initial: 15000, current: 19800, currency: 'USD' },
    { id: 'a10', platform: 'bybit', connectedOn: '2023-08-03', initial: 25000, current: 33000, currency: 'USD' },
    { id: 'a11', platform: 'pepperstone', connectedOn: '2023-12-26', initial: 10000, current: 16700, currency: 'USD' },
    { id: 'a12', platform: 'vantage', connectedOn: '2023-11-19', initial: 25000, current: 41750, currency: 'USD' },
    { id: 'a13', platform: 'atcbrokers', connectedOn: '2023-06-03', initial: 15000, current: 22200, currency: 'USD' },
    { id: 'a14', platform: 'puprime', connectedOn: '2024-02-08', initial: 30000, current: 24600, currency: 'USD' },
    { id: 'a15', platform: 'switch-markets', connectedOn: '2023-11-29', initial: 30000, current: 34500, currency: 'USD' },
    { id: 'a16', platform: 'blueberry-markets', connectedOn: '2024-02-01', initial: 10000, current: 5800, currency: 'USD' },
    { id: 'a17', platform: 'pepperstone', connectedOn: '2023-09-04', initial: 20000, current: 44000, currency: 'USD' },
    { id: 'a18', platform: 'pepperstone', connectedOn: '2023-11-01', initial: 15000, current: 22200, currency: 'USD' },
    { id: 'a19', platform: 'pepperstone', connectedOn: '2024-02-08', initial: 20000, current: 33400, currency: 'USD' },
    { id: 'a20', platform: 'pepperstone', connectedOn: '2023-11-02', initial: 20000, current: 29600, currency: 'USD' }
]

/** Profit in account currency. Signed. */
export const totalProfit = (account: ResultsAccount) => account.current - account.initial

/** Growth as a whole-number percentage, signed. Rounded, because the drawn
 *  figures are — 41,750 on 25,000 is 67%, not 67.0%. */
export const accountGrowth = (account: ResultsAccount) =>
    Math.round((totalProfit(account) / account.initial) * 100)
