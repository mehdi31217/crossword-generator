#!/usr/bin/env python3
"""Build the pressed-state tiles from the approved artwork.

The approved look is the `recess2` recipe applied to the real raster: the control
sinks into the clay, its top lip darkens and the hollowed wall lightens. The app
cannot re-run that at runtime, so for every control that has a printed face we
render the panel once with *only that control* pressed and crop a padded tile
around it. A tile therefore carries the recess and nothing else -- neighbouring
controls stay exactly as the idle panel paints them, so tiles may overlap without
artefacts.

Emits `public/images/game/press/*.webp` plus `components/pressTiles.ts` (the rect
of each tile inside its panel, in panel pixels) so placement cannot drift from the
crop.

Run from the repo root:  python3 scripts/press-panels.py
"""
import os

import numpy as np
from scipy import ndimage
from PIL import Image

from press_gold import build as gold_mask
from press_recess import circle_alpha, round_alpha, recess2 as press
from press_shape import corners_alpha
from press_util import biggest, close_fill, load

GAME = "public/images/game/"
OUT = GAME + "press/"
TS = "components/pressTiles.ts"
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(OUT + f)

LUM = np.array([0.299, 0.587, 0.114])

# --- the approved parameter sets --------------------------------------------
KEY_P = dict(inset=3.2, dy=2.4, darken=0.975, wall_top=1.00, wall_bot=0.70, top_shadow=0.55,
             wall_tint=0.46, band=7.2, smooth=1.9, soft_px=1.1, ring_blur=1.3, shadow_len=0.34, grow=1)
GOLD_P = dict(KEY_P, grow=2, band=8.4, wall_bot=0.85)
DISC_P = dict(inset=0.0, dy=0.8, darken=0.900, wall_top=1.00, wall_bot=0.45, top_shadow=0.28,
              wall_tint=0.75, band=5.2, smooth=0.8, ring_blur=0.7, shadow_len=0.5)
PILL_P = dict(inset=2.2, dy=1.5, darken=0.966, wall_top=1.00, wall_bot=0.60, top_shadow=0.13,
              wall_tint=0.45, band=5.0, smooth=1.3, ring_blur=1.2, shadow_len=0.40, grow=1)
AV_P = dict(inset=1.8, dy=1.1, darken=0.966, wall_top=1.00, wall_bot=0.58, top_shadow=0.13,
            wall_tint=0.45, band=5.0, smooth=1.2, ring_blur=1.0, shadow_len=0.40)
CHEV_P = dict(inset=0.0, dy=0.0, darken=0.880, wall_top=0.0, wall_bot=0.0, top_shadow=0.26,
              wall_tint=0.0, band=-1)
CHIP_P = dict(inset=0.0, dy=0.0, darken=0.870, wall_top=0.0, wall_bot=0.0, top_shadow=0.20,
              wall_tint=0.0, band=-1)

PILL_BOX = (34.5, 190.5, 41.0, 103.5)
PILL_R = 31.25
AV_CX, AV_CY, AV_R = 686.8, 71.5, 49.0

tiles = {}


def crop_box(cx, cy, w, h, pad):
    return (int(round(cx - w / 2 - pad)), int(round(cy - h / 2 - pad)),
            int(round(cx + w / 2 + pad)), int(round(cy + h / 2 + pad)))


def emit(base, masks, box, name, shape_key, key=None):
    """press exactly one control, crop the box, save the tile + remember its rect"""
    rgb = base[..., :3].astype(np.float32).copy()
    for m, p in masks:
        rgb = press(rgb, m, **p)
    rgba = base.copy()
    rgba[..., :3] = rgb
    x0, y0, x1, y1 = box
    H, W = base.shape[:2]
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(W, x1), min(H, y1)
    # every part of the recess has to be inside the crop, else it is cut off
    for m, _ in masks:
        ys, xs = np.where(m > 0.35)
        if len(xs) and (xs.min() < x0 + 1 or xs.max() > x1 - 2 or ys.min() < y0 + 1 or ys.max() > y1 - 2):
            print("  !! %s recess reaches the crop edge (mask %d..%d x %d..%d, box %d..%d x %d..%d)"
                  % (name, xs.min(), xs.max(), ys.min(), ys.max(), x0, x1, y0, y1))
    tile = np.clip(rgba[y0:y1, x0:x1], 0, 255).astype(np.uint8)
    Image.fromarray(tile).save(OUT + name + ".webp", "WEBP", lossless=True, quality=100, method=6)
    # the src follows the *file*, not the manifest key: the online bar and the
    # online tray share their key prefixes with the solo ones
    tiles.setdefault(shape_key, {})[key or name] = (
        x0, y0, x1 - x0, y1 - y0, "/images/game/press/%s.webp" % name)
    return tile


