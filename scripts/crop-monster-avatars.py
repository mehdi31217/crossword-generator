#!/usr/bin/env python3
"""Turn raw monster artwork into square, face/figure-focused portraits.

The in-game avatar is a small circle (56–80 px), so a full page scan is
unreadable there. This script:
  1. trims the painted area out of manuscript page scans (same detector as
     smart-crop.py),
  2. finds the square window with the densest painted detail (edge + colour
     energy, with a mild centre prior),
  3. writes a 512x512 JPEG over the old generated SVG path.

Manual boxes are fractions of the raw source and are applied before detection.
"""
import argparse
import json
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "public", "images", "_raw", "monsters")
OUT = os.path.join(ROOT, "public", "images", "monsters")
SIZE = 512

# Fractional boxes in the original download (x0, y0, x1, y1).
# Multi-panel folios (text + two paintings) defeat the colour-blob detector: it
# keeps the calligraphy because that is the largest "colourful" blob. These
# boxes frame just the painted panel for the labour.
MANUAL_CROPS = {
    "rostam7/khan1-lion.jpg": (0.140, 0.478, 0.504, 0.700),
    "rostam7/khan2-skull.jpg": (0.428, 0.631, 0.725, 0.831),
    "rostam7/khan3-dragon.jpg": (0.163, 0.226, 0.558, 0.525),
    "rostam7/khan4-witch.jpg": (0.470, 0.390, 0.890, 0.730),
    "rostam7/khan5-warrior.jpg": (0.343, 0.445, 0.709, 0.668),
    "rostam7/khan6-demon.jpg": (0.192, 0.523, 0.682, 0.856),
    "rostam7/khan7-white-beast.jpg": (0.570, 0.596, 0.960, 0.834),
    # Folios with a text block plus a framed painting: the detector reliably
    # prefers the calligraphy, so the painting panel is measured by hand.
    "esfandiyar/ch5-monster.jpg": (0.050, 0.335, 0.420, 0.705),
    "afrasiab/monster7.jpg": (0.200, 0.580, 0.720, 0.820),
    "rostam-akvan/ch1-monster.jpg": (0.300, 0.265, 0.760, 0.495),
    "rostam-akvan/ch2-monster.jpg": (0.450, 0.330, 0.900, 0.620),
    "rostam-death/ch1-monster.jpg": (0.160, 0.290, 0.520, 0.530),
    "rostam-esfandiyar/ch3-monster.jpg": (0.200, 0.125, 0.660, 0.345),
    "siavoshan/ch4-monster.jpg": (0.380, 0.350, 0.880, 0.620),
    "zahhak/ch3-monster.jpg": (0.420, 0.290, 0.800, 0.570),
    "kaykhosrow/ch6-monster.jpg": (0.020, 0.220, 0.700, 0.880),
    "kaykhosrow/ch1-monster.jpg": (0.160, 0.145, 0.520, 0.735),
    "anushirvan/ch1-monster.jpg": (0.330, 0.430, 0.660, 0.700),
    "khosrow/ch3-monster.jpg": (0.300, 0.290, 0.960, 0.730),
    "khosrow/ch5-monster.jpg": (0.100, 0.420, 0.750, 0.710),
    "safavids/monster5.jpg": (0.250, 0.330, 0.850, 0.680),
    "safavids/monster3.jpg": (0.180, 0.100, 0.720, 0.550),
    "qajars/monster5.jpg": (0.200, 0.300, 0.820, 0.720),
    "sohrab/giant.jpg": (0.120, 0.140, 0.680, 0.820),
    "sohrab/dragon.jpg": (0.340, 0.245, 0.940, 0.605),
    "sohrab/elephant.jpg": (0.250, 0.000, 0.800, 1.000),
    "sohrab/lion.jpg": (0.030, 0.245, 0.330, 0.535),
    "tahmineh/ch1-monster.jpg": (0.020, 0.215, 0.620, 0.560),
    # Folktales: single subject portraits, framed by hand so the animal/object
    # sits in the middle of the 512px circle.
    "folktales/shangool/ch1-monster.jpg": (0.320, 0.060, 0.840, 0.840),
    "folktales/kadoo/ch1-monster.jpg": (0.050, 0.019, 0.950, 0.981),
    "folktales/khoros/ch1-monster.jpg": (0.260, 0.060, 0.780, 0.840),
    "folktales/mahi/ch1-monster.jpg": (0.130, 0.000, 0.790, 1.000),
    "folktales/boz/ch1-monster.jpg": (0.120, 0.085, 0.870, 0.725),
    "folktales/gonjeshk/ch1-monster.jpg": (0.120, 0.090, 0.670, 0.910),
    "folktales/gol/ch1-monster.jpg": (0.040, 0.080, 0.940, 0.880),
    "folktales/shab/ch1-monster.jpg": (0.050, 0.020, 0.700, 0.660),
    "siavoshan/sudabeh.jpg": (0.100, 0.450, 0.520, 0.780),
    "siavoshan/slaying.jpg": (0.100, 0.400, 0.900, 0.800),
    "safavids/monster1.jpg": (0.300, 0.120, 0.680, 0.500),
    "folktales/khaleh/ch1-monster.jpg": (0.340, 0.275, 0.640, 0.725),
    "folktales/mosh/ch1-monster.jpg": (0.110, 0.255, 0.730, 0.705),
    "folktales/dokhtar/ch1-monster.jpg": (0.210, 0.360, 0.910, 0.836),
    "folktales/siah/ch1-monster.jpg": (0.235, 0.070, 0.785, 0.428),
    "folktales/gorbeh/ch1-monster.jpg": (0.180, 0.433, 0.800, 0.927),
    "folktales/div/ch1-monster.jpg": (0.290, 0.471, 0.810, 0.889),
    "folktales/naneh/ch1-monster.jpg": (0.000, 0.125, 1.000, 0.875),
    # Boss = the chapter's antagonist: wolf, fox, cat, pelican instead of the
    # hero animal the story is named after.
    "folktales/boz/ch1-monster.jpg": (0.250, 0.050, 0.980, 0.900),
    "folktales/kadoo/ch1-monster.jpg": (0.400, 0.150, 0.980, 0.850),
    "folktales/khoros/ch1-monster.jpg": (0.220, 0.050, 0.920, 0.950),
    "folktales/gorbeh/ch1-monster.jpg": (0.250, 0.080, 0.950, 0.930),
    "folktales/gonjeshk/ch1-monster.jpg": (0.020, 0.020, 0.980, 0.900),
    "folktales/mahi/ch1-monster.jpg": (0.000, 0.040, 1.000, 0.760),
    "khosrow/ch1-monster.jpg": (0.460, 0.060, 0.980, 0.590),
    "qajars/monster4.jpg": (0.020, 0.050, 0.980, 0.950),
    "hushang/ch2-monster.jpg": (0.050, 0.330, 0.950, 0.960),
    "esfandiyar/ch5-monster.jpg": (0.050, 0.330, 0.950, 0.960),
    # Median kings: Deioces (portrait), a Mede nobleman (Persepolis relief),
    # and the Qizqapan rock-relief portrait; Darius on the Behistun relief.
    "seljuks/monster1.jpg": (0.180, 0.020, 0.820, 0.520),
    "seljuks/monster4.jpg": (0.130, 0.050, 0.800, 0.520),
    "parthians/monster2.jpg": (0.000, 0.010, 0.415, 0.946),
    "parthians/monster4.jpg": (0.360, 0.060, 0.900, 0.600),
    "medes/monster1.jpg": (0.160, 0.100, 0.840, 0.780),
    # King Astyages in chains before Cyrus (tapestry detail, 448x895).
    "medes/monster4.jpg": (0.000, 0.000, 1.000, 0.5006),
    "medes/monster2.jpg": (0.160, 0.120, 0.840, 0.430),
    # Cyaxares swings the axe at the Scythian chiefs (Dovaston litho).
    "medes/monster3.jpg": (0.480, 0.040, 0.930, 0.411),
    "achaemenids/monster4.jpg": (0.040, 0.020, 0.960, 0.720),
}

