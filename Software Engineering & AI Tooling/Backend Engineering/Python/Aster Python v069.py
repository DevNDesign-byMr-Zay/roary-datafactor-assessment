from __future__ import annotations

import io
from PIL import Image


def expand_canvas(
    image_bytes: bytes,
    left: int = 0,
    right: int = 0,
    top: int = 0,
    bottom: int = 0,
    *,
    fill: tuple[int, int, int] = (127, 127, 127),
) -> bytes:
    """Expand an RGB canvas by exact side pads and preserve the original pixels at the resulting offset."""
    pads = [max(0, int(v)) for v in (left, right, top, bottom)]
    l, r, t, b = pads
    with Image.open(io.BytesIO(image_bytes)) as source:
        src = source.convert("RGB")
        width, height = src.size
        target = Image.new("RGB", (width + l + r, height + t + b), tuple(int(v) for v in fill))
        target.paste(src, (l, t))
        out = io.BytesIO()
        target.save(out, format="PNG")
        return out.getvalue()
