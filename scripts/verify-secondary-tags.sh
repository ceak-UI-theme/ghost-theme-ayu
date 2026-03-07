#!/usr/bin/env bash
set -euo pipefail
for u in /categories/ /secondary-tags/; do
  code=$(curl -s -o /tmp/resp.html -w '%{http_code}' "http://172.22.0.199:2368${u}")
  echo "${u} ${code}"
done
curl -s http://172.22.0.199:2368/categories/ > /tmp/cat.html
grep -nE 'Secondary Tags|category-hub-link|/secondary-tags/' /tmp/cat.html | head -n 20 || true
curl -s http://172.22.0.199:2368/secondary-tags/ > /tmp/sec.html
grep -nE 'Secondary Tags|secondary-tags-featured|secondary-tags-grid|term-empty' /tmp/sec.html | head -n 30 || true