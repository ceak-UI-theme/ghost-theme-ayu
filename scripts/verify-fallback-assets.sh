#!/usr/bin/env bash
set -euo pipefail
for f in post-default.png primary-tag-default.png series-tag-default.png secondary-tag-default.png; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://172.22.0.199:2368/assets/images/fallback/${f}")
  echo "${f}:${code}"
done