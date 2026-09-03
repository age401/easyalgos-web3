import type { Config } from 'tailwindcss'
import { eaTheme } from './design-system/tailwind.tokens'
import { PINNED_MEDIA, STACKED_MEDIA } from './utils/breakpoints'

// Colour, typography, space and shape come from the EasyAlgos Web Design System
// (design-system/tokens.json, mirrored in Figma). They are imported wholesale
// from design-system/tailwind.tokens.ts rather than restated here, so the
// codebase and the Figma library cannot drift.
//
// What stays local to this file is the page's own machinery: the breakpoints,
// the ea-* brand gradients and elevation stacks measured off the design, and the
// motion keyframes. Those are compositions of the tokens, not tokens themselves.
// ---- Deliberately outside the design system ----
// Because textColor/backgroundColor/borderColor are replaced wholesale below,
// anything added only to `colors` would never reach those utilities. These are
// spread into all four maps.
const projectColors = {
    // Six ecosystem role identity colours. An identity set, not a state set, so
    // folding them into feedback/* would be wrong and folding them into data/*
    // would shift four of the six. If roles spread beyond the home page,
    // promote them to a role/* semantic group with these exact values rather
    // than remapping them.
    'Role/trader': '#BC78FF',
    'Role/developer': '#42DBE0',
    'Role/broker': '#00F070',
    'Role/vps': '#C9C2FF',
    'Role/community': '#B1C4F1',
    'Role/analytics': '#F1D8B1',
    // The role chip's shell. #3E4153 is a 14%-saturation blue-grey that falls in
    // the gap between neutral/* (25–28% saturation) and gray/* (0%) — nothing in
    // the system lands within ΔE 11 of it. A `neutral-muted` step would close
    // the gap; until then it stays local.
    'Chip/bg': '#0E0E10',
    'Chip/edge': '#3E4153',
}

