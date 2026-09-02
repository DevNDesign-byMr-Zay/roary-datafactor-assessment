"""Aster Python v015
Authenticated historical derivative: normalize HTTP/data/file media references before upload.
Provider-specific upload logic removed behind a callback.
"""
from __future__ import annotations
import base64, os
from collections.abc import Callable
from typing import Optional

def normalize_media_reference(ref: str, file_bytes: Optional[bytes], filename_hint: str, uploader: Callable[[bytes, str], str]) -> str:
    if isinstance(ref, str) and ref.startswith(("http://", "https://")):
        return ref
    if file_bytes:
        suffix = os.path.splitext(filename_hint or "")[1] or ".png"
        return uploader(file_bytes, suffix)
    if isinstance(ref, str) and ref.startswith("data:"):
        header, encoded = ref.split(",", 1)
        mime = header[5:].split(";", 1)[0] if header.startswith("data:") else "application/octet-stream"
        content = base64.b64decode(encoded.encode("utf-8"))
        suffix = ".jpg" if ("jpeg" in mime or "jpg" in mime) else ".png"
        return uploader(content, suffix)
    return ref or ""
