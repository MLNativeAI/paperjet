# Deployment Pipeline Summary

This document provides an overview of the enhanced CI/CD pipeline with automatic Coolify deployment.

## Pipeline Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Push to Main  │───▶│  Build & Push    │───▶│  Deploy to Dev  │
│                 │    │  Docker Image    │    │   (Coolify)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Semantic Release│───▶│  Build & Push    │───▶│ Update Release  │───▶│ Deploy to Prod  │
│                 │    │Multi-Arch Images │    │   with Docker   │    │   (Coolify)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

## Workflows

### 1. Development Workflow (`docker-dev.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Process:**
1. Build Docker image: `mlnative/paperjet-dev:main-{sha}`
2. Push to Docker Hub
3. Update Coolify dev application image tag
4. Trigger deployment

**Environment:** `development`

### 2. Production Workflow (`release.yml`)

**Triggers:**
- Push to `main` (for release creation)
- Manual workflow dispatch

**Process:**
1. Create semantic release (if changes warrant it)
2. Build multi-platform Docker images: `mlnative/paperjet:{version}`, `mlnative/paperjet:latest`
3. Push to Docker Hub
4. Update GitHub release with Docker info
5. Update Coolify production application image tag
6. Trigger deployment

## Key Features

### ✅ Automatic Deployment
- No manual intervention required
- Deploys immediately after successful image build

### ✅ Environment Separation
- Separate dev/prod environments with different configurations
- Uses GitHub Environments for security

### ✅ Image Tag Management
- Development: Uses commit SHA for traceability
- Production: Uses semantic versioning + latest tag

### ✅ Error Handling
- Deployment only triggers on successful image builds
- PR builds don't trigger deployments
- Comprehensive error reporting

### ✅ Security
- API tokens stored as GitHub secrets
- Environment-based access controls
- No sensitive data in workflow files

## Image Strategy

### Development Images
- **Repository**: `mlnative/paperjet-dev`
- **Tags**: 
  - `main-{sha}` (each commit)
  - `latest` (latest main branch)
  - `{date}-{sha}` (daily builds)

### Production Images
- **Repository**: `mlnative/paperjet`
- **Tags**:
  - `{version}` (e.g., `1.2.3`)
  - `{major}.{minor}` (e.g., `1.2`)
  - `{major}` (e.g., `1`)
  - `latest`

## Benefits

1. **Faster Deployments**: Automatic deployment reduces time from code to production
2. **Consistency**: Same process for every deployment reduces human error
3. **Traceability**: Clear mapping between commits, images, and deployments
4. **Rollback Capability**: Easy to revert to previous image versions
5. **Monitoring**: All deployments logged in GitHub Actions