// Number and date formatting for the results ledger, in one place so the two
// responsive takes can never render the same account differently.
//
// Everything goes through vue-i18n's `n`, so the grouping separator follows the
// reader's locale ("20,000" in en, "20.000" in de) without a per-component
// branch — the same treatment the accolades band and the closing banner give
// SITE_STATS.
//
// The signed forms carry a SPACE after the sign ("+ 24,000 USD", "- 5,400 USD"),
// which is drawn and is not a typo: at 14px the sign reads as a separate token
// telling you the direction before your eye reaches the figure.
export const useResultsFormat = () => {
    const { n, locale } = useI18n()

    /** "20,000 USD", or "+ 24,000 USD" / "- 5,400 USD" when `signed`. */
    const money = (value: number, currency: string, signed = false) => {
        const magnitude = `${n(Math.abs(value))} ${currency}`
        return signed ? `${value < 0 ? '-' : '+'} ${magnitude}` : magnitude
    }

    /** "+ 120%" / "- 18%". Always signed — a growth figure without a direction
     *  is not a growth figure. */
    const percent = (value: number) => `${value < 0 ? '-' : '+'} ${n(Math.abs(value))}%`

    /** The panel's "last update" stamp, split into the three runs the titlebar
     *  draws: date, time, zone.
     *
     *  Pinned to UTC and to a fixed en-GB pattern rather than the reader's
     *  locale. Two reasons, and both matter: the page is PRERENDERED, so a
     *  format that depended on the visitor's timezone would be baked at build
     *  time and then contradict itself on hydration; and the zone is printed
     *  right next to the time, so a value in anything but that zone would be a
     *  lie. Dashes, not slashes, as drawn. */
    const stamp = (iso: string) => {
        const at = new Date(iso)
        const date = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric'
        }).format(at).replace(/\//g, '-')
        const time = new Intl.DateTimeFormat('en-US', {
            timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true
        }).format(at).toUpperCase()
        return { date, time, zone: 'GMT +00' }
    }

    return { money, percent, stamp, locale }
}
