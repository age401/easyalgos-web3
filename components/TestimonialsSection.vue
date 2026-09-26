<script setup lang="ts">
// Partner quotes on the second dark band — a 2x2 bento of bordered cards.
//
// The design draws two card widths that swap sides row to row: 787.2 + 48 + 524.8
// fills the 1360 column exactly, which is 3fr/2fr either side of a 48px gap. That
// is why the rows are two separate grids rather than one five-column grid — a
// single template cannot flip 3fr/2fr to 2fr/3fr on the second row, and faking it
// with column spans lands the seam 9.6px off because the extra grid gaps eat into
// the track widths.
//
// Card internals differ by width and the variant is stated in the data rather than
// derived from position, so a card can be re-ordered without silently changing
// shape:
//   feature — portrait + attribution on the left, headline pull-quote over the
//             body quote on the right. 192px portrait.
//   compact — portrait left of the quote, then a rule, then the attribution.
//             128px portrait, no headline.
//
// Figma strokes are INSIDE, so the drawn 40px card padding already contains the
// 2px rule; CSS puts the border outside the padding box, hence p-[38px] + border-2
// = the drawn 40 (and a tighter 24 on phones, where 40 would eat the measure).
// The border itself is a gradient (#404040 -> #262626), which CSS
// can only express as two backgrounds clipped to different boxes — padding-box
// carries the band colour so the card interior stays flush with the ground.
//
// Each block is a real <blockquote>/<figcaption> pair so the attribution is bound
// to its quote in the accessibility tree rather than just sitting near it. The
// portrait is a direct child of the <figure> (not of the caption) because
// <figcaption> must be the figure's first or last child, and here it is last.
//
// Portraits are greyscaled in CSS rather than baked into the files, so the same
// exports stay usable anywhere a colour portrait is wanted.
//
// The file only draws this section at 1920, so the narrower steps are ours. The
// two-up bento is held back to `desktop` rather than `tablet-wide`: the portrait
// and its 40px gutter do not scale with the column, so at 1024 a compact card's
// quote is squeezed to ~104px of measure — about four words a line. Below that the
// cards go full width, and their text column is capped at 640px so a full-width
// card does not stretch a 16px quote across the whole viewport. Below `tablet` the
// portrait stacks above the quote. Reading order is 1-2-3-4 at every width.
//
// `video` is undefined on all four entries for now, so no "Watch testimonial"
// affordance is rendered — same rule as the How-it-works steps: an affordance that
// does nothing is worse than none. Setting `video` on an entry in data/content.ts
// is the only change needed to light it up.
//
// /for-developers (3282:31975) draws the same band with its own two quotes in one
// 2fr/3fr row, so the cards are a prop and their copy lives under `ns`. The
// eyebrow and title stay the home page's — both pages draw the same pair.
//
// `dense` is that page's own phone treatment (frames 3412:7945 at 360,
// 3412:7990 at 600), held until `desktop`, where the feature layout takes over
// again: a 128 portrait (8px corners on a phone, 12 from 600), 14 / 140% quote,
// 12 / 140% attribution, 24 padding and 24 between cards, 48 from heading to
// first card. At 360 the card is one column — portrait, quote, attribution; from
// 600 the portrait sits left and the quote and attribution stack beside it, top
// aligned, 16 apart. No indent, no rule. The home page does not pass it.
import { TESTIMONIALS } from '~/data/content'
import type { Testimonial } from '~/types/home'

const props = withDefaults(
    defineProps<{
        items?: Testimonial[]
        /** i18n namespace the item copy is read from: `<ns>.items.<id>.*`. */
        ns?: string
        /** /for-developers' phone layout below `desktop` — see above. */
        dense?: boolean
    }>(),
    { items: () => TESTIMONIALS, ns: 'testimonials', dense: false }
)

// Drawn order runs down the page two at a time; the rows only exist to carry
// the alternating column template.
const rows = computed(() => {
    const out: Testimonial[][] = []
    for (let i = 0; i < props.items.length; i += 2) out.push(props.items.slice(i, i + 2))
    return out
})

const isWide = (item: Testimonial) => (item.width ?? (item.variant === 'feature' ? 'wide' : 'narrow')) === 'wide'
</script>

