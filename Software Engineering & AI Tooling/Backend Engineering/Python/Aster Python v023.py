"""Aster Python v023
Authenticated historical derivative: plan multi-step outpaint padding so each side stays under a per-call maximum.
"""
from __future__ import annotations

def plan_outpaint_steps(left: int, right: int, top: int, bottom: int, max_pad_per_step: int) -> list[dict[str, int]]:
    remaining = {"left": max(0,int(left)), "right": max(0,int(right)), "top": max(0,int(top)), "bottom": max(0,int(bottom))}
    limit = max(1, int(max_pad_per_step))
    steps: list[dict[str,int]] = []
    while any(remaining.values()):
        step = {side: min(value, limit) for side, value in remaining.items()}
        steps.append(step)
        for side, value in step.items(): remaining[side] -= value
    return steps
