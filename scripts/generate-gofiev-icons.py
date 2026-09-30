"""Generate GoFiev / Buddy peach-droplet app icons — open looking eyes only."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/workspace/public/icons")
PEACH = (232, 163, 126, 255)  # #e8a37e
CREAM = (250, 246, 240, 255)  # #faf6f0
PUPIL = (184, 108, 78, 255)  # deeper peach for pupil contrast


def cubic(p0, p1, p2, p3, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def droplet_points(cx: float, cy: float, scale: float) -> list[tuple[float, float]]:
    tip = (12, 3.1)
    right = cubic(tip, (14.8, 5.6), (18.7, 10.4), (18.7, 15.15), 20)
    arc = [(12 + 6.7 * math.cos((i / 32) * math.pi), 15.15 + 6.7 * math.sin((i / 32) * math.pi)) for i in range(33)]
    left = cubic((5.3, 15.15), (5.3, 10.4), (9.2, 5.6), tip, 20)
    raw = right + arc[1:] + left[1:]
    return [(cx + (x - 12) * scale, cy + (y - 12) * scale) for x, y in raw]


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), PEACH)
    draw = ImageDraw.Draw(img)

    scale = size / 24 * (0.62 if maskable else 0.68)
    cx = size / 2
    cy = size * 0.52

    draw.polygon(droplet_points(cx, cy, scale), fill=CREAM)

    eye_r = max(2.2, 1.55 * scale)
    eye_y = cy + (14.35 - 12) * scale
    eye_lx = cx + (9.5 - 12) * scale
    eye_rx = cx + (14.5 - 12) * scale
    for ex in (eye_lx, eye_rx):
        draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=PEACH)

    pupil_r = max(1.4, 0.78 * scale)
    # Pupils toward center — looking at you
    for ex, toward in ((eye_lx, 0.2), (eye_rx, -0.2)):
        px = ex + toward * scale
        py = eye_y
        draw.ellipse([px - pupil_r, py - pupil_r, px + pupil_r, py + pupil_r], fill=PUPIL)

    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    draw_icon(192).save(ROOT / "icon-192.png", optimize=True)
    draw_icon(512).save(ROOT / "icon-512.png", optimize=True)
    draw_icon(512, maskable=True).save(ROOT / "icon-512-maskable.png", optimize=True)
    draw_icon(180).save(ROOT / "apple-touch-icon.png", optimize=True)
    print("wrote icons to", ROOT)


if __name__ == "__main__":
    main()
