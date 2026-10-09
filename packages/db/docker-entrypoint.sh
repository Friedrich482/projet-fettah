#!/bin/sh
set -e

echo "Running postgres migrations..."
node ./node_modules/@repo/db/dist/src/migrator.js
printf "\nMigrations ran successfully\n"
printf "\nStarting api...\n"
exec "$@"