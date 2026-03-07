#!/usr/bin/env bash
set -euo pipefail
key=$(curl -s http://172.22.0.199:2368/ | grep -oP 'data-key="\K[^"]+' | head -n1)
url="http://172.22.0.199:2368/ghost/api/content/posts/?key=${key}&filter=primary_tag:tech-docs&limit=1"
echo "check:${url}"
curl -s "$url" | grep -o '"total":[0-9]*' | head -n 1