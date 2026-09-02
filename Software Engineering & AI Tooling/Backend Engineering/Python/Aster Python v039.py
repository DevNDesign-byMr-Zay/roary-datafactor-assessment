from __future__ import annotations

from typing import Any


_TEXT_TYPES = ("text/", "application/xhtml+xml", "application/xml", "application/json")


async def fetch_text_page(client: Any, url: str, max_bytes: int = 1_000_000) -> dict[str, Any]:
    """Fetch one page with redirect, status, type, and response-size checks."""
    response = await client.get(url, follow_redirects=True)
    response.raise_for_status()

    content_type = str(response.headers.get("content-type", "")).lower()
    if content_type and not any(prefix in content_type for prefix in _TEXT_TYPES):
        raise ValueError(f"unsupported content type: {content_type}")

    raw = bytes(response.content)
    if len(raw) > max_bytes:
        raw = raw[:max_bytes]

    encoding = getattr(response, "encoding", None) or "utf-8"
    text = raw.decode(encoding, errors="replace")
    return {
        "url": str(response.url),
        "content_type": content_type,
        "text": text,
        "truncated": len(response.content) > max_bytes,
    }
