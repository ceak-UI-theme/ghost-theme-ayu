#!/usr/bin/env bash
set -euo pipefail
cd /mnt/d/workspace/02.works/ghost-dev
sql="SELECT t.slug, COUNT(p.id) AS published_posts FROM tags t LEFT JOIN posts_tags pt ON pt.tag_id = t.id LEFT JOIN posts p ON p.id = pt.post_id AND p.status = 'published' GROUP BY t.slug ORDER BY t.slug;"
docker exec ghostdev_mysql mysql -ughost -pghostpass ghost -e "$sql"
