"""Aster Python v033
Authenticated historical derivative: deterministic lightweight text tokenization for lexical retrieval.
Product identity, private paths, credentials, and provider coupling removed.
"""
from __future__ import annotations
import re

_TOKEN_RE = re.compile(r"[a-z0-9_]+")

def tokenize_lexical(text: str) -> list[str]:
    """Lowercase text and return simple alphanumeric/underscore terms."""
    return _TOKEN_RE.findall((text or "").lower())
