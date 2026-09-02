"""Aster Python v030
Buyer-safe historical derivative: reject effectively empty removal masks using a measurable coverage threshold.
"""
from __future__ import annotations
from typing import Any


def require_meaningful_mask(stats: dict[str, Any], minimum_ratio: float = 0.0008) -> dict[str, Any]:
    ratio = stats.get("ratio") if isinstance(stats, dict) else None
    if not isinstance(ratio, (int, float)):
        raise ValueError("Mask coverage is unavailable")
    threshold = max(0.0, float(minimum_ratio))
    if float(ratio) < threshold:
        raise ValueError("Mask is empty or too small")
    return stats
