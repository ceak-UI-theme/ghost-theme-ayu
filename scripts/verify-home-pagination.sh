#!/usr/bin/env bash
set -euo pipefail
curl -s 'http://172.22.0.199:2368/' > /tmp/home-pagination-final.html

echo "HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' 'http://172.22.0.199:2368/')"
echo "PAGINATION_MARKER=$(grep -c 'ayu-pagination' /tmp/home-pagination-final.html || true)"
echo "PAGE_LINKS_START"
grep -oE '<nav class="ayu-pagination"[\s\S]*?</nav>' /tmp/home-pagination-final.html | grep -oE '>([^<]+)<' | sed -E 's/[><]//g' | sed '/^$/d' || true
echo "PAGE_LINKS_END"
