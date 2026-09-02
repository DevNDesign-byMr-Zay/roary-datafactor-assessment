"""Aster Python v057
Authenticated historical derivative: browser-safe response headers for streamed media that must remain fresh and cross-origin displayable.
"""
from __future__ import annotations
from collections.abc import Mapping

def hardened_media_headers(existing: Mapping[str, str] | None = None) -> dict[str, str]:
    headers = dict(existing or {})
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    headers["Pragma"] = "no-cache"
    headers["Expires"] = "0"
    headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    headers["X-Content-Type-Options"] = "nosniff"
    return headers
