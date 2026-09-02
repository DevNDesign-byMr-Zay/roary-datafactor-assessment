#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${1:-${HOME}/llm-config/aster-models.json}"

if [[ ! -s "$REGISTRY" ]]; then
  printf 'model registry missing or empty: %s\n' "$REGISTRY" >&2
  exit 1
fi

if ! jq -e 'type == "object" and (.models | type == "object") and (.models | length > 0)' "$REGISTRY" >/dev/null; then
  printf 'model registry is not a non-empty models object: %s\n' "$REGISTRY" >&2
  exit 1
fi

printf 'model registry valid: %s\n' "$REGISTRY"
