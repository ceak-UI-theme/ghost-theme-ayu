#!/usr/bin/env bash
set -euo pipefail

THEME_SRC="/mnt/d/workspace/02.works/ghost-theme-ayu"
GHOST_DEV="/mnt/d/workspace/02.works/ghost-dev"
THEME_NAME="signal-wave-ayu"
RESTART_DOCKER="${1:-}"

echo "[1/6] Build and zip theme"
cd "$THEME_SRC"
npm run zip

ZIP_PATH="$THEME_SRC/dist/${THEME_NAME}.zip"
if [[ ! -f "$ZIP_PATH" ]]; then
  echo "Theme zip not found: $ZIP_PATH" >&2
  exit 1
fi

echo "[2/6] Export signal-wave-ayu.zip"
cp -f "$ZIP_PATH" "$THEME_SRC/signal-wave-ayu.zip"

TARGET="$GHOST_DEV/content/themes/${THEME_NAME}"

echo "[3/6] Replace runtime theme directory"
rm -rf "$TARGET"
mkdir -p "$TARGET"

echo "[4/6] Extract theme zip"
unzip -oq "$ZIP_PATH" -d "$TARGET"

if [[ "$RESTART_DOCKER" == "--restart-docker" ]]; then
  echo "[5/6] Restart docker compose"
  cd "$GHOST_DEV"
  docker compose down
  docker compose up -d
else
  echo "[5/6] Skip docker restart"
fi

echo "[6/6] Done"
echo "Zip: $ZIP_PATH"
echo "Theme path: $TARGET"
