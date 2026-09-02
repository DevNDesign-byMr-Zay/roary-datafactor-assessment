#!/usr/bin/env bash
set -euo pipefail

source "$HOME/aster-llama/bin/activate"

python -m llama_cpp.server \
  --config_file "$HOME/llm-config/aster-models.json" \
  --host 127.0.0.1 --port 8080 \
  --n_ctx 2048 --n_threads 4 --n_batch 128
