<script setup lang="ts">
// Topbar: EasyAlgos wordmark, centered anchor nav, Log in + Apply CTA + language.
const links = [
    { label: 'The model', href: '#model' },
    { label: 'Collection', href: '#collection' },
    { label: 'Results', href: '#results' },
    { label: 'Terms', href: '#terms' },
]
</script>

<template>
    <header class="sticky top-0 z-50 w-full border-b border-Tinted/100 bg-white/85 backdrop-blur-md">
        <div class="relative mx-auto flex h-[68px] max-w-[1920px] items-center justify-between pl-5 pr-4 tablet:pl-6">
            <!-- Brand -->
            <a href="#top" class="flex items-center" aria-label="EasyAlgos">
                <img src="/img/easyalgos-logo.svg" alt="EasyAlgos" class="h-[22px] w-auto" width="172" height="32" />
            </a>

            <!-- Centered nav (desktop) -->
            <nav class="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 tablet-wide:flex" aria-label="Primary">
                <a
                    v-for="link in links"
                    :key="link.href"
                    :href="link.href"
                    class="group relative flex h-12 items-center px-3 font-poppins text-base font-medium tracking-[0.02em] text-BW/05 transition-colors duration-300 ease-smooth hover:text-Tinted/900"
                >
                    {{ link.label }}
                    <span class="absolute bottom-2.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-Blue/600 transition-all duration-300 ease-smooth group-hover:w-5" aria-hidden="true" />
                </a>
            </nav>

            <!-- Tools -->
            <div class="flex items-center gap-3">
                <a
                    href="https://easyalgos.ai/auth/signin"
                    class="hidden font-poppins text-base font-medium text-BW/05 transition-colors duration-300 ease-smooth hover:text-Tinted/900 tablet-md:block"
                >
                    Log in
                </a>
                <div class="hidden tablet:block">
                    <CtaButton label="Apply now" size="sm" :arrow="false" />
                </div>
                <button
                    type="button"
                    class="flex items-center rounded-xl border-2 border-BLUE/02 bg-white p-2 transition-colors duration-300 ease-smooth hover:bg-Blue/25"
                    aria-label="Change language"
                >
                    <img src="/img/home/flag-us.svg" alt="English" class="h-5 w-[30px] rounded" width="30" height="20" />
                </button>
            </div>
        </div>
    </header>
</template>
