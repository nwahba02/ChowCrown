# Architectural Patterns

## Routing / Page Management

Uses React Router (`react-router-dom`). Routes are declared with `<Routes>/<Route>` inside `AppInner` at the bottom of `src/App.tsx`. Navigation uses `useNavigate()`.

- A `setActivePage(page: string)` helper still exists in `AppInner` — it maps page name strings to paths and calls `navigate()`. Some older components use it instead of `useNavigate()` directly.
- `ScrollToTopOnNav` is a side-effect component that calls `window.scrollTo(0,0)` on every pathname change.
- Bottom nav uses `layoutId` shared animation to animate the active indicator between tabs.

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

`BottomNav` is rendered only on mobile. The top `Navbar` collapses to a hamburger on mobile.

## Styling System

Custom design tokens are defined in `src/index.css` under `@theme`:
- Brand colors: `brand-coral`, `brand-mint`, `brand-sage`, `brand-cream`, `brand-warm`
- Custom utility classes: `.soft-card`, `.warm-glow-coral`, `.card-hover`, `.card-3d`, `.btn-touch` (44px min touch target), `.safe-top` / `.safe-bottom` (CSS env insets for notch)
- Fluid typography: `.text-fluid-xs` through `.text-fluid-5xl` using `clamp()`

Reference: `src/index.css`

## Environment / Config

`vite.config.ts` exposes `GEMINI_API_KEY` to the frontend bundle via `define`. Any new env vars that need to reach the frontend must be added to the `define` block there as well. The `DISABLE_HMR` env var disables Vite HMR (used for AI Studio compatibility).

Reference: `vite.config.ts`
