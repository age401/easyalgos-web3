<script setup lang="ts">
// "The stories" — one editorial pull-quote at a time, auto-rotating with a
// progress rail. Client-only rotation; SSR renders the first quote.
const quotes = [
    {
        quote: 'After over a decade working inside top brokers, EasyAlgos\' Expert Advisors show one of the highest survivability rates I have seen in retail algorithmic trading.',
        name: 'Angus Walker',
        role: 'Head of Trading · IC Markets',
    },
    {
        quote: 'After 10 years of inconsistent results with manual trading, EasyAlgos gave me steady returns I could actually plan around.',
        name: 'Pedro',
        role: 'Salesman · Spain',
    },
    {
        quote: 'EasyAlgos made trading simpler than any software I have tried. Around 2.5% monthly returns, without touching a chart.',
        name: 'Lam',
        role: 'Retired · Hong Kong',
    },
    {
        quote: 'After losing money with other EAs, I finally found steady profits. I am averaging almost 5% a month.',
        name: 'Ioannis',
        role: 'IT · Greece',
    },
    {
        quote: 'EasyAlgos gave me exactly what I needed: peace of mind and steady growth. The verified records were what convinced me.',
        name: 'Vivek',
        role: 'Institutional banker · Dubai',
    },
]

const DURATION_MS = 6500
const index = ref(0)
const running = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

function select(i: number) {
    index.value = i
    if (timer) {
        clearInterval(timer)
        timer = setInterval(advance, DURATION_MS)
    }
}
function advance() {
    index.value = (index.value + 1) % quotes.length
}

onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    running.value = true
    timer = setInterval(advance, DURATION_MS)
})
onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})
</script>

<template>
    <section id="stories" class="border-t border-Tinted/100 bg-Tinted/25 py-20 tablet-md:py-28">
        <div class="ea-container">
            <div class="flex items-baseline justify-between gap-6">
                <p class="ea-eyebrow ea-eyebrow--accent" v-reveal>The stories</p>
                <span class="font-poppins text-[11px] font-medium uppercase tracking-[0.14em] text-Tinted/400" v-reveal>{{ String(index + 1).padStart(2, '0') }} / {{ String(quotes.length).padStart(2, '0') }}</span>
            </div>

            <div class="mt-10 min-h-[16rem] tablet:min-h-[13rem] tablet-wide:min-h-[11rem]" v-reveal="80">
                <Transition name="fade" mode="out-in">
                    <figure :key="index" class="max-w-[56rem]">
                        <blockquote class="font-poppins font-medium leading-[1.42] tracking-[-1px] text-Tinted/950 text-[1.5rem] tablet:text-[1.875rem] desktop:text-[2.125rem]">
                            &ldquo;{{ quotes[index].quote }}&rdquo;
                        </blockquote>
                        <figcaption class="mt-7 flex items-center gap-3">
                            <span class="h-px w-4 bg-Tinted/400" aria-hidden="true" />
                            <span class="font-poppins text-sm font-semibold text-Tinted/900">{{ quotes[index].name }}</span>
                            <span class="font-poppins text-[11px] font-medium uppercase tracking-[0.12em] text-Tinted/400">{{ quotes[index].role }}</span>
                        </figcaption>
                    </figure>
                </Transition>
            </div>

            <!-- Progress rail -->
            <div class="mt-10 flex items-center gap-2.5" role="tablist" aria-label="Testimonials" v-reveal="140">
                <button
                    v-for="(q, i) in quotes"
                    :key="q.name"
                    type="button"
                    role="tab"
                    :aria-selected="i === index"
                    :aria-label="`Story from ${q.name}`"
                    class="group flex h-6 items-center"
                    @click="select(i)"
                >
                    <span class="relative h-0.5 w-10 overflow-hidden rounded-full bg-Tinted/200 transition-colors duration-300 group-hover:bg-Tinted/300">
                        <span
                            v-if="i === index && running"
                            :key="'fill' + index"
                            class="ea-progress-fill absolute inset-0 rounded-full"
                            style="background: linear-gradient(90deg, #205EFB, #B36DFF); --quote-dur: 6.5s"
                        />
                        <span v-else-if="i === index" class="absolute inset-0 rounded-full" style="background: linear-gradient(90deg, #205EFB, #B36DFF)" />
                    </span>
                </button>
            </div>
        </div>
    </section>
</template>
