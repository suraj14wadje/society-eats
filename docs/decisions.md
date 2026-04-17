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
