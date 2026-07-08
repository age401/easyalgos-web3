<script setup lang="ts">
/**
 * EasyAlgos CTA button (from the "Button ICPrecision CTA" Figma component,
 * promoted to the ecosystem design system).
 * - primary: animated blue->violet gradient (Button Background, 200% wide) plus a
 *   translating Button Shine (300% wide); both slide on X across states.
 * - white / white-stroke: light variants for the gradient banner and the hero.
 * Keeps the brand Lottie "Apply" arrow (/lottie/apply-arrow.json): recoloured to a
 * dark arrow on the light variants. It rests on frame 45 (FULL_FRAME below), the
 * instant both trim-path strokes are fully drawn and not yet erased, loops the
 * whole draw/erase/hold cycle while hovered/focused, and on leave keeps playing
 * until it comes back around to frame 45 before settling there again.
 */
const props = withDefaults(
    defineProps<{
        label?: string
        href?: string
        variant?: 'primary' | 'white' | 'white-stroke'
        size?: 'md' | 'sm'
        arrow?: boolean
        newTab?: boolean
    }>(),
    { label: 'Apply now', href: 'https://easyalgos.ai/', variant: 'primary', size: 'md', arrow: true, newTab: false },
)

// Normalised RGB the Lottie arrow is recoloured to (white stays as authored).
const ARROW_RGB: Record<string, [number, number, number] | null> = {
    primary: null,
    white: [0.262, 0.243, 0.408],        // Tinted/800 #433E68
    'white-stroke': [0.09, 0.09, 0.09],  // Neutral/800 #171717
}

// Frame where both trim-path strokes are 100% drawn and 0% erased
// (apply-arrow.json: the "e" keyframe hits 100 while "s" is still 0 at t=45).
const FULL_FRAME = 45

const arrowEl = ref<HTMLElement | null>(null)
let anim: any = null
let ready = false
let loading = false
let hovering = false
let stopRequested = false
let lastFrame = 0

function recolour(data: any, rgb: [number, number, number]) {
    const walk = (node: any) => {
        if (!node || typeof node !== 'object') return
        if (node.c && node.c.k && Array.isArray(node.c.k) && node.c.k.length >= 3) {
            const a = node.c.k[3]
            node.c.k = a === undefined ? [...rgb] : [...rgb, a]
        }
        for (const key in node) walk(node[key])
    }
    walk(data)
    return data
}

function startLoop() {
    stopRequested = false
    anim.loop = true
    anim.setDirection(1)
    anim.play()
}

// While a stop is pending, watch the playhead cross FULL_FRAME going forward
// (post-loop-wrap included) and land the animation there instead of cutting it off.
function onEnterFrame() {
    if (!stopRequested || !anim) return
    const frame = anim.currentFrame
    if (lastFrame < FULL_FRAME && frame >= FULL_FRAME) {
        stopRequested = false
        anim.loop = false
        anim.goToAndStop(FULL_FRAME, true)
    }
    lastFrame = frame
}

async function ensureLottie() {
    if (ready || loading || !arrowEl.value || !props.arrow) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    loading = true
    try {
        const [{ default: lottie }, raw] = await Promise.all([
            import('lottie-web'),
            fetch('/lottie/apply-arrow.json').then((r) => r.json()),
        ])
        const rgb = ARROW_RGB[props.variant]
        const data = rgb ? recolour(raw, rgb) : raw
        anim = lottie.loadAnimation({
            container: arrowEl.value,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: data,
        })
        anim.addEventListener('enterFrame', onEnterFrame)
        anim.addEventListener('DOMLoaded', () => {
            ready = true
            anim.goToAndStop(FULL_FRAME, true)
            arrowEl.value?.querySelector('svg.cta-arrow-fallback')?.remove()
            if (hovering) startLoop()
        })
    } catch {
        /* keep the static fallback arrow */
    }
}

onBeforeUnmount(() => anim?.destroy?.())

function onEnter() {
    hovering = true
    void ensureLottie()
    if (!ready) return
    if (stopRequested || anim.isPaused) startLoop()
}
function onLeave() {
    hovering = false
    if (!ready || !anim || anim.isPaused) return
    stopRequested = true
    lastFrame = anim.currentFrame
}

const variantClass = computed(() => `ea-cta--${props.variant}`)
const rel = computed(() => (props.newTab ? 'noopener noreferrer' : undefined))
const target = computed(() => (props.newTab ? '_blank' : undefined))
</script>

<template>
    <a
        :href="href"
        :target="target"
        :rel="rel"
        :class="['ea-cta', variantClass, size === 'sm' ? '!h-12 !px-7 !text-[15px]' : '']"
        @mouseenter="onEnter"
        @mouseleave="onLeave"
        @focus="onEnter"
        @blur="onLeave"
    >
        <span v-if="variant === 'primary'" class="ea-cta__bg" aria-hidden="true" />
        <span v-if="variant === 'primary'" class="ea-cta__shine" aria-hidden="true" />

        <span>{{ label }}</span>

        <span v-if="arrow" ref="arrowEl" class="inline-flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
            <svg class="cta-arrow-fallback" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M8.5 4.5 12.5 8l-4 3.5" stroke="currentColor" stroke-width="1.6"
                      stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>
    </a>
</template>
