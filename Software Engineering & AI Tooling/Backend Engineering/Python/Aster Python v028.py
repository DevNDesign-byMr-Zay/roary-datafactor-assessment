"""Aster Python v028
Buyer-safe historical derivative: normalize a painted removal mask to the source image dimensions and hard binary semantics.
"""
from __future__ import annotations
import io
from PIL import Image


def normalize_binary_mask(mask_bytes: bytes, image_bytes: bytes) -> bytes:
    with Image.open(io.BytesIO(image_bytes)) as image:
        target_size = image.size
    with Image.open(io.BytesIO(mask_bytes)) as mask:
        rgba = mask.convert("RGBA")
        if rgba.size != target_size:
            rgba = rgba.resize(target_size, Image.Resampling.NEAREST)
        luminance = rgba.convert("L")
        alpha = rgba.getchannel("A")
        binary = Image.new("L", target_size, 0)
        binary.putdata([255 if (lum > 0 and a > 0) else 0 for lum, a in zip(luminance.getdata(), alpha.getdata())])
        output = io.BytesIO()
        binary.save(output, format="PNG")
        return output.getvalue()
