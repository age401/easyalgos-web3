<script setup lang="ts">
// Hero: "Access the best Expert Advisors, without paying for them." + the
// verified track-record panel (equity curve draws in on load via .ea-chart).
// Entrance is orchestrated on mount via the `.is-loaded` flag (hero-fade /
// line-mask classes in main.css), gated behind the `.js` html flag for no-JS.
const loaded = ref(false)
onMounted(() => requestAnimationFrame(() => (loaded.value = true)))

const logos = [
    { src: '/img/home/logo-icmarkets.png', alt: 'IC Markets', w: 360, h: 96, cls: 'h-[18px]' },
    { src: '/img/home/logo-ictrading.png', alt: 'IC Trading', w: 352, h: 96, cls: 'h-[17px]' },
    { src: '/img/home/logo-metatrader5.png', alt: 'MetaTrader 5', w: 400, h: 96, cls: 'h-[19px]' },
]

// Equity curve: gentle compounding rise with realistic pull-backs.
const equity = 'M0,246 C48,240 76,232 116,218 C150,206 172,212 204,196 C240,178 258,186 296,160 C336,132 356,142 398,112 C438,84 462,92 506,62 C524,50 538,44 550,40'
const equityArea = `${equity} L550,300 L0,300 Z`
// Pre-rendered grid (v-html): dynamic x/y bindings on SVG <line> trip Vue's
// hydration prop-patching (read-only SVGAnimatedLength props).
const gridMarkup = [60, 120, 180, 240]
    .map((y) => `<line x1="0" y1="${y}" x2="560" y2="${y}"></line>`)
    .join('')
</script>

