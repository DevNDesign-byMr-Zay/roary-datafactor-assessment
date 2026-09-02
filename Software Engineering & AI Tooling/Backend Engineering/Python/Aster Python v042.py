from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any


def normalize_model_registry(payload: Any, max_models: int = 64) -> list[dict[str, str]]:
    """Normalize bounded alias-to-artifact model configuration into a stable list."""
    if max_models < 1:
        return []

    root = payload.get("models", payload) if isinstance(payload, Mapping) else payload
    rows: list[tuple[Any, Any]] = []

    if isinstance(root, Mapping):
        rows.extend(root.items())
    elif isinstance(root, Sequence) and not isinstance(root, (str, bytes, bytearray)):
        for item in root:
            if not isinstance(item, Mapping):
                continue
            rows.append((item.get("alias") or item.get("name"), item.get("model") or item.get("path")))
    else:
        return []

    normalized: list[dict[str, str]] = []
    seen_aliases: set[str] = set()
    seen_targets: set[str] = set()

    for alias_value, target_value in rows:
        alias = str(alias_value or "").strip()
        target = str(target_value or "").strip()
        if not alias or not target:
            continue

        alias_key = alias.casefold()
        target_key = target.casefold()
        if alias_key in seen_aliases or target_key in seen_targets:
            continue

        seen_aliases.add(alias_key)
        seen_targets.add(target_key)
        normalized.append({"alias": alias, "target": target})
        if len(normalized) >= max_models:
            break

    return normalized
