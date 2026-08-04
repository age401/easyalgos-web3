import type { RoleCard } from '~/types/home'

// The six role labels floating over the particle cluster — "the different places"
// the problem copy is talking about.
//
// Transcribed from Figma's composed frame "Star Difussion" (524:2841), which is
// the authority for WHERE each card sits; the card itself is 524:2889 (see
// `.ea-chip` in main.css) and the glyph set is 526:842.
//
// Positions are the CENTRE of each card as a percentage of the shared 760x760 box,
// derived from Figma's top-left origin plus half the card's own size. Worth
// stating because the previous pass used the raw top-left coordinates while the
// markup centred each card on them, which offset every one of them by half its
// width — invisible only because a second bug (below) was cancelling it out.
//
// Glyphs are inlined rather than fetched. They are single-colour 1.5px strokes on
// a 20x20 grid — the exact path data exported from the Figma symbols, unaltered —
// so as `currentColor` they inherit the bubble's ink from CSS and cost nothing:
// six more requests for six sets of two-to-four short paths would be the whole
// budget of this section spent on decoration. Anything that needs to change about
// their colour is a token change in `.ea-chip__bubble`.
//
// There is deliberately no per-card size or opacity here, though Figma draws the
// community and analytics cards smaller (0.686 / 0.556) and fainter (0.63 / 0.38
// alpha) to push them into the background. Diego's call, after seeing both a static
// and an animated version of that depth: every card is drawn at full strength and
// the only thing separating them is the drift. It also removed the last of the
// stroke crawl — a part-transparent card being scaled over a live particle canvas
// was re-rasterising its 2px rule onto a new sub-pixel boundary every frame.
//
// So the one piece of per-card motion data left is the drift phase.
export const ROLE_CARDS: RoleCard[] = [
    {
        id: 'developer',
        left: 57.237,
        top: 31.053,
        color: 'text-Role/developer',
        delay: '0s',
        // Direction-Horizontal: two chevrons back to back.
        icon: ['M8.4585 7.6875L6.146 10L8.4585 12.3125', 'M11.5415 7.6875L13.854 10L11.5415 12.3125']
    },
    {
        id: 'vps',
        left: 28.355,
        top: 36.711,
        color: 'text-Role/vps',
        delay: '-13.2s',
        // Server: two stacked racks, each with its indicator lamp.
        icon: [
            'M4.5625 6.97916C4.5625 6.49845 4.75346 6.03743 5.09337 5.69753C5.43328 5.35762 5.8943 5.16666 6.375 5.16666H13.625C14.1057 5.16666 14.5667 5.35762 14.9066 5.69753C15.2465 6.03743 15.4375 6.49845 15.4375 6.97916V8.18749C15.4375 8.66819 15.2465 9.12921 14.9066 9.46912C14.5667 9.80903 14.1057 9.99999 13.625 9.99999H6.375C5.8943 9.99999 5.43328 9.80903 5.09337 9.46912C4.75346 9.12921 4.5625 8.66819 4.5625 8.18749V6.97916Z',
            'M4.5625 11.8125C4.5625 11.3318 4.75346 10.8708 5.09337 10.5309C5.43328 10.191 5.8943 10 6.375 10H13.625C14.1057 10 14.5667 10.191 14.9066 10.5309C15.2465 10.8708 15.4375 11.3318 15.4375 11.8125V13.0208C15.4375 13.5015 15.2465 13.9626 14.9066 14.3025C14.5667 14.6424 14.1057 14.8333 13.625 14.8333H6.375C5.8943 14.8333 5.43328 14.6424 5.09337 14.3025C4.75346 13.9626 4.5625 13.5015 4.5625 13.0208V11.8125Z',
            'M6.979 7.58334V7.58939',
            'M6.979 12.4167V12.4227'
        ]
    },
    {
        id: 'trader',
        left: 37.237,
        top: 55.658,
        color: 'text-Role/trader',
        delay: '-4.4s',
        // Arrows-Exchange: two arrows passing in opposite directions.
        icon: ['M6.91699 8.5H15.5503L13.0837 6', 'M13.0835 11.5H4.4502L6.91686 14']
    },
    {
        id: 'broker',
        left: 66.184,
        top: 71.579,
        color: 'text-Role/broker',
        delay: '-18.5s',
        // Layout-Grid: four panes.
        icon: [
            'M5.1665 5.77082C5.1665 5.61059 5.23016 5.45692 5.34346 5.34361C5.45676 5.23031 5.61044 5.16666 5.77067 5.16666H8.18734C8.34757 5.16666 8.50124 5.23031 8.61455 5.34361C8.72785 5.45692 8.7915 5.61059 8.7915 5.77082V8.18749C8.7915 8.34772 8.72785 8.5014 8.61455 8.6147C8.50124 8.728 8.34757 8.79166 8.18734 8.79166H5.77067C5.61044 8.79166 5.45676 8.728 5.34346 8.6147C5.23016 8.5014 5.1665 8.34772 5.1665 8.18749V5.77082Z',
            'M11.2085 5.77082C11.2085 5.61059 11.2721 5.45692 11.3855 5.34361C11.4988 5.23031 11.6524 5.16666 11.8127 5.16666H14.2293C14.3896 5.16666 14.5432 5.23031 14.6565 5.34361C14.7698 5.45692 14.8335 5.61059 14.8335 5.77082V8.18749C14.8335 8.34772 14.7698 8.5014 14.6565 8.6147C14.5432 8.728 14.3896 8.79166 14.2293 8.79166H11.8127C11.6524 8.79166 11.4988 8.728 11.3855 8.6147C11.2721 8.5014 11.2085 8.34772 11.2085 8.18749V5.77082Z',
            'M5.1665 11.8125C5.1665 11.6523 5.23016 11.4986 5.34346 11.3853C5.45676 11.272 5.61044 11.2083 5.77067 11.2083H8.18734C8.34757 11.2083 8.50124 11.272 8.61455 11.3853C8.72785 11.4986 8.7915 11.6523 8.7915 11.8125V14.2292C8.7915 14.3894 8.72785 14.5431 8.61455 14.6564C8.50124 14.7697 8.34757 14.8333 8.18734 14.8333H5.77067C5.61044 14.8333 5.45676 14.7697 5.34346 14.6564C5.23016 14.5431 5.1665 14.3894 5.1665 14.2292V11.8125Z',
            'M11.2085 11.8125C11.2085 11.6523 11.2721 11.4986 11.3855 11.3853C11.4988 11.272 11.6524 11.2083 11.8127 11.2083H14.2293C14.3896 11.2083 14.5432 11.272 14.6565 11.3853C14.7698 11.4986 14.8335 11.6523 14.8335 11.8125V14.2292C14.8335 14.3894 14.7698 14.5431 14.6565 14.6564C14.5432 14.7697 14.3896 14.8333 14.2293 14.8333H11.8127C11.6524 14.8333 11.4988 14.7697 11.3855 14.6564C11.2721 14.5431 11.2085 14.3894 11.2085 14.2292V11.8125Z'
        ]
    },
    {
        id: 'community',
        left: 74.231,
        top: 47.81,
        color: 'text-Role/community',
        delay: '-9.7s',
        // Users-Group: three figures, one drawn to the front.
        icon: [
            'M7.58333 15.4375V14.8333C7.58333 14.5129 7.71064 14.2055 7.93725 13.9789C8.16385 13.7523 8.4712 13.625 8.79167 13.625H11.2083C11.5288 13.625 11.8361 13.7523 12.0628 13.9789C12.2894 14.2055 12.4167 14.5129 12.4167 14.8333V15.4375M13.0208 8.79167H14.2292C14.5496 8.79167 14.857 8.91897 15.0836 9.14558C15.3102 9.37219 15.4375 9.67953 15.4375 10V10.6042M4.5625 10.6042V10C4.5625 9.67953 4.68981 9.37219 4.91641 9.14558C5.14302 8.91897 5.45036 8.79167 5.77083 8.79167H6.97917M8.79167 10.6042C8.79167 10.9246 8.91897 11.232 9.14558 11.4586C9.37219 11.6852 9.67953 11.8125 10 11.8125C10.3205 11.8125 10.6278 11.6852 10.8544 11.4586C11.081 11.232 11.2083 10.9246 11.2083 10.6042C11.2083 10.2837 11.081 9.97635 10.8544 9.74975C10.6278 9.52314 10.3205 9.39583 10 9.39583C9.67953 9.39583 9.37219 9.52314 9.14558 9.74975C8.91897 9.97635 8.79167 10.2837 8.79167 10.6042ZM11.8125 5.77083C11.8125 5.92951 11.8438 6.08664 11.9045 6.23324C11.9652 6.37984 12.0542 6.51305 12.1664 6.62525C12.2786 6.73746 12.4118 6.82646 12.5584 6.88719C12.705 6.94791 12.8622 6.97917 13.0208 6.97917C13.1795 6.97917 13.3366 6.94791 13.4832 6.88719C13.6298 6.82646 13.763 6.73746 13.8753 6.62525C13.9875 6.51305 14.0765 6.37984 14.1372 6.23324C14.1979 6.08664 14.2292 5.92951 14.2292 5.77083C14.2292 5.45036 14.1019 5.14302 13.8753 4.91641C13.6486 4.68981 13.3413 4.5625 13.0208 4.5625C12.7004 4.5625 12.393 4.68981 12.1664 4.91641C11.9398 5.14302 11.8125 5.45036 11.8125 5.77083ZM5.77083 5.77083C5.77083 5.92951 5.80209 6.08664 5.86281 6.23324C5.92354 6.37984 6.01254 6.51305 6.12475 6.62525C6.23695 6.73746 6.37016 6.82646 6.51676 6.88719C6.66336 6.94791 6.82049 6.97917 6.97917 6.97917C7.13785 6.97917 7.29497 6.94791 7.44158 6.88719C7.58818 6.82646 7.72138 6.73746 7.83359 6.62525C7.94579 6.51305 8.0348 6.37984 8.09552 6.23324C8.15625 6.08664 8.1875 5.92951 8.1875 5.77083C8.1875 5.45036 8.06019 5.14302 7.83359 4.91641C7.60698 4.68981 7.29964 4.5625 6.97917 4.5625C6.6587 4.5625 6.35135 4.68981 6.12475 4.91641C5.89814 5.14302 5.77083 5.45036 5.77083 5.77083Z'
        ]
    },
    {
        id: 'analytics',
        left: 24.868,
        top: 70.789,
        color: 'text-Role/analytics',
        delay: '-23.1s',
        // Chart-Line: a rising trace over its axis.
        icon: ['M5.1665 14.2292H14.8332M5.1665 11.8125L7.58317 8.1875L9.99984 9.39583L12.4165 6.375L14.8332 8.79167']
    }
]
