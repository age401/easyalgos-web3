import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import { PINNED_MEDIA, STACKED_MEDIA } from './utils/breakpoints'

// EasyAlgos design system (ported verbatim from PROJECT_STACK_GUIDE_FOR_AI.md §17)
// plus the v2 "Ledger" additions at the bottom of the colors map. Ship as-is for
// copy-paste compatibility with the main EasyAlgos client.
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
        colors: {
            ...colors,
            'VIOLET': '#4134BC',
            'VIOLET/100': '#E4E0FF',
            'VIOLET/200': '#C9C2FF',
            'VIOLET/300': '#AFA3FF',
            'VIOLET/400': '#8B7EFF',
            'VIOLET/500': '#7D73EA',
            'VIOLET/600': '#7469D7',
            'VIOLET/700': '#5A50C9',
            'VIOLET/800': '#4134BC',
            'PURPLE': '#8B7EFF',
            'EXTRA-PURPLE': '#8B23FE',
            'BLUE/BASE': '#205EFB',
            'BLUE/00': '#F1F4F9',
            'BLUE/01': '#DEE1EF',
            'BLUE/02': '#ACBCF0',
            'BLUE/03': '#7A96F2',
            'BLUE/04': '#4871F3',
            'BLUE/05': '#285FF7',
            'BLUE/05/20': 'rgba(32, 94, 251, 0.2)',
            'BLUE/05/40': 'rgba(32, 94, 251, 0.4)',
            'BLUE/06': '#074CFB',
            'BW/00': '#FFFFFF',
            'BW/01': '#F0F0F0',
            'BW/02': '#D2D2D2',
            'BW/03': '#B4B4B4',
            'BW/04': '#969696',
            'BW/05': '#696969',
            'BW/06': '#4B4B4B',
            'BW/07': '#2D2D2D',
            'BW/08': '#1E1E1E',
            'BW/09': '#222128',
            'error': '#F04438',
            'dark-title': '#2E2E2E',
            'PINK': '#B36DFF',
            'WARNING': '#FF3437',
            'Neutral/White': '#FFFFFF',
            'Neutral/25': '#FAFAFA',
            'Neutral/50': '#F5F5F5',
            'Neutral/100': '#E5E5E5',
            'Neutral/200': '#D4D4D4',
            'Neutral/300': '#A3A3A3',
            'Neutral/400': '#737373',
            'Neutral/500': '#525252',
            'Neutral/600': '#404040',
            'Neutral/700': '#262626',
            'Neutral/800': '#171717',
            'Tinted/25': '#F7F7FB',
            'Tinted/50': '#F0F1F7',
            'Tinted/100': '#E4E6F0',
            'Tinted/200': '#C9CCDD',
            'Tinted/300': '#AEB2C9',
            'Tinted/400': '#9499B6',
            'Tinted/500': '#7A7FA3',
            'Tinted/600': '#62678F',
            'Tinted/700': '#51567A',
            'Tinted/800': '#433E68',
            'Tinted/900': '#2F2A4A',
            'Tinted/950': '#1C1833',
            'Green/10': '#F0FDF4',
            'Green/50': '#ADEBC5',
            'Green/100': '#00DB63',
            'Green/200': '#00BA38',
            'Blue/25': '#F5F8FF',
            'Blue/50': '#EBF1FF',
            'Blue/100': '#074CFB',
            'Blue/200': '#A6BFFD',
            'Blue/400': '#5481F9',
            'Blue/500': '#3D71F8',
            'Blue/600': '#285FF7',
            'Red/10': '#F1B1B1',
            'Red/50': '#FEF2F2',
            'Red/100': '#FF1519',
            'Red/200': '#DC2626',
            'Gray/200': '#787878',
            'Orange/100': '#FB951E',
            // v2 "Ledger" additions — the institutional ink ramp, anchored to the
            // wordmark ink (#0B1125). Used for dark surfaces instead of pure black.
            'Ink/950': '#0B1125',
            'Ink/900': '#101731',
            'Ink/800': '#161F3E',
            'Ink/edge': '#232D52',
            // v3 additions, read off the Figma file.
            // Mixed-case Violet ramp mirroring the legacy uppercase VIOLET/* one.
            // The v3 file names its variables this way, so matching it keeps the
            // classes in the markup readable straight off the design.
            'Violet/100': '#E4E0FF',
            'Violet/200': '#C9C2FF',
            'Violet/300': '#AFA3FF',
            'Violet/400': '#8B7EFF',
            'Violet/500': '#7D73EA',
            'Violet/600': '#7469D7',
            'Violet/700': '#5A50C9',
            'Violet/800': '#4134BC',
            // The role cards floating over the particle cluster.
            'Chip/bg': '#0E0E10',
            'Chip/edge': '#3E4153',
            // The body of a card's bubble, under the `ea-bubble` wash. Shared with
            // the star map's orbiting dots, which are the same object drawn in SVG.
            'Bubble/pearl': '#C5CDD5',
            // Chip label colours — one per ecosystem role, from the Indicators set.
            'Role/trader': '#BC78FF',
            'Role/developer': '#42DBE0',
            'Role/broker': '#00F070',
            'Role/vps': '#C9C2FF',
            'Role/community': '#B1C4F1',
            'Role/analytics': '#F1D8B1',
        },
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
            },
            borderRadius: {
                '1.5xl': '.875rem',
                '2.5xl': '1.25rem',
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            lineHeight: {
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
            fontSize: {
                'xl': '1.3125rem',
                '3.5xl': '2rem',
                '3.6xl': '2.125rem',
                '4.5xl': '2.625rem',
                '6xl': '4rem',
            },
            spacing: {
                '6.5': '1.625rem',
                '13': '3.25rem',
                '15': '3.75rem',
                '21': '5.5rem',
                '25': '6.25rem',
                '29': '7.5rem',
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
