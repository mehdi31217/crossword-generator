#!/usr/bin/env python3
"""Build a visual contact sheet for one or more monster folders."""
import argparse
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images", "monsters")
SHEETS = "/tmp/monster-sheets"
TILE = 190
LABEL = 22
COLS = 4


def font():
    for p in ("/System/Library/Fonts/Supplemental/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, 13)
            except Exception:
                pass
    return ImageFont.load_default()


def sheet(folder):
    base = os.path.join(OUT, folder)
    files = sorted(f for f in os.listdir(base) if f.lower().endswith(".jpg"))
    if not files:
        return None
    rows = (len(files) + COLS - 1) // COLS
    canvas = Image.new("RGB", (COLS * TILE, rows * (TILE + LABEL)), "#101014")
    draw = ImageDraw.Draw(canvas)
    f = font()
    for i, name in enumerate(files):
        im = Image.open(os.path.join(base, name)).convert("RGB")
        im.thumbnail((TILE - 10, TILE - 10), Image.LANCZOS)
        x = (i % COLS) * TILE + (TILE - im.width) // 2
        y = (i // COLS) * (TILE + LABEL) + (TILE - im.height) // 2
        canvas.paste(im, (x, y))
        draw.text(((i % COLS) * TILE + 6, (i // COLS) * (TILE + LABEL) + TILE + 3),
                  name[:30], fill="#e8e8e8", font=f)
    os.makedirs(SHEETS, exist_ok=True)
    dst = os.path.join(SHEETS, folder + ".jpg")
    canvas.save(dst, "JPEG", quality=88)
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folders", nargs="+")
    args = ap.parse_args()
    for folder in args.folders:
        p = sheet(folder)
        print(p or f"empty: {folder}")


if __name__ == "__main__":
    main()
