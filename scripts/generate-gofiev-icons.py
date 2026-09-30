"""Generate GoFiev / Buddy peach-droplet app icons."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path("/workspace/public/icons")
PEACH = (232, 163, 126, 255)  # #e8a37e
CREAM = (250, 246, 240, 255)  # #faf6f0
PEACH_SOFT = (251, 230, 216, 255)  # #fbe6d8


def droplet_points(cx: float, cy: float, scale: float) -> list[tuple[float, float]]:
    """Approximate the plump dewdrop path as a polygon (viewBox 0..24 → scaled)."""
    # Sampled from BuddyGlyph plump dewdrop silhouette in 24×24 space,
    # then mapped so the glyph sits centered with padding.
    raw = []
    # Tip + left curve down to belly, around the arc, back up
    # Using a denser point set for a smooth look at 512px
    import math

    # Upper sides via bezier-ish sampling of the SVG path intent:
    # M12 3.1 C14.8 5.6 18.7 10.4 18.7 15.15 a6.7 6.7 0 1 1 -13.4 0 C5.3 10.4 9.2 5.6 12 3.1
    def cubic(p0, p1, p2, p3, n=24):
        pts = []
        for i in range(n + 1):
            t = i / n
            u = 1 - t
            x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
            y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
            pts.append((x, y))
        return pts

    tip = (12, 3.1)
    # Right upper cubic: 12,3.1 → 14.8,5.6 → 18.7,10.4 → 18.7,15.15
    right = cubic(tip, (14.8, 5.6), (18.7, 10.4), (18.7, 15.15), 20)
    # Bottom arc from angle ~0 to ~pi (right to left) around center (12, 15.15) r=6.7
    arc = []
    for i in range(33):
        a = -math.pi / 2 + (i / 32) * math.pi  # wait: at 18.7,15.15 we're at angle 0 from center
        # center 12,15.15 — point 18.7,15.15 is angle 0; go clockwise (SVG a ... 1 1 goes the long way for full circle half)
        # Full bottom semicircle+ : from east going south to west = angles 0 → pi
        a = (i / 32) * math.pi
        arc.append((12 + 6.7 * math.cos(a), 15.15 + 6.7 * math.sin(a)))
    # Left upper cubic reverse: 5.3,15.15 → 5.3 via 9.2,5.6 → 12,3.1
    left = cubic((5.3, 15.15), (5.3, 10.4), (9.2, 5.6), tip, 20)

    raw = right + arc[1:] + left[1:]

    out = []
    for x, y in raw:
        # Map 24 viewBox → icon, with ~18% padding for maskable-ish centering
        px = cx + (x - 12) * scale
        py = cy + (y - 12) * scale
        out.append((px, py))
    return out


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), PEACH if not maskable else PEACH)
    draw = ImageDraw.Draw(img)

    # For maskable, keep glyph in ~80% safe zone; same art, peach fill full bleed.
    scale = size / 24 * (0.62 if maskable else 0.68)
    cx = cy = size / 2
    # Nudge droplet slightly up so tip has room
    cy = size * 0.52

    pts = droplet_points(cx, cy, scale)
    draw.polygon(pts, fill=CREAM)

    # Eyes + smile as peach cutouts (show brand peach through cream body)
    eye_r = max(1.5, 1.15 * scale)
    eye_y = cy + (14.55 - 12) * scale
    eye_lx = cx + (9.8 - 12) * scale
    eye_rx = cx + (14.2 - 12) * scale
    draw.ellipse(
        [eye_lx - eye_r, eye_y - eye_r, eye_lx + eye_r, eye_y + eye_r],
        fill=PEACH,
    )
    draw.ellipse(
        [eye_rx - eye_r, eye_y - eye_r, eye_rx + eye_r, eye_y + eye_r],
        fill=PEACH,
    )

    # Soft smile lens
    smile_y = cy + (17.2 - 12) * scale
    smile_w = 2.2 * scale
    smile_h = 1.1 * scale
    draw.ellipse(
        [cx - smile_w, smile_y - smile_h * 0.2, cx + smile_w, smile_y + smile_h],
        fill=PEACH,
    )
    # Carve upper part back to cream so only a smile crescent remains
    draw.ellipse(
        [cx - smile_w * 1.05, smile_y - smile_h * 1.35, cx + smile_w * 1.05, smile_y + smile_h * 0.15],
        fill=CREAM,
    )

    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    draw_icon(192).save(ROOT / "icon-192.png", optimize=True)
    draw_icon(512).save(ROOT / "icon-512.png", optimize=True)
    draw_icon(512, maskable=True).save(ROOT / "icon-512-maskable.png", optimize=True)
    draw_icon(180).save(ROOT / "apple-touch-icon.png", optimize=True)
    # Also write a 32/favicon-style 192 downsample is enough; copy small for apple already done
    print("wrote icons to", ROOT)


if __name__ == "__main__":
    main()
