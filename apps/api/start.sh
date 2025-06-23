#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
cd /usr/src/app
bunx drizzle-kit migrate --config=apps/backend/drizzle.config.ts

# Start the application with correct path to node_modules
cd apps/backend
NODE_PATH=/usr/src/app/node_modules exec bun index.ts 