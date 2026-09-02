from __future__ import annotations

import os
from pathlib import Path
from typing import Any


def audit_model_artifacts(models: list[dict[str, Any]], min_bytes: int = 1) -> dict[str, list[dict[str, str]]]:
    """Preflight configured local model artifacts without exposing file contents."""
    ready: list[dict[str, str]] = []
    unavailable: list[dict[str, str]] = []
    threshold = max(0, int(min_bytes))

    for row in models:
        alias = str(row.get("alias") or "").strip()
        target = str(row.get("target") or row.get("model") or row.get("path") or "").strip()
        if not alias or not target:
            continue

        path = Path(target).expanduser()
        status = "ready"
        try:
            if not path.exists():
                status = "missing"
            elif not path.is_file():
                status = "not_file"
            elif path.stat().st_size < threshold:
                status = "empty"
            elif not os.access(path, os.R_OK):
                status = "unreadable"
        except OSError:
            status = "unavailable"

        record = {"alias": alias, "status": status}
        (ready if status == "ready" else unavailable).append(record)

    return {"ready": ready, "unavailable": unavailable}
