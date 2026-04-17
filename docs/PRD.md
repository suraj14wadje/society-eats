# society-eats — Product Requirements Document

## Changelog

- 2026-04-17 — v0.1 initial PRD, v1 scope locked.

## Problem

A single cloud kitchen operating inside one residential society currently takes orders over WhatsApp. Orders get missed, delivery slots clash, and UPI payments sit unreconciled until someone scrolls through bank messages. The owner (chef + operator) needs a lightweight ordering channel that:

- Lets residents browse what's on today's menu without DMing
- Captures delivery slot + flat number so the owner doesn't have to re-ask
- Records the UPI reference number at order time so reconciliation is a dashboard task, not an archaeology project
- Works on cheap phones over 4G, installs nothing

This is not an attempt to build Swiggy. It's a household tool for one kitchen, one society.

## Target User

- **Residents** of one named society (Society → Building → Flat Number).
- ~50–150 households. Age skews 25–60. Primarily Android, usually 4G.
- Payments are UPI-native (GPay, PhonePe, Paytm). Cash fallback exists but isn't the default.
- Most discovery is via a WhatsApp broadcast — they arrive at the web app already knowing who the kitchen is.

## Success Metric (v1, first week in production)

- ≥ 20 real orders placed end-to-end (signup → UPI paid → delivered)
- Zero order disputes that require scrolling WhatsApp history to resolve
- Owner spends < 5 minutes/day reconciling payments

## v1 Features (in scope)

1. **Phone OTP auth** via Supabase
2. **Profile onboarding** — `Society (fixed)`, `Building (select)`, `Flat Number (text)`, `Full Name`
3. **Menu browsing** — list of today's available items (name, price ₹, image, description)
4. **Cart** — client-side, persists across refreshes
5. **Checkout** — pick delivery slot (today lunch, today dinner, tomorrow lunch, tomorrow dinner), show UPI QR + ID, paste UPI reference number, submit
6. **Order history + status** — resident sees their own orders with current status
7. **Admin dashboard** — only for `profiles.is_admin = true`. Live order list (via Supabase Realtime), click to update status (`placed → payment_pending → paid → cooking → out_for_delivery → delivered | cancelled`)
8. **Vercel deploy** — `society-eats.vercel.app` (no custom domain in v1)

## Non-Goals for v1

See [docs/scope.md](./scope.md) for the full deferred list. Highlights: no admin menu CRUD UI (edit in Supabase Studio), no Razorpay, no SMS notifications, no ratings, no promo codes, no multi-society support, no refund workflow.

## Pricing Model

**No markup in v1.** Prices shown are what residents pay; the owner keeps 100%. The owner is the kitchen — there is no platform cut. The app itself has no subscription; running costs (Supabase free tier, Vercel free tier, phone OTP SMS) come out of the kitchen's operating costs.

## Technical Shape

- Next.js 16 App Router + TypeScript strict
- Supabase (Postgres + Auth + RLS + Realtime)
- shadcn/ui + Tailwind 4
- Deployed on Vercel free tier, `*.vercel.app`
- No custom domain, no email, no SMS beyond phone OTP

Detailed technical decisions live in [docs/decisions.md](./decisions.md).
