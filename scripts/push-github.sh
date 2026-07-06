#!/usr/bin/env bash
# After creating empty repo on GitHub, run: ./scripts/push-github.sh YOUR_GITHUB_USERNAME
set -e
USER="${1:?Usage: ./scripts/push-github.sh YOUR_GITHUB_USERNAME}"
REPO="homely-pets-store"
cd "$(dirname "$0")/.."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${USER}/${REPO}.git"
git branch -M main
echo ""
echo "Pushing to https://github.com/${USER}/${REPO} ..."
echo "(Sign in to GitHub if prompted)"
echo ""
git push -u origin main
echo ""
echo "Done. Next: https://render.com → New → Blueprint → select ${REPO}"