# ---------------- keyboard ----------------
kb = load(GAME + "keyboard-panel.webp")
kb_rgb = kb[..., :3]
Rk, Gk, Bk = kb_rgb[..., 0], kb_rgb[..., 1], kb_rgb[..., 2]
al = kb[..., 3]
tilem = ((Rk - Bk) < 70) & (Gk > 120) & (al > 180)
gold = (Gk > 140) & (Bk < 130) & (Rk > 195) & ((Rk - Bk) > 100) & (al > 180)
km = close_fill(tilem | gold)
lab, n = ndimage.label(km)
keys = []
for i in range(1, n + 1):
    ys, xs = np.where(lab == i)
    if len(xs) < 1500:
        continue
    keys.append((ys.mean(), xs.mean(), lab == i, (xs.min(), xs.max(), ys.min(), ys.max())))
keys.sort(key=lambda a: (round(a[0] / 60), -a[1]))

# mirror of POSTER_ROWS in components/GameKeyboard.tsx
KEY_ROWS = [
    dict(cy=106, lastCx=866.5, pitch=71.03, w=55, h=57, cols=12),
    dict(cy=194.5, lastCx=864.5, pitch=77.8, w=61, h=62, cols=11),
    dict(cy=287.5, lastCx=848, pitch=81.25, w=63, h=64, cols=9),
]
HINT = dict(cx=107.5, cy=286, w=80, h=61)

groups = {}
for idx, k in enumerate(keys):
    groups.setdefault(round(k[0] / 60), []).append(idx)
order = sorted(groups)
print("keyboard groups:", [(g, len(groups[g])) for g in order])
assert [len(groups[g]) for g in order] == [r["cols"] for r in KEY_ROWS[:-1]] + [KEY_ROWS[-1]["cols"] + 1], "row counts"
# the third group carries the gold lamp as its leftmost key
lamp_idx = len(keys) - 1
for gi, g in enumerate(order):
    row = KEY_ROWS[gi]
    members = groups[g]
    for col, idx in enumerate(members):          # col 0 = rightmost
        if idx == lamp_idx:
            continue
        box = crop_box(row["lastCx"] - col * row["pitch"], row["cy"], row["w"], row["h"], 10)
        emit(kb, [(keys[idx][2], KEY_P)], box, "kb-r%dc%d" % (gi + 1, col), "keyboard")
lamp_box = crop_box(HINT["cx"], HINT["cy"], HINT["w"], HINT["h"], 10)
emit(kb, [(gold_mask(kb_rgb), GOLD_P)], lamp_box, "kb-lamp", "keyboard")

# ---------------- top bar ----------------
for variant, fname in (("topbar", "topbar.webp"), ("topbarOnline", "topbar-online.webp")):
    base = load(GAME + fname)
    rgb = base[..., :3]
    Lt = rgb @ LUM
    dr = (ndimage.gaussian_filter(Lt, 14) - Lt) > 6
    dr[:40] = False; dr[100:] = False; dr[:, :480] = False; dr[:, 630:] = False
    dm = close_fill(dr)
    lb, nn = ndimage.label(dm)
    discs = []
    for i in range(1, nn + 1):
        ys, xs = np.where(lb == i)
        if len(xs) < 500:
            continue
        discs.append((xs.min(), xs.max(), ys.min(), ys.max()))
    discs.sort()
    print(variant, "discs", [(int(a), int(b), int(c), int(d)) for a, b, c, d in discs])
    # the rival badge of the online bar merges into the right-hand disc, so the
    # three carve circles are taken from the solo bar -- same clay, same discs
    DISC_CIRCLES = [(512.0, 66.5, 21.3), (555.0, 66.5, 21.3), (598.0, 70.0, 22.3)]
    disc_masks = [circle_alpha(base.shape, cx, cy, r) for cx, cy, r in DISC_CIRCLES]
    pillar = corners_alpha(base.shape, PILL_BOX, (PILL_R,) * 4) > 0.5
    avatar_m = circle_alpha(base.shape, AV_CX, AV_CY, AV_R, ss=16)

    # BAR_SLOTS in components/Header.tsx (768x136)
    for name, (x, y, w, h), masks in (
        ("bulb", (490, 44, 44, 45), [(disc_masks[0], DISC_P)]),
        ("flip", (533, 44, 44, 45), [(disc_masks[1], DISC_P)]),
        ("home", (576, 44, 44, 45), [(disc_masks[2], DISC_P)]),
        ("purse", (39, 45, 145, 51), [(pillar, PILL_P)]),
        ("avatar", (634, 20, 108, 92), [(avatar_m, AV_P)]),
    ):
        box = (x - 10, y - 10, x + w + 10, y + h + 10)
        emit(base, masks, box, ("bar-" if variant == "topbar" else "baro-") + name, variant, "bar-" + name)

