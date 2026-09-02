#!/usr/bin/env bash
set -euo pipefail

SERVER_MODULE="${SERVER_MODULE:?set SERVER_MODULE}"
MODEL_FILE="${MODEL_FILE:?set MODEL_FILE}"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-5151}"

HELP_TEXT="$(python -m "$SERVER_MODULE" --help 2>&1 || true)"
ARGS=(--model "$MODEL_FILE" --host "$HOST" --port "$PORT")

supports_flag() {
  local flag="$1"
  grep -Fq -- "$flag" <<<"$HELP_TEXT"
}

supports_flag --n_ctx && ARGS+=(--n_ctx "${N_CTX:-2048}")
supports_flag --n_threads && ARGS+=(--n_threads "${N_THREADS:-4}")
supports_flag --n_batch && ARGS+=(--n_batch "${N_BATCH:-128}")

exec python -m "$SERVER_MODULE" "${ARGS[@]}"
