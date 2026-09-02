"""Aster Python v012
Authenticated historical derivative: alpha-first binary mask normalization.
Transparent UI masks are normalized to white=edit / black=keep and resized to the source image.
"""
from __future__ import annotations
from io import BytesIO
from PIL import Image, ImageFilter, ImageOps

def normalize_mask_to_image(mask_bytes:bytes,image_bytes:bytes,alpha_threshold:int=8,luma_threshold:int=10,denoise:bool=True)->bytes:
    if not mask_bytes or not image_bytes:raise ValueError('mask and image bytes are required')
    with Image.open(BytesIO(image_bytes)) as image:
        size=image.size
    with Image.open(BytesIO(mask_bytes)) as source:
        mask=source.convert('RGBA').resize(size,Image.Resampling.NEAREST)
        red,green,blue,alpha=mask.split();amin,amax=alpha.getextrema()
        if amin==0 and amax>0:
            base=alpha;threshold=max(1,int(alpha_threshold))
        else:
            base=ImageOps.grayscale(Image.merge('RGB',(red,green,blue)));threshold=max(1,int(luma_threshold))
        binary=base.point(lambda p:255 if p>=threshold else 0)
        if denoise:binary=binary.filter(ImageFilter.MedianFilter(size=3))
        out=BytesIO();binary.save(out,format='PNG');return out.getvalue()
