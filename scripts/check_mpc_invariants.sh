#!/bin/sh
# Refuses forbidden engine names in dependency manifests.
# Docs and skills name those strings in order to ban them, so they are not scanned.
set -eu
cd "$(dirname "$0")/.."
banned='silence-laboratories|entropyxyz/synedrion|backend-rug|insecure-assume-preimage-known|wallet-plugin-wombat|Private during development'
found=0
for f in package.json package-lock.json; do
  if [ -f "$f" ] && grep -E -n "$banned" "$f"; then
    found=1
  fi
done
if [ "$found" -ne 0 ]; then
  echo "banned snippet found in a manifest" >&2
  exit 1
fi
echo "manifests clean"
