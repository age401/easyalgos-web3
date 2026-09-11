<script setup lang="ts">
// The client-accounts table: priority columns plus a per-row disclosure.
//
// The argument
// ------------
// A ledger of twenty accounts is a RANKED LIST first and a spreadsheet second.
// What a visitor is doing here is scanning down one column — account growth —
// to answer "does this work". The responsive strategy has to protect that scan,
// and it does so by dropping columns rather than the rows' alignment: at 360px
// you still get twenty rows, one per line, with the growth figure stacked in a
// single column you can run your eye down. Nothing about the reading posture
// changes between 360 and 1440; there is just less detail.
//
// The columns leave in reverse order of how much they are read (see
// RESULTS_COLUMNS in data/resultsAccounts.ts for the ranking), and everything
// dropped is one tap away in the row's own drawer, so no figure is ever lost.
//
// Cost, stated plainly and accepted: comparing two accounts on a hidden column
// means opening two drawers, and the drawers make the list's height jump around.
// The alternative that keeps cross-column comparison — freezing rank and
// platform and scrolling the rest sideways — was built, compared and dropped.
//
// Implementation notes
// --------------------
// * It stays a real <table> at every width — one DOM, one set of semantics, and
//   a screen reader still announces "Account growth, plus 120 percent". Nothing
//   is duplicated into a phone-only card list.
// * Which columns exist at which width is pure CSS (`hidden tablet-md:table-cell`),
//   so there is no viewport listener, no `useMediaQuery`, and no SSR/client
//   divergence to reconcile. Column widths ride on the <th> cells rather than a
//   <colgroup> because a `<col>` cannot be reliably removed with `display:none`.
//   There is a real trap in doing it this way — read the comment at the top of
//   <thead> before touching a width.
// * The only JS is one ref holding the id of the open row.
import type { ResultsAccount } from '~/types/results'

interface Props {
    rows: ResultsAccount[]
}
defineProps<Props>()

const { money, percent } = useResultsFormat()

// One open row at a time. An accordion rather than a set: with twenty rows, the
// alternative is a page that grows to four screens of half-read drawers.
const openRow = ref<string | null>(null)
const toggle = (id: string) => {
    openRow.value = openRow.value === id ? null : id
}

// The drawer's `colspan` has to be the number of columns actually on screen,
// and here is why it is worth the two media queries.
//
// Under `table-layout: fixed`, a cell hidden with `display: none` contributes no
// width to its column — which is fine while nothing else mentions that column,
// because the column then does not exist. A `colspan` that reaches PAST the
// visible columns brings them back: they reappear as `auto` columns with no
// width source and take an equal share of the table's leftover space. With
// `colspan="8"` at 390px the platform column went from 143px to 28.59px, i.e.
// one fifth of the slack instead of all of it, and the header row visibly
// stopped short of the panel edge.
//
// `useMediaQuery` resolves to false on the server and on the first client
// render, and its own note says it must gate behaviour rather than layout. This
// obeys that: the drawer is only ever rendered in response to a click, so it
// does not exist during SSR or first paint and there is no markup to mismatch.
const isTabletMd = useMediaQuery('(min-width: 800px)')
const isTabletWide = useMediaQuery('(min-width: 1024px)')
/** 4 columns below 800 (rank, platform, growth, disclose); 6 from 800 up. */
const drawerSpan = computed(() => (isTabletMd.value ? 6 : 4))

// One predicate for "this row's drawer is on screen", used by both the drawer's
// `v-if` and the open row's border-suppressing class. They have to agree: the
// class hands the row's bottom rule to the drawer, so a row that carried it
// without a drawer beneath would leave a gap in the ruling.
const isOpen = (id: string) => openRow.value === id && !isTabletWide.value
</script>

