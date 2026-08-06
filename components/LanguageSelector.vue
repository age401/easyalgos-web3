<script setup lang="ts">
// Language selector — the footer's flag chip and its menu.
// Figma: button 681:6224, dropdown 681:6778, item 681:6444, flags 681:6457,
// in-place sample 687:7335.
//
// A disclosure, not the ARIA menu pattern. `role="menu"` carries a strict
// keyboard contract (roving tabindex, type-ahead, and menu items that are NOT
// tab stops), and getting half of it is worse than not claiming it at all. This
// is four buttons behind a toggle: `aria-expanded` on the trigger says what it
// does, each option is a real <button>, and Tab/Enter/Space work without any
// help from us. Arrow keys, Home/End and Escape are added on top as a
// convenience for anyone who expects them.
//
// The panel opens UPWARD (`bottom-full`) and is right-aligned to the chip, as
// drawn — the chip sits at the top of a very long footer, so opening downward
// would drop the menu over the link columns.
//
// The panel is `v-if`'d rather than hidden with CSS: it holds four focusable
// controls, and leaving them in the DOM behind `display:none` is the classic way
// to end up with a tab stop nobody can see. It server-renders closed.
//
// Flags are decorative. Each option is already labelled by its autonym, so the
// flag carries no information — `alt=""`, and it is never the only thing
// identifying a language. (A flag is a country, not a language; the text is what
// is actually being chosen, which is also why the trigger has a real
// `aria-label` naming the current language rather than relying on the image.)
const { locale, locales, setLocale } = useI18n()

/** Flag artwork per locale, exported from the Figma flag set. Keyed by locale
 *  code — the file names are country codes because that is what a flag is, and
 *  `en` is drawn as the US flag in the design. */
const FLAGS: Record<string, string> = { en: 'us', de: 'de', es: 'es', pt: 'pt' }

/** The configured locales, in nuxt.config order, with their autonyms. */
const options = computed(() =>
    (locales.value as { code: string; name?: string }[]).map((entry) => ({
        code: entry.code,
        // `name` is the autonym ("Deutsch", not "German") and is never translated.
        label: entry.name ?? entry.code.toUpperCase(),
        flag: FLAGS[entry.code] ?? 'us'
    }))
)

const current = computed(() => options.value.find((o) => o.code === locale.value) ?? options.value[0])

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)

function close(refocus = false) {
    if (!open.value) return
    open.value = false
    if (refocus) trigger.value?.focus()
}

async function toggle() {
    open.value = !open.value
    if (!open.value) return
    // Move into the panel so a keyboard user lands on the options rather than
    // having to tab past the trigger again.
    await nextTick()
    focusOption(options.value.findIndex((o) => o.code === locale.value))
}

function focusOption(index: number) {
    const items = panel.value?.querySelectorAll<HTMLButtonElement>('[data-option]')
    if (!items?.length) return
    // Wrap, so Up from the first lands on the last.
    items[(index + items.length) % items.length]?.focus()
}

function onPanelKeydown(event: KeyboardEvent) {
    const items = Array.from(panel.value?.querySelectorAll<HTMLButtonElement>('[data-option]') ?? [])
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'ArrowDown') { event.preventDefault(); focusOption(at + 1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); focusOption(at - 1) }
    else if (event.key === 'Home') { event.preventDefault(); focusOption(0) }
    else if (event.key === 'End') { event.preventDefault(); focusOption(items.length - 1) }
}

async function choose(code: string) {
    close(true)
    if (code !== locale.value) await setLocale(code as typeof locale.value)
}

// Escape anywhere closes and hands focus back; a pointer press outside closes
// without stealing focus. `pointerdown` rather than `click` so the menu is gone
// before whatever was clicked reacts.
function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') close(true)
}
function onPointerDown(event: PointerEvent) {
    if (open.value && !root.value?.contains(event.target as Node)) close()
}

onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onPointerDown)
})
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
    <div ref="root" class="relative">
        <!-- 46x36 with a 2px INSIDE stroke in Figma, so the CSS padding is 6 and
             not the 8 the file states: `border-box` counts the border, and
             2 + 6 + 30 + 6 + 2 is the drawn 46. -->
        <button
            ref="trigger"
            type="button"
            class="ea-lang__trigger"
            :aria-expanded="open"
            :aria-label="$t('footer.language', { language: current.label })"
            @click="toggle"
        >
            <img :src="`/img/flags/${current.flag}.svg`" alt="" width="30" height="20" class="h-5 w-[30px] rounded" />
        </button>

        <Transition name="ea-lang">
            <div
                v-if="open"
                ref="panel"
                class="ea-lang__panel"
                @keydown="onPanelKeydown"
            >
                <ul class="flex flex-col gap-1">
                    <li v-for="option in options" :key="option.code">
                        <button
                            type="button"
                            data-option
                            class="ea-lang__option"
                            :aria-current="option.code === locale ? 'true' : undefined"
                            :lang="option.code"
                            @click="choose(option.code)"
                        >
                            <img :src="`/img/flags/${option.flag}.svg`" alt="" width="30" height="20" class="h-5 w-[30px] shrink-0 rounded" />
                            {{ option.label }}
                        </button>
                    </li>
                </ul>
            </div>
        </Transition>
    </div>
</template>
