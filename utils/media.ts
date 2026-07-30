import type { MediaAsset } from '~/types/home'

// Every raster on this page is pre-encoded by scripts/optimize-assets.py into an
// AVIF + WebP + legacy-fallback set under the same directory and basename, so the
// asset descriptor is derivable rather than written out three times.
//
// The fallback is a JPEG for opaque artwork and a PNG only where an alpha channel
// is genuinely needed (the hero's rounded cards). A 1100x660 dashboard panel is
// ~40KB as JPEG against ~320KB as quantised PNG, and since AVIF/WebP serve
// essentially all real traffic, the fallback should not be the biggest file in
// the set.
//
// Why not @nuxt/image: the sources are fixed exports we control, already sized for
// their slot. A runtime image module would add a dependency and a transform step
// to produce files we can simply commit — and <picture> with explicit intrinsic
// dimensions is the fastest thing a browser can be handed.

/** Build the asset set for `/img/<dir>/<name>.{avif,webp,<fallback>}`.
 *  `width`/`height` are the INTRINSIC (layout) dimensions — always pass them,
 *  since they are what lets the browser reserve the box and hold CLS at zero.
 *  Files themselves are written at 2x those dimensions. */
export function mediaAsset(
    dir: string,
    name: string,
    width: number,
    height: number,
    options: { altKey?: string; fallback?: 'jpg' | 'png' } = {}
): MediaAsset {
    const base = `/img/${dir}/${name}`
    return {
        avif: `${base}.avif`,
        webp: `${base}.webp`,
        fallback: `${base}.${options.fallback ?? 'jpg'}`,
        width,
        height,
        altKey: options.altKey
    }
}
