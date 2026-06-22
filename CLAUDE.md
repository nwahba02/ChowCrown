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
```

During development run both `npm run dev` and `npm run server` simultaneously. Vite proxies `/api/*` to `:3001`.

## Architecture

### Frontend (`src/`)

**`src/App.tsx` is a monolith.** All page components are defined in one file. Routing is an `activePage` state string — no router library. `AppInner` holds all state and logic; it's wrapped in `<ToastProvider>` by the exported `App` default — this is intentional because `AppInner` calls `useToast()` which requires the provider above it.

**QR URL entry point.** When the app loads with `?vote=TOKEN` in the URL, `AppInner`'s mount effect calls `POST /api/tokens/redeem`, strips the param from the URL, then routes directly to `VotingPage` with the `voteToken` set. This is the real pilot flow. The `ScanQRPage` is only shown in the in-app browse/demo flow (no real token).

**`VotingPage` has two modes.** When `voteToken` is non-null it calls `POST /api/votes`. When null it shows a success toast without hitting the API (demo mode for browsing).

**Competition data is still hardcoded** as `const` arrays in `src/App.tsx`. The backend stores votes but the competition/restaurant catalogue lives in the frontend only.

### Backend (`server/`)

Express API on port 3001 (configurable via `API_PORT`). Persistence is JSON files in `data/` (gitignored). No external database.

```
server/
  index.ts              # Express setup, static serving in production
  db.ts                 # Read/write helpers for data/tokens.json + data/votes.json
  routes/tokens.ts      # POST /api/tokens/generate, POST /api/tokens/redeem
  routes/votes.ts       # POST /api/votes
  routes/competitions.ts # GET /api/competitions/:id/results
```

**Token lifecycle:** `generate` → token written with `redeemedAt: null` → `redeem` → `redeemedAt` stamped → `POST /api/votes` succeeds once per token → duplicate blocked.

**Admin protection:** `POST /api/tokens/generate` checks for `x-admin-key` header if `ADMIN_KEY` env var is set. Unset = open (fine for local dev/pilot).

### Environment

Copy `.env.example` → `.env`:
- `GEMINI_API_KEY` — AI features
- `APP_URL` — written into generated QR code URLs (e.g. `https://yourapp.com`)
- `API_PORT` — defaults to 3001
- `ADMIN_KEY` — optional; if set, protects token generation endpoint

Frontend env vars must also be added to `vite.config.ts:define` to reach the browser bundle.

## UI Components & Styling

Reusable primitives (`Button`, `Card`, `Badge`, `Input`, `Modal`, `Toast`, `Loading`) live in `src/components/ui/`, barrel-exported from the index. All accept `variant` + `className`.

Design tokens (brand colors, fluid typography, safe-area insets) are in `src/index.css` under `@theme` — not in a Tailwind config file.

## Additional Documentation

- [`.claude/docs/architectural_patterns.md`](.claude/docs/architectural_patterns.md) — component variant pattern, Toast context, animation conventions, responsive rendering
