"""Aster Python v059
Authenticated historical derivative: wrap a remote HTTP(S) asset in a same-origin media-proxy URL with deterministic encoding and optional cache busting.
"""
from __future__ import annotations
from urllib.parse import quote, urlparse

def _is_http_url(value: str) -> bool:
    try:
        return urlparse(value).scheme.lower() in {"http", "https"}
    except Exception:
        return False

def build_media_proxy_url(
    base_url: str,
    upstream_url: str,
    *,
    proxy_path: str = "/media",
    cache_bust: int | str | None = None,
) -> str:
    if not _is_http_url(upstream_url):
        return upstream_url
    base = (base_url or "").rstrip("/")
    path = proxy_path if proxy_path.startswith("/") else "/" + proxy_path
    wrapped = f"{base}{path}?url={quote(upstream_url, safe='')}"
    if cache_bust is not None:
        wrapped += f"&t={quote(str(cache_bust), safe='')}"
    return wrapped
