<script setup lang="ts">
// "You don't pay, you qualify" — the three qualification tiers, plus the
// collapsible explainer of how the free model is actually paid for.
//
// Drawn as a tinted shell holding three near-white cards separated by a 1px
// gutter, which is done with `gap-px` over the card list's own background rather
// than borders: no double lines at the joins, and the outer radius stays clean
// because only the wrapper is rounded.
//
// The middle tier is the emphasised one and takes the gradient CTA; the outer two
// take the ink pill. That comes from the data (`featured`), not from an index, so
// re-ordering the tiers cannot break it.
import { PRICING_TIERS, PRICING_MODEL_BULLETS } from '~/data/content'

const { n } = useI18n()

// One instance of this section per page, so a literal id is enough for
// aria-controls and it survives SSR/hydration without a generated-id mismatch.
const PANEL_ID = 'pricing-model-panel'

// The explainer's opening paragraphs are three separate i18n keys because the
// design sets them 8px apart, not as one wrapped block.
const MODEL_INTROS = ['intro1', 'intro2', 'intro3'] as const

const open = ref(false)
const panel = ref<HTMLElement | null>(null)

// `hidden` is NOT just `!open`: on collapse the attribute has to stay off until
// the height animation has finished, or the panel would vanish instantly and the
// animation would have nothing to run on. So it trails `open` on the way out and
// leads it on the way in. It starts true, which is what the server renders — the
// panel's content is out of the a11y tree and out of the tab order before JS.
const collapsed = ref(true)

let anim: Animation | null = null

// Height animation, done on the element rather than in CSS because `height: auto`
// is not interpolable — we have to measure `scrollHeight` at the moment of the
// toggle. Web Animations rather than a transition so a mid-flight reversal can be
// cancelled cleanly instead of fighting a queued transitionend.
async function toggle() {
    open.value = !open.value
    // A reversal mid-flight cancels the old run, which rejects its `finished`
    // promise — that rejection is how the superseded call below bails out.
    anim?.cancel()
    anim = null

    if (open.value) collapsed.value = false
    await nextTick()

    const el = panel.value
    // No element, no Web Animations, or the user asked for less motion: just
    // snap. The aria state and the `hidden` attribute are still correct.
    const reduced =
        typeof window === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || reduced || typeof el.animate !== 'function') {
        collapsed.value = !open.value
        return
    }

    const full = el.scrollHeight
    const run = el.animate(
        [{ height: `${open.value ? 0 : full}px` }, { height: `${open.value ? full : 0}px` }],
        { duration: 420, easing: 'cubic-bezier(.22,.61,.36,1)' }
    )
    anim = run

    try {
        await run.finished
    } catch {
        return // cancelled by a newer toggle, which now owns the state
    }
    if (anim !== run) return
    anim = null
    collapsed.value = !open.value
}
</script>

