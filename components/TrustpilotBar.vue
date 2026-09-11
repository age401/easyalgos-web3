<script setup lang="ts">
// The Trustpilot strip under the home hero.
//
// This component is now only the BOX: a full-bleed band with rules top and
// bottom whose background and contents both track the page darkening as the
// section below arrives. The rating itself moved to TrustpilotRating when the
// developer-recruitment hero turned out to draw the same Figma component inline
// with no box around it — see the note there.
</script>

<template>
    <!-- Background, rules and content all track the page darkening, but not in
         the same way — see `.ea-trustpilot` in main.css. The background and the
         two rules are declared there rather than as utilities here because they
         are expressions, not fixed colours. -->
    <div class="ea-trustpilot">
        <!-- min-h pins the bar to the height it is drawn at (52px on phones,
             68px above 768 — the variable carries the switch), which is what the
             hero's `100svh - topbar - trustpilot` subtraction assumes. Content
             is untouched; it is still centred in whatever height it needs.
             py is 1px under Figma's 16/20 because Figma's borders are INSIDE
             strokes — its padding already contains the 1px rule, while CSS adds
             the border outside the padding box. -->
        <div
            class="ea-trustpilot__inner ea-container flex min-h-[calc(var(--ea-trustpilot-h)-2px)] items-center justify-center px-4 py-[15px] min-[769px]:py-[19px]"
        >
            <TrustpilotRating />
        </div>
    </div>
</template>
