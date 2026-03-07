#!/usr/bin/env bash
set -euo pipefail
for u in / /categories/ /series/ /secondary-tags/; do
  code=$(curl -s -o /tmp/p.html -w '%{http_code}' "http://172.22.0.199:2368${u}")
  echo "${u} ${code}"
done
curl -s http://172.22.0.199:2368/ > /tmp/home.html
curl -s http://172.22.0.199:2368/categories/ > /tmp/categories.html
curl -s http://172.22.0.199:2368/series/ > /tmp/series.html
curl -s http://172.22.0.199:2368/secondary-tags/ > /tmp/secondary.html

echo '---fallback markers---'
grep -nE 'assets/images/fallback/post-default|assets/images/fallback/primary-tag-default|assets/images/fallback/series-tag-default|assets/images/fallback/secondary-tag-default' /tmp/home.html /tmp/categories.html /tmp/series.html /tmp/secondary.html | head -n 80 || true