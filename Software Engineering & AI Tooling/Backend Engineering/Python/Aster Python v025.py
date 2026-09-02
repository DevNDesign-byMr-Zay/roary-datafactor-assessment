"""Aster Python v025
Authenticated historical derivative: recursively enumerate text-like knowledge files by extension.
"""
from __future__ import annotations
from pathlib import Path
from collections.abc import Iterable

DEFAULT_EXTENSIONS = {".txt",".md",".markdown",".json",".yaml",".yml",".csv",".tsv",".html",".htm",".css",".js",".ts",".py",".log"}

def iter_text_files(root: Path, allowed_extensions: set[str] | None = None) -> Iterable[Path]:
    allowed = allowed_extensions or DEFAULT_EXTENSIONS
    if not root.exists(): return
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in allowed: yield path
