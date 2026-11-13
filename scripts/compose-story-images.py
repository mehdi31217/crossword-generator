#!/usr/bin/env python3
"""Compose the raw Commons downloads into the story-mode artwork set.

Shahnameh folios come in wildly different aspect ratios (tall album pages,
wide battle scenes, square photos of reliefs). This pass puts every one of them
on the same 4:3 canvas with a blurred, darkened copy of the artwork as the
backdrop, so a chapter grid reads as one curated set instead of a pile of
mismatched scans.

    python3 scripts/compose-story-images.py [--only=zahhak,kaveh]

Raw files live in public/images/_raw (git-ignored); finished JPEGs are written
to public/images/covers and public/images/chapters.

Before fitting, each scan is cropped to its painted region (see smart-crop.py)
so manuscript pages contribute their miniature rather than a wall of text.
"""
import argparse
import importlib.util
import io
import os
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "public", "images", "_raw", "images")
OUT = os.path.join(ROOT, "public", "images")

_spec = importlib.util.spec_from_file_location("smart_crop", os.path.join(ROOT, "scripts", "smart-crop.py"))
smart_crop = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(smart_crop)

COVER_SIZE = (1100, 734)   # 3:2 — the library cards crop this to ~1.9:1
CHAPTER_SIZE = (800, 534)
MARGIN = 0.03            # breathing room around the artwork
BORDER = (176, 141, 87)  # muted gold, matches the game's palette


def cover_crop(im, size):
    scale = max(size[0] / im.width, size[1] / im.height)
    resized = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def compose(src, dst, size, key=None):
    im = Image.open(src)
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        flat = Image.new("RGB", im.size, (248, 244, 236))
        flat.paste(im, mask=im.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")

    box = smart_crop.best_window(im, key)
    box_w, box_h = box[2] - box[0], box[3] - box[1]
    art_im = im.crop(box)
    small = box_w < 600 and (box_w * box_h) < im.width * im.height * 0.35

    backdrop = cover_crop(art_im, size).filter(ImageFilter.GaussianBlur(22))
    backdrop = ImageEnhance.Brightness(backdrop).enhance(0.42)
    backdrop = ImageEnhance.Color(backdrop).enhance(0.75)

    box_w = int(size[0] * (1 - 2 * MARGIN))
    box_h = int(size[1] * (1 - 2 * MARGIN))
    scale = min(box_w / art_im.width, box_h / art_im.height)
    art = art_im.resize((max(1, round(art_im.width * scale)), max(1, round(art_im.height * scale))), Image.LANCZOS)

    canvas = backdrop.copy()
    x = (size[0] - art.width) // 2
    y = (size[1] - art.height) // 2
    # soft shadow so light folios separate from the dark backdrop
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle([x - 6, y - 6, x + art.width + 5, y + art.height + 5], fill=(0, 0, 0, 110))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(9)))
    canvas.paste(art, (x, y))
    ImageDraw.Draw(canvas).rectangle([x - 1, y - 1, x + art.width, y + art.height], outline=BORDER, width=2)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    canvas.convert("RGB").save(dst, "JPEG", quality=88, optimize=True, progressive=True)
    return (im.size, art.size, small)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="", help="comma separated folder names")
    args = ap.parse_args()
    only = {s for s in args.only.split(",") if s}

    done = failed = 0
    smalls = []
    for base, _dirs, files in os.walk(RAW):
        rel = os.path.relpath(base, RAW)
        parts = rel.split(os.sep)
        if parts[0] == "covers":
            kind, folder = "cover", "covers"
        elif parts[0] == "chapters" and len(parts) > 1:
            kind, folder = "chapter", parts[1]
        else:
            continue
        if only and folder not in only:
            continue
        for name in sorted(files):
            if not name.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            src = os.path.join(base, name)
            dst = os.path.join(OUT, rel, os.path.splitext(name)[0] + ".jpg")
            size = COVER_SIZE if kind == "cover" else CHAPTER_SIZE
            try:
                _, art_size, small = compose(src, dst, size, os.path.join(rel, name))
                done += 1
                if small:
                    smalls.append(f"{rel}/{name} -> {art_size[0]}x{art_size[1]}")
            except Exception as exc:  # noqa: BLE001 - report and continue the batch
                failed += 1
                print(f"FAIL {rel}/{name}: {exc}", file=sys.stderr)
    print(f"composed {done} images, {failed} failed")
    if smalls:
        print(f"{len(smalls)} low-resolution sources (consider replacing):")
        for s in smalls:
            print("  " + s)


if __name__ == "__main__":
    main()
