"""Aster Python v014
Authenticated historical derivative: decode RFC-style data URLs into bytes and MIME metadata.
Product identity, credentials, private paths, and provider coupling removed.
"""
from __future__ import annotations
import base64
from typing import Tuple

def is_data_url(value: object) -> bool:
    return isinstance(value, str) and value.startswith("data:")

def data_url_to_bytes(data_url: str) -> Tuple[bytes, str]:
    header, encoded = data_url.split(",", 1)
    mime = "application/octet-stream"
    if header.startswith("data:"):
        mime = header[5:].split(";", 1)[0] or mime
    return base64.b64decode(encoded.encode("utf-8")), mime
