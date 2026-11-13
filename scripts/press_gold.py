"""Silhouette mask for the gold (lamp) key, taken from the artwork it is drawn on.

The tile is tilted, so its right flank slopes inwards and no rounded rect fits it.
The gold is separated from the clay tray by hue (tray ~20 deg, gold ~29-38 deg),
which keeps the shadowed flanks and drops the warm cast shadow.
"""
import numpy as np
from scipy import ndimage

WX0, WX1, WY0, WY1 = 56, 160, 246, 326
HUE_MIN = 26.0


def hue_deg(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    df = np.maximum(mx - mn, 1e-3)
    h = np.where(mx == r, (g - b) / df,
        np.where(mx == g, 2.0 + (b - r) / df, 4.0 + (r - g) / df)) * 60.0
    return h % 360.0


def build(rgb):
    """rgb: keyboard panel (H, W, 3) as float. Returns a bool mask of panel shape."""
    sub = np.asarray(rgb, np.float32)[WY0:WY1, WX0:WX1]
    m = (hue_deg(sub) >= HUE_MIN) & (sub.max(axis=2) >= 60.0)
    m = ndimage.binary_opening(m, np.ones((2, 2)))
    m = ndimage.binary_closing(m, np.ones((5, 5)))
    m = ndimage.binary_fill_holes(m)
    lab, n = ndimage.label(m)
    sizes = ndimage.sum(m, lab, range(1, n + 1))
    m = lab == (1 + int(np.argmax(sizes)))
    out = np.zeros(np.asarray(rgb).shape[:2], bool)
    out[WY0:WY1, WX0:WX1] = m
    ys, xs = np.where(out)
    print("gold mask bbox x", xs.min(), xs.max(), "y", ys.min(), ys.max(), "area", int(out.sum()))
    return out
