#!/usr/bin/env bash
set -euo pipefail
for u in \
  http://172.22.0.199:2368/assets/images/hub/categories-hero.png \
  http://172.22.0.199:2368/assets/images/hub/series-hero.png; do
  code=$(curl -s -o /tmp/hubimg.bin -w '%{http_code}' "$u")
  size=$(stat -c%s /tmp/hubimg.bin)
  echo "$u => $code size=$size"
done