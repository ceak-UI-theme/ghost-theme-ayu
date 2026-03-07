#!/usr/bin/env bash
set -euo pipefail
p='/mnt/d/workspace/02.works/ghost-dev/content/settings/routes.yaml'
if ! grep -q '/secondary-tags/' "$p"; then
  awk '1;/  \/search\/:/{print "  /secondary-tags/:"; print "    template: secondary-tags"}' "$p" > /tmp/routes.yaml
  cp /tmp/routes.yaml "$p"
fi
sed -n '1,80p' "$p"