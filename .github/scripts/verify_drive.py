#!/usr/bin/env python3
"""Verify the live Drive corpus maps exactly to the mirrored GitHub corpus."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path, PurePosixPath

from import_drive import drive_id, is_source, probe, safe_path, with_drive_suffix

REPO_ROOT = Path(__file__).resolve().parents[2]
STAGING_ROOT = REPO_ROOT / "Software Engineering & AI Tooling"
REPORT_PATH = REPO_ROOT / "VERIFY_REPORT.md"
JSON_PATH = REPO_ROOT / "VERIFY_REPORT.json"


def planned_targets(manifest: list[dict[str, object]]) -> tuple[list[dict[str, str]], list[str]]:
    entries: list[dict[str, object]] = []
    excluded: list[str] = []
    for item in manifest:
        url = str(item.get("url", ""))
        raw = str(item.get("path", ""))
        if not url or not raw:
            excluded.append(raw or "<missing path>")
            continue
        rel = safe_path(raw)
        if not is_source(rel):
            excluded.append(str(rel))
            continue
        entries.append({"id": drive_id(url), "rel": rel})

    counts = Counter(str(e["rel"]).casefold() for e in entries)
    collisions = {path for path, count in counts.items() if count > 1}
    used: set[str] = set()
    planned: list[dict[str, str]] = []

    for entry in entries:
        rel = entry["rel"]
        assert isinstance(rel, PurePosixPath)
        fid = str(entry["id"])
        target_rel = with_drive_suffix(rel, fid) if str(rel).casefold() in collisions else rel
        key = str(target_rel).casefold()
        if key in used:
            target_rel = with_drive_suffix(rel, fid, width=len(fid))
            key = str(target_rel).casefold()
        used.add(key)
        planned.append({"drive_id": fid, "source_path": str(rel), "repository_path": str(target_rel)})

    return planned, excluded


def main() -> int:
    manifest = probe()
    planned, excluded = planned_targets(manifest)

    expected = {item["repository_path"] for item in planned}
    actual = {
        p.relative_to(STAGING_ROOT).as_posix()
        for p in STAGING_ROOT.rglob("*")
        if p.is_file()
    }

    missing = sorted(expected - actual, key=str.casefold)
    unexpected = sorted(actual - expected, key=str.casefold)
    duplicate_expected_paths = len(planned) - len(expected)

    status = (
        "PASS — EXACT LIVE MATCH"
        if not excluded and not missing and not unexpected and duplicate_expected_paths == 0
        else "FAIL — MISMATCH"
    )

    data = {
        "status": status,
        "live_recursive_drive_files": len(manifest),
        "eligible_drive_files": len(planned),
        "excluded_drive_files": len(excluded),
        "repository_files_under_corpus_root": len(actual),
        "missing_repository_files": len(missing),
        "unexpected_repository_files": len(unexpected),
        "duplicate_planned_repository_paths": duplicate_expected_paths,
        "excluded": excluded,
        "missing": missing,
        "unexpected": unexpected,
    }
    JSON_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Live Drive ↔ GitHub Verification",
        "",
        f"- Status: **{status}**",
        f"- Live recursive Drive files discovered now: **{len(manifest)}**",
        f"- Drive files eligible for mirroring: **{len(planned)}**",
        f"- Drive files excluded by importer rules: **{len(excluded)}**",
        f"- Files currently present under the GitHub corpus root: **{len(actual)}**",
        f"- Missing GitHub files: **{len(missing)}**",
        f"- Unexpected GitHub files: **{len(unexpected)}**",
        f"- Duplicate planned repository paths after collision handling: **{duplicate_expected_paths}**",
        "",
        "This check re-probes the live Google Drive root recursively, rebuilds the same collision-safe repository paths used by the importer, and compares the complete expected path set with the files actually present in GitHub.",
    ]
    if excluded:
        lines += ["", "## Excluded Drive paths", ""] + [f"- `{p}`" for p in excluded]
    if missing:
        lines += ["", "## Missing GitHub paths", ""] + [f"- `{p}`" for p in missing]
    if unexpected:
        lines += ["", "## Unexpected GitHub paths", ""] + [f"- `{p}`" for p in unexpected]
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(json.dumps(data, indent=2), flush=True)
    return 0 if status.startswith("PASS") else 1


if __name__ == "__main__":
    raise SystemExit(main())
