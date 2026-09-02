#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://127.0.0.1:8080/v1"

curl -s "$BASE_URL/models" | jq .

curl -s "$BASE_URL/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "phi3-mini",
    "messages": [{"role": "user", "content": "Hello, who are you?"}],
    "max_tokens": 100
  }' | jq .
