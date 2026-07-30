<script setup lang="ts">
// "What you get" — a nine-row accordion on the left, the matching visual on the
// right.
//
// Rows are real <button>s inside a heading, so the list is keyboard-operable and
// announces its open state for free via aria-expanded. The open row's description
// animates on grid-template-rows 0fr -> 1fr (see .ea-solution-row in main.css),
// which is the only way to transition to an auto height without measuring in JS.
//
// The right-hand panel cross-fades between per-row visuals. Only two rows have
// their artwork so far; the rest fall back to the dashboard export so the panel is
// never empty while the per-item animations are outstanding. Dropping each one in
// later is a single line in data/content.ts — no change here.
import { SOLUTIONS, SOLUTIONS_FALLBACK_VISUAL } from '~/data/content'

const activeId = ref(SOLUTIONS[0]!.id)

function toggle(id: string) {
    // Always leave one row open: the right-hand panel is driven by the selection,
    // so collapsing everything would blank half the section.
    if (activeId.value !== id) activeId.value = id
}

const activeVisual = computed(() => {
    const item = SOLUTIONS.find((entry) => entry.id === activeId.value)
    return item?.visual ?? SOLUTIONS_FALLBACK_VISUAL
})
</script>

<template>
    <section id="what-you-get" class="ea-section relative overflow-x-clip bg-white">
        <div class="ea-container-wide grid grid-cols-1 items-center gap-12 tablet-wide:grid-cols-[minmax(0,620px)_minmax(0,1fr)] tablet-wide:gap-10 desktop:gap-16">
            <!-- Left column -->
            <div>
                <SectionHeading :eyebrow="$t('whatYouGet.eyebrow')">
                    <template #title>
                        {{ $t('whatYouGet.titleLine1') }}<br />
                        <span class="ea-grad">{{ $t('whatYouGet.titleAccent') }}</span>.
                    </template>
                </SectionHeading>

                <div v-reveal="140" class="mt-10 tablet-wide:mt-12">
                    <h3
                        v-for="(item, index) in SOLUTIONS"
                        :key="item.id"
                        class="m-0"
                    >
                        <button
                            type="button"
                            class="ea-solution-row"
                            :aria-expanded="activeId === item.id"
                            :aria-controls="`solution-body-${item.id}`"
                            @click="toggle(item.id)"
                        >
                            <span class="ea-solution-row__index pt-0.5">
                                {{ String(index + 1).padStart(2, '0') }}
                            </span>
                            <span class="block">
                                <span class="block font-poppins text-[14px] font-medium leading-5 text-Neutral/800">
                                    {{ $t(`whatYouGet.items.${item.id}.title`) }}
                                </span>
                                <span :id="`solution-body-${item.id}`" class="ea-solution-row__body">
                                    <span class="block">
                                        <span class="ea-body--sm block pt-1 !text-Neutral/500">
                                            {{ $t(`whatYouGet.items.${item.id}.description`) }}
                                        </span>
                                    </span>
                                </span>
                            </span>
                        </button>
                    </h3>
                </div>

                <div v-reveal="220" class="mt-12">
                    <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
                </div>
            </div>

            <!-- Right panel. Bleeds past the column as drawn; the section clips it. -->
            <div
                v-reveal="180"
                class="relative w-full tablet-wide:w-[calc(100%+8vw)] desktop:w-[calc(100%+12vw)]"
            >
                <div class="ea-media relative aspect-[1100/660] w-full rounded-2xl border-2 border-Tinted/100 bg-Tinted/25 shadow-ea-step">
                    <Transition name="swap" mode="out-in">
                        <AppPicture
                            :key="activeId"
                            :media="activeVisual"
                            loading="lazy"
                            sizes="(min-width: 1280px) 1100px, (min-width: 1024px) 60vw, 100vw"
                            img-class="h-full w-full rounded-2xl object-cover object-left-top"
                        />
                    </Transition>
                </div>
            </div>
        </div>
    </section>
</template>
