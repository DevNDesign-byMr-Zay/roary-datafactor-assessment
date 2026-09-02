"""Aster Python v036
Authenticated historical derivative: normalize and split text into overlapping character windows with a minimum tail size.
Product identity, private paths, credentials, and provider coupling removed.
"""
from __future__ import annotations
import re

def chunk_text_overlapping(text: str, chunk_chars: int = 2200, overlap: int = 300, min_chars: int = 200) -> list[str]:
    normalized = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    normalized = re.sub(r"\n{3,}", "\n\n", normalized).strip()
    if not normalized:
        return []
    width = max(1, int(chunk_chars))
    overlap = max(0, min(int(overlap), width - 1))
    step = max(1, width - overlap)
    minimum = max(0, int(min_chars))
    chunks: list[str] = []
    for start in range(0, len(normalized), step):
        chunk = normalized[start:start + width]
        if len(chunk) >= minimum:
            chunks.append(chunk)
    return chunks
