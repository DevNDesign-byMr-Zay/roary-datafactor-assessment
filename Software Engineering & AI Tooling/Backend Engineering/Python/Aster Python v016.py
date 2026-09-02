"""Aster Python v016
Authenticated historical derivative: extract the first usable image URL from heterogeneous result payloads.
"""
from __future__ import annotations
from typing import Any

def first_image_url(result: dict[str, Any]) -> str:
    if not isinstance(result, dict): return ""
    direct = result.get("image_url")
    if isinstance(direct, str) and direct: return direct
    images = result.get("images")
    if isinstance(images, list):
        for item in images:
            if isinstance(item, dict) and isinstance(item.get("url"), str) and item.get("url"):
                return item["url"]
    image = result.get("image")
    if isinstance(image, dict) and isinstance(image.get("url"), str): return image.get("url") or ""
    for key in ("url", "output", "result"):
        value = result.get(key)
        if isinstance(value, str) and value: return value
        if isinstance(value, dict) and isinstance(value.get("url"), str) and value.get("url"): return value["url"]
    return ""