<template>
    <section id="top" :class="['relative flex min-h-[calc(100vh-68px)] items-center overflow-hidden', { 'is-loaded': loaded }]">
        <!-- Subtle brand wash -->
        <div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div class="absolute -right-[10%] -top-[20%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(139,126,255,0.10),transparent_62%)]" />
            <div class="absolute -bottom-[30%] -left-[12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(40,95,247,0.08),transparent_64%)]" />
        </div>

        <div class="ea-container grid grid-cols-1 items-center gap-10 pb-16 pt-10 tablet-wide:grid-cols-[1.04fr_0.96fr] tablet-wide:gap-10 tablet-wide:py-20">
            <!-- Copy -->
            <div class="order-2 max-w-[40rem] tablet-wide:order-1">
                <p class="ea-eyebrow ea-eyebrow--hero hero-fade" style="--reveal-delay: 0ms">
                    Award-winning Expert Advisors &middot; Verified since 2017
                </p>

                <h1 class="mt-6 font-poppins font-medium leading-[1.135] tracking-[-2px] text-Tinted/950 text-[2.5rem] tablet:text-[3.25rem] desktop:text-[4.25rem]">
                    <span class="line-mask"><span style="--reveal-delay: 80ms">The best Expert</span></span>
                    <span class="line-mask"><span style="--reveal-delay: 160ms">Advisors, without</span></span>
                    <span class="line-mask"><span style="--reveal-delay: 240ms"><em class="ea-grad-text not-italic">paying for them</em>.</span></span>
                </h1>

                <p class="ea-lead hero-fade mt-7 max-w-[33rem]" style="--reveal-delay: 360ms">
                    The Expert Advisor industry was broken &mdash; so we rebuilt it. EasyAlgos gives qualifying traders <strong class="font-semibold text-Neutral/800">institutional-grade algorithms with 8+ years of third-party-verified track records</strong>, at zero cost of access.
                </p>

                <div class="hero-fade mt-12 flex flex-wrap items-center gap-4" style="--reveal-delay: 460ms">
                    <CtaButton label="Apply now" href="https://easyalgos.ai/" />
                    <CtaButton label="See the results" href="#results" variant="white-stroke" />
                </div>

                <div class="hero-fade mt-12 flex flex-wrap items-center gap-x-5 gap-y-3" style="--reveal-delay: 560ms">
                    <span class="font-poppins text-[11px] font-medium uppercase tracking-[0.18em] text-Tinted/400">Official partners</span>
                    <div class="flex items-center gap-4">
                        <template v-for="(logo, i) in logos" :key="logo.alt">
                            <span v-if="i > 0" class="h-1 w-1 rounded-full bg-Tinted/200" aria-hidden="true" />
                            <img :src="logo.src" :alt="logo.alt" :width="logo.w" :height="logo.h" :class="['w-auto opacity-70', logo.cls]" loading="lazy" />
                        </template>
                    </div>
                </div>
            </div>

            <!-- Verified track-record panel -->
            <div class="hero-fade order-1 relative mx-auto w-full max-w-[520px] tablet-wide:order-2 tablet-wide:mx-0 tablet-wide:ml-auto" style="--reveal-delay: 300ms">
                <div :class="['ea-chart rounded-[20px] p-4 shadow-[0_40px_80px_-40px_rgba(47,42,74,0.28)]', { 'is-active': loaded }]"
                     style="background: linear-gradient(100.3deg, #F6F7FF 0%, #E7E9F9 39.423%, #F2F3FF 100%)">
                    <div class="rounded-xl border-2 border-white bg-white/70 p-5">
                        <!-- Panel header -->
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-2.5">
                                <img src="/img/home/logo-easyalgos-isologo.svg" alt="" width="16" height="16" class="h-4 w-4" aria-hidden="true" />
                                <span class="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-Tinted/700">Live portfolio</span>
                                <span class="relative flex h-2 w-2" aria-hidden="true">
                                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-Green/200 opacity-60" />
                                    <span class="relative inline-flex h-2 w-2 rounded-full bg-Green/200" />
                                </span>
                            </span>
                            <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">3rd-party verified</span>
                        </div>

                        <!-- Equity curve -->
                        <svg viewBox="0 0 560 300" class="mt-5 w-full" preserveAspectRatio="none" role="img" aria-label="EasyAlgos verified equity growth since 2017: a steadily compounding curve.">
                            <defs>
                                <linearGradient id="heroLineGrad" x1="0" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stop-color="#205EFB" />
                                    <stop offset="0.55" stop-color="#5959FF" />
                                    <stop offset="1" stop-color="#B36DFF" />
                                </linearGradient>
                                <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stop-color="#5959FF" stop-opacity="0.14" />
                                    <stop offset="1" stop-color="#5959FF" stop-opacity="0" />
                                </linearGradient>
                            </defs>

                            <g stroke="#E4E6F0" stroke-width="1" v-html="gridMarkup" />

                            <path class="chart-wedge" :d="equityArea" fill="url(#heroAreaGrad)" />
                            <path class="chart-line" :d="equity" fill="none" stroke="url(#heroLineGrad)" stroke-width="4" stroke-linecap="round" pathLength="1" />

                            <g class="chart-dot">
                                <circle class="chart-pulse" cx="550" cy="40" r="6" fill="#B36DFF" />
                                <circle cx="550" cy="40" r="6" fill="#B36DFF" />
                            </g>
                        </svg>

                        <!-- Axis -->
                        <div class="mt-2 flex items-center justify-between font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">
                            <span>2017</span>
                            <span>Verified equity growth</span>
                            <span>Today</span>
                        </div>

                        <!-- Stats -->
                        <div class="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-Tinted/100 ring-1 ring-Tinted/100">
                            <div class="bg-white px-4 py-3">
                                <div class="font-poppins text-lg font-semibold leading-6 text-Tinted/950">8+ yrs</div>
                                <div class="mt-0.5 font-poppins text-[10px] font-medium uppercase tracking-[0.1em] text-Tinted/500">Track record</div>
                            </div>
                            <div class="bg-white px-4 py-3">
                                <div class="font-poppins text-lg font-semibold leading-6 text-Tinted/950">$0</div>
                                <div class="mt-0.5 font-poppins text-[10px] font-medium uppercase tracking-[0.1em] text-Tinted/500">Cost of access</div>
                            </div>
                            <div class="bg-white px-4 py-3">
                                <div class="font-poppins text-lg font-semibold leading-6 text-Tinted/950">0%</div>
                                <div class="mt-0.5 font-poppins text-[10px] font-medium uppercase tracking-[0.1em] text-Tinted/500">Commissions</div>
                            </div>
                        </div>

                        <!-- Verification row -->
                        <div class="mt-4 flex items-center gap-3 font-poppins text-[11px] font-medium text-Tinted/500">
                            <span class="uppercase tracking-[0.12em] text-Tinted/400">Verified by</span>
                            <span class="flex items-center gap-1.5">
                                <span class="h-1.5 w-1.5 rounded-full bg-Green/200" aria-hidden="true" />
                                MyFxBook
                            </span>
                            <span class="flex items-center gap-1.5">
                                <span class="h-1.5 w-1.5 rounded-full bg-Green/200" aria-hidden="true" />
                                FXBlue
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
