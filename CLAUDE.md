# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (Vite on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

This is a React + TypeScript wedding video processing application built with Vite, using Supabase as the backend and Cloudflare for video storage/streaming.

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui components with Radix UI primitives, Tailwind CSS
- **Backend**: Supabase (auth, database, edge functions)
- **Video Processing**: External AI service at Modal.run
- **Storage**: Cloudflare R2 and Stream
- **State Management**: React Query, React Context (Auth, Subscription)
- **Routing**: React Router DOM

### Key Architecture Patterns

**Context Providers**: The app is wrapped in multiple context providers (QueryClient, Auth, Subscription) that provide global state management.

**Route Structure**:
- `/` - Main dashboard (authenticated users)
- `/auth` - Authentication page
- `/guest/:qrCode` - Guest upload interface via QR codes
- `/subscription` - Subscription management
- `/account-settings` - User settings

**Component Organization**:
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Top-level route components
- `src/hooks/` - Custom React hooks for business logic
- `src/contexts/` - React context providers
- `src/integrations/supabase/` - Supabase client and types

**Video Processing Flow**:
1. Users upload wedding videos via VideoUpload components
2. Videos are stored in Cloudflare R2 via Supabase edge functions
3. AI processing is triggered via external service (Modal.run)
4. Results are stored back in Supabase and displayed via VideoManager

**Guest Upload System**:
- QR code generation for guest access
- Secure guest upload interface without authentication
- Guest contributions are linked to projects via QR codes

**Subscription Model**:
- Freemium model with usage limits
- Subscription context manages access control
- Feature gating throughout the application

### Supabase Edge Functions
Located in `supabase/functions/`:
- `cloudflare-r2-storage` - File upload to Cloudflare R2
- `cloudflare-stream-upload` - Video upload to Cloudflare Stream
- `process-wedding-videos` - Trigger AI processing
- `create-payment` / `verify-payment` - Stripe integration
- `lifecycle-cleanup` - Clean up expired data

### AI Service Integration
- External AI service for video processing at Modal.run
- Configuration in `src/config/aiService.ts`
- Value mapping functions for frontend-to-AI parameter translation
- Error handling for service sleeping/network issues

### Import Alias
Use `@/` for imports from the `src` directory (configured in tsconfig and vite config).