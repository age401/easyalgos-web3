#!/usr/bin/env python3
"""Shrink a GLB by decimating its baked animation keyframes.

3D Jutsu (and THREE.GLTFExporter generally) exports animation BAKED: every
channel gets a key on every frame, whether anything changed or not. For the
"EasyAlgos for Developers" hero that is 52,920 keyframes across 147 channels —
1.15 MB of file, of which only ~200 KB is geometry. The motion itself is twenty
cubes drifting slowly, so the overwhelming majority of those keys sit exactly on
the straight line between their neighbours and describe nothing.

This removes the ones that do nothing, and only those. For each channel it walks
forward from the last kept key and drops every run of keys that linear
interpolation already reproduces to within `--tol`. Nothing is resampled onto a
new grid and no key is moved, so anything the artist authored as a HARD CUT
survives exactly: this scene drifts its cubes sideways and teleports them back to
loop seamlessly, a 512-unit jump in one frame, and a jump is not collinear with
anything. That is the reason for tolerance-based decimation rather than the
obvious "resample to 12fps", which would smear those teleports across a frame or
two and visibly break the loop.

The tolerance is in the units of whatever the channel animates — scene units for
translation, quaternion components for rotation, a factor for scale, a 0..1
weight for morph targets. The default 0.002 is chosen against a scene ~512 units
across, so a positional error is ~1/250000 of the scene: several orders of
magnitude below one device pixel. Verified per channel, and the worst observed
deviation is reported.

It also writes the `.gz` and `.br` siblings, because the file has to be served
compressed and nothing else will do it: nitro's `compressPublicAssets` decides by
MIME type and skips `model/gltf-binary`, so an uncompressed GLB goes out at its
full 470 KB against 43 KB brotlied. What nitro DOES do is skip any file that
already has siblings and register them in its asset manifest with the right
`Content-Encoding` — so writing them here is the supported route, verified end to
end (br 42,872 / gzip 57,797 / identity 470,436 with the immutable cache header).

That makes the siblings part of the artefact rather than a build step, and a stale
sibling would be SERVED IN PREFERENCE to the model beside it — a silent, very
confusing wrong-geometry bug. So they are always rewritten together here, and if
no brotli tool can be found the existing ones are DELETED rather than left to rot.

Usage:
    python scripts/optimize-glb.py <in.glb> <out.glb> [--tol 0.002]

Re-run this whenever the scene is re-exported. Committing the raw export instead
is the mistake it exists to prevent.
"""

from __future__ import annotations

import argparse
import gzip
import json
import shutil
import struct
import subprocess
from pathlib import Path

NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}
FLOAT = 5126


def read_glb(path: Path) -> tuple[dict, bytes]:
    raw = path.read_bytes()
    magic, version, _ = struct.unpack_from("<III", raw, 0)
    if magic.to_bytes(4, "little") != b"glTF":
        raise SystemExit(f"{path} is not a GLB")
    if version != 2:
        raise SystemExit(f"unsupported glTF version {version}")

    gltf = None
    bin_chunk = b""
    off = 12
    while off < len(raw):
        clen, ctype = struct.unpack_from("<II", raw, off)
        body = raw[off + 8 : off + 8 + clen]
        kind = ctype.to_bytes(4, "little")
        if kind == b"JSON":
            gltf = json.loads(body.decode("utf-8"))
        elif kind == b"BIN\x00":
            bin_chunk = body
        off += 8 + clen + ((4 - clen % 4) % 4 if clen % 4 else 0)
    if gltf is None:
        raise SystemExit("no JSON chunk")
    return gltf, bin_chunk


