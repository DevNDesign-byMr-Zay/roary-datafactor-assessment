"""Aster Python v026
Authenticated historical derivative: resilient UTF-8 text loading with byte-decoding fallback.
"""
from __future__ import annotations
from pathlib import Path

def read_text_resilient(path: Path) -> str:
    try: return path.read_text(encoding="utf-8")
    except Exception:
        try: return path.read_text(encoding="utf-8", errors="ignore")
        except Exception: return path.read_bytes().decode("utf-8", errors="ignore")
