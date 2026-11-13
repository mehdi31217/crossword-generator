#!/usr/bin/env python3
"""Find the painted region inside a scanned manuscript page.

Commons has many Shahnameh/Khamsa scans where the miniature occupies a fifth of
the page and the rest is ruled calligraphy. Feeding the whole page into the art
cards makes every panel look like a document screenshot, so the composer crops
to the painted region first.

The painted area is found by tiling the page and scoring each tile on hue
diversity: calligraphy blocks are gold paper plus black ink (one or two hues),
while a miniature brings blues, reds and greens together. The largest blob of
colourful tiles becomes the crop. Photographs and full-bleed paintings are left
uncropped.
"""
import argparse
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "public", "images", "_raw", "images")


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


def is_page_scan(im):
    """A manuscript page carries a lot of light, low-saturation paper.

    The paper must also be warm: a pale blue sky in a full-bleed miniature has
    the same brightness and saturation as vellum, and treating it as paper makes
    the detector zoom into whichever carpet happens to be the most colourful.
    """
    small = im.copy()
    small.thumbnail((220, 220), Image.LANCZOS)
    arr = np.asarray(small, dtype=np.float32) / 255.0
    mx = arr.max(axis=2)
    mn = arr.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1e-3)
    warm = arr[..., 2] <= arr[..., 0] + 0.06
    paper = ((mx > 0.72) & (sat < 0.30) & warm).mean()
    return paper > 0.18


def painted_region(im):
    """Bounding box of the tiled region whose colours are actually varied."""
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
    return (max(0, int(xs.min() * tile * sx)), max(0, int(ys.min() * tile * sy)),
            min(width, int((xs.max() + 1) * tile * sx)),
            min(height, int((ys.max() + 1) * tile * sy)))


# Photographs of a bound volume (page edges, mount, neighbouring leaf) defeat
# both the paper test and the colour blob. For these few the painted frame was
# measured by hand; boxes are fractions of the source image.
MANUAL_CROPS = {
    "chapters/rostam-death/ch1.jpg": (0.245, 0.182, 0.943, 0.735),
    "chapters/zal/ch2.jpg": (0.280, 0.225, 0.725, 0.765),
    "chapters/haft_peykar/ch4.jpg": (0.165, 0.240, 0.872, 0.678),
    "chapters/rostam-akvan/ch1.jpg": (0.110, 0.177, 0.713, 0.863),
    # Walters W.597 (Haft Khan): photos of one bound volume, each leaf offset
    # slightly, so the miniature frame was measured per page.
    "chapters/rostam7/khan1.jpg": (0.098, 0.224, 0.814, 0.734),
    "chapters/rostam7/khan2.jpg": (0.345, 0.515, 0.894, 0.838),
    "chapters/rostam7/khan3.jpg": (0.083, 0.285, 0.792, 0.800),
    "chapters/rostam7/khan4.jpg": (0.094, 0.228, 0.810, 0.740),
    "chapters/rostam7/khan5.jpg": (0.094, 0.233, 0.790, 0.736),
    "chapters/rostam7/khan6.jpg": (0.092, 0.224, 0.810, 0.738),
    "chapters/rostam7/khan7.jpg": (0.090, 0.278, 0.800, 0.770),
}


def best_window(im, key=None):
    if key in MANUAL_CROPS:
        x0, y0, x1, y1 = MANUAL_CROPS[key]
        return (int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height))
    if not is_page_scan(im):
        return (0, 0, im.width, im.height)
    box = painted_region(im)
    bw, bh = box[2] - box[0], box[3] - box[1]
    # A crop that keeps almost the whole page, or that keeps only a stamp-sized
    # piece of it, is a detection failure: leave the source untouched.
    if (bw * bh) < im.width * im.height * 0.12:
        return (0, 0, im.width, im.height)
    if bw < im.width * 0.25 or bh < im.height * 0.2:
        return (0, 0, im.width, im.height)
    pad_x, pad_y = int(bw * 0.012), int(bh * 0.012)
    return (max(0, box[0] - pad_x), max(0, box[1] - pad_y),
            min(im.width, box[2] + pad_x), min(im.height, box[3] + pad_y))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--debug", default="/tmp/crops")
    args = ap.parse_args()
    os.makedirs(args.debug, exist_ok=True)
    for p in args.paths:
        im = Image.open(p).convert("RGB")
        box = best_window(im)
        name = os.path.basename(os.path.dirname(p)) + "-" + os.path.basename(p)
        out = os.path.join(args.debug, name)
        im.crop(box).save(out, "JPEG", quality=85)
        print(f"{os.path.relpath(p, RAW)} {im.size} -> {box} {out}")


if __name__ == "__main__":
    main()
