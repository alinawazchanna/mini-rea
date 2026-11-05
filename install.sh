#!/bin/bash
# Install mini-rea globally. Usage: ./install.sh
set -euo pipefail

command -v node >/dev/null 2>&1 || { echo "mini-rea: Node.js 18+ is required: https://nodejs.org"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "mini-rea: npm is required (comes with Node.js)"; exit 1; }

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "mini-rea: Node.js 18+ is required (found $(node --version))."
  exit 1
fi

npm install --global .
echo "mini-rea installed. Try: mini-rea doctor"
