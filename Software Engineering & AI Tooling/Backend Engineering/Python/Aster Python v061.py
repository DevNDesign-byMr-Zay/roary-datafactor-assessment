"""Aster Python v061
Authenticated historical derivative: convert upstream exceptions into bounded diagnostics without leaking unbounded response bodies.
"""
from __future__ import annotations
from typing import Any

def bounded_upstream_error(exc: BaseException, *, response_chars: int = 2000) -> str:
    response_chars = max(0, int(response_chars))
    parts = [f"{type(exc).__name__}: {exc}"]
    response: Any = getattr(exc, "response", None)

    if response is not None:
        status = getattr(response, "status_code", None)
        if status is not None:
            parts.append(f"http_status={status}")

        try:
            text = getattr(response, "text", None)
        except Exception:
            text = None
        if text and response_chars:
            parts.append("response=" + str(text)[:response_chars])

    return " | ".join(parts)
