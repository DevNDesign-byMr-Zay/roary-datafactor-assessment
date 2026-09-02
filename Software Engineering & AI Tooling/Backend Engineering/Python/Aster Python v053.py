from __future__ import annotations

import io

from PIL import Image


def binary_mask_coverage(mask_bytes: bytes) -> dict[str, int | float]:
    """Return exact white-pixel coverage for a normalized binary mask."""
    with Image.open(io.BytesIO(mask_bytes)) as mask:
        mask = mask.convert("L")
        histogram = mask.histogram()
        white_pixels = int(histogram[255])
        total_pixels = int(mask.width * mask.height)

    coverage = (white_pixels / total_pixels) if total_pixels else 0.0
    return {
        "white_pixels": white_pixels,
        "total_pixels": total_pixels,
        "coverage": coverage,
    }