def write_glb(path: Path, gltf: dict, blob: bytes) -> None:
    js = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    js += b" " * ((4 - len(js) % 4) % 4)
    blob += b"\x00" * ((4 - len(blob) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    out = bytearray()
    out += struct.pack("<III", int.from_bytes(b"glTF", "little"), 2, total)
    out += struct.pack("<II", len(js), int.from_bytes(b"JSON", "little"))
    out += js
    out += struct.pack("<II", len(blob), int.from_bytes(b"BIN\x00", "little"))
    out += blob
    path.write_bytes(bytes(out))


def accessor_floats(gltf: dict, blob: bytes, index: int) -> list[tuple[float, ...]]:
    """Read a float accessor as a list of per-element tuples. Animation accessors
    are always tightly packed floats, which is asserted rather than assumed."""
    acc = gltf["accessors"][index]
    if acc["componentType"] != FLOAT:
        raise SystemExit(f"accessor {index}: expected float, got {acc['componentType']}")
    view = gltf["bufferViews"][acc["bufferView"]]
    if view.get("byteStride") not in (None, NCOMP[acc["type"]] * 4):
        raise SystemExit(f"accessor {index}: interleaved animation data not handled")
    n = NCOMP[acc["type"]]
    start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
    flat = struct.unpack_from(f"<{acc['count'] * n}f", blob, start)
    return [tuple(flat[i * n : (i + 1) * n]) for i in range(acc["count"])]


def decimate(times: list[float], values: list[tuple[float, ...]], tol: float):
    """Indices to keep, and the worst error the dropped keys incur.

    Greedy: from the last kept key, extend the span as far as linear
    interpolation still reproduces every key inside it. O(n·span), and span is
    small wherever the motion is actually doing something."""
    keep = [0]
    worst = 0.0
    i = 0
    last = len(times) - 1
    while i < last:
        j = i + 1
        best_err = 0.0
        while j < last:
            span = times[j + 1] - times[i]
            err = 0.0
            if span > 0:
                for k in range(i + 1, j + 1):
                    u = (times[k] - times[i]) / span
                    for c in range(len(values[0])):
                        lin = values[i][c] + (values[j + 1][c] - values[i][c]) * u
                        err = max(err, abs(lin - values[k][c]))
                        if err > tol:
                            break
                    if err > tol:
                        break
            if err > tol:
                break
            best_err = err
            j += 1
        keep.append(j)
        worst = max(worst, best_err)
        i = j
    return keep, worst


def write_siblings(dst: Path) -> None:
    """The .gz and .br nitro will serve instead of the model. Either both are
    current or neither exists — see the module docstring on why a stale one is
    actively dangerous."""
    gz, br = dst.with_suffix(dst.suffix + ".gz"), dst.with_suffix(dst.suffix + ".br")

    with gzip.GzipFile(gz, "wb", compresslevel=9, mtime=0) as out:
        out.write(dst.read_bytes())

    try:
        import brotli  # type: ignore

        br.write_bytes(brotli.compress(dst.read_bytes(), quality=11))
    except ImportError:
        exe = shutil.which("brotli")
        if not exe:
            br.unlink(missing_ok=True)
            print("WARNING: no brotli (pip install brotli, or the brotli CLI).")
            print("         Removed any stale .br; the model will ship gzipped.")
            return
        subprocess.run([exe, "-q", "11", "-f", "-o", str(br), str(dst)], check=True)

    print(f"siblings: gzip {gz.stat().st_size:,}  brotli {br.stat().st_size:,}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path)
    ap.add_argument("dst", type=Path)
    ap.add_argument("--tol", type=float, default=0.002)
    args = ap.parse_args()

    gltf, blob = read_glb(args.src)
    before = args.src.stat().st_size

    if "animations" not in gltf:
        raise SystemExit("no animations to decimate")

    # Every accessor this file has is backed by its own bufferView, which is what
    # lets the rebuild below be a straight per-accessor copy. Bail rather than
    # silently corrupt anything if a re-export ever shares views.
    owners: dict[int, int] = {}
    for i, acc in enumerate(gltf["accessors"]):
        view = acc.get("bufferView")
        if view is None:
            raise SystemExit(f"accessor {i} has no bufferView (sparse?) — not handled")
        if view in owners:
            raise SystemExit(f"bufferView {view} shared by accessors {owners[view]} and {i}")
        owners[view] = i

    # ---------------------------------------------------------------- decimate --
    new_data: dict[int, bytes] = {}   # accessor index -> packed float bytes
    new_count: dict[int, int] = {}
    keys_before = keys_after = 0
    worst_err = 0.0
    worst_where = ""

    for anim in gltf["animations"]:
        for sampler in anim["samplers"]:
            if sampler.get("interpolation", "LINEAR") != "LINEAR":
                continue  # STEP keeps every key by definition; CUBICSPLINE has tangents
            t_acc, v_acc = sampler["input"], sampler["output"]
            times = [t[0] for t in accessor_floats(gltf, blob, t_acc)]
            raw_values = accessor_floats(gltf, blob, v_acc)
            if len(times) < 3:
                continue

            # Morph-target weights pack N weights per key, so the output accessor
            # is N times longer than the input. Group them back up before
            # decimating, or every key would be compared against the wrong one.
            stride = len(raw_values) // len(times)
            if stride * len(times) != len(raw_values):
                raise SystemExit("output/input length mismatch")
            values = [
                tuple(c for elem in raw_values[k * stride : (k + 1) * stride] for c in elem)
                for k in range(len(times))
            ]

            keep, err = decimate(times, values, args.tol)
            keys_before += len(times)
            keys_after += len(keep)
            if err > worst_err:
                worst_err, worst_where = err, anim.get("name", "(unnamed)")

            new_data[t_acc] = struct.pack(f"<{len(keep)}f", *(times[i] for i in keep))
            new_count[t_acc] = len(keep)
            flat = [c for i in keep for c in values[i]]
            new_data[v_acc] = struct.pack(f"<{len(flat)}f", *flat)
            new_count[v_acc] = len(keep) * stride
            # glTF REQUIRES min/max on an animation input accessor — a viewer reads
            # the clip's duration from it, so a stale max is a clip that ends early.
            gltf["accessors"][t_acc]["min"] = [times[keep[0]]]
            gltf["accessors"][t_acc]["max"] = [times[keep[-1]]]

    # ------------------------------------------------------------------ rebuild --
    # One fresh buffer, accessors in order, each 4-byte aligned. Untouched
    # accessors (all the geometry) are copied verbatim from the old blob.
    out = bytearray()
    for i, acc in enumerate(gltf["accessors"]):
        view = gltf["bufferViews"][acc["bufferView"]]
        if i in new_data:
            payload = new_data[i]
            acc["count"] = new_count[i]
        else:
            start = view.get("byteOffset", 0)
            payload = blob[start : start + view["byteLength"]]
        out += b"\x00" * ((4 - len(out) % 4) % 4)
        view["byteOffset"] = len(out)
        view["byteLength"] = len(payload)
        view.pop("byteStride", None)
        view["buffer"] = 0
        acc.pop("byteOffset", None)
        out += payload

    gltf["buffers"] = [{"byteLength": len(out)}]
    write_glb(args.dst, gltf, bytes(out))

    after = args.dst.stat().st_size
    print(f"keyframes {keys_before:,} -> {keys_after:,} ({keys_after / keys_before:.1%})")
    print(f"worst deviation {worst_err:.6f} (tolerance {args.tol}), in {worst_where}")
    print(f"{before:,} -> {after:,} bytes ({after / before:.1%})")
    write_siblings(args.dst)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