export default <Partial<Config>>{
    content: [
        './pages/**/*.{vue,js}',
        './components/**/*.{vue,js}',
        './layouts/**/*.{vue,js}',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
        './assets/css/main.css',
        './data/**/*.{ts,js}',
    ],
    theme: {
        screens: {
            mobile: '360px',
            tablet: '600px',
            'tablet-md': '800px',
            'tablet-wide': '1024px',
            desktop: '1280px',
            'desktop-md': '1600px',
            wide: '1920px',
            // `pinned:` / `stacked:` belong here conceptually but CANNOT live here:
            // a single object-valued entry in `screens` turns off the `min-[Npx]:`
            // and `max-*` arbitrary variants for the whole project, and this
            // codebase leans on those (SiteHeader's 841/1241, TrustpilotBar's 769,
            // and `max-tablet-wide` itself). They are registered as plain variants
            // at the foot of this file instead.
        },
        // ---- Design system colour (design-system/tailwind.tokens.ts) ----
        // Primitives are literal hex so /opacity modifiers still work.
        // The per-utility maps below add the semantic roles on top, as var()
        // so a [data-theme="dark"] subtree flips them with no dark: variants.
        colors: { ...eaTheme.colors, ...projectColors },
        textColor: { ...eaTheme.textColor, ...projectColors },
        backgroundColor: { ...eaTheme.backgroundColor, ...projectColors },
        borderColor: { ...eaTheme.borderColor, ...projectColors },
        extend: {
            fontFamily: {
                poppins: ['"Poppins"', 'ui-serif', 'system-ui'],
                franklin: ['"Roboto"', 'sans-serif', 'system-ui'],
                // Rubik is the dashboard-UI face; the EA cards' 10px stat rows use
                // it. Roboto is listed ahead of the generic fallback so that if the
                // Rubik woff2 files are absent the rows land on a face that is
                // already loaded rather than on the system sans — at 10px the two
                // are near-indistinguishable, and it means Rubik never has to be
                // preloaded into the critical path.
                rubik: ['"Rubik"', '"Roboto"', 'sans-serif', 'system-ui'],
                // No `inter`: the Figma file specifies Inter Bold on the
                // Trustpilot bar and nowhere else, and that now renders in
                // Roboto rather than dragging a third family into the page.
                //
                // The design system's own names for the same three faces.
                // `poppins`/`franklin`/`rubik` above are the legacy aliases and
                // still resolve; prefer display/text/data in new markup.
                ...eaTheme.extend.fontFamily,
            },
            fontWeight: {
                book: '400',
                medium: '500',
            },
            backgroundImage: {
                'blue-gradient': 'linear-gradient(to bottom, #074CFB 0%, #205EFB 100%)',
                'blue-gradient-hover': 'linear-gradient(to bottom, #074CFB 0%, #0F3FBA 100%)',
                'blue-gradient-active': 'linear-gradient(to bottom, #0037C1 0%, #0B359F 100%)',
                'blue-purple-gradient': 'linear-gradient(to right, #205EFB 0%, #B36DFF 100%)',
                'black-gradient': 'linear-gradient(to bottom, #4B4B4B 0%, #1E1E1E 100%)',
                'black-gradient-hover': 'linear-gradient(to bottom, #696969 0%, #4B4B4B 100%)',
                'black-gradient-active': 'linear-gradient(to bottom, #969696 0%, #696969 100%)',
                // ---- v3 brand gradients (measured from the Figma file) ----
                // Headline accent: the blue-to-violet sweep on "without paying for
                // them". Light-surface variant.
                'ea-text': 'linear-gradient(90deg, #205EFB 0%, #5959FF 50%, #B36DFF 100%)',
                // The same idea lifted for dark surfaces, so it still reads at 48px
                // on #171717.
                'ea-text-dark': 'linear-gradient(90deg, #4379FF 0%, #7272FF 50%, #B571FF 100%)',
                // The accolades figures. Same three hues as the dark variant but
                // raked diagonally and inset at both ends, so a short run like
                // "7435" still travels the whole blue-to-violet sweep instead of
                // ending mid-blue. Figma 812:5829 / 812:5848 — the file reports
                // 127.5deg on one card and 137.2deg on the other only because it
                // measures the angle against each box; it is one gradient.
                'ea-text-stat': 'linear-gradient(127deg, #4379FF 8%, #7272FF 47%, #B571FF 92%)',
                // Primary CTA fill. The stops are the Figma band's, laid across a
                // layer three times the pill's width (see .ea-btn__bg in main.css):
                // at rest its right end is framed (blue -> violet), on hover it
                // slides so the left end is framed (violet -> blue).
                'ea-cta': 'linear-gradient(96deg, #8663FF 0%, #205EFB 50%, #5959FF 75%, #B36DFF 100%)',
                // Closing banner: a blue-violet base with two radial blooms over it
                // (a deep navy that darkens the bottom-left, a cyan that lifts the
                // top-right) — the layering is what keeps 636px of gradient from
                // looking flat.
                //
                // Derived from Figma 226:5462 by INVERTING each paint's
                // `gradientTransform` — the matrix Figma stores maps the box back
                // onto the gradient's unit space, so reading it forwards gives the
                // wrong angle and extent. The previous values were eyeballed and
                // were wrong in two ways that showed: the linear axis is 96deg, not
                // 104, and the navy bloom sits at alpha 0.35 fading to fully
                // transparent, not 0.85 fading to 0.9 — which was muddying the
                // entire bottom-left corner.
                //
                // The linear's end stops deliberately fall OUTSIDE the box
                // (29.1% and 126.78%), which is why the drawn band never shows
                // pure #205EFB or pure #B36DFF. Do not "tidy" them to 0/100%.
                'ea-banner': [
                    'radial-gradient(51.71% 113.07% at 86% 10%, rgba(64,214,255,0.45) 0%, rgba(29,33,109,0) 70.85%)',
                    'radial-gradient(35.96% 78.65% at 10% 100%, rgba(21,43,119,0.35) 0%, rgba(9,21,60,0) 100%)',
                    'linear-gradient(96.14deg, #205EFB 29.1%, #5959FF 74.03%, #B36DFF 126.78%)'
                ].join(', '),
                // Pricing: an outer tinted shell holding three near-white cards.
                // Both recovered from Figma 420:1070 / 420:1072 by inverting each
                // paint's `gradientTransform` back to handles in the node's own
                // box, then projecting onto the CSS gradient line. The previous
                // values were eyeballed — the angles were out by ~27deg and ~154deg
                // respectively, which is why the sheen ran the wrong way across the
                // cards.
                //
                // The card gradient's box is each CARD, not the row, so the same
                // one definition restarts per column and reads as three separate
                // sheens. That is Figma's own arrangement: all three tier fills are
                // byte-identical.
                'ea-pricing-shell': 'linear-gradient(108.6deg, #F6F7FF -2.45%, #E7E9F9 36.97%, #F2F3FF 97.56%)',
                'ea-pricing-card': 'linear-gradient(313.9deg, #F7F7FB -0.93%, #FFFFFF 49.08%)',
                // Trustpilot review shell (Figma 885:2325). The same three-stop wash
                // as `ea-pricing-shell` — one design-system fill, not a lookalike —
                // but its own geometry: 94.13deg, with the stops squared off at
                // 0/39.42/100 instead of the pricing shell's slight overshoot.
                //
                // The box is each CARD, so the sheen restarts per review exactly as
                // it does per pricing tier. Same arrangement as the pricing row: a
                // tinted outer shell holding a near-white inner card.
                'ea-review-shell': 'linear-gradient(94.13deg, #F6F7FF 0%, #E7E9F9 39.42%, #F2F3FF 100%)',
                // "EA of the month" ribbon on the featured hero card.
                'ea-ribbon': 'linear-gradient(95.25deg, #489EFF 0%, #4CA8FF 100%)',
                // The role cards' inner bubble (Figma 524:2890) — and the same
                // object as the star map's orbiting dots, which is the point: the
                // cards are labels ON those dots, so the two must read identically.
                //
                // It is a PEARL, not a dark disc: a light #C5CDD5 body (set as the
                // background-COLOUR in `.ea-chip__bubble`) seen through this wash,
                // which is clear at the highlight and only reaches 0.8 alpha at the
                // rim. The previous version had the same three colours as fully
                // opaque stops, which threw the base away and rendered the bubble
                // roughly twice as dark as drawn.
                //
                // Geometry is Figma's verbatim: centre 50% / 29.69%, radius 70.31%
                // of the box. Expressed as an `ellipse` with two percentage radii
                // because CSS forbids a percentage radius on `circle` — the bubble
                // is always square, so the two are the same thing here.
                'ea-bubble':
                    'radial-gradient(ellipse 70.31% 70.31% at 50% 29.69%, rgba(120, 124, 154, 0) 0%, rgba(55, 63, 120, 0.2) 55%, rgba(68, 77, 141, 0.8) 90%)',
                // The design system's four published gradients. The ea-* entries
                // above are page-specific compositions and stay as they are.
                ...eaTheme.extend.backgroundImage,
            },
            boxShadow: {
                'primary': '0px 16px 20px 0px rgba(63, 97, 235, 0.16)',
                'secondary': '0px 8px 10px 0px rgba(63, 97, 235, 0.08)',
                'dropdown': '0px 30px 30px 0px rgba(3, 63, 255, 0.1)',
                'notify': '0 5px 5px -3px rgba(0, 0, 0, 0.04), 0 32px 64px -12px rgba(28, 24, 51, 0.14)',
                'dashboard': '0px 143px 40px 0px rgba(76, 113, 154, 0), 0px 92px 37px 0px rgba(76, 113, 154, 0.01), 0px 52px 31px 0px rgba(76, 113, 154, 0.04), 0px 6px 13px 0px rgba(76, 113, 154, 0.08), 0px -20px 40px 2px rgba(76, 113, 154, 0.03)',
                'affiliate-card': '0px 30px 40px 0px rgba(3, 63, 255, 0.05)',
                'pricing-card': '0 24px 60px 0 rgba(192, 191, 243, 0.6)',
                'card-m': '0 16px 16px 0 rgba(84, 107, 197, 0.04), 0 8px 6px 0 rgba(84, 107, 197, 0.04)',
                // ---- v3 ----
                // Primary/dark CTA: a tight contact shadow plus a wide blue bloom.
                'ea-cta': '0 12px 30px -12px rgba(32, 94, 251, 0.2), 0 1px 2px 0 rgba(11, 17, 37, 0.16)',
                'ea-cta-hover': '0 18px 40px -14px rgba(32, 94, 251, 0.34), 0 2px 4px 0 rgba(11, 17, 37, 0.18)',
                // The solid pills (ink / white). One neutral drop, unchanged across
                // default, hover and pressed — the Figma component only moves colour
                // between those states, never the shadow.
                'ea-pill': '0 18px 40px -16px rgba(11, 17, 37, 0.5)',
                // Floating EA card. Four stacked ambient shadows, no offset — the
                // cards read as suspended sheets rather than as lifted UI.
                'ea-card':
                    '0 0 250px 0 rgba(128, 123, 143, 0.12), 0 0 96px 0 rgba(37, 32, 51, 0.04), 0 0 48px 0 rgba(37, 32, 51, 0.02), -6px 0 12px 0 rgba(84, 107, 197, 0.04)',
                'ea-card-hover':
                    '0 0 250px 0 rgba(128, 123, 143, 0.16), 0 24px 48px -24px rgba(37, 32, 51, 0.18), 0 0 48px 0 rgba(37, 32, 51, 0.03), -6px 0 12px 0 rgba(84, 107, 197, 0.05)',
                // Halo around a role chip's bubble.
                'ea-bubble': '0 0 0 4px rgba(98, 103, 143, 0.1)',
                // The burger's dropdown card, floating clear of the topbar.
                'ea-menu': '0 20px 48px 12px rgba(24, 17, 64, 0.14), 0 6px 9.6px 2px rgba(34, 32, 38, 0.06)',
                'ea-step': '0 24px 48px -28px rgba(37, 32, 51, 0.16)',
                // "What you get" slide container. The same suspended-sheet stack as
                // `ea-card` with a second, wider blue wash on the left edge — the
                // panel bleeds off the right of the viewport, so the only side that
                // reads as lit is the one facing the copy. Figma 626:5098.
                'ea-slide':
                    '0 0 250px 0 rgba(128, 123, 143, 0.12), 0 0 96px 0 rgba(37, 32, 51, 0.04), 0 0 48px 0 rgba(37, 32, 51, 0.02), -12px 0 16px 0 rgba(84, 107, 197, 0.04), -6px 0 12px 0 rgba(84, 107, 197, 0.04)',
                // The same five layers on handhelds, at roughly a quarter of the
                // blur — and with the two blue washes moved from the left edge onto
                // the bottom. Inline in the list the slide is centred in the column
                // rather than bleeding off the right, so it reads as lit from above
                // instead of from the side. Figma 626:7817.
                'ea-slide-sm':
                    '0 0 60px 0 rgba(128, 123, 143, 0.12), 0 0 48px 0 rgba(37, 32, 51, 0.04), 0 0 24px 0 rgba(37, 32, 51, 0.02), 0 6px 8px 0 rgba(84, 107, 197, 0.04), 0 3px 6px 0 rgba(84, 107, 197, 0.04)',
                // shadow-card / shadow-raised / shadow-action / shadow-overlay.
                ...eaTheme.extend.boxShadow,
            },
            // ---- Design system scales (design-system/tailwind.tokens.ts) ----
            // The 13-step size ramp, ratio leading, optical tracking, the 4-based
            // space scale and the six radii measured off the WEB3 design.
            fontSize: eaTheme.extend.fontSize,
            letterSpacing: eaTheme.extend.letterSpacing,
            lineHeight: {
                // The design system's ratio leading.
                ...eaTheme.extend.lineHeight,
                // Page-specific fixed leadings, kept from before the migration.
                '3.5': '.875rem',
                '4.25': '1.0625rem',
                '4.5': '1.125rem',
                '5.5': '1.375rem',
                '11': '3rem',
                '13': '4rem',
                '14': '4.5rem',
                '15': '4.875rem',
                '20': '6rem',
            },

            // NOTE — do NOT spread eaTheme.extend.spacing / .borderRadius here.
            // The design system names space tokens by their pixel value
            // (space/16 = 16px) while Tailwind's numeric scale is quarter-rems
            // (4 = 16px). Merging them silently redefines the whole scale:
            // gap-2 becomes 2px instead of 8px, p-4 becomes 4px instead of 16px.
            // Same trap on radius, where DS radius/8 would redefine rounded-8.
            // The DS space and radius scales are exposed as --space-* and
            // --radius-* custom properties in design-system/tokens.css for
            // hand-written CSS; Tailwind keeps its own (already 4-based) scale.
            spacing: {
                '6.5': '1.625rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '21': '5.5rem',
                '25': '6.25rem',
                '29': '7.5rem',
            },
            borderRadius: {
                '1.5xl': '.875rem',
                '2.5xl': '1.25rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(2px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                // Brand marquee. Translating exactly -50% of a doubled track is what
                // makes the loop seamless; transform-only so it stays on the
                // compositor and never triggers layout.
                eaMarquee: {
                    from: { transform: 'translate3d(0, 0, 0)' },
                    to: { transform: 'translate3d(-50%, 0, 0)' },
                },
                // Slow drift on the role cards, so each one reads as orbiting the
                // cluster rather than bobbing in place. Eight stations around an
                // 8.75px circle: with `linear` timing that is close enough to a
                // circle at this amplitude, and unlike a four-station diamond it has
                // no corners to give the path away. Each card enters at its own
                // phase (a negative delay in ROLE_CARDS, spread across the whole
                // period), so the set drifts as a field instead of moving in unison.
                //
                // Transform-only, and deliberately on the card itself rather than on
                // the wrapper that positions it: an animated `transform` outranks an
                // inline one, so a single element cannot carry both the drift and
                // the `translate(-50%,-50%)` that centres the card on its point.
                eaOrbit: {
                    '0%, 100%': { transform: 'translate3d(8.75px, 0, 0)' },
                    '12.5%': { transform: 'translate3d(6.19px, 6.19px, 0)' },
                    '25%': { transform: 'translate3d(0, 8.75px, 0)' },
                    '37.5%': { transform: 'translate3d(-6.19px, 6.19px, 0)' },
                    '50%': { transform: 'translate3d(-8.75px, 0, 0)' },
                    '62.5%': { transform: 'translate3d(-6.19px, -6.19px, 0)' },
                    '75%': { transform: 'translate3d(0, -8.75px, 0)' },
                    '87.5%': { transform: 'translate3d(6.19px, -6.19px, 0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.15s ease-out',
                eaMarquee: 'eaMarquee 46s linear infinite',
                // Linear, because an orbit has no ends to ease into.
                //
                // The period is set from the radius, not picked: widening the circle
                // from 7px to 8.75px lengthens the path by 25%, so holding the old
                // 18s would have made the cards travel 25% FASTER, which is the
                // opposite of a slow drift. 22.5s would have exactly cancelled that;
                // 27s goes past it, so the cards now cover more ground at a lower
                // speed than before — 2.0 px/s against the old 2.4. Change the
                // radius and this has to move with it.
                eaOrbit: 'eaOrbit 27s linear infinite',
            },
            blur: {
                '120': '120px',
            },
            borderWidth: {
                '1': '1px',
            },
            transitionDuration: {
                300: '300ms',
                500: '500ms',
                600: '600ms',
                700: '700ms',
                1000: '1000ms',
            },
            transitionDelay: {
                360: '360ms',
                420: '420ms',
            },
            transitionProperty: {
                'transform-opacity': 'transform, opacity',
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(.22,.61,.36,1)',
            },
        },
    },
    plugins: [
        function ({ addUtilities }: any) {
            addUtilities({
                '.contents': {
                    display: 'contents',
                },
            })
        },
        // The problem/solution section's two states. Not breakpoints — they turn on
        // available AREA, not width, so they cannot be expressed on the `screens`
        // scale (and putting them there would disable `min-[Npx]:` everywhere; see
        // the note in `screens`). Defined as a matched pair rather than relying on
        // a generated inverse, and sharing one source of truth with the component
        // that reads the same query through matchMedia — utils/breakpoints.ts.
        function ({ addVariant }: any) {
            addVariant('pinned', `@media ${PINNED_MEDIA}`)
            addVariant('stacked', `@media ${STACKED_MEDIA}`)
        },
    ],
}
