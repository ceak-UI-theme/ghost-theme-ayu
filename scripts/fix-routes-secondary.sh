#!/usr/bin/env bash
set -euo pipefail
cat > /tmp/routes.yaml <<'YAML'
routes:
  /rss/:
    template: rss
    content_type: text/xml
  /categories/:
    template: categories
  /series/:
    template: series
  /search/:
    template: search
  /secondary-tags/:
    template: secondary-tags

collections:
  /:
    permalink: /{slug}/
    template: index
    filter: tag:-blog
  /blog/:
    permalink: /blog/{slug}/
    template: blog
    filter: tag:blog
    data: tag.blog

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
YAML
cp /tmp/routes.yaml /mnt/d/workspace/02.works/ghost-dev/content/settings/routes.yaml
sed -n '1,80p' /mnt/d/workspace/02.works/ghost-dev/content/settings/routes.yaml