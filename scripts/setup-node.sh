#!/usr/bin/env bash
# Download portable Node 20 for macOS arm64 (one-time setup)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/.tools"
VER="v20.18.1"
ARCH="darwin-arm64"
DIR="$TOOLS/node-$VER-$ARCH"

if [ -x "$DIR/bin/node" ]; then
  echo "Node already installed at $DIR"
  "$DIR/bin/node" --version
  exit 0
fi

mkdir -p "$TOOLS"
cd "$TOOLS"
echo "Downloading Node $VER for $ARCH…"
curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-$ARCH.tar.gz" -o node.tar.gz
tar -xzf node.tar.gz
rm node.tar.gz
echo "Done. Run: ./start.sh"
