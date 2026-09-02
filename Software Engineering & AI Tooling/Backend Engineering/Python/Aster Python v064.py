from __future__ import annotations

from collections.abc import Iterable
from urllib.parse import parse_qs, unquote, urlparse


def unwrap_search_redirect(
    url: str,
    target_params: Iterable[str] = ("url", "u", "target"),
) -> str:
    """Recover a safe HTTP(S) target from a search-result redirect wrapper."""
    value = str(url or "").strip()
    if not value:
        return ""

    try:
        parsed = urlparse(value)
        query = parse_qs(parsed.query)
        for name in target_params:
            raw = query.get(name, [None])[0]
            if not raw:
                continue
            candidate = unquote(raw).strip()
            target = urlparse(candidate)
            if target.scheme in {"http", "https"} and target.netloc:
                return candidate
    except Exception:
        pass

    parsed = urlparse(value)
    return value if parsed.scheme in {"http", "https"} and parsed.netloc else ""
