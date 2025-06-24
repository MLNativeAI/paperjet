# Release Workflow Documentation

This document explains PaperJet's automated release system using conventional commits and semantic versioning.

## Overview

PaperJet uses a fully automated release workflow that:
- Enforces consistent commit message standards
- Automatically determines version numbers based on changes
- Generates changelogs from commit messages
- Builds and publishes Docker images
- Creates GitHub releases with deployment instructions

## Two-Track Docker Strategy

### Development Images (`mlnative/paperjet-dev`)
- Built on every push to `main` branch
- Always available as `latest` tag
- Additional tags: `main-<commit-sha>`, `<date>-<sha>`
- Use for testing and development environments

### Release Images (`mlnative/paperjet`)
- Built only when semantic-release creates a new version
- `latest` always points to the most recent stable release
- Version tags: `1.0.0`, `1.0`, `1` (semantic versions)
- Multi-platform support (AMD64 + ARM64)

## Commit Message Standards

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature (minor version bump)
- `fix` - Bug fix (patch version bump)
- `docs` - Documentation only
- `style` - Code style/formatting
- `refactor` - Code refactoring
- `perf` - Performance improvement (minor version bump)
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

### Breaking Changes
For major version bumps, use:
- `feat!: description` or `fix!: description`
- Or include `BREAKING CHANGE: description` in commit body

### Examples
```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve memory leak in file upload"

# Minor release (1.0.0 → 1.1.0)
git commit -m "feat: add PDF export functionality"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: redesign API authentication

BREAKING CHANGE: API now requires Bearer tokens instead of API keys"

# No release
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

## Writing Commits

### Option 1: Interactive Commit Tool
```bash
bun run commit
```
This launches an interactive prompt that guides you through writing a proper conventional commit.

### Option 2: Manual Commits
Write commits manually following the conventional format. The commit-msg hook will validate the format.

## Release Process

### Automatic Release Flow
1. **Developer pushes commits to main**
   - Development Docker image (`paperjet-dev:latest`) is built immediately
   - Semantic-release analyzes all commits since last release

2. **If releasable changes exist:**
   - Version number calculated automatically
   - Git tag created (e.g., `v1.1.0`)
   - Changelog generated from commits
   - GitHub release created
   - Production Docker images built and tagged
   - Release notes updated with Docker deployment info

3. **Release triggers:**
   - Any `feat:` or `fix:` commits
   - Any `perf:` commits
   - Any commits with `BREAKING CHANGE:`
   - Accumulated changes since last release

4. **No release for:**
   - `docs:`, `chore:`, `style:`, `refactor:`, `test:`, `ci:`, `build:` commits only

### Version Calculation
- **Patch** (1.0.0 → 1.0.1): `fix:`, bug fixes
- **Minor** (1.0.0 → 1.1.0): `feat:`, `perf:`, new features
- **Major** (1.0.0 → 2.0.0): `BREAKING CHANGE:` or `feat!:`/`fix!:`

## Example Timeline

```
Monday 9am: 
Push: "feat: add user dashboard"
→ paperjet-dev:latest updated
→ No release yet (waiting for more changes)

Monday 2pm:
Push: "fix: dashboard layout issue"
→ paperjet-dev:latest updated
→ No release yet

Tuesday 10am:
Push: "docs: update README"
→ paperjet-dev:latest updated
→ Release v1.1.0 created automatically!
  - Includes: 1 feature + 1 fix + 1 doc update
  - paperjet:1.1.0 and paperjet:latest built
  - Changelog generated with all commits

Wednesday:
Push: "chore: update dependencies"
→ paperjet-dev:latest updated
→ No release (chore doesn't trigger releases)

Thursday:
Push: "fix: CSV export encoding"
→ paperjet-dev:latest updated
→ Release v1.1.1 created automatically!
  - paperjet:latest now points to v1.1.1
```

## Docker Deployment

### Development/Testing
```bash
# Always gets latest development build
docker pull mlnative/paperjet-dev:latest
docker run -p 3000:3000 mlnative/paperjet-dev:latest
```

### Production
```bash
# Gets latest stable release
docker pull mlnative/paperjet:latest
docker run -p 3000:3000 mlnative/paperjet:latest

# Pin to specific version
docker pull mlnative/paperjet:1.2.0
docker run -p 3000:3000 mlnative/paperjet:1.2.0
```

## Troubleshooting

### Commit Rejected
If your commit is rejected:
1. Check the commit message format
2. Use `bun run commit` for guided input
3. Ensure type is lowercase and valid

### No Release Created
Releases only trigger on meaningful changes:
- Must include `feat:`, `fix:`, `perf:`, or breaking changes
- `docs:`, `chore:`, etc. don't trigger releases

### Force a Release
To force a release from maintenance commits:
```bash
git commit -m "chore: update dependencies

BREAKING CHANGE: Updated Node.js version requirements"
```

### Skip Release
Some commits can skip releases with `[skip release]` (if configured):
```bash
git commit -m "feat: add feature [skip release]"
```

## Configuration Files

- `.commitlintrc.json` - Commit message validation rules
- `.releaserc.json` - Semantic release configuration
- `.husky/commit-msg` - Git hook for commit validation
- `.github/workflows/release.yml` - Automated release workflow
- `.github/workflows/docker-dev.yml` - Development Docker builds
- `.github/workflows/pr-title.yml` - PR title validation

## Required Secrets

Add these to GitHub repository secrets:
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

## Benefits

✅ **Zero manual version management**  
✅ **Consistent commit messages across team**  
✅ **Automatic changelog generation**  
✅ **Clear separation of dev/production images**  
✅ **Predictable versioning based on changes**  
✅ **Multi-platform Docker support**  
✅ **Enhanced team collaboration through standards**  

The system ensures that every meaningful change is properly versioned, documented, and deployed without manual intervention.