# syntax=docker/dockerfile:1.5

# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install turbo globally with better caching
FROM base AS turbo-installer
RUN --mount=type=cache,target=/root/.bun/install/cache \
    --mount=type=cache,target=/root/.npm \
    bun install -g turbo@^2

# Dependency installer - separate stage for better caching
FROM base AS deps
WORKDIR /usr/src/app

# Copy only package files first for better layer caching
COPY package.json bun.lock ./
COPY apps/*/package.json ./apps/
COPY packages/*/package.json ./packages/

# Install ALL dependencies with aggressive caching
RUN --mount=type=cache,target=/root/.bun/install/cache \
    --mount=type=cache,target=/root/.npm \
    bun install --frozen-lockfile

# Pruner stage - create minimal workspace
FROM turbo-installer AS pruner
COPY . .
RUN turbo prune api dashboard --docker

# Builder stage - build both projects
FROM deps AS builder

# Copy turbo
COPY --from=turbo-installer /usr/local/bin/turbo /usr/local/bin/turbo

# Copy source code (but not node_modules)
COPY --from=pruner /usr/src/app/out/full/ .

# Build with turbo using cache
RUN --mount=type=cache,target=/usr/src/app/.turbo \
    turbo build --filter=api --filter=dashboard

# Production stage - minimal final image
FROM oven/bun:1-slim AS release
WORKDIR /usr/src/app

# Install only production dependencies
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/*/package.json ./packages/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --frozen-lockfile

# Copy built application
COPY --from=builder --chown=bun:bun /usr/src/app/apps/api/dist ./apps/backend/
COPY --from=builder --chown=bun:bun /usr/src/app/apps/api/src ./apps/backend/src/
COPY --from=builder --chown=bun:bun /usr/src/app/packages ./packages/
COPY --from=builder --chown=bun:bun /usr/src/app/apps/dashboard/dist ./apps/backend/public/

# Copy startup script
COPY --chown=bun:bun apps/api/start.sh .
RUN chmod +x start.sh

USER bun
EXPOSE 3000
ENTRYPOINT ["./start.sh"]