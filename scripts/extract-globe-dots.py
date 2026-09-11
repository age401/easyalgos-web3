#!/usr/bin/env python3
"""Turn the Figma world map into a point cloud the browser can animate.

The drawn graphic — Figma "The_Solution" (3201:7987) on the developer page's
"module - The Solution" — is 3,447 individual vector dots, one per land cell of a
perspective-projected globe. Exported as SVG that is 810 KB of path data, which is
the wrong shape for this job twice over: it is far too heavy to ship, and a tree of
3,447 DOM nodes cannot be animated per-dot at 60fps.

So the geometry is extracted ONCE, here, into the smallest thing that still
describes every dot exactly: its centre and its two radii. That is all the runtime
needs — SolutionGlobe.vue draws the field to a canvas and can move, scale or fade
any dot individually, because a dot is four numbers rather than a node.

Each dot is drawn as a four-arc ellipse: `M` at the left extreme, then three `C`
segments through the bottom, right and top extremes, then `H`/`Z` to close. So the
four on-curve anchors ARE the ellipse's extremes, and the bounding box of the
anchors is the exact ellipse box — no curve flattening needed. The dots are
minutely tilted (a degree or two, from the projection); that is dropped, because at
2–3px there is nothing in it to see.

Sizes are not uniform and the variation is not noise: a cell near the limb of the
globe is foreshortened, so its width carries the curvature. Keeping per-dot width
AND height is what makes the flat field read as a sphere.

Usage
-----
The SVG is not committed — it is a 810 KB intermediate whose only purpose is this
script, and the Figma node is the real source. To regenerate after a design change:

  1. Figma > select "The_Solution" (3201:7987) > export as SVG.
     Or via the MCP server: download_assets on that node, take `svgAssets[0]`.
  2. python scripts/extract-globe-dots.py <path-to.svg>

which rewrites data/solutionGlobe.ts in place.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "solutionGlobe.ts"

# Quantisation. Positions land on a tenth of a drawn pixel, which at the largest
# size the field is ever rendered (760 box against the drawn 655 field, so ~1.16x)
# is a hair over a tenth of a device pixel — well inside a dot. Coarser starts to
# show, because the eye reads this lattice as rows and a ragged row is visible long
# before a misplaced dot is.
SCALE = 10
# Base-36 field widths, fixed so records need no separators: three chars carry
# 46,655 (the field is 6,547 tenths wide), one carries 35 (a radius is 20–34
# tenths). Eight chars per dot, so the whole field is one ~27 KB string — which
# builds into a 34 KB chunk, 18 KB over the wire, against 810 KB of SVG. Note
# that base-36 is already near-incompressible, so unlike the SVG this number does
# not improve much under gzip; the win is in the raw size, not the ratio.
POS_CHARS = 3
SIZE_CHARS = 1

TOKEN = re.compile(r"([MmCcLlHhVvZz])|(-?\d+(?:\.\d+)?)")
ARITY = {"M": 2, "L": 2, "C": 6, "H": 1, "V": 1, "Z": 0}


def anchors(d: str) -> list[tuple[float, float]]:
    """On-curve points of a path, in order. Absolute commands only — which is what
    Figma emits; a lowercase command would be silently mis-read, so assert."""
    points: list[tuple[float, float]] = []
    tokens = TOKEN.findall(d)
    cursor = (0.0, 0.0)
    command = ""
    i = 0
    while i < len(tokens):
        head, number = tokens[i]
        if head:
            if head.islower():
                raise ValueError(f"relative path command {head!r} not handled")
            command = head
            i += 1
            continue
        if not command:
            raise ValueError("path data began with a coordinate")
        need = ARITY[command]
        args: list[float] = []
        while len(args) < need and i < len(tokens) and not tokens[i][0]:
            args.append(float(tokens[i][1]))
            i += 1
        if command in ("M", "L"):
            cursor = (args[0], args[1])
        elif command == "C":
            cursor = (args[4], args[5])  # the segment's end point
        elif command == "H":
            cursor = (args[0], cursor[1])
        elif command == "V":
            cursor = (cursor[0], args[0])
        points.append(cursor)
    return points


def b36(value: int, width: int) -> str:
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    value = int(value)
    while value:
        value, r = divmod(value, 36)
        out = digits[r] + out
    out = out.rjust(width, "0")
    if len(out) > width:
        raise ValueError(f"{value} does not fit in {width} base-36 chars")
    return out


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    svg = Path(sys.argv[1]).read_text(encoding="utf-8")

    view = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    if not view:
        raise SystemExit("no viewBox on the SVG root")
    field_w, field_h = float(view.group(1)), float(view.group(2))

    fills = set(re.findall(r'fill="(#[0-9A-Fa-f]{6})"', svg))
    paths = re.findall(r'<path[^>]*\sd="([^"]+)"', svg)
    if not paths:
        raise SystemExit("no <path> elements found")

    records = []
    for d in paths:
        points = anchors(d)
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        cx = (min(xs) + max(xs)) / 2
        cy = (min(ys) + max(ys)) / 2
        rx = (max(xs) - min(xs)) / 2
        ry = (max(ys) - min(ys)) / 2
        records.append(
            b36(round(cx * SCALE), POS_CHARS)
            + b36(round(cy * SCALE), POS_CHARS)
            + b36(round(rx * 2 * SCALE), SIZE_CHARS)
            + b36(round(ry * 2 * SCALE), SIZE_CHARS)
        )

    blob = "".join(records)
    # Wrapped so the emitted module is diffable and no line is absurd; the parts
    # are concatenated back in the TS, which costs nothing at module scope.
    width = 96
    lines = [blob[i : i + width] for i in range(0, len(blob), width)]
    body = "\n".join(f"    '{line}' +" for line in lines)
    body = body.rstrip(" +")

    OUT.write_text(
        f"""// The dot field behind "module - The Solution" — a perspective-projected globe of
