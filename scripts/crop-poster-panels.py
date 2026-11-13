#!/usr/bin/env python3
"""Cut the top bar and the clue slab out of the approved mockups.

The mockups (vibe_images/mockups/final-solo.png / final-online.png) are the
design the game must show, so the panels ship as their own pixels: the clay, the
pills, the carved recesses and the printed chevrons are the artwork, and the DOM
lays only live values (coins, score, clock, clue number/text, direction arrow)
on top of them. Nothing is re-drawn in CSS.

Geometry measured from the 1024x1280 sources (poster pixels):

  top bar silhouette   x 130..886   y  18..142   r 40
    purse pill           x 163..313  y  53..116   digits x 204..308
    score pill           x 320..472  y  51..114   digits x 345..457
    dial                 cx 547 cy 84 r 55         digits x 526..574 y 74..100
    recesses             cx 722 / 679 / 636, cy 78, r 17
    avatar disc          cx 813 cy 80 r 50
  clue slab silhouette x 116..909   y 756..912   r 50
    slip                 x 152..888  y 795..888   (offline; online ends at 745)
    chevrons             cx 187 / 830 (offline), cx 187 / 700 (online), cy 843
    number chip          x 632..672  (online 565..602)
    direction square     x 682..730  (online 616..664)
    clue text            x 300..620  (online 225..528), y 816..860

    online only: reaction knob cx 846 cy 840 r 56

The panels sit on other clay (bar -> board frame, slab -> board above and the key
tray below), and the table behind them is warm terracotta too, so a colour mask
merges everything into one blob: the alpha is measured geometry, feathered, not
segmented.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import cv2
import os

SRC_SOLO = 'vibe_images/mockups/final-solo.png'
SRC_ONLINE = 'vibe_images/mockups/final-online.png'
OUT = 'public/images/game'
QUALITY = 93

# name -> (crop box, silhouette rounded rect, radius, inpaint boxes)
# every box is in poster coordinates; the crop box is padded past the silhouette
# so the feather has real pixels to fade into.
#
# A hollow's box spans the whole *hollow* (most of the pill's inner height), not
# just the ink: the Laplace fill then interpolates between the hollow's own top
# and bottom rows and keeps the pressed-clay gradient, instead of leaving a flat
# rectangle where the gradient used to be. Rings that touch a pill's rim drag the
# dark edge inside, so every box stays 4..6px inside its hollow.
PANELS = [
    ('topbar', SRC_SOLO, (124, 12, 892, 148), (130, 18, 886, 142), 40, [
        (217, 60, 296, 110),    # purse digits, inside the cream pill
        (380, 60, 422, 108),    # score digits, inside the olive pill
        (527, 64, 566, 104),    # clock digits, inside the dial's clay face
    ]),
    ('topbar-online', SRC_ONLINE, (124, 12, 892, 148), (130, 18, 886, 142), 40, [
        (217, 60, 296, 110),
        (357, 60, 450, 108),    # opponent digits + dot + own digits
        (527, 64, 566, 104),
    ]),
    ('clue-panel', SRC_SOLO, (110, 750, 915, 918), (116, 756, 909, 912), 50, [
        (297, 806, 624, 868),   # clue text
        (641, 827, 661, 848),   # number chip digit
        (687, 824, 716, 850),   # direction arrow inside the blue square
    ]),
    ('clue-panel-online', SRC_ONLINE, (110, 750, 915, 918), (116, 756, 909, 912), 50, [
        (232, 806, 559, 868),   # clue text
        (577, 827, 597, 848),
        (623, 824, 652, 850),
    ]),
]


def silhouette(size, rect, radius):
    """Feathered alpha for one rounded slab, measured rather than segmented."""
    mask = Image.new('L', size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(rect, radius=radius, fill=255)
    a = np.asarray(mask).astype(np.float32) / 255.0
    # the artwork's edge carries its own 1px shadow, so a light blur is enough to
    # kill the stair-step without making the clay look cut out with scissors
    return np.asarray(
        Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.9))
    ).astype(np.float32) / 255.0


def harmonic_fill(region, mask, iters=900):
    """Fill a hollow with the smoothest surface that meets its own rim.

    Telea/smearing pulled the pill's dark rim across the middle of the hollow; a
    Laplace solve only ever sees the rim pixels, so the cream stays cream and the
    gradient of the pressed pill survives inside the patch."""
    a = region.astype(np.float32)
    img = a.copy()
    h, w = mask.shape
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        free = np.where(~row)[0]
        if len(free) < 2:
            continue
        for x in np.where(row)[0]:
            left = free[free < x]
            right = free[free > x]
            if len(left) and len(right):
                l, r = left[-1], right[0]
                t = (x - l) / (r - l)
                img[y, x] = a[y, l] * (1 - t) + a[y, r] * t
            else:
                img[y, x] = a[y, left[-1] if len(left) else right[0]]
    for _ in range(iters):
        avg = (np.roll(img, 1, 0) + np.roll(img, -1, 0) +
               np.roll(img, 1, 1) + np.roll(img, -1, 1)) / 4.0
        img[mask] = avg[mask]
    return img


def inpaint(img, boxes, local):
    """Erase painted-on values (numbers, clock, arrow, clue text) so a live value
    can be drawn in the same hollow."""
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    rng = np.random.default_rng(11)
    for (x0, y0, x1, y1) in boxes:
        ox, oy = local
        x0, y0 = max(0, x0 - ox), max(0, y0 - oy)
        x1, y1 = min(a.shape[1], x1 - ox), min(a.shape[0], y1 - oy)
        if x1 <= x0 or y1 <= y0:
            continue
        # 1px past the requested box catches the ink's antialias without walking
        # into the hollow's rim
        px0, py0 = max(0, x0 - 1), max(0, y0 - 1)
        px1, py1 = min(a.shape[1], x1 + 1), min(a.shape[0], y1 + 1)
        mask = np.zeros((py1 - py0, px1 - px0), bool)
        mask[(y0 - py0):(y1 - py0), (x0 - px0):(x1 - px0)] = True
        patch = harmonic_fill(a[py0:py1, px0:px1], mask)
        grain = rng.normal(0, 2.4, mask.shape)[..., None]
        a[py0:py1, px0:px1] = patch + grain * mask[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def proof(img, boxes, name, local):
    """4x look at every cleaned hollow, for eyeballing the patch quality."""
    ox, oy = local
    tiles = []
    for (x0, y0, x1, y1) in boxes:
        box = (max(0, x0 - ox - 10), max(0, y0 - oy - 10), x1 - ox + 10, y1 - oy + 10)
        tile = img.crop(box).resize(((box[2] - box[0]) * 4, (box[3] - box[1]) * 4), Image.LANCZOS)
        tiles.append(tile)
    w = sum(t.width for t in tiles) + 8 * (len(tiles) - 1)
    h = max(t.height for t in tiles)
    sheet = Image.new('RGB', (w, h), (30, 30, 30))
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        x += t.width + 8
    sheet.save(f'/tmp/proof-{name}.png')


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, src, box, rect, radius, boxes in PANELS:
        img = Image.open(src).convert('RGB')
        crop = img.crop(box)
        crop = inpaint(crop, boxes, (box[0], box[1]))
        alpha = silhouette(crop.size, (rect[0] - box[0], rect[1] - box[1],
                                       rect[2] - box[0], rect[3] - box[1]), radius)
        out = crop.convert('RGBA')
        a = np.asarray(out).copy()
        a[..., 3] = (alpha * 255).astype(np.uint8)
        out = Image.fromarray(a)
        path = f'{OUT}/{name}.webp'
        out.save(path, 'WEBP', quality=QUALITY, method=6)
        proof(crop, boxes, name, (box[0], box[1]))
        print(f'{name:20s} {crop.size[0]}x{crop.size[1]}  {os.path.getsize(path)/1024:.1f} KB')


if __name__ == '__main__':
    main()
