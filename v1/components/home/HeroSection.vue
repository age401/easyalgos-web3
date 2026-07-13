<script setup lang="ts">
// Hero v2: "The best Expert Advisors, without paying for them." + the live
// settlement ledger — trade rows tick in like a clearing feed. SSR renders a
// fixed initial slice; the feed only starts mutating after mount, so
// hydration always matches. Entrance via `.is-loaded` (hero-fade / line-mask).
const loaded = ref(false)

const logos = [
    { src: '/img/home/logo-icmarkets.png', alt: 'IC Markets', w: 360, h: 96, cls: 'h-[18px]' },
    { src: '/img/home/logo-ictrading.png', alt: 'IC Trading', w: 352, h: 96, cls: 'h-[17px]' },
    { src: '/img/home/logo-metatrader5.png', alt: 'MetaTrader 5', w: 400, h: 96, cls: 'h-[19px]' },
]

// Deterministic pool the feed cycles through (times are only regenerated
// client-side, after mount).
const TRADE_POOL = [
    { ea: 'EasyGold', market: 'XAUUSD', pl: '+$142.60', up: true },
    { ea: 'Quantum Emperor', market: 'GBPUSD', pl: '+$88.15', up: true },
    { ea: 'EasyAI', market: 'EURUSD', pl: '+$64.02', up: true },
    { ea: 'The Gold Reaper', market: 'XAUUSD', pl: '+$205.44', up: true },
    { ea: 'FastWay', market: 'USDJPY', pl: '-$31.20', up: false },
    { ea: 'EasyScalper', market: 'EURUSD', pl: '+$27.83', up: true },
    { ea: 'Range Breakout', market: 'US30', pl: '+$118.90', up: true },
    { ea: 'EasySentinel', market: 'GBPJPY', pl: '+$54.37', up: true },
    { ea: 'GoldTrade Pro', market: 'XAUUSD', pl: '+$96.51', up: true },
    { ea: 'EasyMomentum', market: 'NAS100', pl: '-$18.75', up: false },
    { ea: 'The Bitcoin Core', market: 'BTCUSD', pl: '+$173.28', up: true },
    { ea: 'MultiWay', market: 'AUDUSD', pl: '+$41.66', up: true },
]
const INITIAL_TIMES = ['14:32:07', '14:31:52', '14:31:40', '14:31:18', '14:30:55', '14:30:31']

interface LedgerRow { id: number; time: string; ea: string; market: string; pl: string; up: boolean }
const rows = ref<LedgerRow[]>(TRADE_POOL.slice(0, 6).map((t, i) => ({ id: i, ...t, time: INITIAL_TIMES[i] })))

let nextId = 6
let poolIndex = 6
let timer: ReturnType<typeof setInterval> | null = null

function pushTrade() {
    const t = TRADE_POOL[poolIndex % TRADE_POOL.length]
    poolIndex++
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    rows.value = [
        { id: nextId++, ...t, time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` },
        ...rows.value.slice(0, 5),
    ]
}

onMounted(() => {
    requestAnimationFrame(() => (loaded.value = true))
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(pushTrade, 2600)
    }
})
onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})
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
                    <CtaButton label="See the record" href="#results" variant="white-stroke" />
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

            <!-- Settlement ledger -->
            <div class="hero-fade order-1 relative mx-auto w-full max-w-[520px] tablet-wide:order-2 tablet-wide:mx-0 tablet-wide:ml-auto" style="--reveal-delay: 300ms">
                <div class="rounded-[20px] p-4 shadow-[0_40px_80px_-40px_rgba(47,42,74,0.28)]"
                     style="background: linear-gradient(100.3deg, #F6F7FF 0%, #E7E9F9 39.423%, #F2F3FF 100%)">
                    <div class="rounded-xl border-2 border-white bg-white/75 p-5">
                        <!-- Panel header -->
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-2.5">
                                <img src="/img/home/logo-easyalgos-isologo.svg" alt="" width="16" height="16" class="h-4 w-4" aria-hidden="true" />
                                <span class="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-Tinted/700">Settlement ledger</span>
                                <span class="relative flex h-2 w-2" aria-hidden="true">
                                    <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-Green/200 opacity-60" />
                                    <span class="relative inline-flex h-2 w-2 rounded-full bg-Green/200" />
                                </span>
                            </span>
                            <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">MyFxBook &middot; FXBlue</span>
                        </div>

                        <!-- Column headers -->
                        <div class="mt-5 grid grid-cols-[3.4rem_1fr_4.6rem_4.6rem] gap-2 border-b border-Tinted/100 pb-2 font-poppins text-[10px] font-medium uppercase tracking-[0.12em] text-Tinted/400">
                            <span>Time</span>
                            <span>Expert Advisor</span>
                            <span>Market</span>
                            <span class="text-right">P/L</span>
                        </div>

                        <!-- Feed -->
                        <TransitionGroup tag="div" name="ledger" class="relative mt-1 flex flex-col" aria-live="off">
                            <div
                                v-for="row in rows"
                                :key="row.id"
                                class="grid w-full grid-cols-[3.4rem_1fr_4.6rem_4.6rem] items-center gap-2 border-b border-Tinted/50 py-2.5"
                            >
                                <span class="font-franklin text-[11px] tabular-nums text-Tinted/400">{{ row.time }}</span>
                                <span class="truncate font-poppins text-[13px] font-semibold text-Tinted/900">{{ row.ea }}</span>
                                <span class="font-franklin text-[11px] tracking-[0.04em] text-Tinted/500">{{ row.market }}</span>
                                <span :class="['text-right font-poppins text-[13px] font-semibold tabular-nums', row.up ? 'text-Green/200' : 'text-Red/200']">{{ row.pl }}</span>
                            </div>
                        </TransitionGroup>

                        <!-- Ledger footer -->
                        <div class="mt-4 flex items-center justify-between">
                            <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">Commission applied &middot; 0%</span>
                            <span class="flex items-baseline gap-2">
                                <span class="font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">Session P/L</span>
                                <span class="ea-grad-text font-poppins text-lg font-bold tabular-nums">+$1,284.36</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
