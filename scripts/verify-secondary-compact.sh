#!/usr/bin/env bash
set -euo pipefail
curl -s http://172.22.0.199:2368/secondary-tags/ > /tmp/sec.html
grep -nE 'secondary-tags-featured|secondary-tags-grid' /tmp/sec.html | head -n 20 || true
css=$(grep -o '/assets/built/screen.css?v=[^" ]*' /tmp/sec.html | head -n 1)
echo "css:${css}"
curl -s "http://172.22.0.199:2368${css}" > /tmp/screen.css
grep -nE 'secondary-tags-featured \{|secondary-tags-featured \.tag-header-image|secondary-tag-thumb \{' /tmp/screen.css | head -n 20 || true