# AGENTS.md — Otis (AI Travel Planner)

## Stack

- **Framework:** Next.js 16.2.6 (App Router), React 19.2.4
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 with `@tailwindcss/postcss`, CSS custom properties for theming
- **State:** TanStack React Query 5 (server/async), Zustand 5 (local UI state)
- **Backend:** Firebase 12 (Auth + Firestore), Firebase Admin SDK 13 (server-side)
- **AI:** `@google/generative-ai` (Gemini 2.0 Flash)
- **Validation:** Zod 4
- **UI:** `lucide-react` icons, `@dnd-kit` (drag & drop)
- **Linting:** ESLint 9 with `eslint-config-next` (core-web-vitals + typescript)

## Build / Lint / Test Commands

```bash
npm run dev         # Next.js dev server (Turbopack)
npm run build       # Production build (standalone output)
npm run start       # Start production server
npm run lint        # ESLint check
```

No test framework is configured. If adding tests, use Vitest (preferred) or Jest, colocated as `*.test.ts` next to source files.

## Project Structure

```
app/                  # Next.js App Router pages + API routes
  (dashboard)/        # Route group for authenticated pages
  api/                # API route handlers
    generate/         # Gemini itinerary generation (SSE streaming)
    places/           # Google Places API proxy
    flights/          # Travelpayouts flight proxy
    routes/           # Route optimization
    weather/          # Open-Meteo weather proxy
  globals.css         # Design tokens + base styles
  layout.tsx          # Root layout (providers, skip link, PWA)
  providers.tsx       # TanStack Query + Firebase Auth providers
  login/              # Auth pages
  signup/
proxy.ts              # Route protection middleware (session cookie)
components/
  ui/                 # Reusable UI primitives (Button, Sheet, TabBar, etc.)
  shared/             # Shared components (WeatherWidget, ServiceWorkerRegister)
  map/                # Google Maps wrapper
  planner/            # Itinerary builder UI
  ai/                 # AI-related UI
hooks/                # TanStack Query + real-time Firestore hooks
lib/
  firebase/           # Firebase client + admin init
  gemini/             # Gemini client, prompts, Zod schemas
  utils/              # normalize, validate, rateLimit
  flights/            # Flight API helpers
stores/               # Zustand stores (plannerStore)
types/                # Shared TypeScript interfaces (index.ts)
```

## Code Style Guidelines

### Imports & Module Conventions

- Use the `@/` path alias mapped to project root. No relative parent imports (`../`).
- Use `import type` for type-only imports. Group type imports after value imports.
- File header: `// path/from/root.ts` followed by `// short description of purpose`.
- Section divider comments: `// ─── Section name ───────────────────────────────────────────` (80 char width, filled with `─`).
- Named exports for hooks, utilities, types. Default export for page components.

### Formatting & Syntax

- Semicolons required.
- Single quotes for strings (except JSX attributes and template literals).
- Trailing commas in multiline objects/arrays.
- Align object values with spaces when it improves readability (see `plannerStore.ts` for pattern).
- Use `Array.from({ length: n })` for generating ranges, never manual loops.

### TypeScript

- `strict: true` in tsconfig.
- Define interfaces locally in component files unless shared — use `types/index.ts` for shared types.
- Prefer `interface` over `type` for object shapes. Use `type` for unions, primitives, and `Record<>`.
- Avoid `any`. Use `unknown` with type narrowing for catch clauses (`err: unknown`).
- Use `Record<string, unknown>` for raw API responses that get normalized.
- Define prop interfaces as `{ ComponentName }Props` locally in the component file.
- Use `ReactNode` for children, `ButtonHTMLAttributes` etc. for extending native elements.

### Naming Conventions

