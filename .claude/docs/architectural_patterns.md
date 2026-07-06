# Architectural Patterns

## Routing / Page Management

Uses React Router (`react-router-dom`). Routes are declared with `<Routes>/<Route>` inside `AppInner` at the bottom of `src/App.tsx`. Navigation uses `useNavigate()`.

- A `setActivePage(page: string)` helper still exists in `AppInner` — it maps page name strings to paths and calls `navigate()`. Some older components use it instead of `useNavigate()` directly.
- `ScrollToTopOnNav` is a side-effect component that calls `window.scrollTo(0,0)` on every pathname change.

## UI Component Pattern

All primitives in `src/components/ui/` follow the same shape:
- Accept a `variant` prop (e.g., `"primary" | "secondary" | "outline"`) and a `size` prop
- Accept `className` for ad-hoc overrides
- Compose Tailwind classes via `cn()`-style string concatenation based on variant/size

Barrel exports from `src/components/ui/index.ts` and `src/components/layout/index.ts` — always import from the barrel, not the file directly.

References: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`

## Toast / Global Notifications

`Toast.tsx` implements a React Context provider (`ToastProvider`) with a `useToast()` hook. Wrap with `<ToastProvider>` at the app root; call `toast.success()`, `toast.error()`, etc. anywhere in the tree.

Reference: `src/components/ui/Toast.tsx`

## Animation

Reusable Framer Motion variant objects live in `src/utils/animations.ts` (e.g., `fadeInUp`, `staggerContainer`, `slideInLeft`). Import and spread them onto `motion.*` components instead of defining inline variants.

Scroll-triggered animations use the `useScrollAnimation` hook from `src/hooks/useAnimation.ts`, which returns a ref and `controls` to pair with `motion` + `useInView`.

Reference: `src/utils/animations.ts`, `src/hooks/useAnimation.ts`

## Responsive Layout

`useResponsive()` (`src/hooks/useResponsive.ts`) returns `{ isMobile, isTablet, isDesktop }` booleans derived from `window.matchMedia`. Use this for conditional rendering of entirely different layouts; use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for CSS-only differences.

The top `Navbar` (defined inline in `src/App.tsx`, `fixed`, `h-[68px]`) collapses to a hamburger on mobile. `BottomNav` (`src/components/layout/BottomNav.tsx`) is dead code — exported from the layout barrel but not rendered anywhere; don't assume it's live without checking.

## Hero Banner Images at a Fixed Aspect Ratio

Competition hero banners (`CompetitionDetailsPage`) render into a fixed box (`aspect-[4/3] sm:aspect-[16/7] md:aspect-[3/1]`) that's much wider than most source photos (~3:2). Plain `object-cover` would crop out roughly half the photo's height to fill that box; plain `object-contain` avoids cropping but leaves flat empty bars on the sides.

The pattern used instead: stack two copies of the same `<img>` absolutely inside the box —
1. A background copy: `object-cover scale-110 blur-2xl` (fills the whole box, blurred, so it doesn't need to look sharp)
2. A foreground copy: `object-contain scale-150` (the real photo, uncropped, scaled up until it fills most of the width — the `scale-150` factor is a manually-tuned tradeoff between "no crop" and "no visible side padding", not a formula — re-tune by eye if the aspect box or typical photo shape changes)

A `bg-gradient-to-t from-black/75 via-black/30 to-black/10` overlay sits on top of both for text legibility. Reference: `src/App.tsx`, `CompetitionDetailsPage` banner section.

## Styling System

Custom design tokens are defined in `src/index.css` under `@theme`:
- Brand colors: `brand-coral`, `brand-mint`, `brand-sage`, `brand-cream`, `brand-warm`
- Custom utility classes: `.soft-card`, `.warm-glow-coral`, `.card-hover`, `.card-3d`, `.btn-touch` (44px min touch target), `.safe-top` / `.safe-bottom` (CSS env insets for notch)
- Fluid typography: `.text-fluid-xs` through `.text-fluid-5xl` using `clamp()`

Reference: `src/index.css`

## Environment / Config

`vite.config.ts` exposes `GEMINI_API_KEY` to the frontend bundle via `define`. Any new env vars that need to reach the frontend must be added to the `define` block there as well. The `DISABLE_HMR` env var disables Vite HMR (used for AI Studio compatibility).

Reference: `vite.config.ts`
