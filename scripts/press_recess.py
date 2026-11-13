import numpy as np
from scipy import ndimage


def alpha_from_mask(m, soft_px=0.7):
    d = ndimage.distance_transform_edt(m) - ndimage.distance_transform_edt(~m)
    return np.clip(d + soft_px, 0.0, 1.0)


def circle_alpha(shape, cx, cy, r, ss=4):
    H, W = shape[:2]
    y0 = max(0, int(cy - r) - 2); y1 = min(H, int(cy + r) + 3)
    x0 = max(0, int(cx - r) - 2); x1 = min(W, int(cx + r) + 3)
    a = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    acc = np.zeros(yy.shape, np.float32)
    for i in range(ss):
        for j in range(ss):
            oy = (i + 0.5) / ss - 0.5
            ox = (j + 0.5) / ss - 0.5
            acc += (((xx + ox - cx) ** 2 + (yy + oy - cy) ** 2) <= r * r)
    a[y0:y1, x0:x1] = acc / (ss * ss)
    return a


def round_alpha(shape, box, radius, ss=4):
    H, W = shape[:2]
    x0b, x1b, y0b, y1b = box
    y0 = max(0, y0b - 2); y1 = min(H, y1b + 3)
    x0 = max(0, x0b - 2); x1 = min(W, x1b + 3)
    a = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    acc = np.zeros(yy.shape, np.float32)
    for i in range(ss):
        for j in range(ss):
            oy = (i + 0.5) / ss - 0.5
            ox = (j + 0.5) / ss - 0.5
            px = xx + ox; py = yy + oy
            dx = np.maximum(np.maximum(x0b + radius - px, px - (x1b - radius)), 0)
            dy = np.maximum(np.maximum(y0b + radius - py, py - (y1b - radius)), 0)
            inside = (px >= x0b) & (px <= x1b) & (py >= y0b) & (py <= y1b)
            acc += inside & ((dx ** 2 + dy ** 2) <= radius * radius)
    a[y0:y1, x0:x1] = acc / (ss * ss)
    return a


def _bilinear(img, u, v):
    H, W = img.shape[:2]
    u = np.clip(u, 0, W - 1.001)
    v = np.clip(v, 0, H - 1.001)
    x0 = np.floor(u).astype(np.int32)
    y0 = np.floor(v).astype(np.int32)
    x1 = np.minimum(x0 + 1, W - 1)
    y1 = np.minimum(y0 + 1, H - 1)
    fx = (u - x0)[..., None] if img.ndim == 3 else (u - x0)
    fy = (v - y0)[..., None] if img.ndim == 3 else (v - y0)
    a = img[y0, x0]
    b = img[y0, x1]
    c = img[y1, x0]
    d = img[y1, x1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def recess2(base, mask, inset=2.0, dy=1.5, darken=0.96, wall_top=1.0, wall_bot=0.45,
            top_shadow=0.16, wall_tint=0.46, grow=0, soft_px=0.9, band=0.0, smooth=1.1, ring_blur=1.0, shadow_len=1.0):
    external_alpha = mask.dtype != bool
    if external_alpha:
        mfl = mask.astype(np.float32)
        mask = mfl > 0.5
    if grow:
        mask = ndimage.binary_dilation(mask, iterations=grow)
    if smooth and not external_alpha:
        mask = ndimage.gaussian_filter(mask.astype(np.float32), smooth) > 0.5
        mask = ndimage.binary_fill_holes(mask)
    ys, xs = np.where(mask)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = 12
    Y0, Y1 = max(0, y0 - pad), min(base.shape[0], y1 + pad + 1)
    X0, X1 = max(0, x0 - pad), min(base.shape[1], x1 + pad + 1)
    sub = base[Y0:Y1, X0:X1].astype(np.float32)
    sm = mask[Y0:Y1, X0:X1]
    H, W = sm.shape

    w = x1 - x0 + 1
    h = y1 - y0 + 1
    ly0, lx0 = y0 - Y0, x0 - X0

    a_mask = sm.astype(np.float32) if external_alpha else alpha_from_mask(sm, soft_px)
    d_in = ndimage.distance_transform_edt(sm)

    bw = band if band != 0 else inset + 2.4
    ring = ndimage.gaussian_filter(np.clip(bw - d_in + 0.5, 0, 1) * a_mask, ring_blur)

    dil = ndimage.binary_dilation(sm, iterations=4) & ~sm
    wall_rgb = np.median(sub[dil], axis=0) if dil.any() else np.median(sub, axis=0)

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    gte = np.clip((yy - ly0) / max(1.0, h - 1), 0, 1)
    wstr = (wall_top + (wall_bot - wall_top) * gte)[..., None] * ring[..., None]
    wstr = np.clip(wstr, 0, 1)
    canvas = sub * (1 - wstr) + (wall_rgb * wall_tint) * wstr

    s = max(0.5, 1 - 2 * inset / min(w, h))
    cxl, cyl = lx0 + (w - 1) / 2.0, ly0 + (h - 1) / 2.0
    u = (xx - cxl) / s + cxl
    v = (yy - cyl - dy) / s + cyl
    face = _bilinear(sub, u, v)
    fa = np.clip(_bilinear(a_mask, u, v), 0, 1)
    tv = np.clip((v - ly0) / max(1.0, h - 1), 0, 1)
    ts = np.clip(tv / shadow_len, 0, 1)
    face = face * darken * (1 - top_shadow * (1 - ts) ** 2)[..., None]

    fa3 = fa[..., None]
    canvas = canvas * (1 - fa3) + face * fa3

    a3 = np.maximum(a_mask, fa)[..., None]
    res = base.astype(np.float32).copy()
    res[Y0:Y1, X0:X1] = sub * (1 - a3) + canvas * a3
    return np.clip(res, 0, 255)
