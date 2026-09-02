"""Aster Python v002
Authenticated historical derivative: expand/outpaint input hardening utilities.

Preserved implementation themes:
- unwrap self-referential media-proxy URLs
- convert provider guidance values into a valid range
- normalize, cap, and chunk long prompt inputs deterministically
- prefill expanded canvas edges from source pixels
- feather expansion masks

Original product identity, credentials, private paths, and proprietary prompt text removed.
"""

from __future__ import annotations

import os
from typing import Optional
from urllib.parse import parse_qs, quote, urlparse

from PIL import Image, ImageDraw, ImageFilter
from fastapi import Request

IMAGE_TOOL_BASE = "http://127.0.0.1:5151"
PROMPT_MAX_CHARS = int(os.getenv("ASTER_PROMPT_MAX_CHARS", "500"))
DEFAULT_FILL_GUIDANCE = float(os.getenv("ASTER_FILL_GUIDANCE", "32"))


def safe_http_url(url: str) -> bool:
    try:
        return urlparse(url).scheme in ("http", "https")
    except Exception:
        return False


def unwrap_media_proxy_url(url: str) -> str:
    """Unwrap /media?url=<inner> so the service does not fetch itself."""
    try:
        parsed = urlparse(url)
        if parsed.path.endswith("/media"):
            inner = (parse_qs(parsed.query or "").get("url") or [None])[0]
            if inner and safe_http_url(inner):
                return inner
    except Exception:
        pass
    return url


def ui_proxy_url(request: Optional[Request], url: str) -> str:
    """Return a browser-safe URL for local file-based frontends."""
    if not url or not safe_http_url(url):
        return url
    if request is None:
        return url

    try:
        base = str(request.base_url).rstrip("/")
        if not (
            base.startswith("http://127.0.0.1:5151")
            or base.startswith("http://localhost:5151")
        ):
            base = IMAGE_TOOL_BASE
        return f"{base}/media?url={quote(url, safe='')}"
    except Exception:
        return url


def coerce_fill_guidance(
    value: Optional[float],
    *,
    default: Optional[float] = None,
) -> float:
    fallback = float(default) if default is not None else DEFAULT_FILL_GUIDANCE
    if value is None:
        return fallback

    try:
        guidance = float(value)
    except Exception:
        return fallback

    if guidance <= 2.0:
        guidance = 28.0 + (max(0.0, min(guidance, 2.0)) / 2.0) * 12.0

    if guidance < 28.0:
        guidance = fallback

    return max(28.0, min(guidance, 80.0))


def normalize_prompt_text(text: str) -> str:
    return " ".join((text or "").replace("\r", "\n").split())


def cap_prompt(text: str, limit: int = PROMPT_MAX_CHARS) -> str:
    normalized = normalize_prompt_text(text)
    if len(normalized) <= limit:
        return normalized
    return normalized[:limit].rstrip()


def chunk_text_for_prompts(
    text: str,
    max_chunk_chars: int = 220,
) -> list[str]:
    normalized = normalize_prompt_text(text)
    if not normalized:
        return []

    words = normalized.split(" ")
    chunks: list[str] = []
    current = ""

    for word in words:
        if not current:
            current = word
        elif len(current) + 1 + len(word) <= max_chunk_chars:
            current += " " + word
        else:
            chunks.append(current)
            current = word

    if current:
        chunks.append(current)

    return chunks


def safe_prompt_compose(
    *parts: str,
    limit: int = PROMPT_MAX_CHARS,
) -> str:
    cleaned = [
        item
        for item in (normalize_prompt_text(part) for part in parts)
        if item
    ]
    if not cleaned:
        return ""

    combined = ". ".join(cleaned)
    if len(combined) <= limit:
        return combined

    if len(cleaned) >= 3:
        compact = ". ".join([cleaned[0], cleaned[-1]])
        if len(compact) <= limit:
            return compact

    return cap_prompt(combined, limit=limit)


def build_expand_prefill_canvas(
    source: Image.Image,
    left: int,
    top: int,
    right: int,
    bottom: int,
) -> Image.Image:
    """Prefill expanded borders from source edges before generation."""
    width, height = source.size
    target_width = width + left + right
    target_height = height + top + bottom

    canvas = Image.new("RGB", (target_width, target_height))
    canvas.paste(source, (left, top))

    if top > 0:
        row = source.crop((0, 0, width, 1)).resize(
            (width, top),
            resample=Image.BILINEAR,
        )
        canvas.paste(row, (left, 0))

    if bottom > 0:
        row = source.crop((0, height - 1, width, height)).resize(
            (width, bottom),
            resample=Image.BILINEAR,
        )
        canvas.paste(row, (left, top + height))

    if left > 0:
        column = source.crop((0, 0, 1, height)).resize(
            (left, height),
            resample=Image.BILINEAR,
        )
        canvas.paste(column, (0, top))

    if right > 0:
        column = source.crop((width - 1, 0, width, height)).resize(
            (right, height),
            resample=Image.BILINEAR,
        )
        canvas.paste(column, (left + width, top))

    corners = (
        (left, top, (0, 0), (0, 0)),
        (right, top, (width - 1, 0), (left + width, 0)),
        (left, bottom, (0, height - 1), (0, top + height)),
        (
            right,
            bottom,
            (width - 1, height - 1),
            (left + width, top + height),
        ),
    )

    for pad_x, pad_y, source_xy, dest_xy in corners:
        if pad_x <= 0 or pad_y <= 0:
            continue
        x, y = source_xy
        corner = source.crop((x, y, x + 1, y + 1)).resize(
            (pad_x, pad_y),
            resample=Image.BILINEAR,
        )
        canvas.paste(corner, dest_xy)

    blur_radius = float(
        os.getenv("ASTER_EXPAND_PREFILL_BLUR", "10") or "10"
    )
    if blur_radius > 0:
        padded_mask = Image.new(
            "L",
            (target_width, target_height),
            255,
        )
        drawer = ImageDraw.Draw(padded_mask)
        drawer.rectangle(
            [left, top, left + width - 1, top + height - 1],
            fill=0,
        )
        blurred = canvas.filter(ImageFilter.GaussianBlur(blur_radius))
        canvas = Image.composite(blurred, canvas, padded_mask)

    return canvas


def maybe_feather_mask(mask: Image.Image) -> Image.Image:
    try:
        radius = float(
            os.getenv("ASTER_EXPAND_MASK_FEATHER", "4") or "4"
        )
    except Exception:
        radius = 0.0

    if radius <= 0:
        return mask

    return mask.filter(ImageFilter.GaussianBlur(radius))
