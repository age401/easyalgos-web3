/**
 * EasyAlgos Web Design System 2 — Tailwind theme fragment.
 *
 * Generated from design-system/tokens.json. Merge into tailwind.config.ts:
 *
 *   import { eaTheme } from './design-system/tailwind.tokens'
 *
 * Two deliberately different value styles, and the difference matters:
 *
 *   PRIMITIVES are literal hex. Tailwind can only synthesise an alpha channel
 *   from a literal, so `bg-white/10` and `text-neutral-700/60` work. A
 *   `var()` here would silently break every `/opacity` modifier in the markup.
 *
 *   SEMANTIC tokens are `var(--token)`. That is the whole point of them: put
 *   [data-theme="dark"] on any wrapper and every semantic utility beneath it
 *   flips, with no `dark:` variants anywhere in the markup. The trade is that
 *   they cannot take an /opacity modifier — if you need translucency, reach
 *   for the primitive.
 *
 * The per-utility maps (textColor / backgroundColor / borderColor) contain
 * BOTH tiers, so `text-secondary` and `text-neutral-800` are both valid.
 * Reach for the semantic name first; drop to a primitive only where no role
 * fits.
 */

/** Tier 1 — primitives. Literal values, available to every colour utility. */
export const primitives = {
    /** The violet-tinted neutral. Light page chrome, body text, borders. */
    neutral: {
        25: '#F7F7FB',
        50: '#F0F1F7',
        100: '#E4E6F0',
        200: '#C9CCDD',
        300: '#AEB2C9',
        400: '#9499B6',
        500: '#7A7FA3',
        600: '#62678F',
        700: '#51567A',
        800: '#433E68',
        900: '#2F2A4A',
        950: '#1C1833',
        975: '#0B1125',
    },
    /**
     * True-neutral greyscale. Owns the dark bands and footer, plus product
     * screenshots, code surfaces and monochrome media. Never convert one
     * neutral ramp into the other — the split is intentional.
     */
    gray: {
        25: '#FAFAFA',
        50: '#F5F5F5',
        100: '#E5E5E5',
        200: '#D4D4D4',
        300: '#A3A3A3',
        400: '#737373',
        500: '#525252',
        600: '#404040',
        700: '#262626',
        800: '#171717',
        900: '#0A0A0A',
        950: '#050505',
    },
    /** Action and accent. */
    blue: {
        50: '#EBF1FF',
        100: '#D2DFFE',
        200: '#A6BFFD',
        300: '#7EA2FC',
        400: '#5481F9',
        500: '#3D71F8',
        600: '#285FF7',
        700: '#074CFB',
        800: '#1E48B9',
        900: '#163486',
    },
    /** Brand identity. */
    violet: {
        50: '#F2F0FF',
        100: '#E4E0FF',
        200: '#C9C2FF',
        300: '#AFA3FF',
        400: '#8B7EFF',
        500: '#7D73EA',
        600: '#7469D7',
        700: '#5A50C9',
        800: '#4134BC',
        900: '#2C2382',
    },
    /** Gradient stops and the logo mark. Not ramp steps. */
    brand: {
        indigo: '#5959FF',
        'indigo-bright': '#7272FF',
        'indigo-light': '#A299FF',
        purple: '#B36DFF',
        'purple-bright': '#B571FF',
        'blue-bright': '#4379FF',
    },
    success: { subtle: '#F0FDF4', DEFAULT: '#00DB63', strong: '#00BA38', text: '#067A3C', deep: '#06301C' },
    warning: { subtle: '#FFFBEB', DEFAULT: '#FB951E', strong: '#EE7206', text: '#B45309', deep: '#3A2408' },
    danger: { subtle: '#FEF2F2', DEFAULT: '#FF1519', strong: '#DC2626', deep: '#3A0C0C' },
    /** Eight categorical series. For a soft variant use the same colour at 20% alpha. */
    data: {
        '01': '#5079E2', '02': '#E5C31A', '03': '#42DBE0', '04': '#E160C3',
        '05': '#3CE331', '06': '#6B58E4', '07': '#42E07A', '08': '#C960E1',
    },
    /** Third-party marks, fixed by their owners. Never reuse as UI colour. */
    external: { trustpilot: '#00B67A', 'star-empty': '#D9D9D9' },
    /** Elevation is tinted, not black. */
    shadow: { ambient: '#807B8F', 'ambient-deep': '#252033', card: '#546BC5', action: '#3F61EB' },
} as const

/** Tier 2 — semantic roles. `var()` so a dark subtree flips them. */
const semanticText = {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    disabled: 'var(--text-disabled)',
    inverse: 'var(--text-inverse)',
    brand: 'var(--text-brand)',
    accent: 'var(--text-accent)',
    'on-accent': 'var(--text-on-accent)',
    'on-primary': 'var(--action-on-primary)',
    'on-secondary': 'var(--action-on-secondary)',
    'on-ink': 'var(--action-on-ink)',
    'on-disabled': 'var(--action-on-disabled)',
    positive: 'var(--metric-positive)',
    negative: 'var(--metric-negative)',
    flat: 'var(--metric-neutral)',
    wordmark: 'var(--brand-wordmark)',
} as const