# ---------------- clue tray ----------------
for variant, fname, chev_win, dir_win in (
    ("clue", "clue-panel.webp", (672, 765, 45, 130), (555, 630, 45, 130)),
    ("clueOnline", "clue-panel-online.webp", (548, 632, 45, 130), (495, 560, 45, 130)),
):
    base = load(GAME + fname)
    c = base[..., :3]
    Lc = c @ LUM
    Rc, Bc = c[..., 0], c[..., 2]
    boxes = {}
    for key, win in (("prev", chev_win), ("next", (45, 130, 45, 130))):
        _, bb = biggest(base, (Lc < 168), win, 400)
        r = max(bb[1] - bb[0], bb[3] - bb[2]) / 2.0 - 0.3
        boxes[key] = (bb, circle_alpha(base.shape, (bb[0] + bb[1]) / 2.0, (bb[2] + bb[3]) / 2.0, r))
    _, dir_box = biggest(base, (Bc > Rc + 6) & (Bc > 80), dir_win, 400)
    boxes["dir"] = (dir_box, round_alpha(base.shape, dir_box, 11.0))
    print(variant, {k: v[0] for k, v in boxes.items()})
    # SLIP hit rects in components/ActiveClueBar.tsx (805x168)
    hits = {
        "prev": (690, 56, 54, 56), "next": (62, 56, 52, 56), "dir": (572, 66, 42, 42),
    } if variant == "clue" else {
        "prev": (562, 56, 54, 56), "next": (62, 56, 52, 56), "dir": (509, 66, 42, 42),
    }
    for key, (bb, mask) in boxes.items():
        x, y, w, h = hits[key]
        emit(base, [(mask, CHEV_P if key != "dir" else CHIP_P)], (x - 10, y - 10, x + w + 10, y + h + 10),
             ("clue-" if variant == "clue" else "clueo-") + key, variant, "clue-" + key)

# ---------------- manifest ----------------
def ts_shape(key, w, h):
    body = ",\n".join(
        "    '%s': { src: '%s', x: %d, y: %d, w: %d, h: %d }" % (k, v[4], *v[:4])
        for k, v in sorted(tiles[key].items())
    )
    return "export const %s: PressPanel = { w: %d, h: %d, tiles: {\n%s,\n} };" % (key, w, h, body)


DIMS = {"keyboard": (953, 402), "topbar": (768, 136), "topbarOnline": (768, 136),
        "clue": (805, 168), "clueOnline": (805, 168)}
header = """/* Generated by scripts/press-panels.py -- the pressed face of every printed
   control, rendered from the approved artwork with the same recess recipe as the
   sign-off image. `x/y/w/h` are pixels inside the panel named by the export. */
export interface PressTile { src: string; x: number; y: number; w: number; h: number }
export interface PressPanel { w: number; h: number; tiles: Record<string, PressTile> }
"""
with open(TS, "w") as fh:
    fh.write(header + "\n")
    for k in ("keyboard", "topbar", "topbarOnline", "clue", "clueOnline"):
        fh.write(ts_shape(k, *DIMS[k]) + "\n")
print("tiles:", {k: len(v) for k, v in tiles.items()})
