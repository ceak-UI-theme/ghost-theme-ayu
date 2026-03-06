#!/usr/bin/env bash
set -euo pipefail
cd /mnt/d/workspace/02.works/ghost-dev
docker exec ghostdev_mysql mysql -ughost -pghostpass ghost <<'SQL'
SELECT t.slug, t.name, COUNT(pt.post_id) AS post_count
FROM tags t
LEFT JOIN posts_tags pt ON t.id = pt.tag_id
GROUP BY t.id, t.slug, t.name
ORDER BY t.slug;
SQL
