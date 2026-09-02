from __future__ import annotations

import io
from PIL import Image, ImageDraw, ImageFilter


def build_expansion_insert_mask(
    final_width: int,
    final_height: int,
    original_width: int,
    original_height: int,
    left: int,
    top: int,
    *,
    blur_radius: float = 6.0,
) -> bytes:
    """Create a focused editable mask in expanded pixels while protecting the original rectangle."""
    fw, fh = max(1, int(final_width)), max(1, int(final_height))
    ow, oh = max(1, int(original_width)), max(1, int(original_height))
    left, top = max(0, int(left)), max(0, int(top))
    right = max(0, fw - ow - left)
    bottom = max(0, fh - oh - top)

    pads = {"left": left, "right": right, "top": top, "bottom": bottom}
    dominant = max(pads, key=pads.get)
    x0, y0 = left, top
    x1, y1 = min(fw, left + ow), min(fh, top + oh)

    margin = max(1, int(min(fw, fh) * 0.03))
    band_y0, band_y1 = int(fh * 0.18), int(fh * 0.82)
    band_x0, band_x1 = int(fw * 0.18), int(fw * 0.82)
    roi: tuple[int, int, int, int] | None = None

    if dominant == "right" and right > 0:
        roi = (x1 + margin, band_y0, fw - margin, band_y1)
    elif dominant == "left" and left > 0:
        roi = (margin, band_y0, x0 - margin, band_y1)
    elif dominant == "bottom" and bottom > 0:
        roi = (band_x0, y1 + margin, band_x1, fh - margin)
    elif dominant == "top" and top > 0:
        roi = (band_x0, margin, band_x1, y0 - margin)

    mask = Image.new("L", (fw, fh), 0)
    draw = ImageDraw.Draw(mask)
    if roi and roi[2] > roi[0] and roi[3] > roi[1]:
        draw.rectangle(roi, fill=255)
    elif any(pads.values()):
        draw.rectangle((0, 0, fw - 1, fh - 1), fill=255)

    draw.rectangle((x0, y0, max(x0, x1 - 1), max(y0, y1 - 1)), fill=0)
    if float(blur_radius) > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(float(blur_radius)))

    out = io.BytesIO()
    mask.save(out, format="PNG")
    return out.getvalue()