# Subject point for the landscape cover/chapter crops, when the centre of the
# avatar box is not the best framing (fractions of the raw image).
COVER_FOCUS = {
    "folktales/naneh/ch1-monster.jpg": (0.520, 0.350),
}


def is_page_scan(im):
    small = im.copy()
    small.thumbnail((220, 220), Image.LANCZOS)
    arr = np.asarray(small, dtype=np.float32) / 255.0
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    warm = arr[..., 2] <= arr[..., 0] + 0.06
    paper = ((mx > 0.72) & (sat < 0.30) & warm).mean()
    return paper > 0.18


def colour_mask(im):
    arr = np.asarray(im, dtype=np.float32) / 255.0
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    return ((sat > 0.26) & (mx > 0.18)).astype(np.float32)


def hue_map(arr):
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    d = mx - mn
    hue = np.zeros_like(mx)
    valid = d > 1e-4
    red = valid & (mx == r)
    green = valid & (mx == g) & ~red
    blue = valid & (mx == b) & ~red & ~green
    hue[red] = ((g - b)[red] / d[red]) % 6
    hue[green] = ((b - r)[green] / d[green]) + 2
    hue[blue] = ((r - g)[blue] / d[blue]) + 4
    return hue / 6.0


def painted_region(im):
    width, height = im.size
    small = im.copy()
    small.thumbnail((320, 320), Image.LANCZOS)
    arr = np.asarray(small, dtype=np.float32) / 255.0
    coloured = colour_mask(small) > 0
    hue = hue_map(arr)
    tile = 6
    cols, rows = small.width // tile, small.height // tile
    diverse = np.zeros((rows, cols))
    for row in range(rows):
        for col in range(cols):
            cell = coloured[row * tile:(row + 1) * tile, col * tile:(col + 1) * tile]
            if cell.mean() < 0.06:
                continue
            bins = np.floor(hue[row * tile:(row + 1) * tile, col * tile:(col + 1) * tile][cell] * 24).astype(int)
            counts = np.bincount(bins, minlength=24)
            diverse[row, col] = int((counts > max(2, 0.06 * cell.sum())).sum())
    mask = diverse >= 3
    if not mask.any():
        return (0, 0, width, height)
    mask = ndimage.binary_dilation(mask, np.ones((3, 3)), iterations=2)
    labels, count = ndimage.label(mask)
    sizes = ndimage.sum(mask, labels, range(1, count + 1))
    biggest = int(np.argmax(sizes)) + 1
    ys, xs = np.where(labels == biggest)
    sx = width / small.width
    sy = height / small.height
    box = (max(0, int(xs.min() * tile * sx)), max(0, int(ys.min() * tile * sy)),
           min(width, int((xs.max() + 1) * tile * sx)),
           min(height, int((ys.max() + 1) * tile * sy)))
    bw, bh = box[2] - box[0], box[3] - box[1]
    # Detection failure guards: keep the whole image rather than a stamp.
    if (bw * bh) < width * height * 0.12 or bw < width * 0.25 or bh < height * 0.2:
        return (0, 0, width, height)
    pad_x, pad_y = int(bw * 0.012), int(bh * 0.012)
    return (max(0, box[0] - pad_x), max(0, box[1] - pad_y),
            min(width, box[2] + pad_x), min(height, box[3] + pad_y))