const semanticBg = {
    canvas: 'var(--bg-canvas)',
    surface: 'var(--bg-surface)',
    'surface-alt': 'var(--bg-surface-alt)',
    sunken: 'var(--bg-sunken)',
    inverse: 'var(--bg-inverse)',
    'brand-subtle': 'var(--bg-brand-subtle)',
    'accent-subtle': 'var(--bg-accent-subtle)',
    hover: 'var(--bg-hover)',
    active: 'var(--bg-active)',
    primary: 'var(--action-primary)',
    'primary-hover': 'var(--action-primary-hover)',
    'primary-active': 'var(--action-primary-active)',
    secondary: 'var(--action-secondary)',
    'secondary-hover': 'var(--action-secondary-hover)',
    ink: 'var(--action-ink)',
    'ink-hover': 'var(--action-ink-hover)',
    disabled: 'var(--action-disabled)',
    'success-bg': 'var(--feedback-success-bg)',
    'warning-bg': 'var(--feedback-warning-bg)',
    'danger-bg': 'var(--feedback-danger-bg)',
    'info-bg': 'var(--feedback-info-bg)',
} as const

const semanticBorder = {
    subtle: 'var(--border-subtle)',
    default: 'var(--border-default)',
    DEFAULT: 'var(--border-default)',
    strong: 'var(--border-strong)',
    focus: 'var(--border-focus)',
    inverse: 'var(--border-inverse)',
} as const

const base = {
    transparent: 'transparent',
    current: 'currentColor',
    white: '#FFFFFF',
    black: '#000000',
} as const

export const eaTheme = {
    /** Replaces theme.colors outright — drives fill/stroke/ring/gradient stops. */
    colors: { ...base, ...primitives },

    textColor: { ...base, ...primitives, ...semanticText },
    backgroundColor: { ...base, ...primitives, ...semanticBg },
    borderColor: { ...base, ...primitives, ...semanticBorder },

    extend: {
        fontFamily: {
            display: ['Poppins', 'ui-sans-serif', 'system-ui'],
            text: ['Roboto', 'ui-sans-serif', 'system-ui'],
            data: ['Rubik', 'Roboto', 'sans-serif'],
        },

        /**
         * The size ramp only. Leading and tracking belong to a text style, not
         * to a size — use the `.ea-*` classes in tokens.css, or set
         * `leading-*` / `tracking-*` explicitly.
         */
        fontSize: {
            xs: '0.75rem',    // 12 — the floor for interface text
            sm: '0.875rem',   // 14
            base: '1rem',     // 16
            md: '1.125rem',   // 18
            lg: '1.25rem',    // 20
            xl: '1.5rem',     // 24
            '2xl': '1.75rem', // 28
            '3xl': '2rem',    // 32
            '4xl': '2.5rem',  // 40
            '5xl': '3rem',    // 48
            '6xl': '3.5rem',  // 56
            '7xl': '4rem',    // 64
            '8xl': '4.5rem',  // 72
        },

        fontWeight: { regular: '400', medium: '500', semibold: '600', bold: '700' },

        lineHeight: { none: '1', tight: '1.15', snug: '1.25', normal: '1.4', relaxed: '1.6' },

        letterSpacing: {
            tighter: '-0.03em',
            tight: '-0.02em',
            normal: '0em',
            wide: '0.01em',
            widest: '0.08em',
            eyebrow: '0.25em',
        },

        spacing: {
            0: '0px', 2: '2px', 4: '4px', 8: '8px', 12: '12px', 16: '16px',
            20: '20px', 24: '24px', 32: '32px', 40: '40px', 48: '48px',
            64: '64px', 80: '80px', 96: '96px', 120: '120px',
        },

        borderRadius: {
            none: '0px',
            xs: '4px',
            sm: '6px',
            DEFAULT: '8px',
            md: '12px',
            lg: '20px',
            // Figma stores radius/full as 500 because it has no "infinity";
            // in CSS the same intent is 9999px. 500px would stop being fully
            // round on anything taller than 1000px.
            full: '9999px',
        },

        boxShadow: {
            card: 'var(--elevation-card)',
            raised: 'var(--elevation-raised)',
            action: 'var(--elevation-action)',
            overlay: 'var(--elevation-overlay)',
        },

        backgroundImage: {
            'gradient-brand': 'var(--gradient-brand)',
            'gradient-brand-bright': 'var(--gradient-brand-bright)',
            'gradient-mark': 'var(--gradient-mark)',
            'gradient-tile': 'var(--gradient-tile)',
        },
    },
} as const

export default eaTheme
