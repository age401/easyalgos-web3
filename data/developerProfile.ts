import type { DeveloperProfile } from '~/types/developer'

// The developer this landing page belongs to (Figma 3157:7222).
//
// BAKED DATA, on the same terms as the EA figures in data/heroCards.ts: this is
// what the backend publishes for one developer, resolved at build time so the
// route prerenders complete — no client fetch, no loading state, no layout
// shift. Everything here is content (a person's name, their own bio, their
// profile URLs) and so is deliberately NOT translated; the sentences wrapped
// around it are, and take the name as a parameter — see `devHero.title` and
// `devBanner.title` in the locale files.
//
// One page, one developer, for now. When the route becomes /developers/[slug]
// this module is what the slug resolves to.
export const DEVELOPER: DeveloperProfile = {
    id: 'bogdan-ion-puscasu',
    name: 'Bogdan Ion Puscasu',
    bio: 'Bogdan Ion Puscasu is an expert in automated trading systems and custom indicators. He is based in St. Vincent & The Grenadines. Bogdan specializes in AI-powered trading solutions, leveraging deep learning for market analysis. His tools integrate ChatGPT for optimized, data-driven trading decisions.',
    // Verbatim from the design, INCLUDING the mismatch: the drawn card pairs
    // this location with the Romanian tricolour (its three bars are #012B81 /
    // #FDD116 / #CE1127). Both are reproduced as drawn rather than silently
    // reconciled, because only the publisher knows which of the two is the
    // placeholder. Change one line here once that is settled.
    location: 'St. Vincent & The Grenadines',
    flag: 'ro',
    avatar: 'bogdan-ion-puscasu',
    // PLACEHOLDER HREFS. The design draws the three buttons but names no
    // destinations, and these are per-developer values the backend publishes —
    // so they are left as bare `#` rather than guessed at. A guessed mql5.com or
    // myfxbook.com profile path would look authoritative and be wrong.
    links: [
        { id: 'website', href: '#' },
        { id: 'mql5', href: '#', logo: { src: '/img/brands/mql5.svg', label: 'MQL5', width: 45, height: 14 } },
        {
            id: 'myfxbook',
            href: '#',
            // The colour wordmark, which is a different asset from the flat
            // #433E68 one the brand marquee runs — hence the `-color` suffix
            // rather than a second look at brands/myfxbook.svg.
            logo: { src: '/img/brands/myfxbook-color.svg', label: 'Myfxbook', width: 64, height: 18 }
        }
    ]
}
