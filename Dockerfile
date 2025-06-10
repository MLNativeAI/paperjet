# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies and build all packages
FROM base AS build
# Copy package.json files for all workspaces
COPY package.json turbo.json ./
COPY apps/backend/package.json apps/backend/bun.lock ./apps/backend/
COPY apps/frontend/package.json apps/frontend/bun.lock ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages with Turborepo
RUN bun turbo build

# Final production image
FROM base AS release
WORKDIR /usr/src/app

# Copy necessary files for production
# Copy root node_modules and workspace files
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/apps/backend ./apps/backend
COPY --from=build /usr/src/app/apps/frontend/dist ./apps/backend/public
COPY --from=build /usr/src/app/packages/shared/dist ./packages/shared/dist

# Make the startup script executable
COPY apps/backend/start.sh .
RUN chmod +x start.sh

# Run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "./start.sh" ]