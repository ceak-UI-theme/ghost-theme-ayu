#!/usr/bin/env bash
set -euo pipefail
f=/mnt/d/workspace/02.works/ghost-dev/content/themes/wave/assets/images/hub/categories-hero.png
echo "size=$(stat -c%s "$f")"
echo -n "sig="
od -An -t x1 -N 8 "$f"