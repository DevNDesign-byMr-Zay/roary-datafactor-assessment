#!/usr/bin/env bash
set -euo pipefail

docker stop localai 2>/dev/null || true
docker rm localai 2>/dev/null || true

docker pull quay.io/go-skynet/local-ai:latest-aio-cpu

docker run -d --name localai \
  -p 8080:8080 \
  -v /home/developer/aster-localai/models:/models \
  -e MODELS_CONFIG_FILE=/models/models.yaml \
  -e NUM_THREADS=8 \
  quay.io/go-skynet/local-ai:latest-aio-cpu

curl http://localhost:8080/readyz
curl http://localhost:8080/v1/models | jq .
