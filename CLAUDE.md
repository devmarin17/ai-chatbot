# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js AI Chatbot template built with the AI SDK, featuring real-time streaming, multi-provider AI model support, document/artifact creation, and PostgreSQL persistence. The project uses Next.js 16 App Router, React Server Components, and modern tooling.

## Development Commands

### Core Development
```bash
pnpm install           # Install dependencies
pnpm dev               # Start dev server with Turbo (http://localhost:3000)
pnpm build             # Run migrations and build for production
pnpm start             # Start production server
```

### Code Quality
```bash
pnpm lint              # Check code with Biome (via ultracite)
pnpm format            # Auto-fix code formatting and linting issues
```

### Database Management
```bash
pnpm db:migrate        # Apply database migrations
pnpm db:generate       # Generate migration from schema changes
pnpm db:studio         # Open Drizzle Studio (database GUI)
pnpm db:push           # Push schema changes directly (dev only)
pnpm db:pull           # Pull schema from database
```

### Testing
```bash
pnpm test              # Run Playwright E2E tests
```

### Environment Setup
```bash
vercel env pull        # Download environment variables from Vercel
vercel link            # Link local project to Vercel
```

## Architecture Overview

### Next.js App Router Structure

The app uses route groups for organization:

- **`app/(auth)/`** - Authentication routes (login, register, guest)
  - API endpoints: `/api/auth/[...nextauth]`, `/api/auth/guest`
- **`app/(chat)/`** - Main chat interface
  - `/` - New chat
  - `/chat/[id]` - Existing chat view
  - API endpoints: `/api/chat`, `/api/history`, `/api/suggestions`, `/api/vote`, `/api/document`, `/api/files/upload`

### Database Layer (Drizzle ORM + PostgreSQL)

Located in `lib/db/`:

**Core tables**:
- `User` - User accounts (regular and guest types)
- `Chat` - Chat sessions with visibility settings (public/private)
- `Message_v2` - Messages with parts array and attachments (current schema)
- `Message` - Deprecated message format
- `Vote_v2` - Upvote/downvote reactions
- `Document` - User-created artifacts (text, code, sheet kinds)
- `Suggestion` - AI-generated suggestions for documents
- `Stream` - Resumable stream tracking (Redis-backed)

**Key files**:
- `schema.ts` - Table definitions
- `queries.ts` - All database operations (wrapped with error handling)
- `migrate.ts` - Migration runner
- `migrations/` - Migration SQL files

### AI SDK Integration

Located in `lib/ai/`:

**Models** (`models.ts`):
- Default: Google Gemini 2.5 Flash Lite
- Supports: Anthropic (Claude), OpenAI, Google, xAI
- Reasoning models with extended thinking capability

**Providers** (`providers.ts`):
- Uses Vercel AI Gateway for unified model access
- Supports test environment with mocked models
- Reasoning model middleware for thought extraction

**Prompts** (`prompts.ts`):
- System prompts with artifact guidelines
- Geo-location aware (from Vercel Functions)
- Different prompts for reasoning vs standard models
- Specialized prompts for title generation, code, and sheets

**Tools** (`lib/ai/tools/`):
1. `createDocument` - Creates text, code, or sheet artifacts
2. `updateDocument` - Updates existing documents
3. `getWeather` - Fetches weather (requires approval)
4. `requestSuggestions` - Gets AI suggestions

**Entitlements** (`entitlements.ts`):
- Rate limiting by user type (guest vs regular)
- Tool availability control

### Authentication (Next Auth 5.0)

Configuration in `app/(auth)/auth.ts`:

**Providers**:
- Credentials (Regular): Email/password with bcrypt-ts
- Credentials (Guest): Auto-generated temporary accounts

**Session augmentation**:
```typescript
interface Session {
  user: {
    id: string;
    type: "guest" | "regular";
    email?: string;
  }
}
```

### Key Patterns

**React Server Components**:
- Layout components are async server components
- Data fetching happens server-side with `auth()` calls
- Suspense boundaries for lazy loading

