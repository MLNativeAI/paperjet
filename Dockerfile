# Use the official Bun image
FROM oven/bun:1.3.0 AS base
WORKDIR /usr/src/app

# Install turbo globally with cache mount
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install -g turbo@2.5.9-canary.8

# Pruner stage - create minimal workspace for API, dashboard, and engine
FROM base AS pruner
COPY . .
RUN turbo prune @paperjet/api @paperjet/dashboard --docker

# Installer stage - install dependencies using pruned lockfile
FROM base AS installer
WORKDIR /usr/src/app

# Copy the pruned package.json files and lockfile
COPY --from=pruner /usr/src/app/out/json/ .
COPY --from=pruner /usr/src/app/out/bun.lock ./bun.lock

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install

# Builder stage - build both projects
FROM base AS builder
WORKDIR /usr/src/app

# Copy the full pruned source code
COPY --from=pruner /usr/src/app/out/full/ .
# Copy installed dependencies from installer stage
COPY --from=installer /usr/src/app/ .

# Build both the API and dashboard using turbo
RUN turbo build --filter=@paperjet/api --filter=@paperjet/dashboard

# Final production image
FROM base AS release
WORKDIR /usr/src/app

# Copy necessary files for production
COPY --from=builder --chown=bun:bun /usr/src/app/apps/api ./apps/api
COPY --from=builder --chown=bun:bun /usr/src/app/packages ./packages
COPY --from=builder --chown=bun:bun /usr/src/app/node_modules ./node_modules


# Copy and make the startup script executable
COPY --chown=bun:bun apps/api/start.sh .
RUN chmod +x start.sh

# Set production environment
ENV NODE_ENV=production

# Switch to non-root user
USER bun

# Expose port
EXPOSE 3000/tcp

# Run the app
ENTRYPOINT ["./start.sh"]
