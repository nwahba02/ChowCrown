# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

ChowCrown is a food competition and ranking platform. Diners scan QR codes at restaurants after eating to unlock verified votes on competition dishes; live leaderboards update as votes come in. Competitions are organized by food category (burgers, pizza, tacos, etc.) and city/quarter.

## Commands

```bash
# Frontend
npm run dev      # Vite dev server → http://localhost:3000
npm run build    # Production build → dist/
npm run lint     # TypeScript type-check (no emit, covers both src/ and server/)

# Backend
npm run server   # Express API server with hot-reload → http://localhost:3001

# Production (build first, then serve both frontend + API from one process)
npm run start

# Database utilities
npx ts-node server/seed.ts   # Seed MongoDB with sample competition + restaurants + votes
npx ts-node server/clear.ts  # Wipe all collections (dev only)

# Tests
npm test         # Vitest test suite (server/__tests__/)
```

During development run both `npm run dev` and `npm run server` simultaneously. Vite proxies `/api/*` to `:3001`.

## Architecture

### Frontend (`src/`)

**`src/App.tsx` is a monolith.** All page components are defined in one file.

**Routing uses React Router.** `<Routes>/<Route>` are declared at the bottom of `AppInner`. Navigation is done via `useNavigate()`. A `setActivePage(page)` helper exists and simply calls `navigate()` with the resolved path — it is used by some older components that predate the router migration. `AppInner` is wrapped in `<ToastProvider>` by the exported `App` default because `AppInner` calls `useToast()` which requires the provider above it.

**QR URL entry point.** When the app loads with `?vote=TOKEN` in the URL, `AppInner`'s mount effect calls `POST /api/tokens/redeem`, strips the param from the URL, then routes directly to `VotingPage` with the `voteToken` set. This is the real pilot flow. The `ScanQRPage` is only shown in the in-app browse/demo flow (no real token).

**`VotingPage` has two modes.** When `voteToken` is non-null it calls `POST /api/votes`. When null it shows a success toast without hitting the API (demo mode for browsing).

**Competition and restaurant data is fetched from the API** (`GET /api/competitions`, `GET /api/competitions/:id/restaurants`). It is no longer hardcoded in the frontend. Types are in `src/types.ts` (`ApiCompetition`, `ApiRestaurant`).

### Backend (`server/`)

Express API on port 3001 (configurable via `PORT` or `API_PORT`). Persistence is **MongoDB** — connection via `MONGODB_URI`. No JSON flat files.

```
server/
  index.ts                  # Express setup, middleware stack, rate limiters, static serving
  db.ts                     # MongoDB client, collection helpers, all DB operations
  middleware.ts             # asyncRoute wrapper, global error handler
  security.ts               # requireString/optionalString/timingSafeEqual — NoSQL injection guards
  logger.ts                 # pino logger instance
  cache.ts                  # In-memory TTL cache (used for leaderboard + stats)
  routes/
    tokens.ts               # POST /api/tokens/generate, /generate-zip, /generate-sheet, /redeem
    votes.ts                # POST /api/votes
    competitions.ts         # GET /api/competitions, /:id, /:id/restaurants, /:id/results
    admin.ts                # All /api/admin/* routes (CRUD for competitions, restaurants, votes, contacts)
    contact.ts              # POST /api/contact
    stats.ts                # GET /api/stats
  __tests__/
    tokens.test.ts
    votes.test.ts
    contact.test.ts
  seed.ts                   # Dev seeder
  clear.ts                  # Dev wipe script
```

**Token lifecycle:** `generate` → token written with `redeemedAt: null` → `redeem` → `redeemedAt` stamped → `POST /api/votes` succeeds once per token → duplicate blocked at DB level (unique index on `tokenId`).

**QR generation endpoints:**
- `POST /api/tokens/generate` — up to 500 tokens, returns JSON array of `{ token, url }`
- `POST /api/tokens/generate-zip` — up to 2000 tokens, returns a ZIP of QR PNG files + `manifest.csv`. Saved to `qr-exports/` on the server.
- `POST /api/tokens/generate-sheet` — up to 500 tokens, returns a self-contained print-ready HTML page (open in browser → Ctrl+P → PDF).

**Admin protection:** All `/api/admin/*` routes and token-generation endpoints check `x-admin-key` header against `ADMIN_KEY` env var. In production (`NODE_ENV=production`), `ADMIN_KEY` is **required** — the server refuses to start without it.

**Contact form:** `POST /api/contact` saves the submission to MongoDB then fires a Gmail notification email as a background task (fire-and-forget with `.catch()` logging). The HTTP response is sent immediately after the DB write — the email must not block the request because Railway blocks outbound SMTP.

**Leaderboard caching:** `GET /api/competitions/:id/results` is cached in memory for 30 seconds. Cache is invalidated on each new vote via `cacheInvalidate()`. Stats endpoint is cached for 60 seconds.

**Security:** helmet (no CSP — Vite injects inline scripts), CORS locked to `APP_URL` + localhost, per-route rate limits, `timingSafeEqual` for admin key comparison, `requireString`/`optionalString` guards on all body/query params to block NoSQL injection via qs-parsed objects.

**Logging:** pino + pino-http on every request.

### Environment

Copy `.env.example` → `.env`:
- `MONGODB_URI` — MongoDB Atlas connection string (required)
- `APP_URL` — written into generated QR code URLs (e.g. `https://yourapp.com`)
- `ADMIN_KEY` — **required in production**; protects token generation and all `/api/admin/*` endpoints
- `API_PORT` — defaults to 3001 (Railway overrides with `PORT`)
- `GMAIL_USER` — Gmail address used as the sender for contact form emails (optional; email silently skipped if unset)
- `GMAIL_APP_PASSWORD` — Gmail App Password (not your account password) for nodemailer auth
- `GEMINI_API_KEY` — AI features (frontend)

Frontend env vars must also be added to `vite.config.ts:define` to reach the browser bundle.

## Deployment

Hosted on Railway. Railway sets `PORT` automatically; the server reads `process.env.PORT ?? process.env.API_PORT ?? 3001`. In production both the frontend (served as static files from `dist/`) and the API run from the same process on the same port.

## UI Components & Styling

Reusable primitives (`Button`, `Card`, `Badge`, `Input`, `Modal`, `Toast`, `Loading`, `ErrorBoundary`) live in `src/components/ui/`, barrel-exported from the index. Layout components (`ScrollToTop`, `BottomNav`, `Navbar`) are in `src/components/layout/`. Always import from the barrel, not the file directly.

Design tokens (brand colors, fluid typography, safe-area insets) are in `src/index.css` under `@theme` — not in a Tailwind config file.

Animation variants (`fadeInUp`, `staggerContainer`, `slideInLeft`, etc.) live in `src/utils/animations.ts`. Import and spread them onto `motion.*` components instead of defining inline variants. Scroll-triggered animations use `useScrollAnimation` from `src/hooks/useAnimation.ts`.

`useResponsive()` (`src/hooks/useResponsive.ts`) returns `{ isMobile, isTablet, isDesktop }`. Use it for conditional rendering of entirely different layouts; use Tailwind responsive prefixes for CSS-only differences.

## Additional Documentation

- [`.claude/docs/architectural_patterns.md`](.claude/docs/architectural_patterns.md) — component variant pattern, Toast context, animation conventions, responsive rendering
