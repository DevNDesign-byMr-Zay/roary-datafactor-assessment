"""Aster Python v032
Buyer-safe historical derivative: normalize painted masks using transparency as the primary signal when available, luminance otherwise, then denoise the strict binary result.
"""
from __future__ import annotations
import io
from PIL import Image, ImageFilter, ImageOps


def normalize_binary_mask_transparency_aware(mask_bytes: bytes, image_bytes: bytes, *, alpha_threshold: int = 8, luminance_threshold: int = 10) -> bytes:
    with Image.open(io.BytesIO(image_bytes)) as image:
        target_size = image.size
    with Image.open(io.BytesIO(mask_bytes)) as mask:
        rgba = mask.convert("RGBA")
        if rgba.size != target_size:
            rgba = rgba.resize(target_size, Image.Resampling.NEAREST)
        alpha = rgba.getchannel("A")
        alpha_min, alpha_max = alpha.getextrema()
        if alpha_min == 0 and alpha_max > 0:
            signal = alpha
            threshold = max(0, int(alpha_threshold))
        else:
            signal = ImageOps.grayscale(rgba.convert("RGB"))
            threshold = max(0, int(luminance_threshold))
        binary = signal.point(lambda value: 255 if value >= threshold else 0)
        try:
            binary = binary.filter(ImageFilter.MedianFilter(size=3))
        except Exception:
            pass
        output = io.BytesIO()
        binary.save(output, format="PNG")
        return output.getvalue()
