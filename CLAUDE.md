# society-eats — Claude Automation Rules

## Project Identity

**society-eats** is a food-ordering web app for a single residential society, powering one owner-operated cloud kitchen. Residents pick their **Building + Flat Number** at onboarding, browse the day's menu, and pay via **UPI with a manually-entered reference number**.

**Stack**: Next.js 16 (App Router) + TypeScript strict + Tailwind 4 + shadcn/ui
**Backend**: Supabase (Postgres + Auth + RLS + Storage + Realtime)
**Auth**: Supabase phone OTP
**Payments**: UPI link / QR + manual reconciliation (no Razorpay in v1)
**Hosting**: Vercel (free tier, default `*.vercel.app`, no custom domain)
**Target ship window**: 1 week

This is intentionally minimal. No SOC 2, no multi-tenancy, no internationalization. Scope = one society, one kitchen, one admin.

## Human-Claude Workflow

Solo owner + Claude. Claude does 99% of implementation. Human input is YES/NO or SELECT FROM OPTIONS only.

### The Automation Loop (MANDATORY)

Every unit of work MUST follow this cycle:

**Step 1 — Scope & Present Options**
Before implementing anything, present a DECISION BLOCK:

```
DECISION REQUIRED:
[A] Option description (recommended) — reason
[B] Option description — reason
[C] Option description — reason
```

- Never ask open-ended questions. Always provide concrete options.
- Mark one option as "(recommended)" with a one-line rationale.
- Maximum 4 options.

**Step 2 — Implement**
After human selects, implement completely. Do not stop partway to ask more questions.
Create feature branch, write code, write tests — all in one pass.

**Step 3 — Test & Generate Evidence**
Run ALL tests and capture output. For UI changes: take screenshots with Playwright via `./scripts/screenshot.sh`.
Generate a COMPLETION REPORT:

```
COMPLETED: [task name]
Branch: feature/N-short-desc
Tests: X passed, X failed
Screenshots: evidence/screenshots/xxx.png
Issue: #N → "review" label

NEXT: Review screenshots, then APPROVE or REJECT.
```

**Step 4 — Human Reviews Evidence**
Human reviews screenshots and test reports (not code).
APPROVE → merge PR, close GitHub issue, proceed.
REJECT → ask which specific issue (multiple choice), fix, re-test.

**Step 5 — Bug Sweep**
After every feature, scan for:

- Broken imports or references
- Missing error handling
- RLS gaps / missing policies on new tables
- Service-role key accidentally reaching client code
- Missing tests

Auto-create GitHub issues (labeled `bug`) for anything found. Fix before next feature.

**Step 6 — Update Docs**
If the work introduced a decision worth remembering or changed the product shape:

- Technical decision → append to `docs/decisions.md` (new ADR entry)
- Product/scope change → update `docs/PRD.md` changelog + relevant section
- Scope shift (in/out of v1) → update `docs/scope.md`

## Architecture Rules

- **Supabase is the only backend.** No separate API server in v1. Use Route Handlers (`app/api/*/route.ts`) only when you need server-only logic (service-role key, third-party calls, complex validation).
- **RLS everywhere.** Every new table has Row Level Security enabled from the migration, not added later. Residents read their own rows; admin (`profiles.is_admin = true`) reads all.
- **Three Supabase clients**:
  - `lib/supabase/client.ts` → browser client, anon key, for client components
  - `lib/supabase/server.ts` → SSR client, anon key, for Server Components + Route Handlers (reads cookies)
  - `lib/supabase/service.ts` → service-role client, **server-only**, for mutations that need to bypass RLS (e.g., creating a profile on signup). Never imported into any file under `app/(public)/` or any `"use client"` file.
- **Society scope** is a data-level invariant, not enforced by the app. All residents belong to one society row; the system does not multiplex societies. If you ever need to scope to more than one society, that's a v2 architecture change, not a column filter.
- **No Prisma / ORM.** Use `@supabase/supabase-js` directly. Generated types live in `types/supabase.ts` (regenerate via `pnpm supabase:types`).

## Code Conventions

- File naming: kebab-case (`menu-item-card.tsx`), PascalCase for React components inside files.
- Functions/variables: camelCase. Constants: `SCREAMING_SNAKE_CASE`. DB tables: `snake_case`.
- TypeScript strict. No `any` — use `unknown` + type guards or `z.infer<typeof Schema>`.
- All exported functions have explicit return types.
- API routes in: `app/api/[...]/route.ts`
- Zod for all input validation at API boundaries and form submits.
- Errors: typed, never expose stack traces to clients, log server-side with a correlation ID.

## Mobile-First Responsive Rules

Residents are on 4G Android phones — mobile is the product, desktop is a centered fallback.

- **Design at 375px first.** Default Tailwind classes = mobile styles. Desktop viewports inherit a `max-w-md` centered app shell from `app/layout.tsx` — do NOT add per-page desktop layouts.
- **Breakpoint usage**: use `sm:`/`md:`/`lg:` sparingly, only for small typography/spacing tweaks (e.g., slightly larger heading on wider screens). No multi-column grids, no sidebars, no desktop-only components.
- **Tap targets ≥ 44px** — use `h-11` minimum on buttons and form inputs.
- **Inputs use `text-base` (16px)** to prevent iOS zooming on focus.
- **No horizontal scroll, ever.** Long strings wrap or truncate; tables become stacked cards on narrow screens.
- **Viewport meta** is set in `app/layout.tsx` with `maximum-scale=1` — don't add conflicting meta tags.
- **Safe areas**: if you add sticky bottom bars, use `pb-[env(safe-area-inset-bottom)]` so the iOS home-indicator doesn't overlap content.

See [ADR-007](./docs/decisions.md) for the full rationale.

