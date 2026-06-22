# Design

## Theme

Dark. A deep, warm-tinted near-black page with sections that shift between dark surface levels — not alternating light/offwhite. Accents are vivid: hot amber for primary CTAs and highlights, electric green exclusively for live/active states. One "drenched" amber section (the CTA) makes the accent feel earned when it appears at full saturation.

Physical scene: 8pm at a packed restaurant, someone just took the last bite of what might be the best burger of their life. Their phone screen needs to match that energy.

## Color

### Strategy: Full palette, one drenched moment

Primary surface is dark warm near-black. Sections use different dark surface levels for visual rhythm. The CTA block is drenched in amber.

### Tokens

| Name | OKLCH | Usage |
|------|-------|-------|
| `page` | `oklch(0.11 0.025 38)` | Page background |
| `section` | `oklch(0.17 0.025 38)` | Alternate section backgrounds |
| `card` | `oklch(0.22 0.030 38)` | Card surfaces, inputs |
| `overlay` | `oklch(0.07 0.020 38)` | Darkest overlays, footer |
| `amber` | `oklch(0.72 0.180 52)` | Primary CTA, key highlights, scores |
| `amber-soft` | `oklch(0.57 0.140 52)` | Amber icon backgrounds, in-range scores |
| `amber-glow` | `oklch(0.84 0.120 52)` | Hover states, lighter amber moments |
| `live` | `oklch(0.80 0.220 140)` | Live badges, success states |
| `live-dim` | `oklch(0.65 0.170 140)` | Dimmer live indicators |
| `fg` | `oklch(0.96 0.010 70)` | Primary text |
| `fg-muted` | `oklch(0.65 0.015 70)` | Secondary text |
| `fg-dim` | `oklch(0.42 0.010 70)` | Tertiary, placeholders |

Alpha is expressed via Tailwind modifier syntax (e.g. `border-white/[0.07]`, `bg-amber/[0.12]`).

## Typography

### Fonts

- Display: Fredoka — large headlines, competition names, logo. Playful weight.
- Body: DM Sans — all UI text, labels, copy.

### Scale

- Hero/display: `clamp(3.5rem, 9vw, 6.5rem)`, leading 0.95, tracking -0.025em
- H1: `clamp(2.5rem, 6vw, 4.5rem)`, leading 1.0, tracking -0.02em
- H2: `clamp(1.75rem, 4vw, 3rem)`, tracking -0.015em
- H3: `clamp(1.25rem, 3vw, 1.75rem)`
- Body: 1rem, leading 1.6
- Small/label: 0.875rem
- Micro: 0.75rem, often uppercase + tracked

### Hierarchy rules

700–800 for headlines; 400 for body; 600 for labels. Tight letter-spacing on display sizes. Big scale jumps between hierarchy levels (ratio ≥ 1.4×).

## Components

### Button

Primary: `bg-amber text-page` — dark text on vivid amber, active scale 0.97.
Secondary: `bg-card border border-white/[0.12] text-fg` — dark raised surface.
Ghost: transparent, `text-fg-muted`, hover `text-fg bg-white/[0.05]`.
Danger: `bg-error text-white`.

### Card

`bg-card border border-white/[0.07] rounded-2xl`. Hover: translateY(-3px) + ambient amber glow shadow.
No white cards on white backgrounds. No nested cards.

### Live Badge

`bg-live/[0.15] text-live` with pulsing green dot. Electric green only — not amber.

### Score Buttons (Voting)

1–10 numbered tiles on `bg-card`. Selected: `bg-amber text-page score-active`. In range: `bg-amber/[0.15] text-amber`.

## Layout

- Max width: 1280px, 24px gutters mobile, 32px desktop
- Section vertical padding: 80px–120px
- No alternating light/offwhite sections — use `page`/`section`/`card` elevation for rhythm
- Cards are used deliberately, not as a default layout unit

## Motion

- Enter: opacity 0→1 + translateY 20→0, ease-out-quart, 0.4–0.6s
- Scroll reveals: once, 0.3 threshold
- Score interactions: spring for selection feedback
- Live pulse: 1.5s ease-in-out infinite on green dot
- Page transition: opacity fade 0.2s
- No bounce, no elastic easing
