// Domain types for the Results page. As in types/home.ts, no display text lives
// here: labels come from i18n, and everything below is either a proper noun, a
// figure, or a machine-readable date.

/** A broker or exchange an account can be held with. The `id` is the key into
 *  PLATFORMS and doubles as the icon's filename. */
export type PlatformId =
    | 'pepperstone'
    | 'icmarkets'
    | 'binance'
    | 'ox-securities'
    | 'fusion-markets'
    | 'ic-trading'
    | 'exness'
    | 'rannforex'
    | 'eightcap'
    | 'bybit'
    | 'b2b-broker'
    | 'vantage'
    | 'atcbrokers'
    | 'puprime'
    | 'switch-markets'
    | 'blueberry-markets'

/** Trademark and mark for one platform. Both are the owner's property; `name` is
 *  a proper noun and is never translated. */
export interface Platform {
    name: string
    /** 20x20 SVG under /img/platforms, exported from Figma "Platform Icons @20". */
    icon: string
}

/** One connected client account, as drawn in the "Table Top 20 Accounts" panel.
 *
 *  `growth` and `profit` are NOT stored. Both are functions of `initial` and
 *  `current`, and holding them separately is how a table ends up disagreeing
 *  with itself — the Figma artboard already does, on row 6.
 *
 *  `platform` is an id rather than a display name for the same reason: the mark
 *  and the label then come from one record and cannot drift apart, which the
 *  artboard also does on row 11. */
export interface ResultsAccount {
    /** Stable key for the row. Platforms repeat, so this is not one. */
    id: string
    platform: PlatformId
    /** ISO date the account was connected to EasyAlgos. Rendered as drawn (YYYY-MM-DD). */
    connectedOn: string
    /** Balance at connection, in `currency` units. */
    initial: number
    /** Balance at `RESULTS_META.updatedAt`, in `currency` units. */
    current: number
    /** ISO 4217. One value across the set today; carried per row so a EUR or GBP
     *  account can join without a schema change. */
    currency: string
}

/** A column of the results table. The order here IS the column order, and both
 *  responsive takes read it, which is what keeps them in step. */
export interface ResultsColumn {
    /** Doubles as the i18n key suffix under `results.columns.*`. */
    id: 'rank' | 'platform' | 'connected' | 'initial' | 'current' | 'growth' | 'profit'
    /** Cell alignment, as drawn. */
    align: 'left' | 'center' | 'right'
    /** Tailwind classes controlling at which width the column appears.
     *  Empty means "always". Only the Reveal take acts on this; the Ledger take
     *  keeps every column at every width by design. */
    hideUntil: string
}
