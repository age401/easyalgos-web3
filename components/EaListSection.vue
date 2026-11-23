<script setup lang="ts">
// Expert Advisors list - "section - Expert Advisors": the toolbar, the grid in
// either view, and the pager (Figma 3939:19358 for cards, 3915:15710 compact).
//
// TOOLBAR. Drawn as one row: search on the left, the AlgoScore filter and the
// view switch on the right. That row needs 905px, so it holds from 1024 up.
// Below that it becomes two rows on one grid - search and the view switch
// share the first, the filter takes the second - which keeps the two controls
// people reach for most on one line and gives the filter the full width it
// needs. The DOM order stays search, filter, switch throughout; only the grid
// placement changes, so the tab order never does.
//
// GRID. Both views run on the wide stage (1800 at 1920, as drawn) rather than
// the 1360 text column, so the list takes whatever width the screen gives it.
// Cards hold 2 columns from 600 and 3 from 1024, then auto-fill from 1280 at a
// 300px floor: 4 from ~1400, the drawn five at 1920, and more on wider screens.
// Compact auto-fills the same way at its own floor, landing on five at 1920.
//
// MOTION. Cards arrive through `v-inview` (fade, rise, then the ring sweeps and
// the sparkline wipes in), staggered by column. Filtering re-flows the grid
// with a FLIP move rather than a jump cut, and switching view cross-fades. The
// filter's dark pill and the switch's white thumb SLIDE between options: both
// are one absolutely-placed element moved by transform, measured off the real
// buttons so they stay exact in every language.
import type { EaBandId } from '~/types/expertAdvisors'
import type { EaListBand, EaListView } from '~/composables/useEaList'

const { t } = useI18n()
const { view, band, query, filtered, visible, remaining, phoneRemaining, phoneVisibleCount, phoneCollapsed, phonePage, loadMore, reset } =
    useEaList()

// Only the bands that have something in them. A "Poor - 0" option is a dead
// control, and which bands are populated is the data's business, not the
// template's.
const bandOptions = computed<{ id: EaListBand; label: string; count: number }[]>(() => [
    { id: 'all', label: t('ea.list.filter.all'), count: EXPERT_ADVISORS.length },
    ...(['excellent', 'good', 'fair', 'poor'] as EaBandId[])
        .filter((id) => EA_BAND_COUNTS[id] > 0)
        .map((id) => ({ id, label: t(`ea.band.${id}`), count: EA_BAND_COUNTS[id] }))
])

const VIEWS: { id: EaListView; icon: 'layoutCards' | 'layoutCompact' }[] = [
    { id: 'cards', icon: 'layoutCards' },
    { id: 'compact', icon: 'layoutCompact' }
]

// ---- The filter's sliding pill ---------------------------------------------
// Until it has been measured (the server render, and the first client frame)
// the active option paints its own dark fill, so the control is complete with
// no JS. Once measured, that fill is handed to the indicator, which can travel.
const filterGroup = ref<HTMLElement | null>(null)
const optionElements = new Map<string, HTMLElement>()
const indicator = ref<{ x: number; width: number } | null>(null)
let groupObserver: ResizeObserver | null = null

function registerOption(id: string, el: unknown) {
    if (el instanceof HTMLElement) optionElements.set(id, el)
    else optionElements.delete(id)
}

function measureIndicator() {
    const active = optionElements.get(band.value)
    if (!active) return
    indicator.value = { x: active.offsetLeft, width: active.offsetWidth }
}

function selectBand(id: EaListBand) {
    band.value = id
    // On a narrow screen the filter scrolls; bring the choice into view.
    optionElements.get(id)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}

/** Arrow keys walk the options, as a radio group should. */
function onFilterKeydown(event: KeyboardEvent) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const ids = bandOptions.value.map((option) => option.id)
    const next = ids[(ids.indexOf(band.value) + step + ids.length) % ids.length]
    selectBand(next)
    optionElements.get(next)?.focus()
}

watch(band, () => nextTick(measureIndicator))

onMounted(() => {
    measureIndicator()
    // Poppins swaps in after first paint and changes every option's width.
    document.fonts?.ready.then(measureIndicator)
    if (filterGroup.value) {
        groupObserver = new ResizeObserver(measureIndicator)
        groupObserver.observe(filterGroup.value)
    }
})

onBeforeUnmount(() => groupObserver?.disconnect())

// ---- Grid ------------------------------------------------------------------
const GRID_CLASS: Record<EaListView, string> = {
    cards: 'grid grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-5 tablet-wide:grid-cols-3 desktop:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] desktop:gap-6',
    compact:
        'grid grid-cols-1 gap-2.5 tablet:grid-cols-[repeat(auto-fill,minmax(248px,1fr))] tablet:gap-4 desktop:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'
}

