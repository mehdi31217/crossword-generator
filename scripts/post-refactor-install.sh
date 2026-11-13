#!/bin/bash
# post-refactor-install.sh
# Run this after switching to the refactor branch to install new dependencies
# and verify the build

set -e

echo "=== 1. Installing server dependencies (pino + pino-pretty) ==="
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2/server"
npm install

echo ""
echo "=== 2. TypeScript type check (frontend) ==="
cd "/Users/mehdipoursoleiman/Desktop/crossword-gen-pro (8) 2 2"
npx tsc --noEmit 2>&1

echo ""
echo "=== 3. Build check ==="
npm run build 2>&1

echo ""
echo "=== 4. Server start test ==="
cd server
timeout 5 node index.js 2>&1 || true

echo ""
echo "=== ✅ All checks complete ==="
