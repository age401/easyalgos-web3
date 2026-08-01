<script setup lang="ts">
// The header scrolls away with the page — it is not pinned. The particle
// section's choreography reads as a full-bleed stage, and a bar floating over it
// the whole way down fought that.
//
// `useDarkBand` is still called here, and still from here: it no longer has a
// floating header to invert (the `.is-dark-band .ea-header` rules survive but are
// inert now that the bar is never over anything but the hero),
// but it is what carries the PAGE background across the self-coloured dark bands
// — the testimonials section and the footer — so an overscroll past one never
// flashes white. The problem/solution section drives the same custom property
// itself, on a scroll ramp; see usePageTint.
//
// The white wordmark is the same SVG under `brightness(0) invert(1)` rather than
// a second asset: one fewer request, and the two can never drift apart.
useDarkBand(72)

// Links drop into the burger one at a time as the row narrows, "Expert
// Advisors" surviving longest — so it hides latest here, and its mobile-panel
// twin (below) hides earliest, once the row already shows it.
const NAV_LINK_ROW_CLASS: Partial<Record<string, string>> = {
    easyvps: 'hidden tablet-wide:inline-flex',
    icprecision: 'hidden desktop:inline-flex',
    research: 'hidden desktop-md:inline-flex'
}
const NAV_LINK_PANEL_CLASS: Partial<Record<string, string>> = {
    expertAdvisors: 'tablet-md:hidden',
    easyvps: 'tablet-wide:hidden',
    icprecision: 'desktop:hidden',
    research: 'desktop-md:hidden'
}

const menuOpen = ref(false)

function close() {
    menuOpen.value = false
}

// Lock the page behind the open panel so the body cannot scroll under it.
watch(menuOpen, (open) => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
    if (import.meta.client) document.documentElement.style.overflow = ''
})

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
}
</script>

<template>
    <header
        class="ea-header relative z-50 border-b border-Tinted/50 bg-white/85 backdrop-blur-md"
        @keydown="onKeydown"
    >
        <div class="ea-header__inner flex h-[72px] items-center justify-between gap-6">
            <!-- Wordmark + audience switch -->
            <div class="flex items-center gap-6">
                <a href="/" class="flex shrink-0 items-center gap-1.5" aria-label="EasyAlgos">
                    <img src="/img/logo-mark.svg" alt="" width="22" height="22" class="h-[22px] w-[22px]" />
                    <span class="relative block h-[18px] w-[93px]">
                        <img
                            src="/img/logo-wordmark.svg"
                            alt="EasyAlgos"
                            width="93"
                            height="18"
                            class="ea-header__logo--ink absolute inset-0 h-full w-full"
                        />
                        <img
                            src="/img/logo-wordmark.svg"
                            alt=""
                            width="93"
                            height="18"
                            aria-hidden="true"
                            class="ea-header__logo--white absolute inset-0 h-full w-full"
                            style="filter: brightness(0) invert(1)"
                        />
                    </span>
                </a>

                <!-- Audience switch. This is the traders site, so Traders is the
                     current segment and Developers is the link away. -->
                <div class="hidden items-center gap-2 desktop:flex">
                    <span class="font-franklin text-[12px] leading-4 text-Tinted/400">{{ $t('common.for') }}</span>
                    <div class="ea-header__switch">
                        <span aria-current="page" class="ea-header__switch-item ea-header__switch-item--current">
                            {{ $t('common.traders') }}
                        </span>
                        <a href="/developers" class="ea-header__switch-item ea-header__switch-idle">
                            {{ $t('common.developers') }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Primary nav. Links join one at a time as the row widens; see
                 NAV_LINK_ROW_CLASS above. -->
            <nav class="hidden items-center gap-4 tablet-md:flex" aria-label="Main">
                <a
                    v-for="link in NAV_LINKS"
                    :key="link.id"
                    :href="link.href"
                    :class="['ea-header__link', NAV_LINK_ROW_CLASS[link.id] ?? 'inline-flex']"
                >
                    {{ $t(`nav.${link.id}`) }}
                </a>
            </nav>

            <!-- Actions -->
            <div class="flex items-center gap-3 tablet:gap-5">
                <a :href="LOGIN_HREF" class="ea-header__link hidden tablet:inline-flex">{{ $t('common.logIn') }}</a>
                <AppButton
                    :label="$t('common.applyNow')"
                    :href="APPLY_HREF"
                    variant="ink"
                    size="sm"
                    :arrow="false"
                    class="hidden tablet:inline-flex"
                />

                <button
                    type="button"
                    class="ea-header__link -mr-1 flex h-10 w-10 items-center justify-center desktop-md:hidden"
                    :aria-label="menuOpen ? $t('common.closeMenu') : $t('common.openMenu')"
                    :aria-expanded="menuOpen"
                    aria-controls="ea-mobile-nav"
                    @click="menuOpen = !menuOpen"
                >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                        <path
                            :d="menuOpen ? 'M5 5l12 12M17 5 5 17' : 'M3 6h16M3 11h16M3 16h16'"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile panel -->
        <Transition name="fade">
            <div
                v-if="menuOpen"
                id="ea-mobile-nav"
                class="ea-container overflow-y-auto border-t border-Tinted/50 bg-white/95 pb-8 pt-6 backdrop-blur-md desktop-md:hidden"
                style="max-height: calc(100vh - 72px)"
            >
                <nav class="flex flex-col" aria-label="Main">
                    <a
                        v-for="link in NAV_LINKS"
                        :key="link.id"
                        :href="link.href"
                        :class="['border-b border-Tinted/50 py-4 font-poppins text-[16px] font-medium text-Tinted/950', NAV_LINK_PANEL_CLASS[link.id]]"
                        @click="close"
                    >
                        {{ $t(`nav.${link.id}`) }}
                    </a>
                    <a
                        :href="LOGIN_HREF"
                        class="border-b border-Tinted/50 py-4 font-poppins text-[16px] font-medium text-Tinted/950"
                        @click="close"
                    >
                        {{ $t('common.logIn') }}
                    </a>
                    <a
                        href="/developers"
                        class="border-b border-Tinted/50 py-4 font-poppins text-[16px] font-medium text-Tinted/600"
                        @click="close"
                    >
                        {{ $t('common.for') }} {{ $t('common.developers') }}
                    </a>
                </nav>
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" class="mt-6 w-full" />
            </div>
        </Transition>
    </header>
</template>
