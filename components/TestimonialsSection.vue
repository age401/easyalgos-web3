<script setup lang="ts">
// Partner quotes on the second dark band.
//
// Three centred blocks with generous air between them, exactly as drawn. Marked
// `data-dark-band` so the header inverts across it (useDarkBand).
//
// Each block is a real <blockquote>/<figcaption> pair so the attribution is bound
// to its quote in the accessibility tree rather than just sitting near it.
import { TESTIMONIALS } from '~/data/content'
</script>

<template>
    <section
        data-dark-band
        class="ea-dark ea-section bg-Neutral/800"
        :aria-label="$t('testimonials.srLabel')"
    >
        <div class="ea-container flex flex-col items-center gap-[88px] tablet-wide:gap-[140px]">
            <figure
                v-for="(item, index) in TESTIMONIALS"
                :key="item.id"
                v-reveal="index * 60"
                class="flex max-w-[640px] flex-col items-center text-center"
            >
                <AppPicture
                    :media="item.media"
                    loading="lazy"
                    :img-class="
                        item.isBrand
                            ? 'h-[92px] w-[92px] rounded-2xl bg-Neutral/700 object-contain p-3'
                            : 'h-[92px] w-[92px] rounded-2xl object-cover grayscale'
                    "
                />

                <blockquote class="mt-8">
                    <p class="font-franklin text-[1.0625rem] leading-[1.6] tracking-[0.01em] text-white tablet-wide:text-[1.25rem] tablet-wide:leading-[1.4]">
                        &ldquo;{{ $t(`testimonials.items.${item.id}.quote`) }}&rdquo;
                    </p>
                </blockquote>

                <figcaption class="mt-8">
                    <p class="font-poppins text-[16px] font-semibold leading-5 text-Tinted/50">
                        {{ $t(`testimonials.items.${item.id}.name`) }}
                    </p>
                    <p class="mt-1 font-franklin text-[14px] leading-[14px] text-Neutral/300">
                        {{ $t(`testimonials.items.${item.id}.role`) }}
                    </p>
                </figcaption>
            </figure>
        </div>
    </section>
</template>
