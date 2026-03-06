#!/usr/bin/env bash
set -euo pipefail
for slug in tech-docs tech-gear ui-ux readium; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://172.22.0.199:2368/tag/$slug/")
  printf '%s %s\n' "$slug" "$code"
done
