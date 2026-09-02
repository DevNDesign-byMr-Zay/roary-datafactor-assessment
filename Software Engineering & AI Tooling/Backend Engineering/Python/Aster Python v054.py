from __future__ import annotations

import hashlib
import os
from pathlib import Path


def artifact_fingerprint(path: str | os.PathLike[str]) -> dict[str, int | float | str]:
    """Fingerprint a local runtime artifact without exposing its filesystem path."""
    target = Path(path)
    digest = hashlib.sha256()
    size = 0

    with target.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            size += len(chunk)
            digest.update(chunk)

    stat = target.stat()
    return {
        "sha256": digest.hexdigest(),
        "bytes": size,
        "mtime": float(stat.st_mtime),
    }
