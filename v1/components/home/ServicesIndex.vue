<script setup lang="ts">
// "Schedule of services" — the membership contents as an indexed document:
// hairline rows, number / title / clause / icon. Rows highlight on hover.
const services = [
    { n: '01', icon: 'feature-01', title: 'EasyVPS', desc: 'A ready-to-go, algo-optimized server by ForexVPS.net on Equinix infrastructure — provisioned for you.' },
    { n: '02', icon: 'feature-02', title: 'AI technology', desc: 'Real AI where it measurably helps, never where it adds risk — with OpenAI, Gemini and Claude behind the scenes.' },
    { n: '03', icon: 'feature-03', title: 'AI market forecasts', desc: 'Weekly forecasts powered by frontier models — context for what your algorithms are doing, and why.' },
    { n: '04', icon: 'feature-07', title: 'Remote support', desc: 'Direct, secure remote support — our team resolves issues on your EasyVPS without interrupting trading.' },
    { n: '05', icon: 'feature-04', title: 'Simple analytics', desc: 'Track and understand performance with clean, intuitive analytics. No spreadsheets required.' },
    { n: '06', icon: 'feature-05', title: 'Trading history', desc: 'A clear, detailed record of every trade on your account — exportable, auditable, yours.' },
    { n: '07', icon: 'feature-06', title: 'Back-testing data', desc: 'High-quality, tick-accurate data on every Expert Advisor before it trades your capital.' },
    { n: '08', icon: 'feature-08', title: 'Community', desc: 'A private Telegram community of traders running the same algorithms you are.' },
]
</script>

<template>
    <section id="included" class="py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="grid grid-cols-1 gap-12 tablet-wide:grid-cols-[0.9fr_1.1fr] tablet-wide:gap-16">
                <!-- Sticky heading -->
                <div class="tablet-wide:sticky tablet-wide:top-28 tablet-wide:self-start">
                    <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>What's included</p>
                    <h2 class="ea-h2 mt-6" v-reveal="80">
                        The whole<br />
                        operation, in<br />
                        <span class="ea-grad-text">one membership</span>.
                    </h2>
                    <p class="ea-lead mt-6 max-w-[26rem]" v-reveal="140">
                        Membership covers more than the algorithms &mdash; the infrastructure they run on, the data that validates them and the people who keep it all working. Schedule of services, in full:
                    </p>
                    <div class="mt-9" v-reveal="200">
                        <CtaButton label="Apply now" href="https://easyalgos.ai/" />
                    </div>
                </div>

                <!-- Indexed rows -->
                <div class="divide-y divide-Tinted/100 border-y border-Tinted/100">
                    <div
                        v-for="(service, i) in services"
                        :key="service.n"
                        class="group grid grid-cols-[2.75rem_1fr_3rem] items-center gap-4 py-5 transition-colors duration-300 ease-smooth hover:bg-Tinted/25 tablet:grid-cols-[2.75rem_11rem_1fr_3rem] tablet:px-3 tablet:-mx-3"
                        v-reveal="i * 60"
                    >
                        <span class="font-poppins text-sm font-medium tracking-[2px] text-BLUE/BASE">{{ service.n }}</span>
                        <h3 class="font-poppins text-base font-semibold leading-snug text-Tinted/950">{{ service.title }}</h3>
                        <p class="col-span-3 col-start-1 font-franklin text-[14px] leading-[1.55] text-Tinted/600 tablet:col-span-1 tablet:col-start-3">{{ service.desc }}</p>
                        <span class="ea-feature-icon-bubble col-start-3 row-start-1 flex h-12 w-12 items-center justify-center rounded-full opacity-60 transition-opacity duration-300 ease-smooth group-hover:opacity-100 tablet:col-start-4">
                            <img :src="`/icons/home/${service.icon}.svg`" :alt="''" aria-hidden="true" class="h-8 w-8" width="32" height="32" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
