#!/usr/bin/env python3
"""Turn raw Figma PNG exports into the AVIF/WebP/PNG triples the page consumes.

Every raster in public/img exists as three files with the same basename:
    <name>.avif   modern, smallest
    <name>.webp   fallback for engines without AVIF
    <name>.png    last-resort fallback
AppPicture.vue emits them as a <picture> with explicit intrinsic dimensions, so
the browser picks the best encoding it understands and reserves the box before
any bytes arrive.

Files are written at 2x the layout size; data/content.ts declares the 1x
dimensions. That is the standard "2x asset, 1x layout box" arrangement — crisp on
retina, correct aspect ratio everywhere.

Usage:
    python scripts/optimize-assets.py <raw-dir>

`raw-dir` holds the PNGs pulled from Figma. Anything listed in JOBS but missing
from the directory is reported and skipped, so a partial asset set still
produces a complete, runnable page.
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'img'

# (source, out-subdir/name, crop, target-size-or-None)
# `crop` is either an explicit box in the SOURCE image's pixel space, the string
# 'alpha' to auto-crop to the opaque content, or None.
#
# The step-card sources are whole 660x588 cards exported at 2x, so the media panel
# is cropped out of them: the card has 32px padding around a 596x400 panel, i.e.
# (32,32)-(628,432) at 1x.
STEP_CROP = (64, 64, 1256, 864)

JOBS = [
    # --- "What you get" panel (2x of the 1100x660 slot) -----------------------
    ('dashboard.png', 'solutions/dashboard', (0, 0, 2200, 1320), (2200, 1320)),
    ('dashboard.png', 'solutions/expert-advisors', (0, 0, 2200, 1320), (2200, 1320)),
    # --- "How it works" step panels (2x of the 596x400 slot) -----------------
    ('card1.png', 'steps/connect', STEP_CROP, (1192, 800)),
    ('card2.png', 'steps/vps', STEP_CROP, (1192, 800)),
    # Steps 3 and 4 have no usable export: "Animation Card 03 - Frame 1" renders
    # clipped to 240px wide and "Animation Card 04 - Frame 1" renders empty (its
    # layers are hidden in the Figma file). They fall through to PLACEHOLDERS
    # below so the section is complete and obviously pending.
    ('card3.png', 'steps/deploy', STEP_CROP, (1192, 800)),
    ('card4.png', 'steps/results', STEP_CROP, (1192, 800)),
    # --- Research cards (native 1x; see notes) -------------------------------
    ('research1.png', 'research/dashboard-upgrade', None, None),
    ('research2.png', 'research/ai-window', None, None),
    ('research3.png', 'research/ai-bubble', None, None),
    # --- Testimonial portraits (128 native, shown at 92) ---------------------
    ('person1.png', 'people/icmarkets-tile', None, None),
    ('person2.png', 'people/kim-shearer', None, None),
    ('person3.png', 'people/wim-schrynemakers', None, None),
    # --- Hero background cards. Auto-cropped on alpha: the sources include up
    #     to 250px of soft shadow bleed, and the opaque bounding box is exactly
    #     the card, which is what the collage positions against. ---------------
    ('ghost-lg-a.png', 'hero/ghost-lg-a', 'alpha', (374, 438)),
    ('ghost-lg-b.png', 'hero/ghost-lg-b', 'alpha', (374, 438)),
    ('ghost-lg-c.png', 'hero/ghost-lg-c', 'alpha', (374, 438)),
    ('ghost-lg-d.png', 'hero/ghost-lg-d', 'alpha', (374, 438)),
    ('ghost-sm-a.png', 'hero/ghost-sm-a', 'alpha', (272, 320)),
    ('ghost-sm-b.png', 'hero/ghost-sm-b', 'alpha', (272, 320)),
    ('ghost-sm-c.png', 'hero/ghost-sm-c', 'alpha', (272, 320)),
    ('ghost-sm-d.png', 'hero/ghost-sm-d', 'alpha', (272, 320)),
    # --- EA avatars (2x of the 64px slot) ------------------------------------
    ('ea-quantum-king.png', 'ea/quantum-king', None, (128, 128)),
    ('ea-syna.png', 'ea/syna', None, (128, 128)),
    ('ea-gold-trader-pro.png', 'ea/gold-trader-pro', None, (128, 128)),
    ('ea-goldbot-one.png', 'ea/goldbot-one', None, (128, 128)),
    ('ea-range-breakout.png', 'ea/range-breakout', None, (128, 128)),
    ('ea-little-crazy.png', 'ea/little-crazy', None, (128, 128)),
]

# Panels with no usable Figma export yet. Rendered as a flat tinted card so the
# layout is exact and the gap is unmistakable, rather than shipping a stretched
# fragment that looks like a rendering bug.
PLACEHOLDERS = {
    'steps/deploy': (1192, 800),
    'steps/results': (1192, 800),
}
# An export smaller than this fraction of its target is treated as unusable.
MIN_USABLE_RATIO = 0.6


def encode(image: Image.Image, stem: Path) -> str:
    """Write the AVIF + WebP + legacy-fallback set and report the sizes.

    The fallback is a JPEG when the source is fully opaque and a PNG only when it
    actually needs an alpha channel. That matters: a 1192x800 dashboard panel is
    ~320KB as a quantised PNG and ~40KB as a JPEG, and since AVIF/WebP cover
    essentially all real traffic, the fallback is dead weight in the repo that
    should still not be 8x larger than the file everyone downloads.
    """
    stem.parent.mkdir(parents=True, exist_ok=True)

    opaque = image.mode != 'RGBA' or image.getchannel('A').getextrema() == (255, 255)
    flat = image.convert('RGB') if opaque else image

    flat.save(stem.with_suffix('.avif'), quality=58, speed=4)
    flat.save(stem.with_suffix('.webp'), quality=80, method=6)
    if opaque:
        flat.save(stem.with_suffix('.jpg'), quality=80, optimize=True, progressive=True)
        exts = ('avif', 'webp', 'jpg')
    else:
        image.save(stem.with_suffix('.png'), optimize=True)
        exts = ('avif', 'webp', 'png')

    return ' '.join(f'{ext}:{stem.with_suffix("." + ext).stat().st_size // 1024}k' for ext in exts)


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    """Bounding box of the near-opaque pixels.

    The hero card exports carry up to 250px of soft drop shadow around them, so
    the image box is nothing like the card box. The card is a solid white fill,
    the shadow is semi-transparent — thresholding alpha therefore recovers the
    exact card rectangle without having to know how the shadow was clipped by
    neighbouring cards.
    """
    if image.mode != 'RGBA':
        return None
    mask = image.getchannel('A').point(lambda value: 255 if value >= 250 else 0)
    return mask.getbbox()


def placeholder(size: tuple[int, int]) -> Image.Image:
    """A flat tinted panel standing in for a missing export."""
    return Image.new('RGBA', size, (240, 241, 247, 255))


def main() -> int:
    raw = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'assets-src'
    if not raw.is_dir():
        print(f'raw directory not found: {raw}')
        return 1

    missing, stubbed, done = [], [], 0
    for source, target, crop, size in JOBS:
        src = raw / source
        stub_size = PLACEHOLDERS.get(target)

        if not src.exists():
            if stub_size:
                work = placeholder(stub_size)
                sizes = encode(work, OUT / target)
                stubbed.append(target)
                print(f'  {target:<34} {work.width}x{work.height}  {sizes}  [placeholder]')
                done += 1
            else:
                missing.append((source, target))
            continue

        with Image.open(src) as image:
            work = image.convert('RGBA')
            if crop == 'alpha':
                box = alpha_bbox(work)
                if box:
                    work = work.crop(box)
            elif crop:
                # Clamp to the image so a slightly different export size degrades
                # to "as much as we have" instead of raising. A degenerate box
                # means the export is empty; leave the image alone and let the
                # usability check below route it to a placeholder.
                box = (
                    max(0, crop[0]), max(0, crop[1]),
                    min(work.width, crop[2]), min(work.height, crop[3]),
                )
                if box[2] > box[0] and box[3] > box[1]:
                    work = work.crop(box)

            # An export that came back far smaller than its slot is a clipped or
            # empty Figma render; a placeholder is more honest than upscaling it.
            if stub_size and work.width < stub_size[0] * MIN_USABLE_RATIO:
                print(f'  {target:<34} unusable export ({work.width}x{work.height})')
                work = placeholder(stub_size)
                stubbed.append(target)
            elif size:
                work = work.resize(size, Image.Resampling.LANCZOS)

            sizes = encode(work, OUT / target)

        print(f'  {target:<34} {work.width}x{work.height}  {sizes}')
        done += 1

    print(f'\n{done} asset(s) encoded into {OUT}')
    if stubbed:
        print(f'\n{len(stubbed)} placeholder(s) — need a real Figma export or the pending animation:')
        for target in stubbed:
            print(f'  {target}')
    if missing:
        print(f'\n{len(missing)} still missing a raw export:')
        for source, target in missing:
            print(f'  {target:<34} expects {raw.name}/{source}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
