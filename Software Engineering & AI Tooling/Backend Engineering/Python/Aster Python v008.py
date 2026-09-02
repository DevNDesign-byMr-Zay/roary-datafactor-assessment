"""Aster Python v008
Authenticated historical derivative: binary-mask coverage and bounding-box statistics for removal diagnostics.
"""
from __future__ import annotations
from io import BytesIO
from typing import Any
from PIL import Image

def mask_stats(mask_bytes:bytes,threshold:int=16)->dict[str,Any]:
    if not mask_bytes:return {'coverage':0.0,'bbox':None,'width':0,'height':0}
    im=Image.open(BytesIO(mask_bytes)).convert('L'); w,h=im.size; px=im.load(); xs=[];ys=[];on=0
    for y in range(h):
        for x in range(w):
            if px[x,y]>threshold:on+=1;xs.append(x);ys.append(y)
    bbox=None if not on else {'left':min(xs),'top':min(ys),'right':max(xs)+1,'bottom':max(ys)+1}
    return {'coverage':on/max(1,w*h),'bbox':bbox,'width':w,'height':h,'selected_pixels':on}

def validate_mask(mask_bytes:bytes,min_coverage:float=0.00001)->dict[str,Any]:
    stats=mask_stats(mask_bytes)
    if stats['coverage']<min_coverage: raise ValueError('Mask is empty')
    return stats
