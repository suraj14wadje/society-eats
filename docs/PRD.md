# society-eats — Product Requirements Document

## Changelog

- 2026-04-17 — v0.1 initial PRD, v1 scope locked.
- 2026-04-17 — v0.2 made mobile-first a first-class requirement (residents are on phones); added responsive rule to v1 features. See ADR-007.
- 2026-04-18 — v0.3 flipped the flow: menu is the landing page (no login), auth runs at checkout. Payment is now Cash on Delivery (ADR-008 supersedes ADR-002). Added Meera's in-product operator surface at `/admin/*` (ADR-010). Resident order history + kitchen edge states (closed, past cutoff, sold out, OTP error, order failed) are now v1 scope.

## Problem

A single cloud kitchen operating inside one residential society currently takes orders over WhatsApp. Orders get missed, delivery slots clash, and UPI payments sit unreconciled until someone scrolls through bank messages. The owner (chef + operator) needs a lightweight ordering channel that:

- Lets residents browse what's on today's menu without DMing
- Captures delivery slot + flat number so the owner doesn't have to re-ask
- Takes payment as cash at the door — Meera prefers counting notes over cross-referencing UPI (ADR-008 supersedes ADR-002)
- Works on cheap phones over 4G, installs nothing

This is not an attempt to build Swiggy. It's a household tool for one kitchen, one society.

## Target User

- **Residents** of one named society (Society → Building → Flat Number).
- ~50–150 households. Age skews 25–60. Primarily Android, usually 4G.
- Payments are cash-at-the-door in v1 (ADR-008). UPI and digital payment rails are deferred to v1.1.
- Most discovery is via a WhatsApp broadcast — they arrive at the web app already knowing who the kitchen is.

## Success Metric (v1, first week in production)

- ≥ 20 real orders placed end-to-end (menu → cart → OTP at checkout → delivered)
- Zero order disputes that require scrolling WhatsApp history to resolve
- Owner spends < 5 minutes/day updating order status from the in-product `/admin` screens

## v1 Features (in scope)

1. **Menu-first landing** — `/` is a public menu. No login required to browse. See [ADR-009](./decisions.md).
2. **Cart** — client-side, Zustand + localStorage, persists across refreshes.
3. **Checkout with auth-at-end** — first-time residents fill Name / Mobile / Tower / Flat then receive an OTP. Returning residents see a saved-address confirmation card. Cash on Delivery is the only payment option (ADR-008).
4. **Order confirmation + live status tracker** — 4-stage visual tracker (Pending → Preparing → Delivering → Delivered) mapped from the 7-value Postgres enum. Live-updating via Supabase Realtime.
5. **Past Thalis** — resident order history at `/history`, last 30 days, with Reorder one-tap.
6. **Meera's in-product operator surface** (ADR-010) at `/admin/queue` and `/admin/controls`. Admin-gated by `profiles.is_admin`. Live queue + per-order transitions; pause toggle + per-item availability + stock tracking.
7. **Edge states** — kitchen closed, lunch cutoff passed (dinner preview), mostly sold out, OTP wrong (shake + attempts remaining), sold-out-at-checkout, empty history — every awkward moment is designed.
8. **Vercel deploy** — `society-eats.vercel.app` (no custom domain in v1).
9. **Mobile-first responsive web** — every page designed for 375–414px phones (primary target: 4G Android). Desktop viewports render the same layout centered in a `max-w-md` app shell; no separate desktop UI. See [ADR-007](./decisions.md).

## Target Users — Two Personas

- **Residents** (primary) — land on `/`, browse the menu, add to cart, check out. First-timers verify phone; returning residents skip straight to address confirmation.
- **Meera, the kitchen owner** — signs in with her phone like any resident, but her profile has `is_admin = true`. She uses `/admin/queue` and `/admin/controls` on the same phone she answers calls on.

## Non-Goals for v1

See [docs/scope.md](./scope.md) for the full deferred list. Highlights: no UPI / Razorpay (ADR-008 deferred digital payments to v1.1), no SMS notifications, no ratings, no promo codes, no multi-society support, no refund workflow, no multi-address book.

## Pricing Model

**No markup in v1.** Prices shown are what residents pay; the owner keeps 100%. The owner is the kitchen — there is no platform cut. The app itself has no subscription; running costs (Supabase free tier, Vercel free tier, phone OTP SMS) come out of the kitchen's operating costs.

## Technical Shape

- Next.js 16 App Router + TypeScript strict
- Supabase (Postgres + Auth + RLS + Realtime)
- shadcn/ui + Tailwind 4
- Deployed on Vercel free tier, `*.vercel.app`
- No custom domain, no email, no SMS beyond phone OTP

Detailed technical decisions live in [docs/decisions.md](./decisions.md).
