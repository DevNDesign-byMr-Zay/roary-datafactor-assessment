#!/usr/bin/env bash
set -euo pipefail
for f in ../12_BUYER_PAYLOAD/01_LICENSABLE_OUTPUTS/*; do
  test -s "$f"
done
echo PASS
