from __future__ import annotations

import os
from collections.abc import Callable

UploadFn = Callable[[bytes, str], str]
DecodeFn = Callable[[str], tuple[bytes, str]]


def coerce_remote_image_ref(
    ref: str,
    file_bytes: bytes | None,
    filename_hint: str,
    upload: UploadFn,
    decode_data_url: DecodeFn,
) -> str:
    """Turn HTTP refs, uploaded bytes, or data URLs into one remotely usable image reference."""
    ref = ref.strip() if isinstance(ref, str) else ""
    if ref.startswith(("http://", "https://")):
        return ref

    if file_bytes:
        suffix = os.path.splitext(filename_hint or "")[1] or ".png"
        return upload(file_bytes, suffix)

    if ref.startswith("data:"):
        content, mime = decode_data_url(ref)
        suffix = ".jpg" if "jpeg" in mime.casefold() or "jpg" in mime.casefold() else ".png"
        return upload(content, suffix)

    return ref
