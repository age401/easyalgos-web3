<script setup lang="ts">
// "Behind the algorithms" — three research cards.
//
// Each card is a single <a> wrapping media and copy, so the whole card is one
// target (no nested-interactive trap) and the hover state can lift the media and
// the title together from one selector.
import { RESEARCH_POSTS } from '~/data/content'
</script>

<template>
    <section id="research" class="ea-section bg-white">
        <div class="ea-container">
            <SectionHeading>
                <template #title>
                    {{ $t('research.titleLine1') }}<br />{{ $t('research.titleLine2') }}
                </template>
                <template #lead>
                    <p class="ea-lead--tight max-w-[620px]">{{ $t('research.lead') }}</p>
                </template>
            </SectionHeading>

            <ul class="mt-12 grid grid-cols-1 gap-8 tablet:grid-cols-2 tablet-wide:mt-16 tablet-wide:grid-cols-3 tablet-wide:gap-8">
                <li v-for="(post, index) in RESEARCH_POSTS" :key="post.id" v-reveal="index * 90">
                    <a :href="post.href" class="group flex h-full flex-col gap-6">
                        <div class="ea-media ea-media-hover aspect-[421/248] w-full rounded-2xl bg-Tinted/50">
                            <AppPicture
                                :media="post.media"
                                loading="lazy"
                                sizes="(min-width: 1024px) 421px, (min-width: 600px) 45vw, 90vw"
                                img-class="h-full w-full rounded-2xl object-cover"
                            />
                        </div>
                        <div>
                            <!-- Not .ea-h3: the research card's title is drawn
                                 18/26 at every width, where .ea-h3 steps up to
                                 20/28 at tablet-wide for the how-it-works step
                                 cards. Same role, two sizes — so this one is
                                 written out rather than sharing the class. -->
                            <h3
                                class="font-poppins text-[18px] font-semibold leading-[26px] tracking-[-0.5px] text-Tinted/950 transition-colors duration-300 group-hover:text-Blue/600"
                            >
                                {{ $t(`research.posts.${post.id}.title`) }}
                            </h3>
                            <p class="ea-body--sm mt-2">{{ $t(`research.posts.${post.id}.excerpt`) }}</p>
                        </div>
                    </a>
                </li>
            </ul>

            <div v-reveal="120" class="mt-14 flex justify-center">
                <AppButton :label="$t('research.more')" href="/research" variant="stroke" :arrow="false" />
            </div>
        </div>
    </section>
</template>
