import type { TrustpilotReview } from '~/types/home'

// The Trustpilot review strip. Figma 885:2323 ("Trustpilot"), cards 885:2325.
//
// These live here rather than in the locale files on the same principle as the
// legal text in data/site.ts, arrived at from the opposite direction: a review is
// a quotation attributed to a named person. Machine-translating "great
// experience! ... excellent job!" into German would put words Jack never wrote
// next to Jack's name, which is a misattribution, not a translation. Trustpilot
// itself does not translate them either — it shows every review in the language
// it was written in. So the prose is fixed and only the chrome around it (the
// "N reviews" line, the date, "Read full review") moves per locale.
//
// Dates are ISO here and formatted through i18n's date formatter at render, so
// the drawn "May 6, 2026" becomes "6. Mai 2026" in de with no second string.
//
// Content note: Figma draws Hany's title already truncated ("The easy setup of
// the VPS and EAs ready…"). The ellipsis is CSS's job here, not the string's, so
// it is stored without one — but that title is therefore still a fragment, and
// the full text wants recovering from the Trustpilot source when these are wired
// to the real export.
export const TRUSTPILOT_REVIEWS: TrustpilotReview[] = [
    {
        id: 'jack',
        author: 'Jack',
        country: 'IT',
        reviewCount: 6,
        date: '2026-05-06',
        rating: 5,
        title: 'great experience',
        body: 'great experience! provides professional tools to trade the markets and a responsive customer care. excellent job!'
    },
    {
        id: 'hany',
        author: 'Hany',
        country: 'AU',
        reviewCount: 3,
        date: '2026-07-01',
        rating: 5,
        title: 'The easy setup of the VPS and EAs ready',
        body: 'The easy setup of the VPS and EAs ready MT5s made such a great experience, I hope for more choices of a better performing EAs that can do scalping and to eliminate the poor performing ones out of the platform. Great job for the team of EasyAlgos.AI'
    },
    {
        // The one card drawn with a "Read full review" link, and the longest body
        // — which is why it is the card that sets the row height in the drawing.
        id: 'diego-martinez',
        author: 'Diego Martinez',
        // No country: Trustpilot publishes none for this profile, so the card
        // shows a bare "2 reviews" with no leading bullet.
        reviewCount: 2,
        date: '2026-02-09',
        rating: 5,
        title: 'Solid long-term trading solution',
        body: 'The platform offers a well-thought-out suite of Expert Advisors, making diversification straightforward without unnecessary complexity. Everything is clearly documented, the dashboard is clean and easy to use, and the VPS setup is reliable, which makes the whole system feel genuinely “set and forget” when configured with a sensible risk profile.\n\nEasyAlgos AI feels like a long-term solution built by people who understand trading as a discipline, not a gamble. If you’re looking for professional automation without noise or false promises, this is a solid choice.',
        // Points at the site's own reviews page, which is already a route in
        // FOOTER_GROUPS. Swap for the Trustpilot permalink if the card should
        // leave the site instead — it is this one line.
        url: '/reviews'
    },
    {
        id: 'geoffrey',
        author: 'Geoffrey',
        country: 'SG',
        reviewCount: 2,
        date: '2026-05-11',
        rating: 5,
        title: 'Everything is set up and easy to use',
        body: 'Everything is set up and easy to use, including the VPs provided. Thanks for the thoughtful process.'
    },
    {
        id: 'alex-krol',
        // Drawn with a leading space in the Figma text layer; trimmed here.
        author: 'Alex Krol Highly Trendy',
        country: 'MX',
        reviewCount: 2,
        date: '2026-05-06',
        rating: 5,
        title: 'Super great experience',
        body: 'Super great experience, system works perfectly, everything is already set up, and the bots are top tier, already in profit as well which is great. This is a must if you have the 5k.'
    }
]
