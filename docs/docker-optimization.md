# Docker Build Optimization Guide

## Overview

This document outlines the optimizations made to reduce Docker build times from ~10 minutes to ~2-3 minutes.

## Key Optimizations Implemented

### 1. Added `.dockerignore` File
**Impact: High (reduces context from 1.22GB to ~50MB)**

The `.dockerignore` file excludes unnecessary files from the build context:
- Git files and directories
- Node modules (they're installed fresh in Docker)
- Build outputs and caches
- Development tools and configs
- Documentation and test files

### 2. Removed Redundant Build Steps
**Impact: Medium (saves ~37 seconds)**

The GitHub Actions workflow was building the project twice:
1. Once in the CI environment
2. Once inside Docker

We removed the redundant `bun install` and `bun run build` steps from the workflow.

### 3. Optimized Caching Strategy
**Impact: High (reduces cache export from 308s to ~30s)**

- Switched from GitHub Actions cache to Docker registry cache
- Uses `type=registry` which is much faster than `type=gha`
- Implements inline cache for better layer reuse

### 4. Separated Platform Builds
**Impact: Medium (parallel builds save ~75 seconds)**

- AMD64 builds by default (fast)
- ARM64 builds only on main branch pushes
- Runs in parallel when both are needed

### 5. Enhanced Dockerfile with Build Mounts
**Impact: High (better dependency caching)**

The optimized Dockerfile uses:
- `--mount=type=cache` for package manager caches
- Better layer ordering for maximum cache hits
- Separate dependency installation stage
- Production-only dependencies in final image

### 6. Fixed Lockfile Issues
**Impact: Medium (consistent builds)**

- Copies `bun.lockb` instead of `bun.lock`
- Uses `--frozen-lockfile` flag
- Prevents dependency resolution on every build

## Performance Metrics

### Before Optimization:
- Context transfer: 18.9s (1.22GB)
- Dependencies install: ~21s (with failures)
- Build time: 82.1s (ARM64), 7.1s (AMD64)  
- Cache export: 307.8s
- **Total: ~10 minutes**

### After Optimization (Expected):
- Context transfer: ~2s (~50MB)
- Dependencies install: ~5s (cached)
- Build time: ~20s (AMD64 only by default)
- Cache export: ~30s (registry cache)
- **Total: ~2-3 minutes**

## Usage

### Standard Build (AMD64 only):
```bash
git push origin main
```

### Test Optimizations Locally:
```bash
./scripts/docker-build-test.sh
```

### Use Optimized Dockerfile:
```bash
# In your workflow, update the build step:
docker build -f Dockerfile.optimized -t myapp .
```

## Further Optimizations (Optional)

1. **Use BuildKit secrets** for private dependencies
2. **Implement distroless base images** for smaller final size
3. **Add health checks** to the Dockerfile
4. **Use multi-stage builds** more aggressively
5. **Consider using `docker buildx bake`** for complex builds

## Rollback Plan

If issues arise, you can quickly rollback:
1. Revert the GitHub Actions workflow changes
2. Delete `.dockerignore` to restore original behavior
3. Use the original `Dockerfile` instead of `Dockerfile.optimized`

## Monitoring

Track build times in GitHub Actions:
- Check the "Build and push Docker image" step duration
- Monitor image sizes in Docker Hub
- Use `docker history` to analyze layer sizes