**Server Actions** (`use server`):
- `saveChatModelAsCookie()` - Persists model selection
- `generateTitleFromUserMessage()` - AI title generation
- `deleteTrailingMessages()` - Message cleanup
- `updateChatVisibility()` - Chat privacy toggle

**Client Components** (`use client`):
- Chat UI uses `useChat()` hook from `@ai-sdk/react`
- Real-time streaming with `createUIMessageStream`
- Custom data types for artifacts (code, text, sheets)

**Stream Architecture**:
- `createUIMessageStream()` for real-time message generation
- `createUIMessageStreamResponse()` for HTTP response wrapping
- Redis-backed resumable streams (optional, requires REDIS_URL)
- Custom data stream types for document updates

**Error Handling**:
- `ChatSDKError` class with structured codes
- Format: `${ErrorType}:${Surface}` (e.g., `rate_limit:chat`)
- Visibility levels: response, log, or none

## Code Quality Standards

This project uses **Ultracite** (Biome wrapper) for strict linting and formatting. Key rules are defined in `.cursor/rules/ultracite.mdc`. Notable standards:

### TypeScript
- No `any` or `enum` types
- Use `import type` and `export type` for types
- Use `as const` instead of literal type annotations
- Array syntax: consistent use of `T[]` or `Array<T>`
- No non-null assertions (`!`)

### React/Next.js
- All React hooks must have correct dependencies
- No `useEffect` with missing dependencies
- Fragment shorthand: `<>` instead of `<Fragment>`
- No Array index as keys
- No `<img>` tags (use Next.js `<Image>`)
- No `<head>` tags (use `<Metadata>`)

### Accessibility
- All buttons must have `type` attribute
- Images must have meaningful alt text
- Interactive elements must be keyboard accessible
- Click handlers on non-interactive elements need proper roles

### Code Style
- Use arrow functions over function expressions
- Use `for...of` instead of `Array.forEach`
- Use optional chaining instead of chained logical expressions
- Prefer `const` over `let` when variables aren't reassigned
- No `console.log` statements

## Data Flow Examples

### Chat Request Flow
1. User sends message via Client Component
2. POST to `/api/chat/` with message and model selection
3. Server verifies auth, rate limits, chat ownership
4. Calls `streamText()` from AI SDK with selected model
5. Tools available based on model type (disabled for reasoning models)
6. Real-time response streamed via `createUIMessageStream`
7. Messages and chat title saved to PostgreSQL
8. Optional stream state saved to Redis for resumption

### Document Creation Flow
1. AI invokes `createDocument` tool
2. Document handler routes to appropriate artifact type (text/code/sheet)
3. Content streamed to client in real-time via custom data stream
4. Final document saved to `Document` table

## Environment Variables

Required variables (see `.env.example`):
- `AUTH_SECRET` - NextAuth secret for JWT signing
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway access (not required on Vercel deployments)
- `POSTGRES_URL` - Database connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

Optional:
- `REDIS_URL` - Enables resumable streams
- Provider-specific API keys if bypassing AI Gateway

## Important Notes

### Migrations
- Always run migrations before build: `pnpm db:migrate`
- The build script automatically runs migrations
- Generate new migrations with `pnpm db:generate` after schema changes

### Model Selection
- Default model is configurable in `lib/ai/models.ts`
- User selections are persisted via server action to cookies
- Reasoning models have tools disabled (they can't use tools during extended thinking)

### Artifact System
- Three types: text, code, sheet
- Located in `lib/artifacts/` with type-specific handlers
- Each artifact type has its own creation/update logic
- Real-time streaming updates via custom data stream types

### Testing
- Playwright tests in `tests/` directory
- Tests run with `PLAYWRIGHT=True` environment variable
- CI runs tests on push/PR to main

### File Uploads
- Handled via `/api/files/upload` endpoint
- Stored in Vercel Blob storage
- Attached to messages via Message_v2 attachments array

### User Types
- **Guest**: Limited rate limits, temporary accounts
- **Regular**: Higher entitlements, persisted accounts
- Entitlements defined in `lib/ai/entitlements.ts`
