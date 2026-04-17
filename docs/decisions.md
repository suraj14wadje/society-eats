# Architecture Decision Records

Append-only log. When a decision is reversed, write a new ADR that supersedes the old one — never edit the past.

Format: one ADR per decision. Status = `Accepted | Superseded by ADR-NNN | Deprecated`.

---

## ADR-001 — Supabase over a custom Postgres + NextAuth stack

**Date**: 2026-04-17
**Status**: Accepted

### Context

We need auth, a database, and row-level authorization for an app shipping in a week. The team is one person. A custom Postgres + Prisma + NextAuth + session middleware stack is well-understood but takes 2–3 days to wire end-to-end.

### Decision

Use Supabase (managed Postgres + Auth + RLS + Storage + Realtime) as the entire backend. No separate ORM layer — use `@supabase/supabase-js` directly with generated TypeScript types.

### Consequences

- **+** Auth (phone OTP), session management, and row-level access control ship with the platform. Cuts ~2 days off the timeline.
- **+** Realtime subscriptions out-of-the-box — admin dashboard live-updates without building a WebSocket layer.
- **+** Free tier covers expected v1 usage (50–150 households, low order volume).
- **−** Vendor lock-in on the data layer. Migrating off Supabase later means re-implementing RLS as application code or moving to another RLS-capable host.
- **−** RLS policies become the security boundary — a bug in a policy is a privacy bug. Mitigated by: every policy gets a test, every migration is reviewed in PR.

---

## ADR-002 — UPI manual reconciliation over Razorpay integration

**Date**: 2026-04-17
**Status**: Accepted

### Context

Residents pay via UPI. We can either (a) integrate Razorpay / Cashfree for automated webhook-confirmed payments or (b) show a UPI ID + QR at checkout and ask the customer to type in their UPI reference number, which the admin verifies in the bank app.

(a) is the "right" way. Razorpay takes 1–2 days of integration work, a fee of ~2%, and requires business KYC. (b) ships in hours and costs nothing.

### Decision

Ship (b) for v1. Order status `payment_pending` until the admin marks it `paid` after cross-checking the reference in their bank app.

### Consequences

- **+** Zero integration cost, zero fee, zero KYC. Ships in one ticket.
- **+** Kitchen owner already checks UPI messages — the marginal effort of matching a reference number is small at v1 volume.
- **−** Does not scale. At >10 orders/day, manual reconciliation becomes painful. That's the trigger to file a new ADR and add Razorpay.
- **−** A malicious user can fake a UPI reference number. Mitigated by: order only progresses past `payment_pending` after admin verification.

---

## ADR-003 — No ORM; use `@supabase/supabase-js` directly

**Date**: 2026-04-17
**Status**: Accepted

### Context

Given Supabase is the backend (ADR-001), we could still add Prisma / Drizzle / Kysely as a typed query layer. Prisma adds 1–2 hours of setup plus an ongoing requirement to keep `schema.prisma` in sync with Supabase migrations.

### Decision

Skip the ORM. Write SQL migrations in `supabase/migrations/*.sql` and generate TypeScript types with `npx supabase gen types typescript --linked > types/supabase.ts`. Use the generated types directly with `supabase-js`.

### Consequences

- **+** No schema duplication — one source of truth (SQL).
- **+** RLS policies live next to table definitions in the same migration file.
- **−** Queries are less ergonomic than Prisma. For v1's simple CRUD this is fine; we revisit if query complexity grows.

---

## ADR-004 — Admin role via `profiles.is_admin`, bootstrapped manually

**Date**: 2026-04-17
**Status**: Accepted

### Context

We need one admin user (the kitchen owner). Options: (a) a separate `admins` table, (b) Supabase Auth custom claims / app_metadata, (c) a boolean `is_admin` column on `profiles`.

### Decision

(c). RLS policies check `profiles.is_admin = true` via a security-definer helper function. After the owner's first phone-OTP signup, set `is_admin = true` manually in the Supabase Studio SQL editor:

```sql
update profiles set is_admin = true where phone = '+91XXXXXXXXXX';
```

This is documented in [SETUP.md](../SETUP.md).

### Consequences

- **+** Simple, matches the existing data model, testable.
- **−** Role escalation is a manual step, not an automated one. Fine because there is exactly one admin for the life of v1.
- **−** If we ever need multi-role (e.g., kitchen helper with view-only access), we'll add a proper role column or a separate RBAC table.

---

## ADR-006 — Local Supabase + test_otp is the default dev loop; cloud provisioning waits for deploy

**Date**: 2026-04-17
**Status**: Accepted

### Context

