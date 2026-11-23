import type { EaBandId, ExpertAdvisor } from '~/types/expertAdvisors'

// State for the Expert Advisors list: which view, which band, the search text
// and how much of the result is on screen.
//
// Pattern A from the stack guide - a `useState` composable holding shared UI
// state, with the component only rendering it. `useState` rather than `ref` for
// a concrete reason: the list is the page people come BACK to. Open an EA, hit
// back, and the view, the filter and the "load more" position are where they
// were left instead of resetting to the first twelve cards.
//
// Nothing here fetches. The list is baked data (data/expertAdvisors.ts); when it
// becomes a feed, the fetch replaces `source` below and nothing else moves.

export type EaListView = 'cards' | 'compact'
export type EaListBand = EaBandId | 'all'

/** Cards shown before "Load more", and how many each press adds. Twelve is
 *  three drawn rows of four, and also divides evenly into three and two
 *  columns, so no breakpoint ever ends on a ragged row. */
const PAGE = 12
/** On a phone the list is one card wide, and twelve cards is 4,000px of scroll
 *  before the reader reaches the button. Six there. */
const PHONE_PAGE = 6

export function useEaList(source: readonly ExpertAdvisor[] = EXPERT_ADVISORS) {
    const view = useState<EaListView>('ea-list-view', () => 'cards')
    const band = useState<EaListBand>('ea-list-band', () => 'all')
    const query = useState<string>('ea-list-query', () => '')
    const shown = useState<number>('ea-list-shown', () => PAGE)
    /** True until the first "Load more": while it holds, a phone hides cards
     *  seven to twelve with CSS. Server and client render the same twelve, so
     *  there is no hydration mismatch and no layout jump on a tablet. */
    const phoneCollapsed = useState<boolean>('ea-list-phone-collapsed', () => true)

    const normalise = (text: string) => text.trim().toLowerCase()

    const filtered = computed(() => {
        const needle = normalise(query.value)
        return source.filter((ea) => {
            if (band.value !== 'all' && ea.band.id !== band.value) return false
            if (!needle) return true
            return [ea.name, ea.developerName, ea.style, ea.pairs].some((field) => normalise(field).includes(needle))
        })
    })

    /** The compact view is the scan-everything view and is never paged. */
    const visible = computed(() => (view.value === 'compact' ? filtered.value : filtered.value.slice(0, shown.value)))

    const remaining = computed(() => Math.max(0, filtered.value.length - visible.value.length))
    /** What a phone still has to load: the CSS-hidden half of the first page too. */
    const phoneRemaining = computed(() => {
        const onPhone = phoneCollapsed.value ? Math.min(PHONE_PAGE, visible.value.length) : visible.value.length
        return Math.max(0, filtered.value.length - onPhone)
    })
    const phoneVisibleCount = computed(() =>
        phoneCollapsed.value ? Math.min(PHONE_PAGE, visible.value.length) : visible.value.length
    )

    function loadMore() {
        // The first press on a phone only lifts the CSS collapse - those six
        // cards are already in the DOM. Everywhere else it adds a page.
        if (phoneCollapsed.value && window.matchMedia('(max-width: 599.98px)').matches) {
            phoneCollapsed.value = false
            return
        }
        phoneCollapsed.value = false
        shown.value += PAGE
    }

    function reset() {
        band.value = 'all'
        query.value = ''
    }

    // A new filter starts from the top of its own result.
    watch([band, query], () => {
        shown.value = PAGE
        phoneCollapsed.value = true
    })

    return {
        view,
        band,
        query,
        filtered,
        visible,
        remaining,
        phoneRemaining,
        phoneVisibleCount,
        phoneCollapsed,
        phonePage: PHONE_PAGE,
        loadMore,
        reset
    }
}
