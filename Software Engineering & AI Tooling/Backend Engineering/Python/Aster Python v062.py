from __future__ import annotations

from collections.abc import Callable, Iterable, Mapping
from typing import Any


SearchAdapter = Callable[[str, int], list[Mapping[str, Any]]]


def run_search_cascade(
    query: str,
    adapters: Iterable[tuple[str, SearchAdapter]],
    limit: int = 5,
) -> dict[str, Any]:
    """Try search adapters in order and expose empty/error attempts instead of failing silently."""
    attempts: list[dict[str, str]] = []

    for name, search in adapters:
        try:
            rows = list(search(query, limit))
        except Exception as exc:
            attempts.append({"adapter": name, "status": "error", "error": type(exc).__name__})
            continue

        if rows:
            attempts.append({"adapter": name, "status": "ok"})
            return {"results": rows[: max(0, limit)], "adapter": name, "attempts": attempts}

        attempts.append({"adapter": name, "status": "empty"})

    return {"results": [], "adapter": None, "attempts": attempts}