<template>
    <section id="pricing" class="ea-section bg-white">
        <div class="ea-container">
            <SectionHeading :eyebrow="$t('pricing.eyebrow')">
                <template #title>
                    <span class="ea-grad">{{ $t('pricing.titleAccent') }}</span>,<br />
                    {{ $t('pricing.titleRest') }}
                </template>
                <template #lead>
                    <p class="ea-lead--tight max-w-[640px]">
                        {{ $t('pricing.leadLine1') }}<br class="hidden tablet:inline" />
                        {{ $t('pricing.leadLine2') }}
                    </p>
                </template>
            </SectionHeading>

            <!-- Tier shell. Figma 420:1070: radius 20, 16px padding, and NO stroke —
                 the shell's own stroke layer is switched off in the file. The white
                 ring belongs to the card list inside it (420:1071), which is what
                 separates the near-white cards from the tinted shell.

                 The gradient lives in the `ea-pricing-shell` token, corrected from
                 the frame's own fill — see tailwind.config.ts for the derivation. -->
            <div v-reveal="160" class="mt-12 rounded-[20px] bg-ea-pricing-shell p-4 tablet-wide:mt-16">
                <ul
                    class="grid grid-cols-1 gap-px overflow-hidden rounded-xl border-2 border-white bg-Tinted/25 tablet-md:grid-cols-3"
                >
                    <!-- Each card carries its own gradient sheen (Figma 420:1072 /
                         1091 / 1107 — three separate fills, identical definitions).
                         Because the gradient box is the card, not the table, the
                         sheen restarts in every column, and that repeat is the
                         effect: a tinted lower-right corner per segment washing out
                         to white by the card's midpoint. A single flat fill across
                         the table loses it entirely.

                         The cards themselves have radius 0 in Figma; their outer
                         corners come from the list clipping them, which is why the
                         rounding lives on the <ul> and not here. -->
                    <li
                        v-for="tier in PRICING_TIERS"
                        :key="tier.id"
                        class="flex flex-col bg-ea-pricing-card p-8 tablet-wide:p-10"
                    >
                        <h3 class="font-poppins text-[1.75rem] font-medium leading-9 tracking-[-0.5px] text-Neutral/700 tablet-wide:text-[2rem]">
                            {{ $t(`pricing.tiers.${tier.id}.name`) }}
                        </h3>

                        <p class="mt-3 flex flex-wrap items-baseline gap-x-2">
                            <span class="ea-num font-poppins text-[1.75rem] font-medium leading-8 tracking-[-0.5px] text-Tinted/800">
                                ${{ n(tier.minimumBalance, { style: 'decimal' }) }}
                            </span>
                            <span class="ea-body">{{ $t('pricing.minimumBalance') }}</span>
                        </p>

                        <!-- 14/26, not 14/24: the line sits on the same 26px rhythm as
                             the body copy above it so the two baselines agree. -->
                        <p class="mt-2 flex items-center gap-2">
                            <span class="h-1 w-1 shrink-0 rounded-full bg-Blue/600" aria-hidden="true" />
                            <span class="font-franklin text-[14px] leading-[26px] text-Tinted/500">
                                {{ $t('pricing.minimumTrades', { count: tier.minimumTrades }) }}
                            </span>
                        </p>

                        <div class="mt-7">
                            <AppButton
                                :label="$t('common.applyNow')"
                                :href="APPLY_HREF"
                                :variant="tier.featured ? 'primary' : 'ink'"
                            />
                        </div>

                        <p class="ea-body mt-8">{{ $t(`pricing.tiers.${tier.id}.description`) }}</p>
                    </li>
                </ul>
            </div>

            <!-- Model explainer. The button is a real <button> (AppButton renders one
                 when it has no href) and the aria-* / @click fall through to it, so
                 the disclosure is announced and operable from the keyboard without
                 AppButton needing to know anything about this section. -->
            <div
                v-reveal="120"
                class="mt-12 flex flex-col items-start justify-between gap-6 tablet-md:flex-row tablet-md:items-center tablet-wide:mt-16"
            >
                <h3 class="ea-h4">&mdash; {{ $t('pricing.modelTitle') }}</h3>
                <AppButton
                    :label="open ? $t('common.close') : $t('common.learnMore')"
                    variant="stroke"
                    :arrow="false"
                    :aria-expanded="open"
                    :aria-controls="PANEL_ID"
                    @click="toggle"
                />
            </div>

            <div :id="PANEL_ID" ref="panel" :hidden="collapsed" class="overflow-hidden">
                <!-- 680px is the measured column in Figma 420:999; the panel is left
                     aligned under the heading, not centred. -->
                <div class="max-w-[680px] pt-12">
                    <!-- Roboto 16/26 in Tinted/800 — one step darker than `.ea-body`,
                         which is why the type is spelled out here instead of reusing
                         it: `.ea-body` lives in the utilities layer too, so its baked
                         `text-Tinted/700` beats a `text-Tinted/800` sitting alongside
                         it on the same element. The 15px/1.6 mobile step matches
                         `.ea-body`'s so the two still scale together. -->
                    <div class="space-y-2">
                        <p
                            v-for="key in MODEL_INTROS"
                            :key="key"
                            class="font-franklin text-[0.9375rem] leading-[1.6] text-Tinted/800 tablet:text-[1rem] tablet:leading-[26px]"
                        >
                            {{ $t(`pricing.model.${key}`) }}
                        </p>
                    </div>

                    <!-- The gradient paint servers live once, here, because three
                         identical <svg> icons cannot each repeat the same gradient
                         `id` without duplicating ids in the document. -->
                    <svg aria-hidden="true" width="0" height="0" class="absolute h-0 w-0 overflow-hidden">
                        <defs>
                            <linearGradient id="ea-pricing-check-ring" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#B36DFF" />
                                <stop offset="1" stop-color="#205EFB" />
                            </linearGradient>
                            <linearGradient id="ea-pricing-check-mark" x1="10" y1="6.251" x2="8.435" y2="13.407" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#B36DFF" />
                                <stop offset="1" stop-color="#205EFB" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <ul class="mt-8 space-y-4 py-3">
                        <li v-for="id in PRICING_MODEL_BULLETS" :key="id" class="flex gap-4">
                            <!-- Geometry exported from Figma 420:1011, not redrawn.
                                 mt-0.5 is the 2px the design nudges the disc down so
                                 it optically centres on the first line, not the box. -->
                            <svg
                                class="mt-0.5 shrink-0"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                            >
                                <rect
                                    x="1"
                                    y="1"
                                    width="18"
                                    height="18"
                                    rx="9"
                                    fill="white"
                                    stroke="url(#ea-pricing-check-ring)"
                                    stroke-width="2"
                                />
                                <path
                                    d="M8.99973 13.7497C8.61473 13.7497 8.22973 13.6047 7.93973 13.3097L5.43973 10.8097C4.85473 10.2247 4.85473 9.27473 5.43973 8.68973C6.02473 8.10473 6.97473 8.10473 7.55973 8.68973L8.99973 10.1297L12.4397 6.68973C13.0247 6.10473 13.9747 6.10473 14.5597 6.68973C15.1447 7.27473 15.1447 8.22473 14.5597 8.80973L10.0597 13.3097C9.76473 13.6047 9.38473 13.7497 8.99973 13.7497Z"
                                    fill="url(#ea-pricing-check-mark)"
                                />
                            </svg>
                            <span class="font-franklin text-[1rem] font-medium leading-[22px] text-Tinted/900">
                                {{ $t(`pricing.model.bullets.${id}`) }}
                            </span>
                        </li>
                    </ul>

                    <p class="mt-8 font-franklin text-[0.9375rem] leading-[1.6] text-Tinted/800 tablet:text-[1rem] tablet:leading-[26px]">
                        {{ $t('pricing.model.outro') }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