/** Stagger by position in the row, so a row arrives as a left-to-right ripple
 *  and a freshly loaded page does not wait behind the twelve before it. */
const staggerDelay = (index: number) => `${(index % 5) * 70}ms`

const filtering = computed(() => band.value !== 'all' || query.value.trim() !== '')

// The line under the grid. `summary` once everything that matches is on screen;
// a running count while there is more to load.
const summary = computed(() =>
    filtering.value
        ? t('ea.list.showingFiltered', { count: filtered.value.length, total: EXPERT_ADVISORS.length })
        : t('ea.list.showingAll', { count: filtered.value.length })
)
const progress = computed(() => t('ea.list.showing', { count: visible.value.length, total: filtered.value.length }))
const phoneProgress = computed(() => t('ea.list.showing', { count: phoneVisibleCount.value, total: filtered.value.length }))
</script>

<template>
    <section id="list" class="bg-Tinted/25 pb-16 pt-6 tablet:pt-8 tablet-wide:pb-24 tablet-wide:pt-10 desktop:pb-32">
        <div class="ea-container xa-list-container">
            <!-- Toolbar -->
            <div
                v-inview
                class="xa-in grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5
                       tablet-wide:grid-cols-[320px_minmax(0,1fr)_auto]"
            >
                <label class="relative col-start-1 row-start-1 block">
                    <span class="sr-only">{{ $t('ea.list.search.label') }}</span>
                    <EaIcon
                        name="search"
                        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-Tinted/400"
                    />
                    <input
                        v-model="query"
                        type="search"
                        enterkeyhint="search"
                        autocomplete="off"
                        :placeholder="$t('ea.list.search.placeholder')"
                        class="xa-search h-10 w-full rounded-xl border-2 border-Tinted/100 bg-white pl-[34px] pr-9
                               font-rubik text-[16px] leading-5 text-Tinted/950 shadow-ea-key outline-none
                               transition-colors duration-300 placeholder:text-Tinted/500
                               hover:border-Tinted/200 focus:border-Blue/200"
                    />
                    <Transition name="fade">
                        <button
                            v-if="query"
                            type="button"
                            class="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg
                                   text-Tinted/500 transition-colors duration-300 hover:bg-Tinted/50 hover:text-Tinted/900"
                            :aria-label="$t('ea.list.search.clear')"
                            @click="query = ''"
                        >
                            <EaIcon name="close" class="size-4" />
                        </button>
                    </Transition>
                </label>

                <!-- AlgoScore filter. Scrolls sideways if a language's labels
                     outgrow a phone; the scrollbar is hidden and the pill
                     travels with the content, since it is inside the scroller. -->
                <div
                    class="col-span-2 row-start-2 min-w-0 tablet-wide:col-span-1 tablet-wide:col-start-2 tablet-wide:row-start-1
                           tablet-wide:justify-self-end"
                >
                    <div
                        ref="filterGroup"
                        role="radiogroup"
                        :aria-label="$t('ea.list.filter.label')"
                        class="xa-noscroll relative flex max-w-full items-center gap-1 overflow-x-auto rounded-full border-2
                               border-Tinted/100 bg-white p-1 tablet-wide:inline-flex"
                        @keydown="onFilterKeydown"
                    >
                        <span
                            v-if="indicator"
                            class="pointer-events-none absolute left-0 top-1 h-8 rounded-full bg-Tinted/900
                                   transition-[transform,width] duration-500 ease-smooth"
                            :style="{ transform: `translateX(${indicator.x}px)`, width: `${indicator.width}px` }"
                            aria-hidden="true"
                        />
                        <span
                            class="shrink-0 pl-3 pr-2 font-rubik text-[12px] font-medium leading-5 tracking-[0.24px] text-Tinted/900
                                   max-[419px]:sr-only"
                        >
                            {{ $t('card.algoScore') }}
                        </span>
                        <button
                            v-for="option in bandOptions"
                            :key="option.id"
                            :ref="(el) => registerOption(option.id, el)"
                            type="button"
                            role="radio"
                            :aria-checked="band === option.id"
                            :tabindex="band === option.id ? 0 : -1"
                            :class="[
                                'relative shrink-0 grow whitespace-nowrap rounded-full px-4 py-2 font-poppins text-[13px] font-medium leading-4',
                                'transition-colors duration-300 tablet-wide:grow-0',
                                band === option.id
                                    ? ['text-white', indicator ? '' : 'bg-Tinted/900']
                                    : 'text-Tinted/700 hover:text-Tinted/950'
                            ]"
                            @click="selectBand(option.id)"
                        >
                            {{ option.label }} &middot; <span class="ea-num">{{ option.count }}</span>
                        </button>
                        <a
                            :href="EA_ROUTES.algoscore"
                            class="relative flex shrink-0 items-center py-2 pl-1 pr-2 text-Tinted/300 transition-colors duration-300
                                   hover:text-Blue/600"
                            :aria-label="$t('ea.list.filter.help')"
                            :title="$t('ea.list.filter.help')"
                        >
                            <EaIcon name="help" class="size-4" />
                        </a>
                    </div>
                </div>

                <!-- View switch -->
                <div
                    class="relative col-start-2 row-start-1 flex h-10 items-center gap-1 rounded-xl bg-Tinted/50 p-1
                           tablet-wide:col-start-3"
                    role="group"
                    :aria-label="$t('ea.list.view.label')"
                >
                    <span
                        class="pointer-events-none absolute left-1 top-1 size-8 rounded-lg bg-white shadow-ea-sheet
                               transition-transform duration-500 ease-smooth"
                        :style="{ transform: view === 'compact' ? 'translateX(36px)' : 'translateX(0)' }"
                        aria-hidden="true"
                    />
                    <button
                        v-for="option in VIEWS"
                        :key="option.id"
                        type="button"
                        :aria-pressed="view === option.id"
                        :aria-label="$t(`ea.list.view.${option.id}`)"
                        :title="$t(`ea.list.view.${option.id}`)"
                        :class="[
                            'relative flex size-8 items-center justify-center rounded-lg transition-colors duration-300',
                            view === option.id ? 'text-Tinted/900' : 'text-Tinted/500 hover:text-Tinted/800'
                        ]"
                        @click="view = option.id"
                    >
                        <EaIcon :name="option.icon" class="size-6" />
                    </button>
                </div>
            </div>

            <!-- Grid. `mode="out-in"` so the two views never share the page:
                 they are different heights, and overlapping them would push
                 the pager around mid-fade. -->
            <div class="mt-5 tablet:mt-6">
                <Transition name="fade" mode="out-in">
                    <TransitionGroup
                        v-if="visible.length"
                        :key="view"
                        tag="ul"
                        name="xa-list"
                        :class="[GRID_CLASS[view], view === 'cards' ? 'xa-cards' : '']"
                    >
                        <li
                            v-for="(ea, index) in visible"
                            :key="ea.slug"
                            v-inview
                            :class="[
                                'xa-in min-w-0',
                                view === 'cards' && phoneCollapsed && index >= phonePage ? 'max-tablet:hidden' : ''
                            ]"
                            :style="{ '--reveal-delay': staggerDelay(index) }"
                        >
                            <EaCard v-if="view === 'cards'" :ea="ea" :level="2" />
                            <EaTile v-else :ea="ea" :level="2" />
                        </li>
                    </TransitionGroup>

                    <!-- Nothing matched -->
                    <div
                        v-else
                        key="empty"
                        class="flex flex-col items-center rounded-[20px] border border-dashed border-Tinted/200 px-6 py-14 text-center
                               tablet:py-20"
                    >
                        <p class="font-poppins text-[18px] font-medium leading-[26px] tracking-[-0.2px] text-Tinted/950">
                            {{ $t('ea.list.empty.title') }}
                        </p>
                        <p class="mt-2 max-w-[400px] font-franklin text-[14px] leading-[22px] text-Tinted/600">
                            {{ $t('ea.list.empty.body') }}
                        </p>
                        <button type="button" class="xa-key mt-6" @click="reset">
                            {{ $t('ea.list.empty.reset') }}
                        </button>
                    </div>
                </Transition>
            </div>

            <!-- Pager and count. The count is announced politely so a screen
                 reader hears the result of a search without losing its place. -->
            <div v-if="visible.length" class="flex flex-col items-center gap-3 pt-10">
                <button
                    v-if="view === 'cards' && (remaining > 0 || phoneRemaining > 0)"
                    type="button"
                    :class="[
                        'ea-btn ea-btn--stroke !h-[60px] !text-Tinted/900 hover:!text-Tinted/700',
                        remaining === 0 ? 'tablet:!hidden' : ''
                    ]"
                    @click="loadMore"
                >
                    <span class="tablet:hidden">{{ $t('ea.list.loadMore', { count: phoneRemaining }) }}</span>
                    <span class="max-tablet:hidden">{{ $t('ea.list.loadMore', { count: remaining }) }}</span>
                </button>

                <!-- Rendered once per case, like the button: a phone may still
                     have cards to load when a wider screen is showing them all. -->
                <p class="text-center font-franklin text-[12px] font-medium text-Tinted/500" aria-live="polite">
                    <span class="tablet:hidden">{{ phoneRemaining > 0 && view === 'cards' ? phoneProgress : summary }}</span>
                    <span class="max-tablet:hidden">{{ remaining > 0 && view === 'cards' ? progress : summary }}</span>
                </p>
            </div>
        </div>
    </section>
</template>
