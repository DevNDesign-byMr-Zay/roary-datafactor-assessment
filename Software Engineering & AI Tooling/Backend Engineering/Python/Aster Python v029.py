"""Aster Python v029
Buyer-safe historical derivative: summarize a binary removal mask with coverage ratio and painted bounding box.
"""
from __future__ import annotations
import io
from typing import Any
from PIL import Image


def binary_mask_stats(mask_bytes: bytes) -> dict[str, Any]:
    with Image.open(io.BytesIO(mask_bytes)) as mask:
        gray = mask.convert("L")
        width, height = gray.size
        pixels = gray.load()
        white = 0
        min_x, min_y, max_x, max_y = width, height, -1, -1
        for y in range(height):
            for x in range(width):
                if pixels[x, y] > 0:
                    white += 1
                    min_x, min_y = min(min_x, x), min(min_y, y)
                    max_x, max_y = max(max_x, x), max(max_y, y)
        total = max(1, width * height)
        bbox = None if white == 0 else [min_x, min_y, max_x, max_y]
        return {"width": width, "height": height, "painted_pixels": white, "ratio": white / total, "bbox": bbox}