## Security Standards (lighter than SOC 2, still non-negotiable)

This isn't SOC 2, but these are the rules that keep the app from leaking data or taking money we can't trace:

### Auth & Authorization

- All mutation routes require a Supabase session (`supabase.auth.getUser()`).
- All reads go through RLS — never use the service-role key to fetch on behalf of a user.
- Admin check = `profiles.is_admin = true` (enforced in RLS policies for admin-only reads, and re-checked in any admin-only Route Handler).
- No hardcoded secrets — use `process.env.X` only. Prefix public env vars with `NEXT_PUBLIC_`.

### Input Validation

- Zod schema at every API boundary + form submit.
- Max string lengths on every text field.
- Never trust the client-provided `orderId`, `userId`, or `totalInr` — recompute/revalidate server-side.

### Data Protection

- TLS via Supabase + Vercel defaults — do not downgrade.
- Service-role key lives only on the server (not prefixed `NEXT_PUBLIC_`), never logged, never sent to the client bundle.
- UPI reference numbers are PII-adjacent — log only hashed versions if logging at all.

### Error Handling

- Generic error messages to clients with correlation IDs.
- Detailed errors server-side only.
- All async DB/auth calls wrapped in try/catch inside Route Handlers.

### Dependencies

- `pnpm audit --audit-level=high` clean in CI — block merges on high/critical.
- Pin versions in `package.json` where possible.

## Testing Requirements

Every feature requires tests before completion.

### Unit tests (required)

- Every function with business logic gets unit tests.
- Every Zod schema gets validation tests (valid + invalid inputs).
- Minimum: 2 positive + 2 negative cases per function.
- Test files colocated: `foo.ts` → `foo.test.ts`.

### Integration tests (required for API routes)

- Full request lifecycle: auth → validation → logic → response.
- Test 400 / 401 / 403 / 404 / 409 paths.
- Use a staging Supabase project or the local Supabase CLI stack — do not mock the Supabase client.

### Screenshot tests (required for UI changes)

- Capture with Playwright via `./scripts/screenshot.sh <path> <name>`.
- Saved to `evidence/screenshots/YYYY-MM-DD-<name>.png`.
- **Default viewport is mobile (390×844)** — this is what reviewers see, because this is what users see. Pass `--desktop` to also capture 1280×800 when a change specifically affects the desktop-centered framing.

## PR Workflow

### Branch Naming

- Features: `feature/N-short-description`
- Bugs: `fix/N-short-description`
- Infra: `infra/N-short-description`

### Commit Messages

Format: `type(scope): description [#N]`
Types: `feat`, `fix`, `refactor`, `test`, `docs`, `infra`, `security`
Example: `feat(checkout): capture UPI reference at order submit [#5]`

### PR Body Must Include

1. What changed and why
2. Test results (pass/fail counts)
3. Screenshots (for UI changes)
4. `Closes #N` to link the GitHub issue
5. Security checklist (RLS, service-role usage, Zod at boundaries)

## GitHub Issues

### Task Lifecycle

1. Claude picks next issue from backlog: `gh issue list --label sprint --state open`
2. Assigns self + adds `in-progress` label
3. Creates feature branch: `git checkout -b feature/N-short-desc`
4. After implementation + tests, creates PR: `gh pr create` with `Closes #N`
5. Adds `review` label, removes `in-progress`
6. Human approves → Claude merges PR (auto-closes issue)
7. Human rejects → Claude fixes, pushes new commit on same branch

### Issue Labels

- `sprint` — in current sprint
- `in-progress` — Claude is working on it
- `review` — ready for human review
- `bug` — bug found during sweep
- `feature`, `infra`, `testing` — category tags
- `P0-urgent`, `P1-high`, `P2-normal`, `P3-low` — priority

## Documentation System

Three files in `docs/` — answer "why", never duplicate what GitHub issues track.

| File                | Purpose                                     | When to update                                                |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| `docs/PRD.md`       | What we're building and why (vision, users) | When product scope / priorities change — bump changelog       |
| `docs/decisions.md` | Why we built it this way (append-only ADRs) | After every significant technical or product decision         |
| `docs/scope.md`     | What's out-of-scope and why                 | When features get deferred, moved in, or explicitly ruled out |

**Rules**:

- **Read on session start**: PRD first, then decisions.md, then scope.md. This is how Claude recovers context.
- **Auto-update silently**: Don't ask for permission to update docs during the work — just do it as part of the automation loop Step 6.
- **Source of truth for tasks = GitHub Issues**. Never create a "status" or "tasks" file — use `gh issue list`.
- **When user asks "can we add X?"**: Check `docs/scope.md` first before answering.
- **ADRs are append-only**: Never delete or rewrite past decisions. If reversed, write a new ADR that supersedes it.

## Available Skills

- **ticket** (`.claude/skills/ticket`) — end-to-end GitHub-issue execution. Plan mode → approval → implement → test → PR → bug sweep.
- **shadcn** (`.claude/skills/shadcn`) — up-to-date shadcn/ui rules and CLI reference. **Always consult before writing custom markup** — check if a shadcn component exists first.

## Commands Reference

```bash
# Development
pnpm dev                       # Start Next.js dev server
pnpm test                      # Run vitest (unit + integration)
pnpm test:coverage             # With coverage
pnpm lint                      # ESLint
pnpm typecheck                 # TypeScript strict check
pnpm build                     # Production build
pnpm start                     # Run prod build (required for screenshot verification)

# Screenshots
./scripts/screenshot.sh /path name   # Capture page screenshot

# Supabase (local CLI)
npx supabase start             # Start local stack
npx supabase db push           # Apply migrations to linked project
npx supabase db reset          # Reset local DB with migrations + seed
npx supabase gen types typescript --linked > types/supabase.ts
```
