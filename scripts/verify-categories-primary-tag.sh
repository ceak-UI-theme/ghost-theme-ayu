#!/usr/bin/env bash
set -euo pipefail
key=$(curl -s http://172.22.0.199:2368/ | grep -oP 'data-key="\K[^"]+' | head -n1)
url="http://172.22.0.199:2368/ghost/api/content/posts/?key=${key}&limit=3"
echo "api:${url}"
curl -s "$url" > /tmp/categories-api.json
head -c 500 /tmp/categories-api.json
echo
if grep -q '"primary_tag"' /tmp/categories-api.json; then
  echo "primary_tag:present"
else
  echo "primary_tag:missing"
fi