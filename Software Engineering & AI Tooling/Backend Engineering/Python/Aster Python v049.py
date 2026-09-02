from __future__ import annotations

from collections.abc import Callable, Iterable
from typing import Any

RunFn = Callable[[dict[str, Any]], dict[str, Any]]


def run_schema_variants(
    variants: Iterable[dict[str, Any]],
    run: RunFn,
    retryable_statuses: tuple[int, ...] = (400, 422, 502),
) -> dict[str, Any]:
    """Try bounded request-schema variants while isolating validation-shaped failures."""
    last_error: Exception | None = None
    attempted = False
    for arguments in variants:
        attempted = True
        try:
            return run(arguments)
        except Exception as exc:
            last_error = exc
            status = getattr(exc, "status_code", None)
            if status is not None and status not in retryable_statuses:
                raise
    if not attempted:
        raise ValueError("no variants supplied")
    if last_error is not None:
        raise last_error
    raise RuntimeError("all variants failed")
