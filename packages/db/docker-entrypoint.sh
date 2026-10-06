#!/bin/sh
set -e

echo "Running postgres migrations..."
pnpm -F=@repo/db migrate

printf "\nStarting api...\n"
exec "$@"