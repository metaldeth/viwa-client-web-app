#!/usr/bin/env python3
"""TEMP: generate peach / mint / pineapple cabinet taste assets from Android fruit refs."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
TASTES_DIR = ROOT / "public" / "assets" / "viwa" / "tastes"
MEDALLIONS_DIR = TASTES_DIR / "medallions"
FRUIT_SRC = Path(r"C:\Users\metal\.cursor\projects\c-viwa\assets\taste-variants-v4\SELECTED")
MANIFEST_PATHS = [
    ROOT / "public" / "assets" / "viwa" / "manifest.json",
    ROOT / "src" / "data" / "viwaAssetManifest.json",
]

BOTTLE_W, BOTTLE_H = 800, 1000
MEDALLION_SIZE = 180
WEBP_QUALITY = 85

NEW_TASTES = {
    "peach": {
        "label_ru": "Персик",
        "fruit_file": "peach-P20.png",
        "bottle_template": "peach-mango.png",
        "medallion_tint": (255, 228, 210),
        "medallion_border": (210, 140, 100),
    },
    "mint": {
        "label_ru": "Мята",
        "fruit_file": "mint-M06.png",
        "bottle_template": "lime-mint.png",
        "medallion_tint": (220, 245, 228),
        "medallion_border": (90, 150, 110),
    },
    "pineapple": {
        "label_ru": "Ананас",
        "fruit_file": "pineapple-A05.png",
        "bottle_template": "orange.png",
        "medallion_tint": (255, 248, 210),
        "medallion_border": (200, 160, 60),
        "darken_right": True,
    },
}


def cover_crop_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        box = (left, 0, left + new_w, src_h)
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        box = (0, top, src_w, top + new_h)
    return img.crop(box).resize((target_w, target_h), Image.Resampling.LANCZOS)


def black_key_to_alpha(img: Image.Image, threshold: int = 42) -> Image.Image:
    rgba = img.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if max(r, g, b) <= threshold:
                pixels[x, y] = (0, 0, 0, 0)
            elif abs(r - g) < 12 and abs(g - b) < 12 and r > threshold:
                # Neutral studio backdrop in some Android refs.
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def radial_background(size: int, center: tuple[int, int, int], edge: tuple[int, int, int]) -> Image.Image:
    base = Image.new("RGBA", (size, size), edge + (255,))
    draw = ImageDraw.Draw(base)
    cx = cy = size // 2
    for radius in range(size // 2, 0, -1):
        t = radius / (size // 2)
        color = tuple(int(center[i] * (1 - t) + edge[i] * t) for i in range(3))
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color + (255,))
    return base


def build_medallion(fruit_path: Path, tint: tuple[int, int, int], border: tuple[int, int, int]) -> Image.Image:
    edge = tuple(max(0, min(255, int(c * 0.92))) for c in tint)
    canvas = radial_background(MEDALLION_SIZE, tint, edge)

    fruit = black_key_to_alpha(Image.open(fruit_path))
    bbox = fruit.getbbox()
    if bbox:
        fruit = fruit.crop(bbox)
    fitted = ImageOps.contain(fruit, (118, 118), Image.Resampling.LANCZOS)
    shadow = fitted.copy()
    shadow = shadow.convert("RGBA")
    shadow_pixels = shadow.load()
    w, h = shadow.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = shadow_pixels[x, y]
            if a:
                shadow_pixels[x, y] = (0, 0, 0, min(90, a // 2))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3))
    x = (MEDALLION_SIZE - fitted.width) // 2
    y = (MEDALLION_SIZE - fitted.height) // 2 + 4
    canvas.alpha_composite(shadow, (x, y + 3))
    canvas.alpha_composite(fitted, (x, y))

    ring = Image.new("RGBA", (MEDALLION_SIZE, MEDALLION_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(ring)
    draw.ellipse((3, 3, MEDALLION_SIZE - 4, MEDALLION_SIZE - 4), outline=border + (255,), width=2)
    draw.ellipse((7, 7, MEDALLION_SIZE - 8, MEDALLION_SIZE - 8), outline=(255, 255, 255, 120), width=1)
    canvas = Image.alpha_composite(canvas, ring)
    return canvas.convert("RGB")


def darken_fruit_region(template: Image.Image, *, widen: bool = False) -> Image.Image:
    """Hide template fruit on the left so new cutout reads cleanly."""
    out = template.copy()
    w, h = out.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    right = 0.78 if widen else 0.72
    bottom_right = 0.72 if widen else 0.66
    draw.polygon([(0, 0), (int(w * right), 0), (int(w * bottom_right), h), (0, h)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(18))
    darken = Image.new("RGBA", (w, h), (0, 0, 0, 220 if widen else 210))
    out = Image.composite(darken, out, mask)
    return out


def build_bottle(template_path: Path, fruit_path: Path, *, widen_mask: bool = False) -> Image.Image:
    template = Image.open(template_path).convert("RGBA")
    if template.size != (BOTTLE_W, BOTTLE_H):
        template = cover_crop_resize(template, BOTTLE_W, BOTTLE_H).convert("RGBA")
    template = darken_fruit_region(template, widen=widen_mask)

    fruit = black_key_to_alpha(Image.open(fruit_path))
    bbox = fruit.getbbox()
    if bbox:
        fruit = fruit.crop(bbox)
    target_w = int(BOTTLE_W * 0.78)
    target_h = int(BOTTLE_H * 0.68)
    fitted = ImageOps.contain(fruit, (target_w, target_h), Image.Resampling.LANCZOS)

    reflection = ImageOps.flip(fitted)
    reflection = reflection.convert("RGBA")
    ref_pixels = reflection.load()
    w, h = reflection.size
    for y in range(h):
        fade = max(0.0, 1.0 - y / h)
        for x in range(w):
            r, g, b, a = ref_pixels[x, y]
            if a:
                ref_pixels[x, y] = (r, g, b, int(a * fade * 0.22))

    x = int(BOTTLE_W * 0.06)
    y = int(BOTTLE_H * 0.16)
    out = template.copy()
    out.alpha_composite(reflection, (x, y + fitted.height - 12))
    out.alpha_composite(fitted, (x, y))
    return out.convert("RGB")


def save_pair(img: Image.Image, dest_dir: Path, basename: str) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    png_path = dest_dir / f"{basename}.png"
    webp_path = dest_dir / f"{basename}.webp"
    img.save(png_path, optimize=True)
    img.save(webp_path, format="WEBP", quality=WEBP_QUALITY, method=6)
    print(f"Wrote {png_path.name}, {webp_path.name}")


def manifest_entry(
    asset_id: str,
    category: str,
    rel_base: str,
    width: int,
    height: int,
    alt_ru: str,
    taste_media_key: str,
    *,
    medallion: bool = False,
) -> dict:
    entry = {
        "id": asset_id,
        "category": category,
        "files": {
            "webp": {"path": f"{rel_base}.webp", "width": width, "height": height},
            "png": {"path": f"{rel_base}.png", "width": width, "height": height},
        },
        "altRu": alt_ru,
        "tasteMediaKey": taste_media_key,
    }
    if medallion:
        entry["cabinetRole"] = "favorite-circle"
    return entry


def insert_taste_manifest_entries(manifest: dict) -> None:
    assets = manifest["assets"]
    insert_after = next(i for i, a in enumerate(assets) if a["id"] == "taste-watermelon")
    medallion_insert_after = next(i for i, a in enumerate(assets) if a["id"] == "taste-medallion-watermelon")

    new_bottles = []
    new_medallions = []
    for key, meta in NEW_TASTES.items():
        label = meta["label_ru"]
        new_bottles.append(
            manifest_entry(
                f"taste-{key}",
                "taste",
                f"tastes/{key}",
                BOTTLE_W,
                BOTTLE_H,
                f"{label} — фруктовый разрез и бутылка",
                key,
            )
        )
        new_medallions.append(
            manifest_entry(
                f"taste-medallion-{key}",
                "taste-medallion",
                f"tastes/medallions/{key}",
                MEDALLION_SIZE,
                MEDALLION_SIZE,
                f"{label} — медальон вкуса",
                key,
                medallion=True,
            )
        )

    for offset, entry in enumerate(new_bottles):
        assets.insert(insert_after + 1 + offset, entry)
    medallion_insert_after += len(new_bottles)
    for offset, entry in enumerate(new_medallions):
        assets.insert(medallion_insert_after + 1 + offset, entry)

    manifest["generatedAt"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def main() -> None:
    for key, meta in NEW_TASTES.items():
        fruit_path = FRUIT_SRC / meta["fruit_file"]
        if not fruit_path.is_file():
            raise SystemExit(f"Missing fruit source: {fruit_path}")
        template_path = TASTES_DIR / meta["bottle_template"]
        bottle = build_bottle(template_path, fruit_path, widen_mask=bool(meta.get("darken_right")))
        medallion = build_medallion(fruit_path, meta["medallion_tint"], meta["medallion_border"])
        save_pair(bottle, TASTES_DIR, key)
        save_pair(medallion, MEDALLIONS_DIR, key)

    for manifest_path in MANIFEST_PATHS:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        existing_keys = {
            a.get("tasteMediaKey")
            for a in manifest["assets"]
            if a.get("category") in ("taste", "taste-medallion")
        }
        if not existing_keys.intersection(NEW_TASTES):
            insert_taste_manifest_entries(manifest)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Updated manifest: {manifest_path}")


if __name__ == "__main__":
    main()
