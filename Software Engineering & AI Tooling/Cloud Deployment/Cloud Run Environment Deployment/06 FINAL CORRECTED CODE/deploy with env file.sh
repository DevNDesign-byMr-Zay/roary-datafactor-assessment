#!/usr/bin/env bash
set -euo pipefail

: "${SERVICE_NAME:?Set SERVICE_NAME}"
: "${REGION:=us-central1}"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --env-vars-file run-env.yaml
