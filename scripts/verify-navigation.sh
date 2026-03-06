#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://172.22.0.199:2368"
HOME_HTML="/tmp/nav-home.html"

curl -s "$BASE_URL/" > "$HOME_HTML"

echo "HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")"
echo "TAG_TECH_DOCS_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/tag/tech-docs/")"
echo "CATEGORIES_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/categories/")"
echo "SERIES_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/series/")"
echo "SEARCH_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/search/")"

echo "NAV_ITEMS_START"
grep -oE '<li class="nav-[^"]+"><a [^>]+>[^<]+</a></li>' "$HOME_HTML" | sed -E 's/.*>([^<]+)<\/a>.*/\1/'
echo "NAV_ITEMS_END"

echo "HAS_THEME_TOGGLE=$(grep -c 'js-theme-toggle' "$HOME_HTML" || true)"
echo "HAS_SIGNIN=$(grep -c 'data-portal="signin"' "$HOME_HTML" || true)"
echo "HAS_SUBSCRIBE=$(grep -c 'data-portal="signup"' "$HOME_HTML" || true)"
