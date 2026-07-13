<script setup lang="ts">
// "How to join" as a horizontal timeline: numbered stations on a hairline
// rail (vertical rail on mobile), one CTA at the end of the section.
const steps = [
    { n: '1', title: 'Apply', desc: 'A five-minute application. We review every account to keep the ecosystem healthy — most traders hear back within a day.' },
    { n: '2', title: 'Onboard', desc: 'Your EasyVPS is provisioned and your Expert Advisors installed and configured by our team — remotely and securely.' },
    { n: '3', title: 'Trade', desc: 'Your algorithms go live on your own broker account. You stay in full control of your capital; we never touch your funds.' },
]
</script>

<template>
    <section id="join" class="border-t border-Tinted/100 py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="max-w-[820px]">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>How to join</p>
                <h2 class="ea-h2 mt-6" v-reveal="80">
                    From application to<br />
                    live trading in <span class="ea-grad-text">three steps</span>.
                </h2>
            </div>

            <!-- Timeline -->
            <div class="relative mt-14">
                <!-- Rail (desktop) -->
                <div class="absolute left-0 right-0 top-6 hidden h-px bg-Tinted/100 tablet-md:block" aria-hidden="true" />

                <div class="grid grid-cols-1 gap-10 tablet-md:grid-cols-3 tablet-md:gap-8">
                    <div
                        v-for="(step, i) in steps"
                        :key="step.n"
                        class="relative border-l border-Tinted/100 pl-8 tablet-md:border-l-0 tablet-md:pl-0"
                        v-reveal="i * 140"
                    >
                        <!-- Station dot -->
                        <div class="absolute -left-6 top-0 tablet-md:static">
                            <div
                                :class="[
                                    'centered relative z-10 h-12 w-12 rounded-full border-2 bg-white font-poppins text-base font-bold',
                                    i === 0 ? 'border-Blue/600 text-Blue/600' : 'border-Tinted/200 text-Tinted/700',
                                ]"
                            >
                                {{ step.n }}
                            </div>
                        </div>
                        <h3 class="mt-0 font-poppins text-lg font-semibold text-Tinted/950 tablet-md:mt-6">{{ step.title }}</h3>
                        <p class="mt-2.5 max-w-[26rem] font-franklin text-[15px] leading-[1.6] text-Tinted/600">{{ step.desc }}</p>
                    </div>
                </div>
            </div>

            <div class="mt-12 flex flex-wrap items-center gap-5" v-reveal="200">
                <CtaButton label="Start the application" href="https://easyalgos.ai/" />
                <span class="font-franklin text-sm text-Tinted/500">Free for qualifying traders &middot; no card, ever</span>
            </div>
        </div>
    </section>
</template>
