from __future__ import annotations

from importlib import import_module
from types import ModuleType
from typing import Iterable


def load_first_available_module(candidates: Iterable[str]) -> tuple[str, ModuleType] | None:
    """Load the first available compatible module name without hard-failing optional features."""
    for name in candidates:
        module_name = str(name).strip()
        if not module_name:
            continue
        try:
            return module_name, import_module(module_name)
        except ModuleNotFoundError as exc:
            if exc.name != module_name:
                raise
    return None
