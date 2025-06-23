# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PaperJet is a privacy-first document processing platform built as a monorepo using Bun and Turbo. It's a full-stack TypeScript application with React frontend, Hono API backend, and PostgreSQL database.

## Essential Commands

### Development
```bash
# Install dependencies
bun install

# Start all services (API, Dashboard, Website)
bun dev

# Start individual apps
cd apps/api && bun dev          # API with hot reload
cd apps/dashboard && bun dev     # React dashboard
cd apps/website && bun dev       # Next.js website

# Database operations (from packages/db)
cd packages/db
bun db:generate  # Generate migrations after schema changes
bun db:migrate   # Apply migrations
bun db:studio    # Open Drizzle Studio GUI
```

### Build & Lint
```bash
# Build all apps
bun build

# Lint and format code
bun lint
```

## Architecture

### API (`/apps/api`)
- **Framework**: Hono on Bun runtime
- **Auth**: Better Auth with session-based authentication
- **Routing**: Modular routes in `/routes` directory
- **Middleware**: Auth middleware validates sessions, public routes defined in array
- **Type Export**: `ApiRoutes` type exported for frontend consumption

### Dashboard (`/apps/dashboard`)
- **Stack**: React + Vite + TanStack Router + TanStack Query
- **Routing**: File-based with `_app` prefix for layouts
- **API Client**: Hono RPC client (`hc`) for type-safe calls
- **State**: Server state via TanStack Query, no global client state

### Database (`/packages/db`)
- **ORM**: Drizzle with PostgreSQL
- **Schema**: Defined in `schema.ts` with foreign key constraints
- **Tables**: `file`, `user`, `session`, `account`, `verification`

### File Storage
- **Backend**: MinIO (S3-compatible) for file storage
- **Pattern**: Metadata in PostgreSQL, content in S3
- **Access**: Presigned URLs for secure downloads

## Key Patterns

### Authentication Flow
1. Client uses `authClient` from better-auth/react
2. Protected routes check session in `beforeLoad`
3. API middleware validates session on every request
4. User context injected into request handlers

### File Upload
1. Client sends FormData to `/api/files`
2. Server validates, generates UUID, creates DB record
3. File uploaded to S3, returns file ID
4. Downloads use presigned URLs

### Type Safety
- End-to-end types from database to UI
- Zod schemas for validation
- API types imported in frontend via Hono RPC

## Environment Setup

Create `.env` files:

**`/apps/api/.env`**:
```env
BETTER_AUTH_SECRET=<generate-secret>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=files
ENVIRONMENT=dev
```

## Code Conventions

- **Formatting**: Biome with spaces (not tabs)
- **Components**: Shadcn/ui components in `/packages/ui`
- **Styling**: Tailwind CSS v4 across all apps
- **Imports**: Organized by Biome rules
- **Error Handling**: Try-catch with specific error responses, toast notifications for user feedback

## Product Vision & Roadmap

### Product Overview

PaperJet is a document processing platform that creates custom AI workflows to process various document types and extract any desired information.

**Core Functionality:**
- Creates custom AI workflows to process various document types
- Extracts and processes any desired information from documents
- Handles diverse documents: invoices, purchase orders, receipts, contracts, agreements, tax forms, bank statements, medical forms, insurance claims, shipping labels, packing slips, quotes, proposals, timesheets, expense reports, utility bills, registration forms
- Supports various formats: normal PDFs, scanned documents, images, technical drawings
- Processes complex content: mixed layouts, infographics, images (not just plain text)
- Facilitates bi-directional data flow (in and out of the system)

### Core Extraction System (MVP Focus)

#### Workflow Creation & Usage
1. User uploads a document to create a new workflow
2. AI analyzes the document and suggests relevant fields for extraction
3. User reviews AI suggestions, then selects and customizes specific fields or tables to extract
4. This configuration is saved as a reusable workflow for similar document types
5. Future documents can use this workflow for consistent data extraction

#### Pre-built Workflows
- System includes ready-to-use workflows for common document types (invoices, receipts, contracts, purchase orders, bank statements, tax forms)
- Users can immediately process documents without creating custom workflows
- Workflows store field names, descriptions, and extraction rules
- Extracted data can be exported in various formats (JSON, CSV, Excel)

### User Experience

Users simply upload documents and receive extracted data without needing technical knowledge. The system provides pre-built workflows for common document types to get started immediately.

### Integrations & Connectors

**Input Sources:**
- Uses connectors to ingest documents from any data source (e.g., Google Drive, Google Notes, Gmail, any email server)
- Supports automated ingestion (e.g., an incoming email with an invoice triggers processing)

**Output Integrations:**
- Integrates with tools like Zapier, Make.com (formerly Integromat)
- Exports processed data to other platforms (e.g., Excel)

### Security & Deployment

- Pitched as a "privacy-first" application
- Can run fully locally, including AI models
- Also offered as a public SaaS with document quotas, hosted on our infrastructure
- Designed for super easy deployments with minimal 3rd party service dependencies
- Self-contained architecture that can run anywhere (local machine, private cloud, or our SaaS)
- Simple deployment options: desktop app, Docker container, or cloud service