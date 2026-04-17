---
name: ticket
description: Execute a GitHub issue end-to-end for society-eats. Phase 1 runs in plan mode — read issue, check scope, present DECISION BLOCK, write the plan, call ExitPlanMode. Phase 2 runs only after the user approves — branch → implement → tests → verify → PR → labels → bug sweep → file follow-ons. **Trigger this skill whenever the user wants to start or continue a ticket**, whether via `/ticket N`, `/ticket next`, or natural-language phrases like "work on ticket N", "can you work on issue N", "do issue N", "start ticket N", "implement ticket N", "next task", "next ticket", "pick up the next ticket", "what's next to work on", "let's do the next issue". When no issue number is supplied, confirm the auto-picked issue with the user via AskUserQuestion before doing anything state-changing.
---

# /ticket — Full Ticket Execution Skill

Encodes the society-eats ticket runbook. The skill is the source of truth for the per-issue execution flow; CLAUDE.md is referenced for conventions, not re-stated.

## Arguments

- `N` — GitHub issue number. If omitted (or user said "next task" / "next ticket" / similar), follow the Auto-pick flow below.
- `next` — same as omitting `N`; triggers Auto-pick + confirm.

### Auto-pick flow (when `N` is not supplied)

Runs before Phase 1. No branch, no label change, no file writes until the user confirms.

1. Fetch candidates:
   ```bash
   gh issue list --state open --label sprint \
     --json number,title,labels \
     --limit 30
   ```
2. Rank by priority label (`P0-urgent` → `P1-high` → `P2-normal` → `P3-low`), then by creation date (oldest first). Exclude any issue already labelled `in-progress` or `review`.
3. Present an `AskUserQuestion` DECISION BLOCK with up to 4 options:
   - Option A `(Recommended)` — top-ranked candidate. Label format: `#N — <short title>`. Description: the priority label + one-line why.
   - Options B/C — next 1–2 ranked candidates, same format.
   - Option D — "Pick a different one" (user will name a specific issue in their answer).
4. **Wait for the user's selection.** Do not create a branch, edit labels, or take any other state-changing action until they've picked.
5. Once confirmed, set `N` to the chosen issue number and enter Phase 1 Step 1.1.

If the sprint board is empty, surface that fact + suggest either `gh issue list` (broader) or filing a new issue — do not invent work.

## Invariants — never violate

- **Plan mode first, every ticket.** No code edits before `ExitPlanMode` is approved.
- **Every unanswered scope question goes through a DECISION BLOCK** (CLAUDE.md §Automation Loop). Never ask open-ended questions.
- **Verification uses `pnpm start`, never `pnpm dev`.** Screenshots and smoke tests reflect the production bundle.
- **Every ticket ends with a bug sweep and follow-on issues filed in GitHub.**
- **Commits follow `type(scope): desc [#N]`.** No skipped hooks, no force-push to main.

---

## Phase 1 — Intake & Plan (plan mode)

### Step 1.1 — Load context

> If `N` was not supplied originally, the Auto-pick flow (see Arguments) has already run and the user has confirmed `N`. Do not re-confirm here — proceed.

Run in parallel:

- `gh issue view N` (title, body, labels, comments, linked PRs)
- Read `CLAUDE.md`, `docs/PRD.md`, `docs/scope.md`, `docs/decisions.md` (only relevant ADRs)
- Read `MEMORY.md` — honour `feedback_*` entries as hard guidance
- `gh issue list --state open --limit 15` — map what's already in flight / adjacent

### Step 1.2 — Verify scope

- Confirm the issue is in `docs/scope.md` "In Scope for v1". If it looks out-of-scope, **stop** and ask the user before exploring.
- Check there isn't an open PR already touching this issue (`gh pr list --search "in:title #N"`).

### Step 1.3 — Explore (single pass, parallel)

