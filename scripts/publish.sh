#!/usr/bin/env bash
# Publish the built site to live/.
# Dev work stays in dist/; only this script swaps live/.
set -euo pipefail
cd "$(dirname "$0")/.."

bun run build

rm -rf live.new live.old
cp -a dist live.new
if [ -d live ]; then
  mv live live.old
fi
mv live.new live
rm -rf live.old

echo "Published to live/"
