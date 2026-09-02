#!/usr/bin/env bash
set -euo pipefail
: "${SERVICE_URL:?Set SERVICE_URL}"
: "${TOKEN:?Set TOKEN to the deployed service token}"

curl -s -H "x-app-token: $TOKEN" "$SERVICE_URL/health"
printf '\n'
curl -s -H "x-app-token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"smoke","text":"Say hi."}' \
  "$SERVICE_URL/chat"
printf '\n'
