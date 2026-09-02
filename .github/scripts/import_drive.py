#!/usr/bin/env python3
"""Mirror the Software Engineering & AI Tooling Drive corpus for assessment."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path, PurePosixPath
from urllib.parse import parse_qs, urlparse

import requests

ROOT_FOLDER_ID = "1oUiGwTRyBuDRNsy6bRyx7v78d94ASEYs"
ROOT_URL = f"https://drive.google.com/drive/folders/{ROOT_FOLDER_ID}"
REPO_ROOT = Path(__file__).resolve().parents[2]
STAGING_ROOT = REPO_ROOT / "Software Engineering & AI Tooling"
REPORT_PATH = REPO_ROOT / "IMPORT_REPORT.md"
FAILURES_PATH = REPO_ROOT / "IMPORT_FAILURES.json"
WORKERS = 32
CONNECT_TIMEOUT_SECONDS = 5
READ_TIMEOUT_SECONDS = 15

SOURCE_SUFFIXES = {
    ".asm", ".bash", ".c", ".cc", ".cfg", ".cjs", ".clj", ".cljs", ".cmake",
    ".conf", ".cpp", ".cs", ".css", ".csv", ".dart", ".env", ".fish", ".fs",
    ".fsx", ".go", ".gql", ".graphql", ".h", ".hpp", ".htm", ".html", ".ini",
    ".java", ".js", ".jsx", ".json", ".kt", ".kts", ".less", ".lua", ".m",
    ".make", ".md", ".mjs", ".mm", ".php", ".pl", ".pm", ".properties",
    ".ps1", ".psd1", ".psm1", ".py", ".r", ".rb", ".rs", ".sass", ".scala",
    ".scss", ".sh", ".sql", ".svelte", ".swift", ".tf", ".tfvars", ".toml",
    ".ts", ".tsx", ".txt", ".vue", ".xml", ".yaml", ".yml", ".zsh",
}
SOURCE_BASENAMES = {
    "dockerfile", "makefile", "gemfile", "procfile", "rakefile", "justfile",
    "requirements.txt", "pipfile", "package.json", "package-lock.json",
    "pnpm-lock.yaml", "yarn.lock", "composer.json", "cargo.toml", "go.mod", "go.sum",
}
USER_AGENT = "Mozilla/5.0 (compatible; DatafactorCorpusImporter/1.0)"


def probe() -> list[dict[str, str]]:
    p = subprocess.run(
        ["gdown", ROOT_URL, "--folder", "--json", "--quiet"],
        check=True, text=True, capture_output=True, timeout=240,
    )
    data = json.loads(p.stdout)
    if not isinstance(data, list):
        raise RuntimeError("Drive probe did not return a list")
    return data


def drive_id(url: str) -> str:
    parsed = urlparse(url)
    query = parse_qs(parsed.query).get("id")
    if query and query[0]:
        return query[0]
    match = re.search(r"/(?:d|folders)/([A-Za-z0-9_-]{10,})", parsed.path)
    if match:
        return match.group(1)
    for token in reversed([p for p in parsed.path.split("/") if p]):
        if re.fullmatch(r"[A-Za-z0-9_-]{20,}", token):
            return token
    raise ValueError(f"Cannot resolve Drive ID from {url!r}")


def safe_path(raw: str) -> PurePosixPath:
    p = PurePosixPath(raw.replace("\\", "/"))
    parts = [part for part in p.parts if part not in ("", ".")]
    if p.is_absolute() or ".." in parts:
        raise ValueError(f"Unsafe Drive path: {raw!r}")
    if parts and parts[0].casefold() == "software engineering & ai tooling":
        parts = parts[1:]
    if not parts:
        raise ValueError(f"Empty Drive path: {raw!r}")
    return PurePosixPath(*parts)


def is_source(path: PurePosixPath) -> bool:
    name = path.name.casefold()
    return name in SOURCE_BASENAMES or name.startswith(".env") or path.suffix.casefold() in SOURCE_SUFFIXES


def with_drive_suffix(path: PurePosixPath, fid: str, width: int = 10) -> PurePosixPath:
    suffix = "".join(path.suffixes)
    stem = path.name[:-len(suffix)] if suffix else path.name
    clean = re.sub(r"[^A-Za-z0-9_-]", "", fid)[:width]
    return path.with_name(f"{stem}.drive-{clean}{suffix}")


def looks_like_drive_error_page(response: requests.Response, data: bytes) -> bool:
    disposition = response.headers.get("content-disposition", "").lower()
    if "attachment" in disposition:
        return False
    sample = data[:4096].lower()
    markers = (
        b"google drive",
        b"request access",
        b"sign in",
        b"quota exceeded",
        b"download quota",
        b"virus scan warning",
    )
    return (b"<html" in sample or b"<!doctype html" in sample) and any(m in sample for m in markers)


def request_download(url: str) -> tuple[bool, bytes, str]:
    try:
        response = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=(CONNECT_TIMEOUT_SECONDS, READ_TIMEOUT_SECONDS),
            allow_redirects=True,
        )
    except requests.RequestException as exc:
        return False, b"", f"{type(exc).__name__}: {exc}"
    if response.status_code != 200:
        return False, b"", f"HTTP {response.status_code}: {response.text[:500]}"
    data = response.content
    if not data:
        return False, b"", "empty response body"
    if looks_like_drive_error_page(response, data):
        return False, b"", "Drive returned an HTML access/quota page instead of file bytes"
    return True, data, ""


def download(fid: str, destination: Path) -> tuple[bool, str]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    urls = [
        f"https://drive.usercontent.google.com/download?id={fid}&export=download&confirm=t",
        f"https://drive.google.com/uc?export=download&id={fid}&confirm=t",
    ]
    errors: list[str] = []
    for url in urls:
        ok, data, error = request_download(url)
        if ok:
            destination.write_bytes(data)
            return True, ""
        errors.append(error)
    if destination.exists():
        destination.unlink()
    return False, " | ".join(errors)[-4000:]


def main() -> int:
    manifest = probe()
    entries: list[dict[str, object]] = []
    excluded = 0
    for item in manifest:
        url = str(item.get("url", ""))
        raw = str(item.get("path", ""))
        if not url or not raw:
            continue
        rel = safe_path(raw)
        if not is_source(rel):
            excluded += 1
            continue
        entries.append({"url": url, "id": drive_id(url), "rel": rel})

    if not entries:
        raise RuntimeError("No source/configuration files found")

    counts = Counter(str(e["rel"]).casefold() for e in entries)
    collisions = {path for path, count in counts.items() if count > 1}
    if STAGING_ROOT.exists():
        shutil.rmtree(STAGING_ROOT)
    STAGING_ROOT.mkdir(parents=True, exist_ok=True)

    used: set[str] = set()
    planned: list[dict[str, object]] = []
    collision_files = 0
    for entry in entries:
        rel = entry["rel"]
        assert isinstance(rel, PurePosixPath)
        fid = str(entry["id"])
        collision = str(rel).casefold() in collisions
        target_rel = with_drive_suffix(rel, fid) if collision else rel
        key = str(target_rel).casefold()
        if key in used:
            target_rel = with_drive_suffix(rel, fid, width=len(fid))
            key = str(target_rel).casefold()
        used.add(key)
        if collision:
            collision_files += 1
        planned.append({**entry, "target_rel": target_rel})

    failures: list[dict[str, str]] = []
    imported = 0
    completed = 0

    def worker(item: dict[str, object]) -> tuple[dict[str, object], bool, str]:
        target_rel = item["target_rel"]
        assert isinstance(target_rel, PurePosixPath)
        target = STAGING_ROOT.joinpath(*target_rel.parts)
        ok, error = download(str(item["id"]), target)
        return item, ok, error

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = [pool.submit(worker, item) for item in planned]
        for future in as_completed(futures):
            item, ok, error = future.result()
            completed += 1
            rel = item["rel"]
            target_rel = item["target_rel"]
            fid = str(item["id"])
            print(f"[{completed}/{len(planned)}] {'OK' if ok else 'BLOCKED'} {rel}", flush=True)
            if ok:
                imported += 1
            else:
                assert isinstance(target_rel, PurePosixPath)
                failures.append({
                    "drive_id": fid,
                    "source_path": str(rel),
                    "repository_path": str(PurePosixPath("Software Engineering & AI Tooling") / target_rel),
                    "url": str(item["url"]),
                    "error": error,
                })

    failures.sort(key=lambda x: x["repository_path"].casefold())
    FAILURES_PATH.write_text(json.dumps(failures, indent=2) + "\n", encoding="utf-8")
    report = [
        "# Drive Import Report", "",
        f"- Source folder ID: `{ROOT_FOLDER_ID}`",
        f"- Recursive Drive entries discovered: **{len(manifest)}**",
        f"- Assessment-relevant source/configuration entries selected: **{len(entries)}**",
        f"- Imported automatically: **{imported}**",
        f"- Authenticated follow-up required: **{len(failures)}**",
        f"- Non-source/binary entries excluded: **{excluded}**",
        f"- Files in duplicate-path groups preserved with Drive-ID suffixes: **{collision_files}**",
        f"- Direct-download workers: **{WORKERS}**",
        "",
        "Every duplicate-path Drive entry receives a distinct repository path. Files that cannot be fetched through direct shared-link download are recorded in `IMPORT_FAILURES.json` for authenticated Drive recovery rather than silently omitted.",
        "",
    ]
    REPORT_PATH.write_text("\n".join(report), encoding="utf-8")
    print("\n".join(report), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
