<script setup lang="ts">
// `<html lang>` has to track the active locale, and with `strategy: 'no_prefix'`
// nothing sets it for us: there is no locale segment in the URL for the module to
// key off, so without this the document stays `lang="en"` however many times the
// footer's language selector is used. That is not cosmetic — assistive tech picks
// its pronunciation rules from this attribute, so German copy would be read out
// with English phonemes, and it is the signal search engines use for the page's
// language too.
//
// `language` (the BCP 47 tag, e.g. `de-DE`) rather than `code` (`de`), since the
// config carries the regional variants deliberately — es is es-ES and pt is
// pt-PT, not their Latin American forms.
const { locale, locales } = useI18n()

const language = computed(
    () => (locales.value as { code: string; language?: string }[])
        .find((entry) => entry.code === locale.value)?.language ?? locale.value
)

useHead({ htmlAttrs: { lang: language } })
</script>

<template>
    <NuxtPage />
</template>
