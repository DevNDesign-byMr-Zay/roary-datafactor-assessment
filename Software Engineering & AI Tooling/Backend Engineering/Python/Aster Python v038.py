from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any


def normalize_search_results(rows: Iterable[Mapping[str, Any]], limit: int = 5) -> list[dict[str, str]]:
    """Return a bounded, de-duplicated search result list with stable fields."""
    out: list[dict[str, str]] = []
    seen: set[str] = set()

    for row in rows:
        url = str(row.get("url") or row.get("href") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)

        title = str(row.get("title") or "").strip()
        snippet = str(row.get("snippet") or row.get("body") or row.get("text") or "").strip()
        out.append({"title": title, "url": url, "snippet": snippet})

        if len(out) >= max(0, limit):
            break

    return out
