<script setup lang="ts">
// Sticky header. Inverts itself while a dark band sits behind it (useDarkBand +
// the .ea-header rules in main.css) — the two wordmarks cross-fade and the links
// lighten, with no layout change, so nothing reflows on the swap.
//
// The white wordmark is the same SVG under `brightness(0) invert(1)` rather than
// a second asset: one fewer request, and the two can never drift apart.
useDarkBand(76)

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
        class="ea-header fixed inset-x-0 top-0 z-50 border-b border-Tinted/50 bg-white/85 backdrop-blur-md"
        @keydown="onKeydown"
    >
        <div class="ea-container flex h-[64px] items-center justify-between gap-6 tablet-wide:h-[76px]">
            <!-- Wordmark + audience switch -->
            <div class="flex items-center gap-4">
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

                <span class="hidden h-3 w-0.5 shrink-0 rounded-full bg-Tinted/100 desktop:block" aria-hidden="true" />

                <!-- Audience switch. This is the traders site, so Traders is the
                     current segment and Developers is the link away. -->
                <div class="hidden items-center gap-2 desktop:flex">
                    <span class="font-franklin text-[12px] leading-4 text-Tinted/400">{{ $t('common.for') }}</span>
                    <div class="ea-header__switch flex items-center gap-1 rounded-full border border-Tinted/100 bg-Tinted/25 p-1">
                        <span
                            aria-current="page"
                            class="rounded-full bg-Tinted/900 px-3 py-1 font-poppins text-[12px] font-medium leading-4 tracking-[0.01em] text-Tinted/25"
                        >
                            {{ $t('common.traders') }}
                        </span>
                        <a
                            href="/developers"
                            class="ea-header__switch-idle rounded-full px-3 py-1 font-poppins text-[12px] font-medium leading-4 tracking-[0.01em] text-Tinted/600 transition-colors duration-300 hover:text-Tinted/900"
                        >
                            {{ $t('common.developers') }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Primary nav -->
            <nav class="hidden items-center gap-8 tablet-wide:flex desktop-md:gap-10" aria-label="Main">
                <a v-for="link in NAV_LINKS" :key="link.id" :href="link.href" class="ea-header__link">
                    {{ $t(`nav.${link.id}`) }}
                </a>
            </nav>

            <!-- Actions -->
            <div class="flex items-center gap-3 tablet:gap-5">
                <a :href="LOGIN_HREF" class="ea-header__link hidden tablet:block">{{ $t('common.logIn') }}</a>
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
                    class="ea-header__link -mr-1 flex h-10 w-10 items-center justify-center tablet-wide:hidden"
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
                class="ea-container overflow-y-auto border-t border-Tinted/50 bg-white/95 pb-8 pt-6 backdrop-blur-md tablet-wide:hidden"
                style="max-height: calc(100vh - 64px)"
            >
                <nav class="flex flex-col" aria-label="Main">
                    <a
                        v-for="link in NAV_LINKS"
                        :key="link.id"
                        :href="link.href"
                        class="border-b border-Tinted/50 py-4 font-poppins text-[16px] font-medium text-Tinted/950"
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
