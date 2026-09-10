<script setup lang="ts">
// Topbar — Figma "Topbar" (node 523:2750), drawn at four widths, plus the two
// unfolded-menu frames (523:2712 / 523:2713) and the burger's own component and
// animation (516:1229 / 515:1263).
//
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
//
// The <header> is deliberately full-bleed while `.ea-header__inner` caps at the
// 1920px stage — that is what lets the bottom stroke run to both edges of an
// ultra-wide viewport while the contents stay on the drawn grid.
//
// Breakpoints here are the ones in the Figma file (841 / 1241 / 1441), not the
// project's named scale, and they are written as arbitrary min-width variants
// because they describe this bar's composition and nothing else on the page
// moves at those widths:
//   >= 1441   the centre links leave the flow and sit at the true horizontal
//             centre of the stage
//   >= 1241   they rejoin the flow, between the left group and the tools
//   >=  841   all but "Expert Advisors" fold into the burger; the menu is a card
//             hung off the bar's right edge
//   <=  840   logo, a solid "Log in" pill and the burger; the menu is a sheet
// 68 is the bar's drawn height at every breakpoint — 4px of padding around a
// 42px pill above 840, 20/12 around a 36px one below it.
useDarkBand(68)

const menuOpen = ref(false)
const root = ref<HTMLElement | null>(null)

function close() {
    menuOpen.value = false
}

// Behaviour only — never layout, which is CSS's (see useMediaQuery). The burger
// itself is gone above 1240, so a menu left open across that edge would have no
// way back to closed.
const isWide = useMediaQuery('(min-width: 1241px)')
watch(isWide, (wide) => {
    if (wide) close()
})

// The scroll lock is a marker, not a decision: whether an open menu actually
// freezes the page is settled in CSS, by the same 840 breakpoint that decides
// whether it is a full sheet or a dropdown card.
watch(menuOpen, (open) => {
    document.documentElement.classList.toggle('ea-menu-open', open)
})

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
}
function onPointerDown(event: PointerEvent) {
    if (root.value && !root.value.contains(event.target as Node)) close()
}

// Escape and click-away are bound to the document rather than to the header, so
// they answer wherever focus happens to be when the menu is open.
watch(menuOpen, (open) => {
    if (open) {
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeydown)
    } else {
        document.removeEventListener('pointerdown', onPointerDown)
        document.removeEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => {
    if (!import.meta.client) return
    document.documentElement.classList.remove('ea-menu-open')
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <header ref="root" class="ea-header relative z-50 w-full border-b border-Tinted/100 bg-white">
        <div class="ea-header__inner">
            <!-- Wordmark + audience switch -->
            <div class="flex shrink-0 items-center gap-6">
                <a href="/" class="ea-header__logo" aria-label="EasyAlgos">
                    <img src="/img/logo-mark.svg" alt="" class="ea-header__logo-mark" />
                    <span class="ea-header__logo-word">
                        <img
                            src="/img/logo-wordmark.svg"
                            alt=""
                            class="ea-header__logo--ink absolute inset-0 h-full w-full"
                        />
                        <img
                            src="/img/logo-wordmark.svg"
                            alt=""
                            aria-hidden="true"
                            class="ea-header__logo--white absolute inset-0 h-full w-full"
                            style="filter: brightness(0) invert(1)"
                        />
                    </span>
                </a>

                <!-- Audience switch. This is the traders site, so Traders is the
                     current segment and Developers is the link away. -->
                <div class="hidden items-center gap-2 min-[841px]:flex">
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

            <!-- Primary nav. Absolutely centred on the stage from 1441 up; below
                 that it is an ordinary flex child between the two groups, and
                 below 1241 only the first link stays in the row. -->
            <nav
                class="hidden shrink-0 items-center gap-4 min-[841px]:flex
                       min-[1441px]:absolute min-[1441px]:left-1/2 min-[1441px]:top-1/2
                       min-[1441px]:-translate-x-1/2 min-[1441px]:-translate-y-1/2"
                aria-label="Main"
            >
                <a
                    v-for="(link, index) in NAV_LINKS"
                    :key="link.id"
                    :href="link.href"
                    :class="[
                        'ea-header__link',
                        index === 0 ? 'inline-flex' : 'hidden min-[1241px]:inline-flex'
                    ]"
                >
                    {{ $t(`nav.${link.id}`) }}
                </a>
            </nav>

            <!-- Actions -->
            <div class="flex shrink-0 items-center justify-end gap-1 min-[841px]:gap-2">
                <!-- Log in is a solid pill on the phone bar and a quiet chip
                     everywhere above it. -->
                <AppButton
                    :label="$t('common.logIn')"
                    :href="LOGIN_HREF"
                    variant="ink"
                    size="xs"
                    :arrow="false"
                    class="ea-header__phone-only"
                />
                <a :href="LOGIN_HREF" class="ea-header__link ea-header__bar-only">
                    {{ $t('common.logIn') }}
                </a>
                <AppButton
                    :label="$t('common.applyNow')"
                    :href="APPLY_HREF"
                    variant="ink"
                    size="sm"
                    :arrow="false"
                    class="ea-header__bar-only"
                />

                <button
                    type="button"
                    class="ea-header__burger min-[1241px]:hidden"
                    :aria-label="menuOpen ? $t('common.closeMenu') : $t('common.openMenu')"
                    :aria-expanded="menuOpen"
                    aria-controls="ea-menu"
                    @click="menuOpen = !menuOpen"
                >
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                    <span aria-hidden="true" />
                </button>
            </div>
        </div>

        <!-- Folded-away nav. Carries the full set at both sizes, switch included,
             exactly as drawn — the row above it is a subset, not the other way
             round. -->
        <Transition name="fade">
            <div v-if="menuOpen" id="ea-menu" class="ea-header__menu min-[1241px]:hidden">
                <div>
                    <div class="pb-6">
                        <div class="ea-header__switch ea-header__switch--wide">
                            <span aria-current="page" class="ea-header__switch-item ea-header__switch-item--current">
                                {{ $t('common.traders') }}
                            </span>
                            <a href="/developers" class="ea-header__switch-item ea-header__switch-idle">
                                {{ $t('common.developers') }}
                            </a>
                        </div>
                    </div>
                    <!-- Unlabelled on purpose: from 841 up the row's own nav is
                         still in the tree, and two landmarks both called "Main"
                         would be announced as a pair. -->
                    <nav class="flex flex-col gap-4">
                        <a
                            v-for="link in NAV_LINKS"
                            :key="link.id"
                            :href="link.href"
                            class="ea-header__link flex w-full"
                            @click="close"
                        >
                            {{ $t(`nav.${link.id}`) }}
                        </a>
                    </nav>
                </div>

                <div>
                    <div class="py-3">
                        <div class="h-px w-full bg-Tinted/100" />
                    </div>
                    <div class="flex flex-col gap-4">
                        <a :href="LOGIN_HREF" class="ea-header__link flex w-full" @click="close">
                            {{ $t('common.logIn') }}
                        </a>
                        <AppButton
                            :label="$t('common.applyNow')"
                            :href="APPLY_HREF"
                            variant="ink"
                            size="sm"
                            :arrow="false"
                            class="w-full"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </header>
</template>
