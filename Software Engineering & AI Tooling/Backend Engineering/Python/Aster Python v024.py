"""Aster Python v024
Authenticated historical derivative: lightweight lowercase word-token extraction for local retrieval indexes.
"""
from __future__ import annotations
import re

def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9_]+", (text or "").lower())