<template>
    <table class="ea-results">
        <caption class="sr-only">{{ $t('results.tableCaption') }}</caption>
        <thead>
            <tr>
                <!-- Widths live on this row, and which columns are left on
                     `auto` is what decides who absorbs the slack:
                       < 800   one auto (platform) takes everything left over
                       >= 800  current + profit share it, platform is 180
                       >= 1024 all five figure columns share it equally, which
                               is the drawn 208.8px each -->
                <!-- 24px below 1024 (a 14px "20" plus the 4px of padding the
                     rank cell takes there), 32 from 1024 up as drawn. Same
                     reasoning as the mark stepping to 16: on a phone every
                     pixel of chrome comes off the broker name. -->
                <th scope="col" class="w-6 text-center tablet-wide:w-8">
                    <span class="sr-only">{{ $t('results.columns.rank') }}</span>
                </th>
                <!-- The only elastic column below 800, so the platform name is
                     the last thing in the row to run out of room. -->
                <th scope="col" class="text-left tablet-md:w-[180px] tablet-wide:w-[220px]">
                    {{ $t('results.columns.platform') }}
                </th>
                <th scope="col" class="hidden text-center tablet-wide:table-cell">
                    {{ $t('results.columns.connected') }}
                </th>
                <th scope="col" class="hidden text-right tablet-wide:table-cell">
                    {{ $t('results.columns.initial') }}
                </th>
                <th scope="col" class="hidden text-right tablet-md:table-cell">
                    {{ $t('results.columns.current') }}
                </th>
                <!-- 70px is "+ 210%" (the widest figure in the set) plus the
                     row's own 16px of padding, and nothing more. It holds at
                     every phone width now that the container's gutters are 12:
                     this is the column that must survive to 360, so it is sized
                     to its content rather than to its label, and every pixel
                     taken here comes straight off the platform name. The label
                     shortens to match: "ACCOUNT GROWTH" is 117px of Poppins at
                     12 and would overrun the cell three times over. -->
                <th scope="col" class="w-[70px] text-right tablet-wide:w-auto">
                    <span class="tablet-wide:hidden">{{ $t('results.columns.growthShort') }}</span>
                    <span class="hidden tablet-wide:inline">{{ $t('results.columns.growth') }}</span>
                </th>
                <th scope="col" class="hidden text-right tablet-md:table-cell">
                    {{ $t('results.columns.profit') }}
                </th>
                <!-- The disclosure gutter. A real column, so that above 1024 it
                     leaves the layout AND its buttons leave the tab order,
                     rather than sitting there inert. -->
                <th scope="col" class="w-9 tablet-wide:hidden">
                    <span class="sr-only">{{ $t('results.detailsColumn') }}</span>
                </th>
            </tr>
        </thead>

        <tbody>
            <template v-for="(row, index) in rows" :key="row.id">
                <tr :class="{ 'ea-results__row--open': isOpen(row.id) }">
                    <td class="ea-results__rank text-center">{{ index + 1 }}</td>
                    <th scope="row" class="ea-results__name text-left">
                        <ResultsPlatformLabel :platform="row.platform" />
                    </th>
                    <td class="ea-results__date hidden text-center tablet-wide:table-cell">
                        {{ row.connectedOn }}
                    </td>
                    <td class="hidden text-right tablet-wide:table-cell">
                        {{ money(row.initial, row.currency) }}
                    </td>
                    <td class="hidden text-right tablet-md:table-cell">
                        {{ money(row.current, row.currency) }}
                    </td>
                    <td :class="[accountGrowth(row) < 0 ? 'ea-results__down' : 'ea-results__up', 'text-right']">
                        {{ percent(accountGrowth(row)) }}
                    </td>
                    <td
                        :class="[totalProfit(row) < 0 ? 'ea-results__down' : 'ea-results__up', 'hidden text-right tablet-md:table-cell']"
                    >
                        {{ money(totalProfit(row), row.currency, true) }}
                    </td>
                    <td class="ea-results__disclose-cell tablet-wide:hidden">
                        <button
                            type="button"
                            class="ea-results__disclose"
                            :aria-expanded="openRow === row.id"
                            :aria-controls="`results-detail-${row.id}`"
                            @click="toggle(row.id)"
                        >
                            <span class="sr-only">
                                {{ $t('results.toggleDetails', { platform: PLATFORMS[row.platform].name }) }}
                            </span>
                            <!-- The library's "Expand Indicator" (component set
                                 3084:6534), path and weight verbatim from its
                                 SVG export rather than redrawn: mitred join,
                                 butt caps, 2px. The set has a second variant for
                                 the open state, but its path is this one rotated
                                 180 degrees about the icon's centre, so the CSS
                                 rotate below is the same shape and can animate.
                                 `currentColor` so the button owns the tone. -->
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                    d="M18 9.5L12.0025 14.5L6 9.5"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-miterlimit="10"
                                />
                            </svg>
                        </button>
                    </td>
                </tr>

                <!-- The drawer. `drawerSpan`, not a fixed 8 - see the note in
                     <script setup> for what a too-large colspan does to a fixed
                     table layout. Not rendered at all above 1024, where the
                     columns it holds are back in the row. -->
                <tr v-if="isOpen(row.id)" :id="`results-detail-${row.id}`" class="tablet-wide:hidden">
                    <td :colspan="drawerSpan" class="ea-results__drawer-cell">
                        <dl class="ea-results__drawer">
                            <div class="ea-results__drawer-row">
                                <dt>{{ $t('results.columns.connected') }}</dt>
                                <dd>{{ row.connectedOn }}</dd>
                            </div>
                            <div class="ea-results__drawer-row">
                                <dt>{{ $t('results.columns.initial') }}</dt>
                                <dd>{{ money(row.initial, row.currency) }}</dd>
                            </div>
                            <!-- Already in the row itself from 800 up. -->
                            <div class="ea-results__drawer-row tablet-md:hidden">
                                <dt>{{ $t('results.columns.current') }}</dt>
                                <dd>{{ money(row.current, row.currency) }}</dd>
                            </div>
                            <div class="ea-results__drawer-row tablet-md:hidden">
                                <dt>{{ $t('results.columns.profit') }}</dt>
                                <!-- `!` because `.ea-results__drawer dd` sets
                                     the colour and outranks a bare utility. -->
                                <dd :class="totalProfit(row) < 0 ? '!text-[#FF4D50]' : '!text-[#00F070]'">
                                    {{ money(totalProfit(row), row.currency, true) }}
                                </dd>
                            </div>
                        </dl>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>
