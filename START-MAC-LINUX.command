#!/bin/bash
# Double-click this file on macOS, or run ./START-MAC-LINUX.command in a terminal.

cd "$(dirname "$0")" || exit 1

echo ""
echo "  BIOMOLECULE TOXICITY DETECTIVE"
echo "  =============================="
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is not installed on this computer."
  echo ""
  echo "  Download it from https://nodejs.org (pick the LTS button),"
  echo "  run the installer, then double-click this file again."
  echo ""
  read -r -p "  Press Enter to close. "
  exit 1
fi

echo "  Node $(node -v) found."
echo ""

if [ ! -d node_modules ]; then
  echo "  First run — installing dependencies. This takes about a minute."
  echo ""
  if ! npm install; then
    echo ""
    echo "  Install failed. Check your internet connection and try again."
    read -r -p "  Press Enter to close. "
    exit 1
  fi
  echo ""
fi

echo "  Building the site and starting the server..."
echo ""
echo "  When you see 'listening on http://localhost:4000' below,"
echo "  the site is live. Your browser should open by itself."
echo ""
echo "  To stop the server: press Ctrl+C, or just close this window."
echo ""

# Open the browser once the server has had time to come up.
(
  sleep 8
  if command -v open >/dev/null 2>&1; then
    open http://localhost:4000
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:4000
  fi
) &

npm run preview

echo ""
echo "  Server stopped."
read -r -p "  Press Enter to close. "
