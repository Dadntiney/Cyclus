"""GoFiev app icons from the glossy 3D droplet brand asset.

Keep EVERY pixel inside the droplet (including pure-white specular gloss).
Only remove white that sits outside the droplet silhouette.

Method:
1) Seed a body mask from clearly non-backdrop pixels (metal, pink gloss, shadow).
2) Morphologically close the mask so rim gaps don't leak.
3) Fill holes inside the silhouette.
4) Outside the silhouette, key out edge-connected white; inside = fully opaque.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path("/workspace/public/icons")
SRC = Path("/workspace/public/brand/gofiev-droplet-source.jpg")
BG = (214, 222, 208, 255)


def _is_body_pixel(r: int, g: int, b: int) -> bool:
    """Metal, pink gloss, or shadow — clearly part of the droplet scene."""
    if min(r, g, b) < 220:
        return True  # shadow + darker metal
    if (r - b) >= 8:
        return True  # warm / pink specular & body
    if (max(r, g, b) - min(r, g, b)) > 12:
        return True  # any noticeable chroma
    return False


def _is_paperish_white(r: int, g: int, b: int) -> bool:
    mn, mx = min(r, g, b), max(r, g, b)
    return mn >= 238 and (mx - mn) <= 14 and (r - b) < 12


def load_drop() -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    pixels = src.load()

    # 1) Binary body mask from definite droplet/shadow pixels.
    body = Image.new("L", (w, h), 0)
    body_px = body.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if _is_body_pixel(r, g, b):
                body_px[x, y] = 255

    # 2) Close small rim leaks so exterior white cannot bite into gloss.
    body = body.filter(ImageFilter.MaxFilter(5))
    body = body.filter(ImageFilter.MinFilter(5))
    body_px = body.load()

    # 3) Fill holes inside the silhouette (white gloss pockets become body).
    # Flood exterior from the border through non-body cells, then everything
    # not reached is interior → force body.
    exterior: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def seed_ext(x: int, y: int) -> None:
        if (x, y) in exterior:
            return
        if body_px[x, y] == 0:
            exterior.add((x, y))
            queue.append((x, y))

    for x in range(w):
        seed_ext(x, 0)
        seed_ext(x, h - 1)
    for y in range(h):
        seed_ext(0, y)
        seed_ext(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in exterior and body_px[nx, ny] == 0:
                exterior.add((nx, ny))
                queue.append((nx, ny))

    for y in range(h):
        for x in range(w):
            if (x, y) not in exterior:
                body_px[x, y] = 255

    # 4) Outside silhouette: transparent if paperish white; keep soft shadow.
    # Inside silhouette: always fully opaque original (gloss stays).
    for y in range(h):
        for x in range(w):
            r, g, b, _a = pixels[x, y]
            if body_px[x, y] == 255:
                pixels[x, y] = (r, g, b, 255)
            elif _is_paperish_white(r, g, b):
                pixels[x, y] = (r, g, b, 0)
            else:
                # Outside colored/dark residue (rare) — keep gently.
                pixels[x, y] = (r, g, b, 255)

    # Soften only the exterior white fringe adjacent to the silhouette.
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a != 0:
                continue
            # Already transparent paper — leave fully clear.
            touch_body = False
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and body_px[nx, ny] == 255:
                    touch_body = True
                    break
            if touch_body and _is_paperish_white(r, g, b) and min(r, g, b) < 252:
                # Tiny AA against the rim; never inside body.
                t = (min(r, g, b) - 238) / 14.0
                pixels[x, y] = (r, g, b, int(40 * (1 - max(0.0, min(1.0, t)))))

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
    print("wrote 3D droplet app icons (silhouette-safe gloss) to", ROOT)


if __name__ == "__main__":
    main()
