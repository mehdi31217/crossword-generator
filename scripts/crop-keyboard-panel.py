#!/usr/bin/env python3
"""Cut the keyboard tray out of the approved board mockup.

`components/GameKeyboard.tsx` renders this file as the whole alphabet band: the
pro ceramic tiles, the orange deck and the gold bulb are the mockup's own pixels,
and the live buttons on top are invisible hit areas. Nothing is redrawn in CSS,
so the tray has to be cut from the poster exactly as it is printed.

The crop also carries a sliver of the room above the tray (paper of the clue
slab and a strip of wall in the top corners). The alpha mask keeps only the clay
tray: the largest warm-coloured blob, with its two top corners trimmed along the
tray's own rounded silhouette.

Geometry measured from vibe_images/clay-game-final-online.png (1024x1280):
  crop              x 38..991   y 876..1278     -> 953x402
  straight top edge y 13
  key rows          y 104 / 195 / 287, pitch 71.27 / 77.7 / 81.5
  left corner arc   (80, 0) -> (22, 60)
  right corner arc  (872, 0) -> (938, 74), then eases out to the crop edge
"""
from PIL import Image
import numpy as np
from scipy import ndimage
import os

SRC = 'vibe_images/clay-game-final-online.png'
OUT = 'public/images/game/keyboard-panel.webp'
BOX = (38, 876, 991, 1278)
QUALITY = 92


def clay_body(rgb: np.ndarray) -> np.ndarray:
    """Largest connected warm-orange region: the tray itself."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    warm = (g / np.maximum(r, 1) < 0.735) & (r >= 105) & ((r - b) >= 45)
    warm = ndimage.binary_closing(warm, np.ones((5, 5)))
    labels, _ = ndimage.label(warm)
    sizes = ndimage.sum(warm, labels, range(1, labels.max() + 1))
    body = labels == (int(np.argmax(sizes)) + 1)
    return ndimage.binary_fill_holes(body)


def corner_cuts(h: int, w: int) -> np.ndarray:
    """Everything outside the tray's rounded ends is room, not tray."""
    yy, xx = np.mgrid[0:h, 0:w]
    left = np.full(h, 8.0)
    for y in range(60):
        left[y] = max(8.0, 80 - np.sqrt(max(0.0, 58 ** 2 - (58 - y) ** 2)))
    right = np.full(h, float(w - 1))
    for y in range(h):
        if y < 74:
            right[y] = min(938.0, 872 + np.sqrt(max(0.0, 66 ** 2 - (74 - y) ** 2)))
        elif y < 190:
            t = (y - 74) / 116.0
            right[y] = 938 + 14 * (0.5 - 0.5 * np.cos(np.pi * t))
    return (xx < left[yy]) | (xx > right[yy])


def main():
    rgb = np.asarray(Image.open(SRC).convert('RGB').crop(BOX)).astype(float)
    h, w, _ = rgb.shape
    body = clay_body(rgb)
    outside = corner_cuts(h, w)
    body &= ~outside
    body = ndimage.binary_dilation(body, np.ones((3, 3)))
    body = ndimage.binary_erosion(body, np.ones((3, 3)))
    alpha = ndimage.gaussian_filter(body.astype(float), 0.85)
    alpha = np.clip((alpha - 0.30) / 0.50, 0, 1)
    alpha[outside] = 0.0  # the blur must not pull wall back into the corners

    img = Image.fromarray(np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)]), 'RGBA')
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, 'WEBP', quality=QUALITY, method=6)
    print(f'{OUT} {img.size[0]}x{img.size[1]} {os.path.getsize(OUT) // 1024} KB')


if __name__ == '__main__':
    main()
