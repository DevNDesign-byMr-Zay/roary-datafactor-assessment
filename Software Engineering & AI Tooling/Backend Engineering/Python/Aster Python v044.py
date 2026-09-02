from __future__ import annotations

import base64


def decode_data_url(data_url: str, max_bytes: int = 32 * 1024 * 1024) -> tuple[bytes, str]:
    """Decode a base64 data URL and return its bytes plus declared MIME type."""
    if not isinstance(data_url, str) or not data_url.startswith("data:") or "," not in data_url:
        raise ValueError("invalid data URL")

    header, encoded = data_url.split(",", 1)
    mime = header[5:].split(";", 1)[0].strip() or "application/octet-stream"
    try:
        content = base64.b64decode(encoded.encode("ascii"), validate=True)
    except Exception as exc:
        raise ValueError("invalid base64 payload") from exc

    if len(content) > max(0, int(max_bytes)):
        raise ValueError("decoded payload exceeds limit")
    return content, mime