// {len(records)} land cells, from Figma "The_Solution" (3201:7987).
//
// GENERATED by scripts/extract-globe-dots.py. Do not hand-edit: re-export the node
// and re-run the script (its docstring has the two steps).
//
// Why the graphic arrives as data rather than as an asset: an SVG or a PNG of this
// map is one opaque object, and the brief is a field that ANIMATES — dots lighting
// up, drifting, arriving. As numbers, every dot is individually addressable and the
// whole field costs one canvas draw, so per-dot motion is free. See
// SolutionGlobe.vue, which is the only consumer.
//
// The blob is base-36, {POS_CHARS + POS_CHARS + SIZE_CHARS + SIZE_CHARS} chars per dot and no separators: centre x, centre y
// (both {POS_CHARS} chars), then width and height ({SIZE_CHARS} char each), every value in tenths of
// a drawn pixel. {len(blob) // 1024} KB of string against 810 KB of the equivalent SVG — 18 KB over
// the wire, in its own chunk that arrives with the section — and it decodes in one
// pass into four typed arrays. See `decodeGlobeField`.

/** The drawn field's own box, in the coordinate space the values below are in.
 *  SolutionGlobe.vue places this inside the larger animation frame. */
export const GLOBE_FIELD = {{ width: {field_w}, height: {field_h} }} as const

/** Every cell is this one colour in the export — Tinted/700. The runtime lightens
 *  and dims from it rather than carrying a colour per dot. */
export const GLOBE_INK = '{sorted(fills)[0] if fills else "#51567A"}'

/** Tenths of a pixel per unit, i.e. what to divide a decoded value by. */
const UNIT = {SCALE}
const POS = {POS_CHARS}
const SIZE = {SIZE_CHARS}
const STRIDE = POS * 2 + SIZE * 2

const FIELD =
{body}

export interface GlobeField {{
    count: number
    /** Centres, in the field's own coordinate space. */
    x: Float32Array
    y: Float32Array
    /** Radii. Not one number: a cell near the limb of the globe is foreshortened,
     *  and that per-dot squash is what makes a flat field read as a sphere. */
    rx: Float32Array
    ry: Float32Array
}}

let cached: GlobeField | null = null

/** Decode the field. Cached: the arrays are immutable geometry, so a second
 *  instance of the graphic shares them rather than re-parsing 27 KB. */
export function decodeGlobeField(): GlobeField {{
    if (cached) return cached

    const count = FIELD.length / STRIDE
    const field: GlobeField = {{
        count,
        x: new Float32Array(count),
        y: new Float32Array(count),
        rx: new Float32Array(count),
        ry: new Float32Array(count)
    }}

    for (let i = 0; i < count; i++) {{
        let at = i * STRIDE
        field.x[i] = parseInt(FIELD.slice(at, (at += POS)), 36) / UNIT
        field.y[i] = parseInt(FIELD.slice(at, (at += POS)), 36) / UNIT
        field.rx[i] = parseInt(FIELD.slice(at, (at += SIZE)), 36) / UNIT / 2
        field.ry[i] = parseInt(FIELD.slice(at, at + SIZE), 36) / UNIT / 2
    }}

    cached = field
    return field
}}
""",
        encoding="utf-8",
    )

    print(f"{len(records)} dots -> {OUT.relative_to(ROOT)} ({len(blob)} chars)")
    print(f"field {field_w} x {field_h}, ink {sorted(fills)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
