"""Aster Python v020
Authenticated historical derivative: retry schema variants against a pluggable callable while preserving the terminal error.
"""
from __future__ import annotations
from collections.abc import Callable, Iterable
from typing import Any

def run_variants(call: Callable[[dict[str, Any]], dict[str, Any]], variants: Iterable[dict[str, Any]]) -> dict[str, Any]:
    last_error: Exception | None = None
    for args in variants:
        try: return call(args)
        except Exception as exc: last_error = exc
    if last_error is not None: raise last_error
    raise RuntimeError("No variants were supplied")
