# PaperJet Setup Flow

## Overview

PaperJet includes a first-time setup flow that activates when the application is first installed. This ensures that an administrator account is created before the system can be used.

## How It Works

### 1. Setup Detection

When the app starts, it checks if any admin users exist in the database:
- The `/api/setup/status` endpoint returns `{ needsSetup: true/false }`
- This check happens in the root route's `beforeLoad` hook
- If no admin exists, users are redirected to `/setup`

### 2. Admin Account Creation

The setup page (`/setup`) allows creating the first admin account with two methods:

#### Password Method
- User provides name, email, and password
- Account is created immediately
- User is redirected to sign in

#### Magic Link Method
- User provides name and email
- A magic link is sent to the email
- User clicks the link to complete setup

### 3. Security Features

- **Rate Limiting**: Maximum 5 setup attempts per IP in 15 minutes
- **One-Time Setup**: Once an admin exists, the setup endpoint is disabled
- **Audit Logging**: Admin creation is logged with IP, timestamp, and event type
- **Input Validation**: Email, password, and name are validated
- **Role Assignment**: First user gets "admin" role, subsequent users get "user" role

### 4. Post-Setup

After the first admin is created:
- The setup page redirects to sign-in
- The `/api/setup/create-admin` endpoint returns 403 (Forbidden)
- New users can only be created through normal registration (with "user" role)
- Only admins can promote other users to admin status

## Technical Implementation

### API Endpoints

- `GET /api/setup/status` - Check if setup is needed (public)
- `POST /api/setup/create-admin` - Create first admin (public, one-time use)

### Frontend Routes

- `/setup` - Setup page with admin creation form
- Automatically redirects here when no admin exists
- Redirects to sign-in after admin creation

### Database Schema

The `user` table includes:
- `role` field (defaults to "user", first user gets "admin")
- `banned`, `banReason`, `banExpires` fields for user management

### Better Auth Configuration

- Admin plugin configured with `defaultRole: "user"`
- Custom user creation hook ensures proper role assignment
- Magic link support for passwordless setup