from __future__ import annotations

from collections.abc import Callable
from typing import Any

PrimaryRun = Callable[..., dict[str, Any]]
FallbackRun = Callable[[str, dict[str, Any]], dict[str, Any]]


def run_with_transport_fallback(
    operation: str,
    arguments: dict[str, Any],
    primary: PrimaryRun | None,
    fallback: FallbackRun,
) -> dict[str, Any]:
    """Prefer a client transport, tolerate a legacy call signature, then use a fallback transport."""
    if primary is not None:
        try:
            try:
                return primary(operation, arguments=arguments)
            except TypeError:
                return primary(operation, arguments)
        except Exception:
            pass
    return fallback(operation, arguments)