- **Components:** PascalCase, exported as default when they are pages.
- **Hooks:** `use` + PascalCase (`useTrips`, `useRealtimeTrip`).
- **Functions/variables:** camelCase.
- **Types/interfaces:** PascalCase.
- **Constants (non-type):** SCREAMING_SNAKE_CASE or camelCase in context — be consistent with surrounding code.
- **CSS classes:** Tailwind utility classes only; no CSS modules or styled-components.
- **Files:** PascalCase for components, camelCase for utilities/hooks.

### Component Patterns

- Client components: `'use client'` directive at top (line 1).
- Prefer function declarations (`function Foo()`) over arrow functions for components.
- Use `forwardRef` only when the component needs ref forwarding (e.g., Button).
- Destructure props inline in the function signature with defaults.
- Use `className` prop concatenation pattern: `[base, variants[variant], sizes[size], className].join(' ')`.
- Boolean props like `loading`, `disabled`, `fullWidth` default to `false`.
- Accessibility required: `role`, `aria-label`, `aria-hidden`, `aria-current`, `aria-live`, `aria-disabled`, focus management, `sr-only` for screen reader text.

### State Management

- **Server state:** TanStack Query hooks in `hooks/`. Query keys: `['resource', identifier]`.
- **Local UI state:** Zustand stores in `stores/` with `devtools` middleware.
- **Form state:** `useState` for simple forms.
- Avoid prop drilling; prefer context (AuthContext in `providers.tsx`) or Zustand.

### Error Handling

- Catch clauses: `catch (err: unknown)` → narrow with `err instanceof Error` or check `'code' in err`.
- Display user-facing error messages (never `err.message` directly).
- API routes: return `Response.json({ error: string }, { status: NNN })`.
- Rate limiting: `lib/utils/rateLimit.ts` — applied to all API routes.
- TanStack Query errors handled via `error` state + `ErrorState` component.

### API Routes

- Export `runtime = 'nodejs'` and `maxDuration` for long-running routes.
- Rate-limit every handler (5 req/min for generate, 30 req/min for places).
- Validate inputs before processing; sanitize strings before sending to AI.
- SSE streaming: `ReadableStream` + `TextEncoder` with `data:` JSON chunks.

### AI / Gemini

- Server-side only (API routes). Not imported in client code.
- Zod schema (`lib/gemini/schema.ts`) validates structured output. Use `safeParse`.
- Prompt templates in `lib/gemini/prompts.ts` — strict JSON-only output instructions.

### Styling with Tailwind

- Use CSS custom properties for theming (`var(--color-*)` defined in `globals.css`).
- Refer to `tailwind.config.ts` for custom tokens: font sizes (`text-title-1`, `text-body`, etc.), colors (`bg-bg-primary`, `text-label-primary`, etc.), radii (`rounded-card`, `rounded-button`), spacing (`h-touch`, `pb-safe`), animations (`animate-card-in`, `animate-sheet-in`, `animate-shimmer`).
- Respect `prefers-reduced-motion` — already handled in `globals.css`".
- Use inline `style` for dynamic values like `opacity`, `backdropFilter`, `boxShadow`.
- Always prefix `var(--...)` references with the Tailwind utility equivalent when available.

### Firebase

- **Client:** Singleton pattern in `lib/firebase/client.ts` — guards against re-init during HMR.
- **Server:** Lazy dynamic imports in `lib/firebase/admin.ts` — never import in client code.
- Firestore queries: `collection`, `doc`, `query`, `where`, `orderBy`, `onSnapshot`.
- Document snapshots mapped as `{ id: snapshot.id, ...snapshot.data() }`.

### Security

- Server-side API keys via `process.env.*` (never `NEXT_PUBLIC_*` for secret keys).
- Sanitize all user input before AI or database (see `lib/utils/validate.ts`).
- Rate-limit all API routes.
- Route protection via `proxy.ts` middleware for `/plan`, `/trips`, `/explore`, `/profile`.
- Security headers in `next.config.ts` (X-Content-Type-Options, X-Frame-Options, etc.).
- DOMPurify (isomorphic-dompurify) available for HTML sanitization.
