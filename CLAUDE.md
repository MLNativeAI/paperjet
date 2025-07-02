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
- **Routing**: Modular routes in `/routes` directory (e.g., `workflows.ts`, `files.ts`)
- **Middleware**: Auth middleware validates sessions, public routes defined in array
- **Type Export**: `ApiRoutes` type exported for frontend consumption
- **Architecture**: Thin HTTP layer that delegates business logic to Engine package

### Engine (`/packages/engine`)
- **Purpose**: Centralized business logic and AI processing
- **Services**: Domain-specific service classes (`WorkflowService`, `FileService`)
- **Dependencies**: AI SDK, database, S3 storage
- **Exports**: Services and types for consumption by API and other apps

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
- **Logging**: Always put the object before the message in logger calls (e.g., `logger.info(object, message)` not `logger.info(message, object)`)

## Backend Development Guidelines

### Architecture Principles

#### 1. Separation of Concerns (MANDATORY)
- **API Layer** (`/apps/api`): HTTP handling, validation, authentication, response formatting
- **Engine Layer** (`/apps/engine`): Business logic, AI processing, data operations
- **Database Layer** (`/packages/db`): Schema, migrations, type definitions

#### 2. Service-Oriented Architecture
- **All business logic MUST be implemented in service classes within the Engine package**
- **API routes should be thin wrappers that delegate to Engine services**
- **Services should be dependency-injected with required resources (S3, database)**

### Engine Package Structure

```
packages/engine/
├── index.ts                    # Main exports
├── src/
│   ├── services/              # Business logic services
│   │   ├── workflow-service.ts # Workflow operations
│   │   ├── file-service.ts     # File operations
│   │   └── [domain]-service.ts # Future domain services
│   └── types/
│       └── index.ts           # Engine-specific types
```

### Service Development Patterns

#### 1. Service Class Structure
```typescript
export interface ServiceDeps {
    s3: S3Interface;
    // Other dependencies
}

export class DomainService {
    constructor(private deps: ServiceDeps) {}

    async operation(params: ValidationSchema): Promise<ResultType> {
        // Business logic implementation
    }
}
```

#### 2. API Route Implementation
```typescript
import { DomainService } from "@paperjet/engine";

const domainService = new DomainService({ s3 });

const router = app
    .get("/", async (c) => {
        try {
            const user = await getUser(c);
            const result = await domainService.operation(user.id);
            return c.json(result);
        } catch (error) {
            // Handle specific error types
            if (error instanceof DomainError) {
                return c.json({ error: error.message }, 400);
            }
            return c.json({ error: "Internal server error" }, 500);
        }
    });
```

### Development Rules

#### 1. Business Logic Placement (MANDATORY)
- **NEVER put business logic directly in API route handlers**
- **ALL AI processing, data validation, and complex operations go in Engine services**
- **API routes should only handle HTTP concerns (auth, validation, response formatting)**

#### 2. Error Handling Patterns
- **Services throw typed errors for specific failure cases**
- **API routes catch and convert service errors to appropriate HTTP responses**
- **Use specific error messages for client-side handling**

#### 3. Dependency Injection
- **Services receive dependencies through constructor injection**
- **Abstract external dependencies (S3, AI models) behind interfaces**
- **Makes services testable and environment-agnostic**

#### 4. File Naming Conventions
- **Service files**: `kebab-case-service.ts` (e.g., `workflow-service.ts`)
- **Route files**: `kebab-case.ts` (e.g., `workflows.ts`, `files.ts`)
- **Type files**: `kebab-case.ts` or `index.ts` for main exports

### Code Review Checklist (Backend)

When reviewing backend code, ensure:
- [ ] No business logic in API route handlers
- [ ] All complex operations delegated to Engine services
- [ ] Services use dependency injection pattern
- [ ] Proper error handling with specific error types
- [ ] Input validation using Zod schemas
- [ ] Type safety maintained end-to-end
- [ ] File naming follows conventions

### Testing Strategy

#### Unit Testing
- **Services are easily unit testable with mocked dependencies**
- **Test business logic independently of HTTP layer**
- **Mock S3, database, and AI services for isolated testing**

#### Integration Testing
- **Test API routes with real service instances**
- **Verify end-to-end flow from HTTP request to response**
- **Use test database and S3 instances**

### Performance Considerations

#### 1. AI Processing
- **Background processing for long-running AI operations**
- **Streaming responses for real-time feedback**
- **Caching strategies for frequently accessed AI results**

#### 2. Database Operations
- **Use database transactions for multi-step operations**
- **Implement proper indexing for common queries**
- **Batch operations where possible**

#### 3. File Storage
- **Presigned URLs for direct client-to-S3 uploads**
- **Efficient file metadata storage in database**
- **Cleanup strategies for temporary files**

### Frontend Development Rules

#### 1. Data Logic Separation (MANDATORY)
- **ALWAYS extract data modifications and state handlers into dedicated custom hooks**
- **Pages/components should focus ONLY on UI rendering and user interactions**
- **Create hooks like `useWorkflows`, `useWorkflow`, `useExecutions`, etc.**
- **Centralize all API calls, mutations, state management, and business logic in hooks**
- **Ensure hooks are reusable across multiple components**

**Benefits:**
- 🔄 Better code reusability - hooks can be shared across components
- 🧪 Improved testability - data logic can be unit tested independently
- 🛠️ Easier maintenance - centralized business logic
- 📦 Clear separation of concerns - UI vs data responsibilities
- ⚡ Better performance - optimized query/mutation strategies

#### 2. File Naming Convention (MANDATORY)
- **Use `kebab-case.tsx` for ALL React component and page files**
- **Examples: `workflow-list.tsx`, `execution-detail.tsx`, `user-profile.tsx`**
- **This applies to both component files and hook files**
- **Hook files: `use-workflows.ts`, `use-workflow.ts`, `use-executions.ts`**

**Benefits:**
- 🎯 Consistency with modern frontend conventions
- 🔍 Better searchability and organization
- 📁 Cleaner file structure in IDEs and file explorers
- 🌐 Web-friendly naming convention

#### 3. Implementation Guidelines
- **Before creating a new page/component, ALWAYS plan the hook structure first**
- **Extract ANY data fetching, mutations, or complex state logic into hooks**
- **Keep components focused on JSX, event handlers, and UI state only**
- **Make hooks composable and testable**
- **Use TypeScript interfaces to define hook return types**
- **Follow the existing pattern established in `/hooks/` directory**

#### 4. Code Review Checklist
When reviewing frontend code, ensure:
- [ ] No direct API calls in components (should be in hooks)
- [ ] No complex business logic in components
- [ ] File names use kebab-case
- [ ] Hooks are properly typed and documented
- [ ] Components focus only on UI concerns
- [ ] Data logic is centralized and reusable

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