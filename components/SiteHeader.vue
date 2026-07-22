<script setup lang="ts">
// Quiet institutional header: wordmark, four links, sign in, one CTA.
// Transparent over the hero; gains a hairline + blur once the page scrolls.
const scrolled = ref(false)
const menuOpen = ref(false)

function onScroll() {
    scrolled.value = window.scrollY > 8
}

onMounted(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
})

const links = [
    { label: 'Expert Advisors', href: '#record' },
    { label: 'Performance', href: '#record' },
    { label: 'Membership', href: '#membership' },
    { label: 'Research', href: '#infrastructure' },
]
</script>

<template>
    <header
        :class="[
            'site-header fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-smooth',
            scrolled || menuOpen ? 'border-b border-Tinted/100 bg-white/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
        ]"
    >
        <div class="eal-container flex h-[68px] items-center justify-between gap-6">
            <a href="#top" aria-label="EasyAlgos home" class="relative shrink-0">
                <img src="/img/easyalgos-logo.svg" alt="EasyAlgos" class="site-header__logo--ink h-[22px] w-auto" width="172" height="32" />
                <img src="/img/easyalgos-logo-white.svg" alt="" aria-hidden="true" class="site-header__logo--white absolute inset-0 h-[22px] w-auto" width="172" height="32" />
            </a>

            <nav class="hidden items-center gap-8 tablet-wide:flex" aria-label="Primary">
                <a
                    v-for="link in links"
                    :key="link.label"
                    :href="link.href"
                    class="site-header__link font-poppins text-[14px] font-normal text-Tinted/700 transition-colors duration-300 hover:text-Ink/950"
                >
                    {{ link.label }}
                </a>
            </nav>

            <div class="hidden items-center gap-6 tablet-wide:flex">
                <a href="https://easyalgos.ai/auth/signin" class="site-header__link font-poppins text-[14px] text-Tinted/700 transition-colors duration-300 hover:text-Ink/950">
                    Sign in
                </a>
                <a href="https://easyalgos.ai/" class="eal-cta eal-cta--ink !h-10 !px-5 !text-[13.5px]">
                    <span class="eal-cta__sheen" aria-hidden="true" />
                    <span>Apply for access</span>
                </a>
            </div>

            <!-- Mobile toggle -->
            <button
                class="centered h-10 w-10 rounded-full border border-Tinted/100 tablet-wide:hidden"
                :aria-expanded="menuOpen"
                aria-controls="mobile-menu"
                aria-label="Toggle navigation"
                @click="menuOpen = !menuOpen"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path v-if="!menuOpen" d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                    <path v-else d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
                </svg>
            </button>
        </div>

        <Transition name="fade">
            <nav
                v-if="menuOpen"
                id="mobile-menu"
                class="border-t border-Tinted/100 bg-white tablet-wide:hidden"
                aria-label="Primary mobile"
            >
                <div class="eal-container flex flex-col gap-1 py-4">
                    <a
                        v-for="link in links"
                        :key="link.label"
                        :href="link.href"
                        class="rounded-lg px-2 py-3 font-poppins text-[15px] text-Tinted/800 hover:bg-Tinted/25"
                        @click="menuOpen = false"
                    >
                        {{ link.label }}
                    </a>
                    <div class="mt-3 flex items-center gap-4 border-t border-Tinted/100 px-2 pt-4 pb-2">
                        <a href="https://easyalgos.ai/auth/signin" class="font-poppins text-[15px] text-Tinted/700">Sign in</a>
                        <a href="https://easyalgos.ai/" class="eal-cta eal-cta--ink !h-10 !px-5 !text-[13.5px]">
                            <span>Apply for access</span>
                        </a>
                    </div>
                </div>
            </nav>
        </Transition>
    </header>
</template>
