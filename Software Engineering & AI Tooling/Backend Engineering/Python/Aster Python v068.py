from __future__ import annotations

from typing import Any, Mapping


def _to_nonnegative_int(value: Any, fallback: int = 0) -> int:
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return max(0, int(fallback))


def normalize_expansion_pads(
    values: Mapping[str, Any] | None = None,
    *,
    pad_left: Any = 0,
    pad_right: Any = 0,
    pad_top: Any = 0,
    pad_bottom: Any = 0,
    expand_left: Any = None,
    expand_right: Any = None,
    expand_top: Any = None,
    expand_bottom: Any = None,
) -> tuple[int, int, int, int]:
    """Resolve equivalent pad/expand field names with explicit values, mapping overrides, and nonnegative output."""
    resolved = {
        "left": expand_left if expand_left is not None else pad_left,
        "right": expand_right if expand_right is not None else pad_right,
        "top": expand_top if expand_top is not None else pad_top,
        "bottom": expand_bottom if expand_bottom is not None else pad_bottom,
    }
    aliases = {
        "expand_left": "left", "expand_right": "right", "expand_top": "top", "expand_bottom": "bottom",
        "pad_left": "left", "pad_right": "right", "pad_top": "top", "pad_bottom": "bottom",
    }
    for key, side in aliases.items():
        if values and key in values:
            resolved[side] = values[key]
    return tuple(_to_nonnegative_int(resolved[side]) for side in ("left", "right", "top", "bottom"))
