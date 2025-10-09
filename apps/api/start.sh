#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations from the packages/db directory
cd /usr/src/app/packages/db
bunx drizzle-kit migrate

# Start the application with correct path to node_modules
cd /usr/src/app/apps/api
NODE_PATH=/usr/src/app/node_modules exec bun src/index.ts

