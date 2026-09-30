"""GoFiev Buddy icons — Lucide droplet + white squint eyes, cream/gold."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/workspace/public/icons")

CREAM = (250, 246, 240, 255)
PEACH = (232, 163, 126, 255)
GOLD = (196, 163, 90, 255)
WHITE = (255, 255, 255, 255)


def _cubic(p0, p1, p2, p3, n=20):
    out = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


def _arc_endpoint(x1, y1, rx, ry, large, sweep, x2, y2, n=28):
    """Sample SVG elliptical arc (radii may be equal; rotation=0)."""
    # Based on SVG arc → center parameterization (simplified, rot=0).
    rx, ry = abs(rx), abs(ry)
    if rx == 0 or ry == 0:
        return [(x2, y2)]
    dx = (x1 - x2) / 2
    dy = (y1 - y2) / 2
    x1p, y1p = dx, dy
    lam = (x1p**2) / (rx**2) + (y1p**2) / (ry**2)
    if lam > 1:
        s = math.sqrt(lam)
        rx, ry = rx * s, ry * s
    sq = max(
        0.0,
        (rx**2 * ry**2 - rx**2 * y1p**2 - ry**2 * x1p**2)
        / (rx**2 * y1p**2 + ry**2 * x1p**2),
    )
    coef = math.sqrt(sq)
    if large == sweep:
        coef = -coef
    cxp = coef * (rx * y1p) / ry
    cyp = coef * (-ry * x1p) / rx
    cx = cxp + (x1 + x2) / 2
    cy = cyp + (y1 + y2) / 2

    def angle(ux, uy, vx, vy):
        n1 = math.hypot(ux, uy)
        n2 = math.hypot(vx, vy)
        cos_a = max(-1.0, min(1.0, (ux * vx + uy * vy) / (n1 * n2)))
        a = math.acos(cos_a)
        if ux * vy - uy * vx < 0:
            a = -a
        return a

    theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dtheta = angle(
        (x1p - cxp) / rx,
        (y1p - cyp) / ry,
        (-x1p - cxp) / rx,
        (-y1p - cyp) / ry,
    )
    if not sweep and dtheta > 0:
        dtheta -= 2 * math.pi
    elif sweep and dtheta < 0:
        dtheta += 2 * math.pi

    pts = []
    for i in range(n + 1):
        t = theta1 + dtheta * (i / n)
        pts.append((cx + rx * math.cos(t), cy + ry * math.sin(t)))
    return pts


def lucide_droplet_points() -> list[tuple[float, float]]:
    """
    Lucide Droplet path (24×24):
    M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5
    c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z
    """
    pts: list[tuple[float, float]] = []
    # M12 22
    cur = (12.0, 22.0)
    pts.append(cur)
    # a7 7 0 0 0 7-7 → (19, 15)
    arc = _arc_endpoint(12, 22, 7, 7, 0, 0, 19, 15)
    pts.extend(arc[1:])
    cur = (19.0, 15.0)
    # c 0 -2, -1 -3.9, -3 -5.5 → (16, 9.5)
    c1 = _cubic(cur, (19, 13), (18, 11.1), (16, 9.5))
    pts.extend(c1[1:])
    cur = (16.0, 9.5)
    # s -3.5 -4, -4 -6.5 → reflected control from previous
    # prev ctrl relative end was (-3,-5.5) from (19,15) → abs (16,9.5)
    # prev ctrl2 abs = (18, 11.1); reflect over cur: 2*cur - prev_c2
    rc = (2 * 16 - 18, 2 * 9.5 - 11.1)  # (14, 7.9)
    c2 = _cubic(cur, rc, (12.5, 5.5), (12, 3))
    pts.extend(c2[1:])
    cur = (12.0, 3.0)
    # c -.5 2.5, -2 4.9, -4 6.5 → (8, 9.5)
    c3 = _cubic(cur, (11.5, 5.5), (10, 7.9), (8, 9.5))
    pts.extend(c3[1:])
    cur = (8.0, 9.5)
    # C 6 11.1, 5 13, 5 15
    c4 = _cubic(cur, (6, 11.1), (5, 13), (5, 15))
    pts.extend(c4[1:])
    # a7 7 0 0 0 7 7 → (12, 22)
    arc2 = _arc_endpoint(5, 15, 7, 7, 0, 0, 12, 22)
    pts.extend(arc2[1:])
    return pts


def map_pts(pts, cx, cy, scale):
    return [(cx + (x - 12) * scale, cy + (y - 12) * scale) for x, y in pts]


def draw_eyes(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float) -> None:
    """White soft-squint ellipses (no pupils)."""
    rx = max(2.2, 1.65 * scale)
    ry = max(1.4, 1.05 * scale)
    for ex in (9.55, 14.45):
        x = cx + (ex - 12) * scale
        y = cy + (14.1 - 12) * scale
        draw.ellipse([x - rx, y - ry, x + rx, y + ry], fill=WHITE)


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), CREAM)
    draw = ImageDraw.Draw(img)

    scale = size / 24 * (0.58 if maskable else 0.64)
    cx = size / 2
    cy = size * 0.52
    raw = lucide_droplet_points()

    rim_w = max(2.0, size * 0.028)
    rim_scale = scale * (1 + rim_w / (size * 0.28))
    draw.polygon(map_pts(raw, cx, cy, rim_scale), fill=GOLD)
    draw.polygon(map_pts(raw, cx, cy, scale), fill=PEACH)
    draw_eyes(draw, cx, cy, scale)
    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    draw_icon(192).save(ROOT / "icon-192.png", optimize=True)
    draw_icon(512).save(ROOT / "icon-512.png", optimize=True)
    draw_icon(512, maskable=True).save(ROOT / "icon-512-maskable.png", optimize=True)
    draw_icon(180).save(ROOT / "apple-touch-icon.png", optimize=True)
    print("wrote Lucide-droplet Buddy icons to", ROOT)


if __name__ == "__main__":
    main()
