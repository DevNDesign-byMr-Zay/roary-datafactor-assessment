from __future__ import annotations

from collections.abc import Callable
from typing import Any

RefineStep = Callable[[str, str, float, int], str]


def _chunks(text: str, max_chars: int) -> list[str]:
    value = " ".join(str(text or "").split())
    cap = max(32, int(max_chars))
    return [value[i : i + cap] for i in range(0, len(value), cap)] if value else []


def bounded_refinement_chain(
    initial_ref: str,
    user_text: str,
    run_step: RefineStep,
    *,
    max_chars: int = 380,
    max_calls: int = 4,
    passes: int = 1,
    initial_strength: float = 1.0,
    followup_factor: float = 0.75,
    minimum_followup_strength: float = 0.60,
) -> dict[str, Any]:
    """Apply chunked sequential refinements with a strict call cap and decreasing follow-up strength."""
    chunks = _chunks(user_text, max_chars)
    if not chunks:
        return {"ref": initial_ref, "calls": 0, "complete": True}

    cap = max(1, int(max_calls))
    desired = max(min(len(chunks), cap), max(1, int(passes)))
    total = min(desired, cap)
    current = str(initial_ref)

    for index in range(total):
        chunk = chunks[index] if index < len(chunks) else chunks[-1]
        strength = float(initial_strength)
        if index:
            strength = max(float(minimum_followup_strength), strength * float(followup_factor))
        next_ref = run_step(current, chunk, strength, index)
        if isinstance(next_ref, str) and next_ref.strip():
            current = next_ref.strip()

    return {"ref": current, "calls": total, "complete": total >= len(chunks)}