<template>
    <section
        data-dark-band
        class="ea-dark ea-section bg-Neutral/800 antialiased"
        :aria-label="$t('testimonials.srLabel')"
    >
        <div class="ea-container flex flex-col gap-12">
            <!-- The v2 build had no visible heading here, only an aria-label; the
                 v3 reference draws the usual eyebrow + H2 pair, and the H2 is
                 plain white with no gradient run. `mb-4` on top of the stack's
                 48px gap gives the drawn 64px down to the first card. -->
            <SectionHeading :eyebrow="$t('testimonials.eyebrow')" invert :class="dense ? 'desktop:mb-4' : 'mb-4'">
                <template #title>{{ $t('testimonials.title') }}</template>
            </SectionHeading>

            <div
                v-for="(row, rowIndex) in rows"
                :key="rowIndex"
                class="grid"
                :class="[
                    dense ? 'gap-6 desktop:gap-12' : 'gap-12',
                    isWide(row[0]) ? 'desktop:grid-cols-[3fr_2fr]' : 'desktop:grid-cols-[2fr_3fr]'
                ]"
            >
                <figure
                    v-for="(item, index) in row"
                    :key="item.id"
                    v-reveal="(rowIndex * 2 + index) * 80"
                    class="grid content-center gap-y-6 rounded-[20px] border-2 border-transparent
                           [background:linear-gradient(#171717,#171717)_padding-box,linear-gradient(115deg,#404040,#262626)_border-box]
                           tablet:gap-x-10 desktop:min-h-[325px]"
                    :class="[
                        dense ? 'p-[22px] desktop:p-[38px]' : 'p-6 tablet:p-[38px]',
                        dense
                            ? 'tablet:grid-cols-[128px_minmax(0,1fr)] tablet:gap-y-4 desktop:grid-cols-[192px_1fr] desktop:gap-y-[21px]'
                            : item.variant === 'feature'
                              ? 'tablet:grid-cols-[192px_minmax(0,640px)] tablet:gap-y-[21px] desktop:grid-cols-[192px_1fr]'
                              : 'tablet:grid-cols-[128px_minmax(0,640px)] tablet:gap-y-0 desktop:grid-cols-[128px_1fr]'
                    ]"
                >
                    <AppPicture
                        :media="item.media"
                        loading="lazy"
                        :img-class="
                            dense
                                ? 'h-[128px] w-[128px] rounded-[8px] object-cover grayscale tablet:rounded-[12px] desktop:h-[192px] desktop:w-[192px]'
                                : item.variant === 'feature'
                                  ? 'h-[128px] w-[128px] rounded-[12px] object-cover grayscale tablet:h-[192px] tablet:w-[192px]'
                                  : 'h-[112px] w-[112px] rounded-[12px] object-cover grayscale tablet:h-[128px] tablet:w-[128px]'
                        "
                        :class="dense ? 'tablet:col-start-1 tablet:row-span-2 tablet:row-start-1 desktop:row-span-1' : 'tablet:col-start-1 tablet:row-start-1'"
                    />

                    <blockquote
                        class="flex flex-col gap-4"
                        :class="
                            dense
                                ? 'tablet:col-start-2 tablet:row-start-1 desktop:row-span-2 desktop:self-center'
                                : item.variant === 'feature'
                                  ? 'tablet:col-start-2 tablet:row-span-2 tablet:row-start-1 tablet:self-center'
                                  : 'tablet:col-start-2 tablet:row-start-1'
                        "
                    >
                        <p
                            v-if="item.headline"
                            class="font-franklin text-[22px] font-medium leading-[26px] tracking-[0.01em] text-white"
                        >
                            &ldquo;{{ $t(`${ns}.items.${item.id}.headline`) }}&rdquo;
                        </p>
                        <!-- The body quote is indented under its headline on the
                             feature cards; the compact cards have nothing to indent
                             from. -->
                        <p
                            class="font-franklin text-Neutral/50"
                            :class="[
                                dense
                                    ? 'text-[14px] leading-[1.4] desktop:text-[16px] desktop:leading-[24px] desktop:tracking-[0.01em]'
                                    : 'text-[16px] leading-[24px] tracking-[0.01em]',
                                item.headline || item.indent ? (dense ? 'desktop:pl-6' : 'tablet:pl-6') : ''
                            ]"
                        >
                            &ldquo;{{ $t(`${ns}.items.${item.id}.quote`) }}&rdquo;
                        </p>

                        <!-- Withheld until a clip exists — see the header comment. -->
                        <a
                            v-if="item.video"
                            :href="item.video"
                            class="mt-1 inline-flex items-center gap-2.5 self-start rounded-full border border-Neutral/600 py-2 pl-2 pr-3 font-poppins text-[12px] leading-3 tracking-[0.01em] text-Neutral/300 transition-colors hover:border-Neutral/500 hover:text-white tablet:self-end"
                        >
                            <span class="h-4 w-4 rounded-full bg-[rgba(122,127,163,0.2)]" aria-hidden="true" />
                            {{ $t('testimonials.watch') }}
                        </a>
                    </blockquote>

                    <figcaption
                        :class="
                            dense
                                ? 'tablet:col-start-2 tablet:row-start-2 desktop:col-start-1'
                                : item.variant === 'feature'
                                  ? 'tablet:col-start-1 tablet:row-start-2'
                                  : 'border-t border-Neutral/600 pt-8 tablet:col-start-2 tablet:row-start-2 tablet:mt-8'
                        "
                    >
                        <!-- Drawn SemiBold; rendered Medium. Only Roboto 500 is
                             self-hosted, and 600 would be synthesised — a real
                             500 reads closer to the drawing than a faked 600. -->
                        <p
                            class="font-franklin font-medium text-Tinted/50"
                            :class="dense ? 'text-[12px] leading-[1.4] desktop:text-[14px] desktop:leading-[18px]' : 'text-[14px] leading-[18px]'"
                        >
                            {{ $t(`${ns}.items.${item.id}.name`) }}
                        </p>
                        <p
                            class="mt-0.5 font-franklin text-Neutral/300"
                            :class="dense ? 'text-[12px] leading-[1.4] desktop:text-[13px] desktop:leading-4' : 'text-[13px] leading-4'"
                        >
                            {{ $t(`${ns}.items.${item.id}.role`) }}
                        </p>
                    </figcaption>
                </figure>
            </div>

            <div v-reveal="240">
                <AppButton :label="$t('common.applyNow')" :href="APPLY_HREF" />
            </div>
        </div>
    </section>
</template>
