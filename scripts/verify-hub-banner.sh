#!/usr/bin/env bash
set -e
for u in / /categories/ /series/; do
  code=$(curl -s -o /tmp/hub-check.html -w '%{http_code}' "http://172.22.0.199:2368${u}")
  echo "${u} ${code}"
done
curl -s http://172.22.0.199:2368/categories/ > /tmp/categories.html
curl -s http://172.22.0.199:2368/series/ > /tmp/series.html
grep -nE 'term-tag-header|categories-hero.png|Explore posts organized by topic.' /tmp/categories.html | head -n 10
grep -nE 'term-tag-header|series-hero.png|Collections of long-form essays and themed series.' /tmp/series.html | head -n 10