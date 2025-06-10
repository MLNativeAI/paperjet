# Fullstack Hono + React Template

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![React](https://img.shields.io/badge/React-61DAFB.svg?style=for-the-badge&logo=React&logoColor=black)](https://react.dev)
[![Hono](https://img.shields.io/badge/Hono-E36002.svg?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444.svg?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/repo)

A lightning-fast, self-hostable template for building modern Single Page Applications with Hono and React, powered by Turborepo for efficient monorepo management.

## 🚀 Demo

Check it out for yourself: [hono-react.mlnative.com](https://hono-react.mlnative.com)

## 💡 Why?
****
This template bridges the gap between using a do-it-all framework and having to configure everything on your own. Despite the SSR/ISR/RSC trends, sometimes what you really need is a simple, efficient way to build SPA + backend applications.

### Key Benefits

- Lightning fast for developing SPAs with Turborepo's caching
- Zero cloud-based vendor dependencies
- Self-hostable with ease
- Highly configurable monorepo structure
- Pre-configured essentials without bloat
- Re-deploys in < 1 minute
- Shared code between packages

## ⚡ Technical Features

- Fullstack type safety with [Hono RPC](https://hono.dev/guides/rpc)
- Unified Docker image build for simple deployments
- Built-in auth handling with [BetterAuth](https://github.com/betterstack-community/better-auth) (fully local)
- Type-safe environment variables (not needed at build time)
- Type-safe client-side navigation
- Efficient dependencies management with Turborepo

## 📦 Template Features

- Sign up & Sign in (extendible with additional BetterAuth providers)
- Dashboard Layout with [Shadcn UI](https://ui.shadcn.com/)
- File handling (upload, storage & retrieval)
- Shared types between frontend and backend

> File handling can be particularly annoying to set up, so we've purposefully included this in the "base" template.

## 🛠 Tech Stack

### Monorepo

- [Turborepo](https://turbo.build/repo) - High-performance monorepo build system
- [Bun](https://bun.sh) - Fast JavaScript runtime with built-in package manager

### Backend

- [Bun](https://bun.sh) - JavaScript runtime & toolkit
- [Hono](https://hono.dev) - Lightweight web framework
- [DrizzleORM](https://orm.drizzle.team) - TypeScript ORM
- [BetterAuth](https://github.com/betterstack-community/better-auth) - Authentication library
- [Zod](https://zod.dev) - TypeScript-first schema validation

### Frontend

- [React 19](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [TailwindCSS](https://tailwindcss.com) - CSS framework
- [Shadcn UI](https://ui.shadcn.com) - UI component library
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [TanStack Query](https://tanstack.com/query) - Data synchronization

## 🏗 Project Structure

The project is organized as a Turborepo monorepo with the following structure:

```
├── apps/
│   ├── frontend/  # React application
│   └── backend/   # Hono API server
├── packages/
│   └── shared/    # Shared types and utilities
└── package.json   # Root workspace configuration
```

- In development mode, run them concurrently with Turborepo
- In production, frontend gets bundled and served by the backend

### Runtime Dependencies

1. **[PostgreSQL](https://www.postgresql.org/)** - easily swappable with another DB provider (see [Drizzle docs](https://orm.drizzle.team/docs/installation-and-db-connection))
2. **[MinIO](https://min.io/)** - for file storage (self-hostable on [Coolify](https://coolify.io/) or use any S3 provider like [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/))

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) or similar OCI runtime (e.g., [Orbstack](https://orbstack.dev/))
- [Bun](https://bun.sh) (v1.2.0 or later)

### Local Development

1. Start the DB and Minio instance:
```bash
docker compose up -d
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cd apps/backend
cp .env.example .env  # No modifications required
```

4. Run migrations:
```bash
cd apps/backend
bunx drizzle-kit migrate
```

5. Start the development environment:
```bash
# From project root
bun turbo dev
```

Your application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

> In development mode, all API requests are automatically proxied to the backend with CORS configured.

## 🚢 Deployment

The project can be deployed to any platform that supports Docker containers ([Coolify](https://coolify.io/), [DigitalOcean](https://www.digitalocean.com/), [Fly.io](https://fly.io/), etc.).

### Building the Docker Image

```bash
docker build -t hono-spa .
```

The application runs on port 3000 by default. The Docker build contains both frontend and backend, with automatic DB migrations on startup.

## Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following command:

```bash
bunx turbo link
```

## 👏 Acknowledgements

This project was largely inspired by [Bun-Hono-React-Expense-Tracker](https://github.com/meech-ward/Bun-Hono-React-Expense-Tracker)
