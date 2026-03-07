#!/usr/bin/env bash
set -euo pipefail
key=$(curl -s http://172.22.0.199:2368/ | grep -oP 'data-key="\K[^"]+' | head -n1)
echo "key:$key"
curl -s "http://172.22.0.199:2368/ghost/api/content/posts/?key=${key}&include=tags&limit=5&fields=id,slug,title" > /tmp/posts-fields.json
head -c 700 /tmp/posts-fields.json
echo
grep -o '"primary_tag"' /tmp/posts-fields.json | head -n 3 || true