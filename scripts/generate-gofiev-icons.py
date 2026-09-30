"""Generate GoFiev Buddy icons — softer rounded dewdrop + looking eyes."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/workspace/public/icons")
PEACH = (232, 163, 126, 255)
CREAM = (250, 246, 240, 255)
PUPIL = (184, 108, 78, 255)


def cubic(p0, p1, p2, p3, n=28):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def droplet_points(cx: float, cy: float, scale: float) -> list[tuple[float, float]]:
    """
    Soft dewdrop matching BuddyGlyph:
    M12 3.6
    C14.35 3.6 16.9 6.55 18.35 10.15
    C19.45 12.85 19.7 14.85 19.7 15.85
    a7.7 7.7 0 1 1 -15.4 0
    C4.3 14.85 4.55 12.85 5.65 10.15
    C7.1 6.55 9.65 3.6 12 3.6Z
    """
    # Right upper: 12,3.6 → 14.35,3.6 → 16.9,6.55 → 18.35,10.15
    r1 = cubic((12, 3.6), (14.35, 3.6), (16.9, 6.55), (18.35, 10.15), 20)
    # Right mid: 18.35,10.15 → 19.45,12.85 → 19.7,14.85 → 19.7,15.85
    r2 = cubic((18.35, 10.15), (19.45, 12.85), (19.7, 14.85), (19.7, 15.85), 16)
    # Bottom arc from east (19.7,15.85) around center (12,15.85) r=7.7, angles 0→π
    arc = []
    for i in range(40):
        a = (i / 39) * math.pi
        arc.append((12 + 7.7 * math.cos(a), 15.85 + 7.7 * math.sin(a)))
    # Left mid reverse: 4.3,15.85 → 4.3,14.85 → 4.55,12.85 → 5.65,10.15
    l2 = cubic((4.3, 15.85), (4.3, 14.85), (4.55, 12.85), (5.65, 10.15), 16)
    # Left upper: 5.65,10.15 → 7.1,6.55 → 9.65,3.6 → 12,3.6
    l1 = cubic((5.65, 10.15), (7.1, 6.55), (9.65, 3.6), (12, 3.6), 20)

    raw = r1 + r2[1:] + arc[1:] + l2[1:] + l1[1:]
    return [(cx + (x - 12) * scale, cy + (y - 12) * scale) for x, y in raw]


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), PEACH)
    draw = ImageDraw.Draw(img)

    scale = size / 24 * (0.60 if maskable else 0.66)
    cx = size / 2
    cy = size * 0.51

    draw.polygon(droplet_points(cx, cy, scale), fill=CREAM)

    eye_r = max(2.2, 1.5 * scale)
    eye_y = cy + (14.55 - 12) * scale
    eye_lx = cx + (9.45 - 12) * scale
    eye_rx = cx + (14.55 - 12) * scale
    for ex in (eye_lx, eye_rx):
        draw.ellipse([ex - eye_r, eye_y - eye_r, ex + eye_r, eye_y + eye_r], fill=PEACH)

    pupil_r = max(1.35, 0.75 * scale)
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
