<script setup lang="ts">
// "You were the only one paying." — the old industry's costs rendered as an
// itemized invoice. Line items strike through as they scroll into view; the
// total settles at $0.00 with a broker-paid stamp.
const items = [
    { label: 'Expert Advisor license', price: '$1,499' },
    { label: '"Holy Grail" upgrade', price: '$499' },
    { label: 'Monthly signals subscription', price: '$99/mo' },
    { label: 'Optimized settings pack', price: '$299' },
    { label: 'Profit-share commission', price: '20-30%' },
]
</script>

<template>
    <section id="cost" class="py-20 tablet-md:py-28">
        <div class="ea-container grid grid-cols-1 items-start gap-12 tablet-wide:grid-cols-2 tablet-wide:gap-16">
            <!-- Heading -->
            <div>
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The problem</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    You were the<br />
                    only one<br />
                    <span class="ea-grad-text">paying</span>.
                </h2>

                <div class="mt-8 border-t border-Tinted/100 pt-8" v-reveal="140">
                    <p class="ea-lead max-w-[30rem]">
                        The old Expert Advisor industry billed you at every step &mdash; and the seller profited whether you did or not. We tore the invoice up. EasyAlgos is compensated by its broker partners, so the only person who never pays here is you.
                    </p>
                </div>

                <div class="mt-10" v-reveal="200">
                    <a href="#terms" class="ea-pill">
                        <img src="/img/home/logo-easyalgos-isologo.svg" alt="" width="12" height="12" class="h-3 w-3 shrink-0" />
                        Free for qualifying traders
                    </a>
                </div>
            </div>

            <!-- The invoice -->
            <div class="relative mx-auto w-full max-w-[480px] tablet-wide:ml-auto tablet-wide:mr-0" v-reveal="120">
                <div class="rounded-2xl border-2 border-Tinted/100 bg-white p-8 shadow-[0_24px_50px_-30px_rgba(47,42,74,0.3)]">
                    <!-- Invoice header -->
                    <div class="flex items-baseline justify-between">
                        <span class="font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-Tinted/700">The old way, itemized</span>
                        <span class="font-franklin text-[11px] uppercase tracking-[0.08em] text-Tinted/400">Invoice &numero; 2016-EA</span>
                    </div>

                    <div class="mt-6 border-t border-dashed border-Tinted/200" aria-hidden="true" />

                    <!-- Line items -->
                    <ul class="mt-6 flex flex-col gap-4">
                        <li
                            v-for="(item, i) in items"
                            :key="item.label"
                            class="flex items-baseline gap-3"
                            v-reveal="200 + i * 130"
                        >
                            <span class="font-franklin text-[15px] text-Tinted/700">{{ item.label }}</span>
                            <span class="mx-1 flex-1 border-b border-dotted border-Tinted/200" aria-hidden="true" />
                            <span class="ea-strike font-poppins text-[15px] font-medium tabular-nums text-Tinted/900">{{ item.price }}</span>
                        </li>
                    </ul>

                    <div class="mt-7 border-t border-dashed border-Tinted/200" aria-hidden="true" />

                    <!-- Total -->
                    <div class="mt-6 flex items-end justify-between" v-reveal="320">
                        <div>
                            <div class="font-poppins text-[10px] font-medium uppercase tracking-[0.14em] text-Tinted/400">Your total</div>
                            <div class="mt-1 font-poppins text-sm font-semibold text-Tinted/900">with EasyAlgos</div>
                        </div>
                        <div class="ea-grad-text font-poppins text-[2.75rem] font-bold leading-none tracking-[-1px] tabular-nums">$0.00</div>
                    </div>

                    <!-- Barcode footer -->
                    <div class="mt-8 flex items-end justify-between gap-6">
                        <div class="flex h-7 items-end gap-[3px] opacity-70" aria-hidden="true">
                            <span v-for="(w, i) in [2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 2]" :key="i"
                                  class="inline-block h-full bg-Tinted/900" :style="{ width: w + 'px' }" />
                        </div>
                        <span class="whitespace-nowrap font-franklin text-[10px] uppercase tracking-[0.12em] text-Tinted/400">Est. 2017 &middot; Verified</span>
                    </div>
                </div>

                <!-- Stamp (rotation lives inside the reveal wrapper — .reveal owns `transform`) -->
                <div class="absolute -bottom-5 right-6 tablet:right-10" v-reveal="600">
                    <div class="-rotate-6 rounded-lg p-[2px] shadow-[0_10px_24px_-12px_rgba(32,94,251,0.5)]"
                         style="background: linear-gradient(131deg, #205EFB 8%, #5959FF 47%, #B36DFF 92%)">
                        <div class="rounded-md bg-white px-4 py-2">
                            <span class="ea-grad-text font-poppins text-[11px] font-bold uppercase tracking-[0.16em]">Paid by our broker partners</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
