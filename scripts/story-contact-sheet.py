#!/usr/bin/env python3
"""Build a labelled contact sheet so the artwork selection can be eyeballed.

    python3 scripts/story-contact-sheet.py zahhak kaveh --out=/tmp/sheets

Writes one montage per book: the cover first, then every chapter in order, each
tile captioned with its file name. `--source=composed` (default) shows the final
files players see; `--source=raw` shows the untouched Commons downloads.
"""
import argparse
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = {
    "raw": os.path.join(ROOT, "public", "images", "_raw"),
    "composed": os.path.join(ROOT, "public", "images"),
}
RAW = SOURCES["composed"]
CREDITS = os.path.join(ROOT, "public", "images", "story-credits.json")
THUMB = (360, 300)
PAD = 14
COLS = 4


def tile(path, label, font):
    im = Image.open(path).convert("RGB")
    im.thumbnail((THUMB[0], THUMB[1] - 26), Image.LANCZOS)
    canvas = Image.new("RGB", THUMB, (24, 24, 28))
    canvas.paste(im, ((THUMB[0] - im.width) // 2, (THUMB[1] - 26 - im.height) // 2))
    ImageDraw.Draw(canvas).text((6, THUMB[1] - 22), label, fill=(240, 230, 200), font=font)
    return canvas


def collect(book, credits):
    entries = [
        (c["kind"] == "cover" and -1 or (c.get("chapter") or 0), c)
        for c in credits.values() if c.get("book") == book
    ]
    paths = []
    for _, c in sorted(entries, key=lambda e: e[0]):
        out = c["out"]
        abs_path = next(
            (p for p in (
                os.path.join(RAW, out.lstrip("/")),
                os.path.join(RAW, out.replace("/images/", "/").lstrip("/")),
            ) if os.path.exists(p)),
            None,
        )
        if not abs_path:
            continue
        label = "COVER" if c["kind"] == "cover" else f"CH{c.get('chapter')}"
        paths.append((abs_path, label))
    return paths


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("books", nargs="+")
    ap.add_argument("--out", default="/tmp/sheets")
    ap.add_argument("--source", choices=sorted(SOURCES), default="composed")
    args = ap.parse_args()
    global RAW
    RAW = SOURCES[args.source]
    os.makedirs(args.out, exist_ok=True)
    font = ImageFont.load_default(size=20)
    credits = json.load(open(CREDITS, encoding="utf-8"))

    for book in args.books:
        paths = collect(book, credits)
        if not paths:
            print(f"{book}: nothing", file=sys.stderr)
            continue
        rows = (len(paths) + COLS - 1) // COLS
        sheet = Image.new("RGB", (COLS * (THUMB[0] + PAD) + PAD, rows * (THUMB[1] + PAD) + PAD), (10, 10, 12))
        for i, (path, label) in enumerate(paths):
            x = PAD + (i % COLS) * (THUMB[0] + PAD)
            y = PAD + (i // COLS) * (THUMB[1] + PAD)
            sheet.paste(tile(path, f"{book} {label}", font), (x, y))
        dst = os.path.join(args.out, f"{book}.jpg")
        sheet.save(dst, "JPEG", quality=80)
        print(f"{dst} ({len(paths)} tiles)")


if __name__ == "__main__":
    main()
