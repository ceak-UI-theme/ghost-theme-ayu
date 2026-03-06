#!/usr/bin/env bash
set -euo pipefail

base="http://172.22.0.199:2368"

curl -s "$base/" > /tmp/home-final-check.html
home_cards=$(grep -c '<article class="post ' /tmp/home-final-check.html || true)
home_page_total=$(grep -o 'data-total-pages="[0-9]*"' /tmp/home-final-check.html | head -n 1 | sed -E 's/[^0-9]//g')

echo "HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$base/")"
echo "HOME_POST_CARDS=$home_cards"
echo "HOME_TOTAL_PAGES=${home_page_total:-0}"

curl -s "$base/tag/tech-docs/" > /tmp/tag-tech-docs-final.html
tag_cards=$(grep -c '<article class="post ' /tmp/tag-tech-docs-final.html || true)
featured_count=$(grep -c 'class="tag-featured-title"' /tmp/tag-tech-docs-final.html || true)
list_count=$(grep -c 'class="tag-post-list-title"' /tmp/tag-tech-docs-final.html || true)

echo "TAG_TECH_DOCS_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$base/tag/tech-docs/")"
echo "TAG_TECH_DOCS_POST_CARDS=$tag_cards"
echo "TAG_TECH_DOCS_FEATURED_SECTION=$featured_count"
echo "TAG_TECH_DOCS_LIST_SECTION=$list_count"
