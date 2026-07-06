#!/usr/bin/env bash
# Sync labels, supplier pack, and Downloads zip
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$HOME/Library/Application Support/Cursor/User/workspaceStorage/c5877af1e520ce01974f4a573d838239/images"
SITE="$ROOT/images/labels"
SUP="$ROOT/supplier-pack/02-product-labels/labels"

echo "→ Syncing labels from supplier masters…"
"$ROOT/scripts/sync-labels.sh"

echo "→ Building supplier + website zip…"
rm -f "$ROOT/homely-pets-supplier-pack.zip"
(cd "$ROOT" && zip -rq homely-pets-supplier-pack.zip supplier-pack -x "*.DS_Store")
cp -f "$ROOT/homely-pets-supplier-pack.zip" "$HOME/Downloads/Homely-Pets-Supplier-Pack.zip"
rm -rf "$HOME/Downloads/Homely-Pets-Supplier-Pack"
unzip -q "$HOME/Downloads/Homely-Pets-Supplier-Pack.zip" -d "$HOME/Downloads"
mv "$HOME/Downloads/supplier-pack" "$HOME/Downloads/Homely-Pets-Supplier-Pack"

rm -f "$HOME/Downloads/Homely-Pets-Website.zip"
(cd "$ROOT" && zip -rq "$HOME/Downloads/Homely-Pets-Website.zip" . \
  -x "*.DS_Store" -x "homely-pets-supplier-pack.zip" -x "supplier-pack/*" -x "scripts/*")

echo "✓ Done — $(ls -1 "$SITE" | wc -l | tr -d ' ') labels, Downloads updated"