Ticket #1's original acceptance criteria assumed we'd create a cloud Supabase project, link, `supabase db push`, and enable a real SMS provider (MSG91 / Twilio) on day one. That mixes two concerns: (a) making migrations + types + seed work end-to-end, and (b) standing up the shared dev/prod environment.

(a) unblocks every subsequent ticket (#2–#8). (b) costs money (SMS), adds external account deps, and only matters when a second developer or a live user needs to hit the same DB.

### Decision

Run v1 development entirely against the local Supabase CLI stack (Docker). Use `[auth.sms.test_otp]` in `supabase/config.toml` plus a stub Twilio provider (`enabled = true`, `auth_token = "local-stub"`) so phone OTP works end-to-end without contacting a real SMS provider. Provisioning the cloud project is deferred to a follow-on ticket paired with the Vercel deploy (#9 / #12).

### Consequences

- **+** Every new developer (including future Claude sessions) gets to a working DB + auth in ~5 minutes via `pnpm supabase:start && pnpm supabase:reset` — no accounts, no keys to share.
- **+** No SMS cost during development. Zero risk of accidentally spamming real phones from a test run.
- **+** CI has nothing to configure on Supabase's side; env vars are stub strings.
- **−** The committed `supabase/config.toml` has `auth_token = "local-stub"` inline. A future PR (tracked in #14) must switch this back to `env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)` before the cloud project goes live.
- **−** First-run is ~2 GB of Docker image pulls. Acceptable one-time cost.
- **−** `test_otp` only short-circuits the listed numbers; adding new dev accounts means editing `config.toml` + restarting the stack.

Related: [supabase/config.toml](../supabase/config.toml), [SETUP.md](../SETUP.md), GitHub issues #12 (cloud provisioning) and #14 (env-sub restore).

---

## ADR-005 — Next.js 16 + Tailwind 4 + shadcn "base-nova" preset

**Date**: 2026-04-17
**Status**: Accepted

### Context

The sibling zrok project uses Next.js 15 + React 18 + Tailwind 3 + shadcn with `default` style + `slate` base color. For society-eats (greenfield, no users to migrate), we can either match zrok's versions exactly or use `create-next-app@latest`.

### Decision

Use the latest: Next 16, React 19, Tailwind 4, shadcn `base-nova` preset. The ticket-driven workflow and shadcn component API port across versions.

### Consequences

- **+** One less version mismatch to debug later.
- **+** Tailwind 4's CSS-first config is simpler than 3's `tailwind.config.ts`.
- **−** The shadcn skill's CLI docs may reference the older `default`/`slate` flags that no longer exist in shadcn 4. Handled at the skill level when we hit it.

---

## ADR-007 — Mobile-first responsive design with capped desktop width

**Date**: 2026-04-17
**Status**: Accepted

### Context

The PRD identifies residents on 4G Android phones as the primary (and essentially only) target users. Despite this, the initial scaffold had no viewport meta tag, no documented mobile-first rule in `CLAUDE.md`, and a screenshot script that captured at Playwright's desktop default (1280×720) — so the completion-report screenshots gating every PR did not reflect what users would actually see. Without a written policy now, every new page built for auth, menu, checkout, and admin would drift toward an implicit desktop-first mental model.

### Decision

Design every page at ~375px first. On wider viewports, content is centered in a `max-w-md` (28rem / 448px) app shell applied once in the root layout — there is no separate desktop layout. `sm:`/`md:`/`lg:` breakpoints are reserved for small typography/spacing tweaks, never layout rewrites (no multi-column grids, no desktop sidebars).

Operational follow-through:

- Root layout sets `width=device-width, initial-scale=1, maximum-scale=1` (the last prevents iOS's input-focus zoom).
- `scripts/screenshot.sh` defaults to a 390×844 viewport (iPhone 14, close to median Android). A `--desktop` flag captures 1280×800 for the rare case a reviewer wants to see the centered desktop framing.
- Tap targets must be ≥ 44px; inputs must use `text-base` (16px) to avoid iOS zoom.

### Consequences

- **+** One code path per page — no desktop variants to maintain, no responsive bugs from forgotten breakpoints.
- **+** Evidence screenshots in PRs match what residents see on their phones.
- **+** Laptop users get a usable, centered layout for free without any extra work.
- **−** Power users who want to use the app on a widescreen laptop get a narrow column. Acceptable — they are not the target.
- **−** Any future desire for a richer admin dashboard (wide tables, side-by-side panels) will need either a dedicated `/admin` layout that opts out of the app shell, or a new ADR reversing this one.

Related: `app/layout.tsx`, `scripts/screenshot.sh`, the "Mobile-First Responsive Rules" section in `CLAUDE.md`.
