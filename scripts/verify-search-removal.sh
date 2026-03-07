#!/usr/bin/env bash
set -euo pipefail

HOME_HTML="/tmp/final-home.html"
BASE_URL="http://172.22.0.199:2368"

curl -s "$BASE_URL/" > "$HOME_HTML"

echo "HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")"
echo "NAV_ITEMS_START"
grep -oE '<li class="nav-[^"]+"><a [^>]+>[^<]+</a></li>' "$HOME_HTML" | sed -E 's/.*>([^<]+)<\/a>.*/\1/'
echo "NAV_ITEMS_END"

echo "SEARCH_MENU_COUNT=$(grep -c 'nav-search' "$HOME_HTML" || true)"
echo "SEARCH_ICON_COUNT=$(grep -c 'data-ghost-search' "$HOME_HTML" || true)"
