from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any

Runner = Callable[[str, dict[str, Any]], dict[str, Any]]


def run_candidate_cascade(
    candidates: Iterable[tuple[str, Iterable[dict[str, Any]], dict[str, Any]]],
    run: Runner,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Try ordered processing engines, each with ordered request-schema variants."""
    attempted = False
    last_error: Exception | None = None

    for engine, variants, metadata in candidates:
        for arguments in variants:
            attempted = True
            try:
                result = run(engine, dict(arguments))
                return result, dict(metadata)
            except Exception as exc:
                last_error = exc
                continue

    if not attempted:
        raise ValueError("no candidates supplied")
    if last_error is not None:
        raise last_error
    raise RuntimeError("candidate cascade failed")
