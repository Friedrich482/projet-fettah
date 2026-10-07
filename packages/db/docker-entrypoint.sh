#!/bin/sh
set -e

echo "Running postgres migrations..."
pnpm --prefix node_modules/@repo/db --config.verify-deps-before-run=false  run migrate

printf "\nStarting api...\n"
exec "$@"