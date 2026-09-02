from __future__ import annotations

import io

from PIL import Image


def normalize_binary_mask(mask_bytes: bytes, image_bytes: bytes, threshold: int = 10) -> bytes:
    """Resize a mask to its image and convert any visible mask pixel to hard white."""
    with Image.open(io.BytesIO(image_bytes)) as image:
        width, height = image.size

    with Image.open(io.BytesIO(mask_bytes)) as mask:
        mask = mask.convert("RGBA")
        if mask.size != (width, height):
            mask = mask.resize((width, height), Image.Resampling.NEAREST)

        limit = max(0, min(255, int(threshold)))
        binary = Image.new("L", (width, height), 0)
        src = list(mask.getdata())
        dst = binary.load()
        for y in range(height):
            for x in range(width):
                r, g, b, a = src[y * width + x]
                if a > limit or r > limit or g > limit or b > limit:
                    dst[x, y] = 255

    output = io.BytesIO()
    binary.save(output, format="PNG")
    return output.getvalue()
