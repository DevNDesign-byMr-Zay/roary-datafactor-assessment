"""Aster Python v034
Authenticated historical derivative: recursively enumerate eligible text-like files by extension.
Product identity, private paths, credentials, and provider coupling removed.
"""
from __future__ import annotations
from collections.abc import Iterable, Iterator
from pathlib import Path

DEFAULT_TEXT_EXTENSIONS = frozenset({
    ".txt", ".md", ".markdown", ".json", ".yaml", ".yml", ".csv", ".tsv",
    ".html", ".htm", ".css", ".js", ".ts", ".py", ".log",
})

def iter_eligible_files(root: Path, allowed_extensions: Iterable[str] = DEFAULT_TEXT_EXTENSIONS) -> Iterator[Path]:
    allowed = {str(ext).lower() for ext in allowed_extensions}
    if not root.exists():
        return
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in allowed:
            yield path
