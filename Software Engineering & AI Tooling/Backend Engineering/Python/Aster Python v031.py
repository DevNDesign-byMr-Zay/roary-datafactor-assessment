"""Aster Python v031
Buyer-safe historical derivative: orchestrate masked removal with a provider-agnostic primary/fallback path while preserving diagnostic mask metadata.
"""
from __future__ import annotations
from collections.abc import Callable
from typing import Any


def run_removal_strategy(*, image_ref: str, mask_ref: str = "", prompt: str = "", mask_meta: dict[str, Any] | None = None,
                         run_masked: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
                         run_masked_fallback: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
                         run_unmasked: Callable[[dict[str, Any]], dict[str, Any]] | None = None) -> dict[str, Any]:
    metadata = {"masked": bool(mask_ref), "mask": mask_meta or None}
    if mask_ref:
        args = {"image_url": image_ref, "mask_url": mask_ref}
        if run_masked is not None:
            try:
                return {"result": run_masked(args), "meta": metadata}
            except Exception:
                if run_masked_fallback is None:
                    raise
        if run_masked_fallback is None:
            raise RuntimeError("No masked removal implementation is available")
        fallback_args = {**args, "prompt": prompt}
        return {"result": run_masked_fallback(fallback_args), "meta": {**metadata, "fallback": True}}
    if run_unmasked is None:
        raise RuntimeError("No unmasked removal implementation is available")
    return {"result": run_unmasked({"image_url": image_ref, "prompt": prompt}), "meta": metadata}
