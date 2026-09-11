// Domain types for the Expert Advisors developer landing page (Figma 3157:7222).
// As in types/home.ts, text never lives here — these describe structure, and an
// `id` doubles as the i18n key suffix its label is looked up under.
import type { EaCardMotion, StagePoint } from '~/types/home'

/** One outbound link on the profile card.
 *
 *  Two shapes, because the design draws two: `website` carries a translated
 *  label beside a globe icon, while `mql5` and `myfxbook` carry the service's
 *  own wordmark beside a chain-link icon. A mark is never translated and never
 *  recoloured, so it is a committed SVG with its drawn intrinsic size rather
 *  than a label plus a class. */
export interface DeveloperLink {
    id: 'website' | 'mql5' | 'myfxbook'
    href: string
    /** Present on the two service links; absent on `website`, which is labelled
     *  from i18n instead. `label` is the trademark, used as the img alt. */
    logo?: { src: string; label: string; width: number; height: number }
}

/** The developer this page belongs to.
 *
 *  BAKED DATA, exactly like the EA figures in data/heroCards.ts: `name`, `bio`,
 *  `location` and the link set are what the backend publishes for this
 *  developer, resolved at build time so the page prerenders complete. None of it
 *  is translated — a person's name, their own bio and their profile URLs are
 *  content, not UI copy. The surrounding sentence IS translated, and takes the
 *  name as a parameter (see `devHero.title` in the locale files). */
export interface DeveloperProfile {
    id: string
    name: string
    bio: string
    /** Where they are based, as published. Rendered verbatim beside `flag`. */
    location: string
    /** Basename in public/img/flags — a 30x20 SVG, as the language selector's. */
    flag: string
    /** Basename in public/img/people, pre-encoded to AVIF/WebP. */
    avatar: string
    links: DeveloperLink[]
}

/** One card in the hero's background field, placed in field px.
 *
 *  The field holds two populations, split on the same reasoning as the home
 *  hero's collage: `front` slots are real EA cards (crisp, translatable,
 *  server-rendered figures) and `veil` slots are the flat blurred bitmap, which
 *  at this strength is unreadable texture and not worth a card subtree in the
 *  LCP path. A `front` slot names the data/heroCards.ts entry that fills it.
 *
 *  Every card carries BOTH layouts, exactly as `EaCard` does. The two
 *  dispositions hold the same six cards in the same paint order inside the same
 *  field box and differ only in where each one sits, so one DOM tree serves both
 *  and the switch is a pair of custom properties rather than a second render. */
export interface DevFieldCard {
    id: string
    kind: 'front' | 'veil'
    card?: string
    wide: StagePoint
    stacked: StagePoint
    motion: EaCardMotion
}
