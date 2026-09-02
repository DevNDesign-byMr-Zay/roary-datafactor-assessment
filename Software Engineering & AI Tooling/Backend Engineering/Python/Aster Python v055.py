from __future__ import annotations

from collections.abc import Iterable


def operation_capability(
    operation: str,
    methods: Iterable[str],
    expected_inputs: Iterable[str],
) -> dict[str, object]:
    """Describe an operation contract so clients can probe capability without executing it."""
    name = str(operation).strip()
    normalized_methods: list[str] = []
    for method in methods:
        value = str(method).strip().upper()
        if value and value not in normalized_methods:
            normalized_methods.append(value)

    inputs: list[str] = []
    for item in expected_inputs:
        value = str(item).strip()
        if value and value not in inputs:
            inputs.append(value)

    return {
        "ok": bool(name and normalized_methods),
        "operation": name,
        "methods": normalized_methods,
        "expects": inputs,
    }
