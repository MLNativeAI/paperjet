#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations
cd apps/backend
bunx drizzle-kit migrate

# Start the application with correct path to node_modules
NODE_PATH=/usr/src/app/node_modules exec bun index.ts 