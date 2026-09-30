"""GoFiev app icons from the glossy 3D droplet brand asset.

Source JPG is white-backed. We remove only background white that is
connected to the image edge (flood-fill) so specular gloss inside the
droplet stays opaque — global near-white keying punched holes in the drop.

Background: sage soft beige-green — brand-adjacent, calmer than cream on
homescreens, enough contrast with the rose-gold droplet.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path("/workspace/public/icons")
SRC = Path("/workspace/public/brand/gofiev-droplet-source.jpg")
# Comparison tile "sage soft" — muted beige-green, not cream/white.
BG = (214, 222, 208, 255)

# Near-white thresholds for backdrop detection (edge-connected only).
HARD_WHITE = 245
SOFT_WHITE = 230


def _is_near_white(r: int, g: int, b: int, threshold: int) -> bool:
    return r > threshold and g > threshold and b > threshold


def load_drop() -> Image.Image:
    """Key out white backdrop via edge flood-fill; keep droplet gloss."""
    src = Image.open(SRC).convert("RGBA")
    pixels = src.load()
    w, h = src.size

    # 1) Mark backdrop: near-white pixels reachable from the image border.
    backdrop: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def try_seed(x: int, y: int) -> None:
        r, g, b, _a = pixels[x, y]
        if (x, y) not in backdrop and _is_near_white(r, g, b, SOFT_WHITE):
            backdrop.add((x, y))
            queue.append((x, y))

    for x in range(w):
        try_seed(x, 0)
        try_seed(x, h - 1)
    for y in range(h):
        try_seed(0, y)
        try_seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in backdrop:
                r, g, b, _a = pixels[nx, ny]
                if _is_near_white(r, g, b, SOFT_WHITE):
                    backdrop.add((nx, ny))
                    queue.append((nx, ny))

    # 2) Make backdrop transparent; soft fringe only on backdrop pixels.
    for x, y in backdrop:
        r, g, b, _a = pixels[x, y]
        if _is_near_white(r, g, b, HARD_WHITE):
            pixels[x, y] = (r, g, b, 0)
        else:
            # Soft edge: fade alpha as we approach hard white.
            t = (min(r, g, b) - SOFT_WHITE) / max(1, HARD_WHITE - SOFT_WHITE)
            alpha = int(255 * (1 - max(0.0, min(1.0, t))))
            pixels[x, y] = (r, g, b, alpha)

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
    print("wrote 3D droplet app icons (sage soft bg, gloss preserved) to", ROOT)


if __name__ == "__main__":
    main()
