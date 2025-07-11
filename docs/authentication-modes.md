# PaperJet Authentication Modes

## Overview

PaperJet supports two authentication modes to accommodate different deployment scenarios:

1. **Classic Mode** (default) - For self-hosted deployments
2. **SaaS Mode** - For cloud/SaaS deployments

## Configuration

Set the authentication mode using the `AUTH_MODE` environment variable:

```env
# Classic mode (default)
AUTH_MODE=classic

# SaaS mode
AUTH_MODE=saas
```

## Authentication Methods by Mode

### Classic Mode
- ✅ Email & Password authentication
- ✅ OAuth (Google, Microsoft)
- ✅ Magic Link (passwordless)
- ✅ Password reset functionality

### SaaS Mode
- ❌ Email & Password authentication (disabled)
- ✅ OAuth (Google, Microsoft)
- ✅ Magic Link (passwordless)
- ❌ Password reset (not applicable)

## Implementation Details

### Backend (API)

1. **Environment Variable**: Added `AUTH_MODE` to the environment schema with validation
2. **Better Auth Configuration**: 
   - Email/password authentication is conditionally enabled based on `AUTH_MODE`
   - Password reset functionality included for Classic mode
   - Magic link always available in both modes
3. **Auth Mode Endpoint**: `/api/auth/mode` exposes the current mode to the frontend

### Frontend (Dashboard)

1. **Auth Mode Detection**: 
   - `auth-mode.ts` utility fetches and caches the current mode
   - Components check mode to show/hide authentication options

2. **Sign In Page**:
   - Classic mode: Shows email/password, OAuth, and magic link options
   - SaaS mode: Shows only OAuth and magic link options

3. **Sign Up Page**:
   - Classic mode: Allows registration with email/password or magic link
   - SaaS mode: Only magic link and OAuth registration

4. **Setup Page**:
   - Classic mode: Admin can set password or use magic link
   - SaaS mode: Only magic link for admin creation

5. **Password Reset**:
   - Only available in Classic mode
   - Accessible via "Forgot password?" link on sign-in page

## Security Considerations

1. **Password Requirements** (Classic mode):
   - Minimum 8 characters
   - Maximum 100 characters
   - Stored using secure hashing (Better Auth defaults)

2. **Rate Limiting**:
   - Setup endpoint: 5 attempts per IP in 15 minutes
   - Standard Better Auth rate limiting for other endpoints

3. **Session Management**:
   - Cookie-based sessions with 5-minute cache
   - Secure session tokens

## Migration Between Modes

To switch between modes:

1. Update the `AUTH_MODE` environment variable
2. Restart the application
3. Users will see updated authentication options immediately

**Note**: Existing users with passwords can still sign in even if switching to SaaS mode, but new password-based registrations will be disabled.