def saliency(im, colour_first=False):
    """Edge + saturation energy per pixel, lightly centre-weighted.

    Chapter art frequently contains ruled calligraphy, which has more edge
    energy than the painting but almost no saturation. Weighting colour first
    keeps the window on the miniature instead of the text block.
    """
    g = im.convert("L").filter(ImageFilter.FIND_EDGES)
    edges = np.asarray(g, dtype=np.float32) / 255.0
    edges = ndimage.uniform_filter(edges, size=3)
    arr = np.asarray(im, dtype=np.float32) / 255.0
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    if colour_first:
        coloured = ((sat > 0.26) & (mx > 0.18)).astype(np.float32)
        energy = 0.22 * edges + 0.78 * ndimage.uniform_filter(coloured, size=5)
    else:
        energy = 0.72 * edges + 0.28 * sat
    h, w = energy.shape
    yy, xx = np.mgrid[0:h, 0:w]
    cy, cx = (h - 1) / 2, (w - 1) / 2
    dist = np.sqrt(((yy - cy) / max(h, 1)) ** 2 + ((xx - cx) / max(w, 1)) ** 2)
    return energy * (1.0 + 0.18 * np.exp(-(dist ** 2) / 0.08))


def best_square(im, colour_first=False):
    """Square window whose mean painted energy is highest, mild size bias."""
    w, h = im.size
    scale = 480 / max(w, h)
    small = im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS) if scale < 1 else im
    energy = saliency(small, colour_first=colour_first)
    sh, sw = energy.shape
    best = None
    for frac in (0.48, 0.56, 0.64, 0.72, 0.82):
        side = int(min(sh, sw) * frac)
        if side < 40:
            continue
        # Mean energy inside a side×side box, evaluated at every centre.
        means = ndimage.uniform_filter(energy, size=side, mode="nearest")
        half = side // 2
        y0, y1 = half, sh - half
        x0, x1 = half, sw - half
        if y1 <= y0 or x1 <= x0:
            continue
        inner = means[y0:y1, x0:x1]
        # Slight preference for larger crops: less risk of cutting a head.
        score = inner * (side / min(sh, sw)) ** 0.22
        iy, ix = np.unravel_index(int(np.argmax(score)), score.shape)
        y, x = y0 + iy - half, x0 + ix - half
        value = float(score[iy, ix])
        if best is None or value > best[0]:
            best = (value, x, y, side)
    if best is None:
        return square_centre(im)
    _, x, y, side = best
    # Pad the box a little so the figure is not glued to the circle edge.
    grow = int(side * 0.06)
    x = max(0, x - grow)
    y = max(0, y - grow)
    side = min(side + 2 * grow, sw - x, sh - y)
    fx, fy = sw / w, sh / h
    box = (int(x / fx), int(y / fy), int((x + side) / fx), int((y + side) / fy))
    # Make the box exactly square in the original pixels.
    side_o = min(box[2] - box[0], box[3] - box[1])
    return (box[0], box[1], box[0] + side_o, box[1] + side_o)


