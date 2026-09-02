#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-compatible-studio}"

if [[ -e "$APP_DIR" ]]; then
  printf 'destination already exists: %s\n' "$APP_DIR" >&2
  exit 2
fi

npm create vite@latest "$APP_DIR" -- --template react-ts
cd "$APP_DIR"
npm install

npm run build
printf 'react-typescript bootstrap verified: %s\n' "$APP_DIR"
