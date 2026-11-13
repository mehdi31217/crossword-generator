"""Small raster helpers shared by the pressed-tile generator."""
import numpy as np
from PIL import Image
from scipy import ndimage


def load(path):
    return np.asarray(Image.open(path).convert("RGBA")).astype(np.float32)


def soft(mask, r=0.8):
    m = ndimage.gaussian_filter(mask.astype(np.float32), r)
    return np.clip(m, 0, 1)


def close_fill(m, o=3, c=7):
    m = ndimage.binary_closing(ndimage.binary_opening(m, np.ones((o, o))), np.ones((c, c)))
    return ndimage.binary_fill_holes(m)


def biggest(img, rule, win, minarea=300):
    """Largest connected blob of `rule` inside the window (x0, x1, y0, y1)."""
    m = rule & (img[..., 3] > 180)
    w = np.zeros(m.shape, bool)
    x0, x1, y0, y1 = win
    w[y0:y1, x0:x1] = True
    m = close_fill(m & w)
    lab, n = ndimage.label(m)
    best = None
    for i in range(1, n + 1):
        ys, xs = np.where(lab == i)
        if len(xs) < minarea:
            continue
        if best is None or len(xs) > best[0]:
            best = (len(xs), lab == i, (xs.min(), xs.max(), ys.min(), ys.max()))
    return best[1], best[2]
