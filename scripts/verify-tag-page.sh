#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://172.22.0.199:2368"
SLUGS=(tech-docs tech-gear ui-ux readium)

for slug in "${SLUGS[@]}"; do
  url="$BASE_URL/tag/$slug/"
  html="/tmp/tag-$slug.html"
  status=$(curl -s -o "$html" -w '%{http_code}' "$url")
  header_count=$(grep -c 'term-tag-header' "$html" || true)
  featured_count=$(grep -c 'tag-featured' "$html" || true)
  list_count=$(grep -c 'tag-post-list' "$html" || true)
  pagination_count=$(grep -c 'class="pagination"' "$html" || true)

  echo "[$slug] status=$status header=$header_count featured=$featured_count list=$list_count pagination=$pagination_count"
done
