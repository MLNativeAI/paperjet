# Use the official Bun image
FROM oven/bun:alpine AS base


# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files from monorepo root and workspace
COPY package.json bun.lock ./
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/email/package.json ./packages/email/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY apps/website/package.json ./apps/website/package.json

# Install dependencies
RUN bun install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the website app
WORKDIR /app/apps/website
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=builder /app/apps/website/public ./apps/website/public

USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/website/server.js"]