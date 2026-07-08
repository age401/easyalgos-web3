<script setup lang="ts">
// Closing banner: full-width blue->violet gradient with cyan / deep-blue glows.
</script>

<template>
    <section class="overflow-hidden">
        <div
            class="ea-cta-banner relative px-6 py-24 tablet-md:py-32"
            v-reveal
        >
            <div class="relative mx-auto flex max-w-[800px] flex-col items-center text-center">
                <p class="font-poppins text-xs uppercase tracking-[0.25em] text-white/80">Why traders choose us</p>

                <h2 class="mt-6 font-poppins font-semibold leading-[1.06] tracking-[-0.02em] text-white text-[2.25rem] tablet:text-[3rem] desktop:text-[3.75rem]">
                    Better results aren't behind a paywall <span class="text-[#D2DFFE]">&mdash; they're right in front of you.</span>
                </h2>

                <p class="mt-7 max-w-[640px] font-franklin text-[18px] leading-[1.6] text-white/85">
                    Apply now and put award-winning, third-party-verified Expert Advisors to work on your account &mdash; with nothing to buy and nothing to subscribe to.
                </p>

                <div class="mt-10 flex flex-wrap items-center justify-center gap-7">
                    <CtaButton label="Apply now" href="https://easyalgos.ai/" variant="white" />
                    <a href="#join" class="ea-textlink group text-white">
                        <span class="relative">
                            See how to join
                            <span class="absolute -bottom-0.5 left-0 h-px w-0 bg-white/50 transition-all duration-300 ease-smooth group-hover:w-full" />
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </section>
</template>
