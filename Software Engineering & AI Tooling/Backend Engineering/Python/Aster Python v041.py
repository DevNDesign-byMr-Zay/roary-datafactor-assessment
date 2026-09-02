from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

SearchFn = Callable[[str, int], Awaitable[list[dict[str, str]]]]
FetchFn = Callable[[str], Awaitable[dict[str, Any]]]


async def browse_with_isolated_failures(
    query: str,
    search: SearchFn,
    fetch: FetchFn,
    max_sources: int = 3,
) -> dict[str, Any]:
    """Search, fetch, and retain successful sources without failing the whole turn."""
    results = await search(query, max_sources)
    sources: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []

    for row in results[:max_sources]:
        url = row.get("url", "").strip()
        if not url:
            continue
        try:
            page = await fetch(url)
        except Exception as exc:
            errors.append({"url": url, "error": type(exc).__name__})
            continue

        sources.append({
            "title": row.get("title", ""),
            "url": page.get("url", url),
            "snippet": row.get("snippet", ""),
            "content": page.get("content") or page.get("text") or "",
        })

    return {"query": query, "sources": sources, "errors": errors}
