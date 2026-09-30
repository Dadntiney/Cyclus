"""GoFiev Buddy icons — classic leaning teardrop (peach on peach-soft)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/workspace/public/icons")
PEACH = (232, 163, 126, 255)
PEACH_SOFT = (251, 230, 216, 255)
PUPIL = (184, 108, 78, 255)


def cubic(p0, p1, p2, p3, n=24):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


def droplet_points(cx: float, cy: float, scale: float) -> list[tuple[float, float]]:
    """
    Classic water-drop with tip leaning slightly left (characterful, soft).
    Matches BuddyGlyph path intent in 24×24 space.
    """
    tip = (10.7, 2.35)
    # Left side down into belly
    left = cubic(tip, (7.2, 5.8), (4.7, 10.4), (5.05, 14.85), 22)
    # Round belly: from left attachment, sweep under to right (angles ~190°→-10°)
    belly = []
    for i in range(36):
        # center of belly circle
        a0, a1 = math.radians(175), math.radians(-5)
        a = a0 + (a1 - a0) * (i / 35)
        belly.append((12.15 + 7.15 * math.cos(a), 15.35 + 7.15 * math.sin(a)))
    # Right side up to tip (leaning)
    right = cubic((19.2, 14.95), (18.6, 9.6), (14.9, 4.6), tip, 22)

    raw = left + belly[1:] + right[1:]
    return [(cx + (x - 12) * scale, cy + (y - 12) * scale) for x, y in raw]


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), PEACH_SOFT)
    draw = ImageDraw.Draw(img)

    scale = size / 24 * (0.58 if maskable else 0.64)
    cx = size / 2
    cy = size * 0.52

    draw.polygon(droplet_points(cx, cy, scale), fill=PEACH)

    eye_r = max(2.3, 1.55 * scale)
    eye_y = cy + (14.15 - 12) * scale
    eye_lx = cx + (9.5 - 12) * scale
    eye_rx = cx + (14.5 - 12) * scale
    for ex in (eye_lx, eye_rx):
        draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=PEACH_SOFT)

    pupil_r = max(1.4, 0.78 * scale)
    for ex, toward in ((eye_lx, 0.22), (eye_rx, -0.22)):
        px = ex + toward * scale
        draw.ellipse(
            [px - pupil_r, eye_y - pupil_r, px + pupil_r, eye_y + pupil_r],
            fill=PUPIL,
        )

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
