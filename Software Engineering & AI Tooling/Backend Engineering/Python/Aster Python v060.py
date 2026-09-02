"""Aster Python v060
Authenticated historical derivative: normalize result envelopes across dictionary, attribute-based, and model-serialization client versions.
"""
from __future__ import annotations
from typing import Any

def normalize_client_payload(result: Any) -> Any:
    if result is None:
        return None

    if isinstance(result, dict):
        nested = result.get("data")
        if isinstance(nested, (dict, list)):
            return nested
        return result

    data = getattr(result, "data", None)
    if data is not None:
        return data

    model_dump = getattr(result, "model_dump", None)
    if callable(model_dump):
        try:
            return model_dump()
        except Exception:
            pass

    to_dict = getattr(result, "dict", None)
    if callable(to_dict):
        try:
            return to_dict()
        except Exception:
            pass

    return result
