from __future__ import annotations

from typing import Any


def first_image_url(result: Any) -> str:
    """Extract the first usable image URL from several common response shapes."""
    if not isinstance(result, dict):
        return ""

    direct = result.get("image_url")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()

    images = result.get("images")
    if isinstance(images, list):
        for item in images:
            if isinstance(item, dict) and isinstance(item.get("url"), str) and item["url"].strip():
                return item["url"].strip()

    image = result.get("image")
    if isinstance(image, dict) and isinstance(image.get("url"), str) and image["url"].strip():
        return image["url"].strip()

    for key in ("url", "output", "result"):
        value = result.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, dict) and isinstance(value.get("url"), str) and value["url"].strip():
            return value["url"].strip()
    return ""


def normalize_image_result(result: Any, label: str = "", meta: dict[str, Any] | None = None) -> dict[str, Any]:
    """Emit a stable image-result envelope while preserving the original payload."""
    raw = result if isinstance(result, dict) else {}
    url = first_image_url(raw)
    images = raw.get("images") if isinstance(raw.get("images"), list) else []
    image = raw.get("image") if isinstance(raw.get("image"), dict) else None
    if not images and url:
        images = [{"url": url}]
    if (not image or not image.get("url")) and url:
        image = {"url": url}
    return {
        "ok": True,
        "label": label,
        "image_url": url,
        "url": url,
        "images": images,
        "image": image,
        "raw": raw,
        "meta": meta or {},
    }