Launch up to 3 `Explore` subagents in parallel only when scope is uncertain or multi-area. Otherwise do direct `Glob`/`Grep`/`Read`. Actively look for existing helpers to reuse — no new code when a good one exists.

### Step 1.4 — Present DECISION BLOCK

Use `AskUserQuestion` for every scope choice that isn't obvious from docs. Each question: 2–4 options, one marked "(Recommended)" with a one-line rationale. Never open-ended.

Common axes:

- Which tables / RLS policies land now vs in a follow-on ticket
- Which shadcn components / libs to introduce
- What to defer vs include
- Where state lives (Supabase / zustand / localStorage)

### Step 1.5 — Write the plan file

Write to the plan path the harness gives you. Structure:

1. **Context** — why this change, what problem it solves, what prompted it
2. **Scope & Non-Goals** — in/out, including deferred follow-ons
3. **User-confirmed scope decisions** — capture the answers from Step 1.4 with dates
4. **Architecture** — tables, RLS, lib layout, API routes, UI pages, approach choices
5. **Dependencies to add** — pinned exact versions only
6. **Critical files to modify / create** — with markdown links
7. **Verification** — migration / seed / lint / typecheck / test / build / `pnpm start` + screenshots / PR
8. **Follow-on tickets to file during bug sweep** — anticipated gaps

### Step 1.6 — Call `ExitPlanMode`

End Phase 1 here. Do **not** proceed to Phase 2 until the plan is approved. If rejected, loop back to Step 1.4.

---

## Phase 2 — Execution (post-approval)

### Step 2.1 — Branch & label

```bash
git checkout -b feature/N-short-desc
gh issue edit N --add-label in-progress
```

### Step 2.2 — Implement

- Follow the approved plan exactly. If reality diverges, **stop and surface a DECISION BLOCK** before deviating on anything non-trivial.
- Enforce CLAUDE.md security rules on every file: Zod at boundaries, no `any`, explicit return types, RLS-first data access (never bypass with the service role key from client code), no secrets in URLs, structured errors with correlation IDs.
- Use `TodoWrite` to track subtasks as you go.

### Step 2.3 — Tests (required before verification)

- Unit tests colocated (`foo.ts` → `foo.test.ts`) — 2 positive + 2 negative per business function.
- Integration tests in `tests/integration/<area>/` — full request lifecycle, every error path (400/401/403/404/409/429).
- Zod schema tests — valid + invalid inputs.
- For tests that need Supabase, hit a staging project or the local Supabase CLI stack — do not mock the client.

### Step 2.4 — Verify (production build, never dev server)

Run in sequence:

1. `pnpm lint` — must pass
2. `pnpm typecheck` — must pass
3. `pnpm test` — must be all green, no skips
4. `pnpm build` — must pass, no warnings that hide errors
5. `pnpm start` **in background** on the built output. Wait for `http://localhost:3000` to respond 200.
6. For every new UI page, capture screenshots into `evidence/screenshots/YYYY-MM-DD-issue-N-*.png` and read each PNG back to confirm it renders correctly:
   - **Static / public pages** → `./scripts/screenshot.sh <path> <issue-N-page-name>`. This script only navigates to a URL — it cannot click, type, or log in.
   - **Flows requiring login or interaction** (OTP signup, onboarding, menu, checkout, admin) → drive with the **Playwright MCP** (`navigate` → `fill` → `click` → `screenshot`). Save PNGs to the same `evidence/screenshots/` path.
   - Do not invent phone numbers. Log in via the pre-registered local test OTPs in `supabase/config.toml` under `[auth.sms.test_otp]` (e.g. `+919999900001` / `123456`). Other fixtures (society, buildings, menu, admin) come from `supabase/seed.sql` via `npx supabase db reset`. If the ticket needs a new fixture or test phone, add it to `test_otp` + `seed.sql` in this same PR.
7. Smoke-test the golden-path API / page flow (signup → onboarding → menu → checkout, or whatever the ticket exposes). Check response bodies, not just status codes.
8. Stop the background server before continuing.

