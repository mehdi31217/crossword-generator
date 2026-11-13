#!/usr/bin/env python3
"""Cut the clay console panels out of the approved game mockup.

The mockup (vibe_images/hybrid-clay-paper-game_*.png) is the design we agreed on,
so instead of re-inventing it in CSS we ship the real artwork and lay the live
grid / clue bar / keys on top of it. Each panel is cropped to the silhouette of
its clay body, gets a rounded alpha mask, and any painted-on game content inside
the area our DOM replaces is inpainted back to plain paper.

Geometry below is measured from the 1024x1280 source:
  board panel silhouette  x 161..868  y 137..790
  paper sheet inside it   x 194..830  y 160..758
  painted 7x7 grid        x 233..793  y 182..736   (8 ink lines, ~80px pitch)
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

SRC = 'vibe_images/hybrid-clay-paper-game_1793126620731_b5419988.png'
OUT = 'public/images/game'
CELL = 80  # painted grid pitch in source pixels

# (name, crop box, rounded-corner radius, list of rects to clean back to paper)
PANELS = [
    ('board-panel', (166, 141, 863, 787), 58, [
        # the painted 7x7 grid, its outer rule and the shadows they cast
        (227, 176, 799, 742),
    ]),
]


def paper_field(region: np.ndarray) -> np.ndarray:
    """Bilinear paper colour field over the painted grid, from the cells' own paper."""
    h, w, _ = region.shape
    gy, gx = 7, 7
    step_y, step_x = h / gy, w / gx
    coarse = np.zeros((gy, gx, 3))
    dark = np.zeros((gy, gx), bool)
    for r in range(gy):
        for c in range(gx):
            y0, y1 = int(r * step_y) + 6, int((r + 1) * step_y) - 6
            x0, x1 = int(c * step_x) + 6, int((c + 1) * step_x) - 6
            patch = region[y0:y1, x0:x1].reshape(-1, 3)
            paper_pix = patch[patch.mean(axis=1) > 140]  # drop ink, black cells, the gold ring
            med = np.median(paper_pix if len(paper_pix) > 40 else patch, axis=0)
            coarse[r, c] = med
            dark[r, c] = len(paper_pix) < (patch.shape[0] * 0.25)
    # discrete harmonic inpainting: dark cells take the mean of their paper neighbours
    for _ in range(40):
        nxt = coarse.copy()
        for r in range(gy):
            for c in range(gx):
                if not dark[r, c]:
                    continue
                acc, n = np.zeros(3), 0
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    rr, cc = r + dr, c + dc
                    if 0 <= rr < gy and 0 <= cc < gx and not dark[rr, cc]:
                        acc += coarse[rr, cc]
                        n += 1
                if n:
                    nxt[r, c] = acc / n
        coarse = nxt
    img = Image.fromarray(coarse.astype(np.uint8))
    return np.asarray(img.resize((w, h), Image.BICUBIC)).astype(float)


def clean_rect(a: np.ndarray, box, feather=3):
    """Replace painted ink inside box with plain paper: the sheet's own lighting
    field plus two bands of mottling, so the patch reads as paper and not glass."""
    x0, y0, x1, y1 = box
    reg = a[y0:y1, x0:x1].astype(float)
    h, w = reg.shape[:2]
    field = Image.fromarray(paper_field(reg.astype(np.uint8)).astype(np.uint8))
    field = np.asarray(field.filter(ImageFilter.GaussianBlur(9))).astype(float)
    rng = np.random.default_rng(7)
    # luminance-only grain: per-channel noise would read as coloured speckle
    def band(scale, amp):
        n = rng.normal(0, 1, (max(2, int(h * scale)), max(2, int(w * scale))))
        return (n - n.mean()) / n.std() * amp
    grain = np.asarray(Image.fromarray(
        np.clip(band(0.35, 1.0) * 40 + 128, 0, 255).astype(np.uint8)
    ).resize((w, h), Image.BICUBIC)).astype(float) - 128
    grit = np.asarray(Image.fromarray(
        np.clip(band(1.0, 1.0) * 5 + 128, 0, 255).astype(np.uint8)
    ).resize((w, h), Image.LANCZOS)).astype(float) - 128
    out = np.clip(field + (grain * 0.3 + grit * 0.14)[..., None], 0, 255).astype(np.uint8)
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rectangle([feather, feather, w - feather, h - feather], fill=255)
    mask = np.asarray(mask.filter(ImageFilter.GaussianBlur(feather))).astype(float) / 255.0
    m = mask[..., None]
    a[y0:y1, x0:x1] = (out * m + reg * (1 - m)).astype(np.uint8)


def rounded_alpha(size, radius):
    mask = Image.new('L', size, 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=radius, fill=255)
    return np.asarray(mask.filter(ImageFilter.GaussianBlur(0.8)))


def main():
    os.makedirs(OUT, exist_ok=True)
    a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.uint8)
    for name, box, radius, cleans in PANELS:
        for cx0, cy0, cx1, cy1 in cleans:
            clean_rect(a, (cx0, cy0, cx1, cy1))
        crop = a[box[1]:box[3], box[0]:box[2]].copy()
        alpha = rounded_alpha((crop.shape[1], crop.shape[0]), radius)
        rgba = np.dstack([crop, alpha]).astype(np.uint8)
        img = Image.fromarray(rgba)
        path = os.path.join(OUT, f'{name}.webp')
        img.save(path, 'WEBP', quality=85, method=6)
        print(f'{path} {img.size[0]}x{img.size[1]} {os.path.getsize(path)//1024} KB')


if __name__ == '__main__':
    main()
