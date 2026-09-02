"""Aster Python v037
Authenticated historical derivative: assemble chunk metadata and a tokenized lexical corpus from a file tree.
Product identity, private paths, credentials, and provider coupling removed.
"""
from __future__ import annotations
from collections.abc import Callable, Iterable
from pathlib import Path
from typing import Any

def build_lexical_corpus(
    root: Path,
    files: Iterable[Path],
    read_text: Callable[[Path], str],
    chunk_text: Callable[[str], list[str]],
    tokenize: Callable[[str], list[str]],
) -> tuple[list[dict[str, Any]], list[list[str]]]:
    documents: list[dict[str, Any]] = []
    corpus_tokens: list[list[str]] = []
    for path in files:
        raw = read_text(path)
        relative = str(path.relative_to(root)).replace("\\", "/")
        for index, chunk in enumerate(chunk_text(raw)):
            documents.append({
                "id": f"{relative}::chunk{index}",
                "source": relative,
                "chunk_index": index,
                "text": chunk,
            })
            corpus_tokens.append(tokenize(chunk))
    return documents, corpus_tokens