If anything fails, fix it — do not paper over with skipped tests or `--no-verify`.

### Step 2.5 — Commit

```bash
git add <specific files>  # never `git add -A`
git commit -m "$(cat <<'EOF'
type(scope): short description [#N]

Why this change exists in 1–3 lines. What it does, what's deferred,
any surprising decision worth recording.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Pre-commit runs `lint-staged` (fast). Do not amend published commits.

### Step 2.6 — Push

```bash
git push -u origin feature/N-short-desc
```

### Step 2.7 — Open PR

```bash
gh pr create --title "type(scope): description [#N]" --body "$(cat <<'EOF'
## Summary
<1–3 bullets of what + why>

Closes #N.

## What changed
<Concrete list of tables, libs, routes, pages, tests>

## Test results
<Unit + integration counts>

## Screenshots
| Page | File |
| --- | --- |
| <page> | [evidence/screenshots/...](evidence/screenshots/...) |

## Security checklist
- [x] Zod at boundaries
- [x] RLS policies cover all new tables
- [x] No hardcoded secrets / service-role key not exposed to client
- [x] `pnpm audit --audit-level=high` clean

## Follow-ons to file after merge
- <description>
- <description>

## Test plan
- [ ] <reviewer TODO>
- [ ] <reviewer TODO>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Step 2.8 — Labels & issue lifecycle

```bash
gh issue edit N --add-label review --remove-label in-progress
```

### Step 2.9 — CI watch

After pushing, check the PR's CI status with `gh run list --branch <branch> --limit 1`. If it fails (and local pre-push passed), the root cause is almost always **env-var drift between local and CI**. Fix the workflow file, push again.

---

## Phase 3 — Bug sweep (mandatory, before declaring done)

Scan the diff for:

- Broken imports or dead references
- Missing error handling on async calls
- Security gaps vs CLAUDE.md: unvalidated routes, `any` types, RLS gaps, unredacted logs, service-role key reaching the client bundle
- Missing tests for any business function
- Functionality the ticket mentioned but the plan deferred (re-check against the plan's "Deferred" list)

For each gap:

- If critical → fix in this PR before asking for review
- If non-critical → file a GitHub issue with labels `bug` (or appropriate) + priority. Include file paths, file:line references, and what "done" looks like.

Never silently skip the sweep. If genuinely nothing is found, say so explicitly in the completion report.

---

## Completion report (always, at end of skill)

```
COMPLETED: <title>
Branch: feature/N-short-desc
PR: <url>
Tests: X passed, X failed (unit + integration)
CI gates: lint ✓ · typecheck ✓ · test ✓ · audit ✓ · build ✓
Screenshots: evidence/screenshots/YYYY-MM-DD-issue-N-*.png
Issue: #N → "review" label

Follow-ons filed during bug sweep:
  #A <title>
  #B <title>

NEXT: Review the screenshots and PR, then APPROVE (I'll merge + close) or REJECT (I'll ask which specific issue via DECISION BLOCK).
```

---

## Do not

- Do not skip plan mode
- Do not implement before `ExitPlanMode` is approved
- Do not use `pnpm dev` for verification screenshots
- Do not use `./scripts/screenshot.sh` for flows that require login/clicks — it only loads a URL. Use the Playwright MCP for interactive flows
- Do not invent phone numbers or mock auth — log in via `[auth.sms.test_otp]` pairs in `supabase/config.toml`
- Do not `git add -A` — stage specific files only (avoid .env leaks)
- Do not skip git hooks (`--no-verify`)
- Do not amend pushed commits
- Do not file follow-ons as in-thread comments — always create GitHub issues
- Do not declare a ticket done without Phase 3 bug sweep
- Do not deviate from the approved plan on anything non-trivial without a fresh DECISION BLOCK
- Do not bypass RLS by importing the service-role client from a React Server Component or client component — use it only in server-side mutation routes
