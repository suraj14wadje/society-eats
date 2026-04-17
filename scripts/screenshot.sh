#!/bin/bash
# Usage: ./scripts/screenshot.sh <url-path> <name> [--wait <ms>]
# Example: ./scripts/screenshot.sh /dashboard dashboard-home --wait 2000

URL_PATH=${1:?Usage: screenshot.sh <url-path> <name> [--wait <ms>]}
NAME=${2:?Usage: screenshot.sh <url-path> <name> [--wait <ms>]}
WAIT=${4:-1000}
DATE=$(date +%Y-%m-%d)
OUTPUT="evidence/screenshots/${DATE}-${NAME}.png"

mkdir -p evidence/screenshots

npx playwright screenshot \
  --full-page \
  --wait-for-timeout "$WAIT" \
  "http://localhost:3000${URL_PATH}" \
  "$OUTPUT"

echo "Screenshot saved: $OUTPUT"
