#!/usr/bin/env bash
set -euo pipefail

for p in categories series; do
  url="http://172.22.0.199:2368/$p/"
  code=$(curl -s -o "/tmp/$p.html" -w '%{http_code}' "$url")
  echo "$p:$code"
  grep -nE 'Featured category|All primary categories|Featured series|All series|Latest posts across all primary categories|Latest posts in ongoing multi-part writeups' "/tmp/$p.html" | head -n 20 || true
done
