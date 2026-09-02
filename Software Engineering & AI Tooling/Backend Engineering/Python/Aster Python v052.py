from __future__ import annotations

import io

from PIL import Image, ImageFilter, ImageOps


def normalize_overlay_mask(
    mask_bytes: bytes,
    image_bytes: bytes,
    alpha_threshold: int = 8,
    luminance_threshold: int = 10,
    denoise: bool = True,
) -> bytes:
    """Normalize a transparent painted overlay into an image-sized binary PNG mask."""
    with Image.open(io.BytesIO(image_bytes)) as image:
        width, height = image.size

    with Image.open(io.BytesIO(mask_bytes)) as mask:
        mask = mask.convert("RGBA")
        if mask.size != (width, height):
            mask = mask.resize((width, height), Image.Resampling.NEAREST)

        _, _, _, alpha = mask.split()
        alpha_min, alpha_max = alpha.getextrema()
        if alpha_min == 0 and alpha_max > 0:
            signal = alpha
            threshold = max(0, min(255, int(alpha_threshold)))
        else:
            signal = ImageOps.grayscale(mask.convert("RGB"))
            threshold = max(0, min(255, int(luminance_threshold)))

        binary = signal.point(lambda value: 255 if value >= threshold else 0)
        if denoise:
            binary = binary.filter(ImageFilter.MedianFilter(size=3))

    output = io.BytesIO()
    binary.save(output, format="PNG")
    return output.getvalue()