def trim_letterbox(im, tol=0.035):
    """Drop uniform bars the 3:2 chapter canvas adds around a taller painting."""
    arr = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
    h, w, _ = arr.shape
    std_x = arr.std(axis=(0, 2))
    std_y = arr.std(axis=(1, 2))
    keep_x = np.where(std_x > tol)[0]
    keep_y = np.where(std_y > tol)[0]
    if not len(keep_x) or not len(keep_y):
        return im
    return im.crop((int(keep_x[0]), int(keep_y[0]), int(keep_x[-1]) + 1, int(keep_y[-1]) + 1))


def square_centre(im):
    """Largest centred square, so a hand-framed box is used verbatim."""
    w, h = im.size
    side = min(w, h)
    x, y = (w - side) // 2, (h - side) // 2
    return (x, y, x + side, y + side)


def crop_one(src, rel, from_chapter=False):
    im = Image.open(src).convert("RGB")
    if rel in MANUAL_CROPS and not from_chapter:
        f = MANUAL_CROPS[rel]
        box = (int(f[0] * im.width), int(f[1] * im.height),
               int(f[2] * im.width), int(f[3] * im.height))
        im = im.crop(box)
        box = square_centre(im)
    else:
        if from_chapter:
            # The chapter art is already cropped to the painted scene; only the
            # composer's letterbox bars need removing.
            im = trim_letterbox(im)
        elif is_page_scan(im):
            im = im.crop(painted_region(im))
        box = best_square(im, colour_first=from_chapter)
    art = im.crop(box).resize((SIZE, SIZE), Image.LANCZOS)
    art = art.filter(ImageFilter.UnsharpMask(radius=1.2, percent=90, threshold=2))
    return art


def write_art(src, rel, debug, from_chapter=False):
    art = crop_one(src, rel, from_chapter=from_chapter)
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    art.save(dst, "JPEG", quality=90, optimize=True, progressive=True)
    art.save(os.path.join(debug, rel.replace(os.sep, "-")), "JPEG", quality=85)
    return dst


