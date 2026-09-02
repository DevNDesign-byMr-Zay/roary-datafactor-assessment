"""Aster Python v019
Authenticated historical derivative: coerce multipart image/mask inputs into a single normalized structure.
"""
from __future__ import annotations
from typing import Any, Optional

def _read_upload_bytes(upload: Optional[Any]) -> tuple[Optional[bytes], str]:
    if not upload: return None, ""
    filename = getattr(upload, "filename", "") or ""
    try:
        content = upload.file.read()
        if hasattr(upload.file, "seek"):
            try: upload.file.seek(0)
            except Exception: pass
        return content, filename
    except Exception:
        return None, filename

def coerce_edit_inputs(image: Optional[Any], image_url: Optional[str], prompt: Optional[str], mask: Optional[Any] = None, mask_url: Optional[str] = None) -> dict[str, Any]:
    image_bytes, image_name = _read_upload_bytes(image)
    mask_bytes, mask_name = _read_upload_bytes(mask)
    return {"image_ref": (image_url or "").strip(), "image_bytes": image_bytes, "image_name": image_name or "image.png", "prompt": (prompt or "").strip(), "mask_ref": (mask_url or "").strip(), "mask_bytes": mask_bytes, "mask_name": mask_name or "mask.png"}
