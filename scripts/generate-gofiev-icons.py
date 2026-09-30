"""GoFiev app icons from the sealed 3D droplet brand asset.

`public/brand/gofiev-droplet.png` is a pre-baked RGBA cutout:
- RGB inside the silhouette is untouched from the source photo
  (including pure-white specular gloss, esp. bottom-right).
- Alpha is a solid filled silhouette — no interior holes.
- Exterior paper-white is fully transparent.

Do NOT chroma-key white from the JPG here: rim gloss matches paper white
and any flood-fill through white punches holes into the drop.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/public/icons")
DROP = Path("/workspace/public/brand/gofiev-droplet.png")
BG = (214, 222, 208, 255)


def _harden_alpha(layer: Image.Image) -> Image.Image:
    """After resize, force binary alpha so gloss cannot go translucent over bg."""
    layer = layer.convert("RGBA")
    pixels = layer.load()
    w, h = layer.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            pixels[x, y] = (r, g, b, 255 if a >= 128 else 0)
    return layer


def make(size: int, drop: Image.Image, *, pad_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BG)
    target = int(size * (1 - 2 * pad_ratio))
    layer = drop.copy()
    layer.thumbnail((target, target), Image.Resampling.LANCZOS)
    layer = _harden_alpha(layer)
    x = (size - layer.width) // 2
    y = (size - layer.height) // 2
    canvas.paste(layer, (x, y), layer)
    return canvas.convert("RGB")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    drop = Image.open(DROP).convert("RGBA")
    make(192, drop, pad_ratio=0.08).save(ROOT / "icon-192.png", optimize=True)
    make(512, drop, pad_ratio=0.08).save(ROOT / "icon-512.png", optimize=True)
    make(512, drop, pad_ratio=0.18).save(ROOT / "icon-512-maskable.png", optimize=True)
    make(180, drop, pad_ratio=0.08).save(ROOT / "apple-touch-icon.png", optimize=True)
    print("wrote icons from sealed droplet PNG (interior gloss untouched)")


if __name__ == "__main__":
    main()
