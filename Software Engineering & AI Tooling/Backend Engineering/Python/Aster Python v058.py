"""Aster Python v058
Authenticated historical derivative: unwrap an HTTP(S) resource nested inside a same-origin media-proxy URL without accepting unsafe schemes.
"""
from __future__ import annotations
from urllib.parse import parse_qs, urlparse

def _is_http_url(value: str) -> bool:
    try:
        return urlparse(value).scheme.lower() in {"http", "https"}
    except Exception:
        return False

def unwrap_media_proxy_url(value: str, *, proxy_path: str = "/media") -> str:
    try:
        parsed = urlparse(value)
        if parsed.path.endswith(proxy_path):
            inner = (parse_qs(parsed.query or "").get("url") or [None])[0]
            if isinstance(inner, str) and _is_http_url(inner):
                return inner
    except Exception:
        pass
    return value
