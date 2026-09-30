"""GoFiev app icons from the glossy 3D droplet brand asset.

Source JPG is white-backed; we key out near-white and composite onto a
brand background. Cream read too white on home screens — sage-soft
(#e4e9de) keeps beige-green brand tone and lets the rose-gold drop pop.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/public/icons")
SRC = Path("/workspace/public/brand/gofiev-droplet-source.jpg")
# Brand --color-sage-soft (globals.css). Beige-green, not white.
BG = (228, 233, 222, 255)


def load_drop() -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    pixels = src.load()
    w, h = src.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r > 245 and g > 245 and b > 245:
                pixels[x, y] = (r, g, b, 0)
            elif r > 235 and g > 235 and b > 235:
                alpha = int(255 * (1 - (min(r, g, b) - 235) / 20))
                pixels[x, y] = (r, g, b, max(0, min(255, alpha)))
    return src


def make(size: int, drop: Image.Image, *, pad_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BG)
    target = int(size * (1 - 2 * pad_ratio))
    layer = drop.copy()
    layer.thumbnail((target, target), Image.Resampling.LANCZOS)
    x = (size - layer.width) // 2
    y = (size - layer.height) // 2
    canvas.alpha_composite(layer, (x, y))
    return canvas.convert("RGB")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    drop = load_drop()
    make(192, drop, pad_ratio=0.08).save(ROOT / "icon-192.png", optimize=True)
    make(512, drop, pad_ratio=0.08).save(ROOT / "icon-512.png", optimize=True)
    make(512, drop, pad_ratio=0.18).save(ROOT / "icon-512-maskable.png", optimize=True)
    make(180, drop, pad_ratio=0.08).save(ROOT / "apple-touch-icon.png", optimize=True)
    print("wrote 3D droplet app icons (sage-soft bg) to", ROOT)


if __name__ == "__main__":
    main()
