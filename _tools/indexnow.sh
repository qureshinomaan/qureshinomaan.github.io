#!/bin/sh
# Optional: tell Bing (and the other IndexNow search engines) that the site changed,
# so new and updated pages are picked up within hours instead of days.
# Run this after a push has gone live:  sh _tools/indexnow.sh
# The key below is public by design; it matches the file 91cc60d8f7ae7a7246bafa68d9d960c5.txt at the site root.
set -e
SITE="https://qureshinomaan.github.io"
KEY="91cc60d8f7ae7a7246bafa68d9d960c5"
URLS=$(curl -s "$SITE/sitemap.xml" | grep -o '<loc>[^<]*' | sed 's/<loc>//' | awk '{printf "%s\"%s\"", (NR>1?",":""), $0}')
curl -s -o /dev/null -w "IndexNow replied with HTTP %{http_code}\n" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"qureshinomaan.github.io\",\"key\":\"$KEY\",\"keyLocation\":\"$SITE/$KEY.txt\",\"urlList\":[$URLS]}"
