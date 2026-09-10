<script setup lang="ts">
// A foreground EA card from the hero collage — real DOM, not an image.
//
// Rendered at its drawn 272px width and scaled as part of the collage stage
// (see HeroSection), so the type sizes here are the literal Figma values and no
// breakpoint has to restate them. The card's inner column is exactly 240px:
// 272 less 2x16 padding, with the 2px stroke drawn as an inset ring rather than
// a border so it costs no layout width.
//
// The figures come in already resolved: they are baked into the prerendered HTML
// at build time from the daily backend publish (see data/heroCards.ts). The row
// labels beside them are static i18n strings, so the card is complete and
// readable on first paint with no fetch, no skeleton and no reflow.
import type { EaCard } from '~/types/home'

interface Props {
    card: EaCard
    /** The featured card's avatar is the only eager raster above the fold. */
    eager?: boolean
}
const props = withDefaults(defineProps<Props>(), { eager: false })

const avatar = computed(() => mediaAsset('ea', props.card.avatar, 64, 64))
</script>

<template>
    <article class="ea-card ea-card-hover flex w-[272px] flex-col items-start overflow-clip p-4">
        <!-- EA of the Month badge. Exactly one card carries it, which is why the
             featured card is drawn 32px taller than the rest. -->
        <div v-if="card.featured" class="w-full pb-2">
            <p
                class="flex w-full items-center justify-center gap-2 rounded-md bg-ea-ribbon px-2 py-1
                       font-poppins text-[11px] font-semibold uppercase leading-4 tracking-[-0.22px] text-white"
            >
                <img
                    src="/img/jewel.svg"
                    alt=""
                    width="16"
                    height="16"
                    aria-hidden="true"
                    class="h-4 w-4 shrink-0 drop-shadow-[0_3px_2px_rgba(9,7,36,0.12)]"
                />
                {{ $t('card.eaOfTheMonth') }}
            </p>
        </div>

        <!-- EA name -->
        <h3 class="w-full pb-2 font-poppins text-[12px] font-semibold text-Tinted/950">
            {{ card.name }}
        </h3>

        <!-- Avatar + myfxbook chart panel -->
        <div class="flex w-full gap-2">
            <AppPicture
                :media="avatar"
                :loading="eager ? 'eager' : 'lazy'"
                :fetchpriority="eager ? 'high' : 'low'"
                img-class="h-16 w-16 rounded-lg object-cover"
            />

            <!-- The myfxbook widget, hand-built: a chrome bar, a gridded plot and
                 the equity curve. The curve is the exported Figma path rather
                 than an approximation, and SVG beats an image here — it stays
                 crisp at any stage scale and weighs nothing. -->
            <div class="flex h-16 flex-1 flex-col overflow-hidden rounded-lg bg-Tinted/50">
                <div class="h-1.5 w-full shrink-0 bg-Tinted/200" />
                <div class="flex-1 p-1.5">
                    <svg
                        class="h-full w-full rounded"
                        viewBox="0 0 156 46"
                        preserveAspectRatio="none"
                        fill="none"
                        aria-hidden="true"
                    >
                        <rect width="156" height="46" rx="4" fill="#F7F7FB" />
                        <!-- 5 rows inset 6px, 10 columns inset 12px — the drawn
                             `justify-between` distributions. -->
                        <g stroke="#F4F5FB" stroke-width="0.648">
                            <path d="M0 6h156M0 14.5h156M0 23h156M0 31.5h156M0 40h156" />
                            <path
                                d="M12 0v46M26.67 0v46M41.33 0v46M56 0v46M70.67 0v46M85.33 0v46M100 0v46M114.67 0v46M129.33 0v46M144 0v46"
                            />
                        </g>
                        <path
                            d="M38.7002 46.4363L37.9476 45.8363L37.1379 45.6363L36.4165 45.4363H31.4493L30.4476 45.8363L29.7002 46.4363"
                            stroke="#FF524F"
                            stroke-width="1.29552"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M46.7002 46.4363L47.3749 45.7228H47.8301L48.4084 45.3661L48.9225 44.6499H49.3134L50.4701 45.3661V44.3147L50.9895 43.5796L52.5371 43.2228V42.6417L53.0512 42.1499L53.5652 42.8661L54.0847 43.2228L54.5987 42.5066L55.1128 41.7931H56.9174L57.1798 41.4363H57.9188L58.208 41.0796H59.7556L60.275 40.3661H61.6566L62.3366 40.7228L62.8507 40.3661L63.8842 39.6499L64.3983 38.5796L64.9177 38.2228H67.3007L68.0075 37.8661H68.527L69.041 37.5066V37.239L69.5551 36.7931V35.8553L70.0746 35.3661V35.0066L71.1027 35.7228L71.6221 36.4363L72.6503 36.7931L73.1697 37.1499L73.6838 37.5066L74.1979 38.2228H74.7173L75.2314 37.5066H76.2649H77.8125L78.3265 36.7931L78.8406 36.4363H79.8741H80.9076L81.4217 36.0796H81.9358L82.4552 35.3661V34.9174L82.9693 34.6499H83.9064L84.4526 34.0904L85.5504 33.5796L86.0644 32.8661L86.5785 32.5066L87.0979 32.1499L88.1261 32.5066H89.1596H90.1931L90.7072 32.8661L91.2212 33.2228L91.7407 32.5066V31.9931L92.2547 31.4363L92.7688 31.0796V30.6985V30.0066H93.3204L93.8023 28.9363H94.5734L95.3499 29.6499L96.3781 30.0066V29.6499L96.8975 29.2931L97.1545 28.9363L97.4116 28.2228H97.9256L98.4451 27.8661H100.442L101.021 27.1499V26.4363L101.54 26.0796L102.054 25.3661V25.0066L102.568 24.2931L103.088 23.2228H103.57L104.116 22.8661L104.635 23.2228H105.149L105.664 22.8661L106.697 22.1499L107.731 21.7931H108.245L108.759 21.4363H109.278L109.792 20.7228L110.826 20.0066L111.34 19.6499L111.854 20.3661L112.373 20.7228L112.887 20.3661V19.2931L113.401 18.5796L113.921 18.2228L114.435 17.8661L114.949 19.2931V20.0066L115.468 20.7228V21.458L115.983 22.1499H117.016H118.044L118.558 21.4363H119.592L120.106 21.0796V20.6985L120.625 20.0066H121.653L122.173 19.6499L122.687 19.2931L123.201 20.0066H123.72L124.235 19.6499L124.749 19.2931H125.268V19.6499L125.782 20.0066H126.816L127.33 19.6499L128.363 18.9363L129.391 18.5796L129.911 17.8661L130.425 17.1499L131.458 16.7931L131.972 16.0796L132.486 15.0066L133.006 14.2931L133.52 13.5796H134.323L135.068 14.2931H135.582L136.615 13.9363L137.033 13.5796H137.745V13.1553L138.677 12.5066V12.1499L139.196 11.7931L139.71 12.1499L140.224 12.5066V12.8661L140.744 13.2228L141.258 12.8661V12.3066V11.4363L141.772 11.0796V10.8336L142.291 10.3661L142.805 10.0066L143.32 9.64985V9.00391L143.834 8.57958L144.353 8.93634H144.867L145.381 9.2931L146.415 8.93634V8.26607L146.929 7.50661H147.223L147.962 7.86607L148.476 8.22283L148.996 8.93634H149.51V8.22283L150.024 7.86607L150.543 7.50661L151.057 8.57958L151.572 9.64985L152.091 10.0066L153.119 10.3661V10.7228L153.639 10.0066L154.153 9.2931V8.57958V7.86607V7.35256L154.667 6.7931L155.7 6.43634"
                            stroke="#FF524F"
                            stroke-width="1.29552"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <!-- The two tinted panels below the chart share one 4px-gutter column. -->
        <div class="flex w-full flex-col items-start gap-1 pt-2">
            <!-- AlgoScore -->
            <div class="w-full overflow-hidden rounded-lg bg-[#F4F4FA] py-1 pl-2 pr-[3px]">
                <div class="flex items-center justify-between">
                    <span class="flex items-center gap-0.5">
                        <img
                            src="/img/logo-mark.svg"
                            alt=""
                            width="14"
                            height="14"
                            class="h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                        <span class="font-rubik text-[10px] font-medium leading-3 text-Tinted/700">
                            {{ $t('card.algoScore') }}
                        </span>
                    </span>
                    <span class="flex items-center overflow-hidden rounded">
                        <span
                            class="flex h-5 items-center bg-[#AAAFCD] py-[3px] pl-2 pr-1.5
                                   font-rubik text-[10px] font-medium leading-[11px] text-white"
                        >
                            {{ $t('card.excellent') }}
                        </span>
                        <span
                            class="ea-num flex h-5 items-center bg-[#6F76A6] px-1.5 py-1
                                   font-rubik text-[12px] font-semibold leading-3 text-white"
                        >
                            {{ card.score }}
                        </span>
                    </span>
                </div>
            </div>

            <!-- Stat ledger -->
            <div class="w-full overflow-hidden rounded-lg bg-[#F4F4FA] py-1 pl-2 pr-[3px]">
                <dl class="flex flex-col gap-px">
                    <div
                        v-for="stat in card.stats"
                        :key="stat.key"
                        class="flex h-[18px] items-center justify-between gap-2
                               font-rubik text-[10px] leading-3 text-Tinted/700"
                    >
                        <dt class="font-medium">{{ $t(`card.${stat.key}`) }}</dt>
                        <dd :class="['ea-num shrink-0 text-right', stat.strong ? 'font-semibold' : 'font-medium']">
                            {{ stat.value }}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    </article>
</template>
