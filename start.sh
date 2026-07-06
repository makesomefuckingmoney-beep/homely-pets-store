#!/usr/bin/env bash
# One-click start: Homely Pets store + Stripe (macOS)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

NODE_BIN="$ROOT/.tools/node-v20.18.1-darwin-arm64/bin"
if [ ! -x "$NODE_BIN/node" ]; then
  echo "Setting up Node (first time only)…"
  bash "$ROOT/scripts/setup-node.sh"
fi
export PATH="$NODE_BIN:$PATH"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env — add your Stripe keys if checkout fails."
fi

if [ ! -d node_modules ]; then
  echo "Installing packages…"
  npm install
fi

node scripts/build-products-json.js

# Free port if something stale is running
if lsof -ti :4242 >/dev/null 2>&1; then
  echo "Restarting store on port 4242…"
  lsof -ti :4242 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

URL="http://localhost:4242"
echo ""
echo "  Homely Pets → $URL"
echo "  Press Ctrl+C to stop"
echo ""

(sleep 1.5 && open "$URL" 2>/dev/null) &

exec node server.js
