#!/usr/bin/env bash
set -euo pipefail
for slug in tech-docs tech-gear ui-ux readium; do
  html="/tmp/tag-$slug-check.html"
  curl -s "http://172.22.0.199:2368/tag/$slug/" > "$html"
  header=$(grep -c 'term-tag-header' "$html" || true)
  featured=$(grep -c 'tag-featured-title' "$html" || true)
  list=$(grep -c 'tag-post-list-title' "$html" || true)
  pag=$(grep -c 'class="pagination"' "$html" || true)
  printf '%s header=%s featured=%s list=%s pagination=%s\n' "$slug" "$header" "$featured" "$list" "$pag"
done
