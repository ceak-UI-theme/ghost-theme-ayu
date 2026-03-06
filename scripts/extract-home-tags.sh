#!/usr/bin/env bash
set -euo pipefail
curl -s 'http://172.22.0.199:2368/' > /tmp/home-now.html
grep -oE '/tag/[^"[:space:]]+' /tmp/home-now.html | sort -u || true
