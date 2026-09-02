#!/usr/bin/env bash
set -euo pipefail

test -f index.mjs
node --check index.mjs

printf 'entry point present and syntactically valid\n'
