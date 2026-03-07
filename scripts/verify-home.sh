#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://172.22.0.199:2368"

curl -s "$BASE_URL/" > /tmp/ghost-home.html
PAGE2_STATUS=$(curl -s -o /tmp/ghost-page2.html -w '%{http_code}' "$BASE_URL/page/2/")
HOME_STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/")

SITE_INTRO_COUNT=$(grep -c 'site-intro' /tmp/ghost-home.html || true)
HERO_CLASS_COUNT=$(grep -E -c 'gh-cover|site-cover|hero' /tmp/ghost-home.html || true)
POST_FEED_COUNT=$(grep -c 'post-feed' /tmp/ghost-home.html || true)

CSS_PATH=$(grep -o '/assets/built/screen.css[^"[:space:]]*' /tmp/ghost-home.html | head -n 1)
CSS_SITE_INTRO_COUNT=0
if [[ -n "$CSS_PATH" ]]; then
  curl -s "$BASE_URL$CSS_PATH" > /tmp/ghost-screen.css
  CSS_SITE_INTRO_COUNT=$(grep -c '\.site-intro' /tmp/ghost-screen.css || true)
fi

echo "HOME_STATUS=$HOME_STATUS"
echo "PAGE2_STATUS=$PAGE2_STATUS"
echo "SITE_INTRO_COUNT=$SITE_INTRO_COUNT"
echo "HERO_CLASS_COUNT=$HERO_CLASS_COUNT"
echo "POST_FEED_COUNT=$POST_FEED_COUNT"
echo "CSS_PATH=$CSS_PATH"
echo "CSS_SITE_INTRO_COUNT=$CSS_SITE_INTRO_COUNT"