def wide_crop(im, focus, size):
    """Crop `size`'s aspect ratio around a subject point (fractions of w/h)."""
    w, h = im.size
    ratio = size[0] / size[1]
    if w / h >= ratio:
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    x = int(min(max(focus[0] * w - cw / 2, 0), w - cw))
    y = int(min(max(focus[1] * h - ch / 2, 0), h - ch))
    art = im.crop((x, y, x + cw, y + ch)).resize(size, Image.LANCZOS)
    return art.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))


def write_wide(src, dst_rel, focus, size):
    art = wide_crop(Image.open(src).convert("RGB"), focus, size)
    dst = os.path.join(ROOT, "public", "images", dst_rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    art.save(dst, "JPEG", quality=88, optimize=True, progressive=True)
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="", help="comma separated monster folder names")
    ap.add_argument("--files", default="", help="comma separated avatar rel paths to rebuild from raw")
    ap.add_argument("--sources", default="", help="JSON list of {rel, src} to crop from chapter art")
    ap.add_argument("--covers", action="store_true", help="also emit folktale cover and chapter art")
    ap.add_argument("--debug", default="/tmp/monster-crops")
    args = ap.parse_args()
    only = {s for s in args.only.split(",") if s}
    files = [s for s in args.files.split(",") if s]
    os.makedirs(args.debug, exist_ok=True)

    done = 0
    if files:
        for rel in files:
            base, _ext = os.path.splitext(rel)
            src = None
            for ext in (".jpg", ".jpeg", ".png", ".JPG", ".PNG"):
                cand = os.path.join(RAW, base + ext)
                if os.path.exists(cand):
                    src = cand
                    break
            if not src:
                print(f"MISS {rel}: no raw source")
                continue
            try:
                write_art(src, rel, args.debug)
            except Exception as exc:  # noqa: BLE001 - report and continue
                print(f"FAIL {rel}: {exc}")
                continue
            done += 1
            print(f"{rel} -> 512x512")
        if args.covers:
            for rel in files:
                f = MANUAL_CROPS.get(rel)
                if not rel.startswith("folktales/") or not f:
                    continue
                base, _ext = os.path.splitext(rel)
                src = next(
                    (os.path.join(RAW, base + ext) for ext in (".jpg", ".jpeg", ".png")
                     if os.path.exists(os.path.join(RAW, base + ext))), None)
                if not src:
                    continue
                focus = COVER_FOCUS.get(
                    rel, ((f[0] + f[2]) / 2, (f[1] + f[3]) / 2))
                slug = rel.split("/")[1]
                write_wide(src, f"folktales/{slug}.jpg", focus, (1100, 734))
                write_wide(src, f"folktales/{slug}/ch1.jpg", focus, (1280, 720))
                print(f"{slug}: cover + chapter art")
        print(f"cropped {done} avatars")
        return

    if args.sources:
        with open(args.sources) as fh:
            entries = json.load(fh)
        for entry in entries:
            rel = entry["rel"]
            if only and rel.split("/")[0] not in only:
                continue
            try:
                write_art(entry["src"], rel, args.debug, from_chapter=True)
            except Exception as exc:  # noqa: BLE001 - report and continue
                print(f"FAIL {rel}: {exc}")
                continue
            done += 1
            print(f"{rel} -> 512x512")
        print(f"cropped {done} avatars")
        return

    for base, _dirs, files in os.walk(RAW):
        folder = os.path.relpath(base, RAW)
        if folder == ".":
            continue
        if only and folder.split(os.sep)[0] not in only:
            continue
        for name in sorted(files):
            if not name.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            rel = os.path.join(folder, os.path.splitext(name)[0] + ".jpg")
            src = os.path.join(base, name)
            try:
                write_art(src, rel, args.debug)
            except Exception as exc:  # noqa: BLE001 - report and continue
                print(f"FAIL {rel}: {exc}")
                continue
            done += 1
            print(f"{rel} -> 512x512")
    print(f"cropped {done} avatars")


if __name__ == "__main__":
    main()
