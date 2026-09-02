"""Aster Python v027
Authenticated historical derivative: normalize, overlap-chunk, and label knowledge text for retrieval indexing.
Private filesystem paths and model/provider identifiers removed.
"""
from __future__ import annotations
import re

def chunk_text(text: str, chunk_chars: int = 2200, overlap: int = 300) -> list[str]:
    cleaned = (text or "").replace("\r\n", "\n")
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if not cleaned: return []
    step = max(1, int(chunk_chars) - int(overlap))
    return [cleaned[start:start+chunk_chars] for start in range(0, len(cleaned), step) if len(cleaned[start:start+chunk_chars]) >= 200]

def build_chunk_records(source_name: str, text: str, chunk_chars: int = 2200, overlap: int = 300) -> list[dict[str, object]]:
    source = (source_name or "document").replace("\\", "/")
    return [{"id": f"{source}::chunk{i}", "source": source, "chunk_index": i, "text": chunk} for i, chunk in enumerate(chunk_text(text, chunk_chars, overlap))]
