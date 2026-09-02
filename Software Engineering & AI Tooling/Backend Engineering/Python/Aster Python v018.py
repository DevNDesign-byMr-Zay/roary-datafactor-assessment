"""Aster Python v018
Authenticated historical derivative: read an upload stream without consuming it permanently.
"""
from __future__ import annotations
from typing import Any, Optional, Tuple

def read_upload_bytes(upload: Optional[Any]) -> Tuple[Optional[bytes], str]:
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
