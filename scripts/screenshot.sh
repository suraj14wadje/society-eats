#!/bin/bash
# Usage: ./scripts/screenshot.sh <url-path> <name> [--wait <ms>] [--desktop]
# Example: ./scripts/screenshot.sh /menu menu-home --wait 2000
# Example: ./scripts/screenshot.sh /menu menu-desktop --desktop
#
# Defaults to mobile viewport (390x844, iPhone 14) since the app is mobile-first.
# Pass --desktop to capture the centered max-w-md desktop view at 1280x800.

URL_PATH=${1:?Usage: screenshot.sh <url-path> <name> [--wait <ms>] [--desktop]}
NAME=${2:?Usage: screenshot.sh <url-path> <name> [--wait <ms>] [--desktop]}
shift 2

WAIT=1000
VIEWPORT="390,844"
SUFFIX=""

while [ $# -gt 0 ]; do
  case "$1" in
    --wait)
      WAIT="$2"
      shift 2
      ;;
    --desktop)
      VIEWPORT="1280,800"
      SUFFIX="-desktop"
      shift
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

DATE=$(date +%Y-%m-%d)
OUTPUT="evidence/screenshots/${DATE}-${NAME}${SUFFIX}.png"

mkdir -p evidence/screenshots

npx playwright screenshot \
  --full-page \
  --viewport-size="$VIEWPORT" \
  --wait-for-timeout "$WAIT" \
  "http://localhost:3000${URL_PATH}" \
  "$OUTPUT"

echo "Screenshot saved: $OUTPUT (viewport: $VIEWPORT)"
