<script setup lang="ts">
// A figure that counts up the first time it is seen.
//
// The server renders the FINAL value, so the prerendered HTML carries the real
// number (for no-JS readers, for crawlers and for the copy-paste case) and the
// count is purely an enhancement on top. It only ever runs inside a module that
// is itself fading in (`.xa-in`), which is what hides the single frame where
// the text drops from the final value back to zero.
//
// Skipped under prefers-reduced-motion, and skipped when the tab is hidden: a
// hidden tab gets no animation frames, and a figure parked at 0 until someone
// looks is worse than one that never moved.
interface Props {
    value: number
    decimals?: 0 | 1 | 2
    /** Milliseconds. */
    duration?: number
    prefix?: string
    suffix?: string
}
const props = withDefaults(defineProps<Props>(), { decimals: 0, duration: 1100, prefix: '', suffix: '' })

const root = ref<HTMLElement | null>(null)
const current = ref(props.value)
let observer: IntersectionObserver | null = null
let frame = 0

const text = computed(() => {
    const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: props.decimals,
        maximumFractionDigits: props.decimals
    }).format(current.value)
    return `${props.prefix}${formatted}${props.suffix}`
})

function run() {
    const startedAt = performance.now()
    current.value = 0
    const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / props.duration)
        // easeOutCubic: fast off the mark, settling into the last digits.
        current.value = props.value * (1 - Math.pow(1 - progress, 3))
        if (progress < 1) frame = requestAnimationFrame(tick)
        else current.value = props.value
    }
    frame = requestAnimationFrame(tick)
}

onMounted(() => {
    if (!root.value) return
    if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    observer = new IntersectionObserver(
        (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return
            observer?.disconnect()
            run()
        },
        { threshold: 0.4 }
    )
    observer.observe(root.value)
})

onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
})

watch(
    () => props.value,
    (value) => {
        cancelAnimationFrame(frame)
        current.value = value
    }
)
</script>

<template>
    <span ref="root" class="ea-num">{{ text }}</span>
</template>
