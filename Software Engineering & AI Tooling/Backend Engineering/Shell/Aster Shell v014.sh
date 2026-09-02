#!/usr/bin/env bash
set -euo pipefail

URL="${1:?usage: $0 URL DESTINATION}"
DEST="${2:?usage: $0 URL DESTINATION}"
TMP="${DEST}.partial"

cleanup() { rm -f "$TMP"; }
trap cleanup EXIT

curl --fail --location --retry 2 --output "$TMP" "$URL"

if [[ ! -s "$TMP" ]]; then
  printf 'download produced an empty artifact: %s\n' "$URL" >&2
  exit 1
fi

mv "$TMP" "$DEST"
trap - EXIT
printf 'artifact saved: %s\n' "$DEST"
