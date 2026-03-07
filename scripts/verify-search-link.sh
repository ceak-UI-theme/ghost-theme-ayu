#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://172.22.0.199:2368"
HTML="/tmp/home-search-link.html"

curl -s "$BASE_URL/" > "$HTML"

echo "HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")"
echo "SEARCH_PAGE_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/search/")"
echo "SEARCH_ICON_LINK_COUNT=$(grep -o 'class="gh-search gh-icon-btn"[^>]*href="[^"]*"' "$HTML" | grep -c '/search/' || true)"
echo "GHOST_SEARCH_ATTR_COUNT=$(grep -c 'data-ghost-search' "$HTML" || true)"
