// Composition-API i18n (legacy: false), matching the reference project.
// Numbers are formatted per locale so "7,435" / "7.435" follow the reader's
// convention without any per-component branching.
export default defineI18nConfig(() => ({
    legacy: false,
    fallbackLocale: 'en',
    // Silence the "not found" warnings for keys that are intentionally shared
    // (proper nouns, EA names) and resolved from data modules instead.
    missingWarn: false,
    fallbackWarn: false
}))
