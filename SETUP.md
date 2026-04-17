# society-eats — First-time setup

This file covers the manual one-time steps for getting the scaffold running. Once done, all subsequent work goes through `/ticket` against GitHub issues.

v1 runs entirely against a **local Supabase stack** (Docker). The cloud-deploy steps are parked at the bottom — we'll wire them up alongside the Vercel ticket (#9).

## Section 1 — Local (v1 default)

### 1.1 Prerequisites

- **Docker** running (`docker ps` should succeed). Supabase spins up ~12 containers locally.
- **pnpm** ≥ 9 and **Node** ≥ 20 (see `package.json` engines).
- No remote Supabase account needed.

### 1.2 Boot the stack

```bash
pnpm supabase:start     # first run pulls ~2 GB of images; takes a few minutes
pnpm supabase:reset     # applies supabase/migrations/* and seeds society/buildings/menu
```

Expected after these run:

- Postgres listening on `127.0.0.1:54322`
- API gateway (PostgREST + Auth + Storage) on `http://127.0.0.1:54321`
- Supabase Studio on `http://127.0.0.1:54323`
- 6 tables in the `public` schema (`societies`, `buildings`, `profiles`, `menu_items`, `orders`, `order_items`), 1 society row, 3 building rows, 5 menu items.

### 1.3 Capture env vars

```bash
npx supabase status -o env
```

Copy the relevant fields into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from above>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY from above>
NEXT_PUBLIC_UPI_ID=test@upi
NEXT_PUBLIC_UPI_QR_URL=/upi-qr.png
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The local anon + service-role keys are deterministic demo keys — safe to keep locally, but never commit them (`.env.local` is gitignored).

### 1.4 Regenerate TypeScript types

```bash
pnpm supabase:types
```

This writes `types/supabase.ts`. Re-run it after any migration change.

### 1.5 Sanity-check

```bash
pnpm typecheck          # confirms clients + generated types agree
pnpm test               # colocated unit tests
pnpm dev                # hot-reload dev server; or pnpm build && pnpm start for prod
```

Visit `http://localhost:3000`. You should see the scaffold landing page.

### 1.6 Phone OTP in local dev

The local stack has no real SMS provider. Instead, `supabase/config.toml` pre-configures `[auth.sms.test_otp]` with two fixed phone/code pairs:

| Phone           | OTP      |
| --------------- | -------- |
| `+919999900001` | `123456` |
| `+919999900002` | `123456` |

Use these when ticket #2 (phone signup) lands. Add more pairs to `supabase/config.toml` and re-run `pnpm supabase:stop && pnpm supabase:start` if you need additional test residents.

### 1.7 Promote yourself to admin (after #2 ships)

Once you sign in via phone OTP and complete onboarding (#2), promote the resulting profile in Supabase Studio (`http://127.0.0.1:54323`) → SQL editor:

```sql
update profiles set is_admin = true where phone = '+919999900001';
select full_name, phone, is_admin from profiles;
```

---

## Section 2 — Cloud deploy (deferred)

> **Not required for local dev.** These steps belong to the Vercel deploy ticket (#9) + a follow-on "provision cloud Supabase" ticket. Skim once you're ready to ship publicly.

### 2.1 Supabase cloud project

1. Create a new project at [supabase.com](https://supabase.com) in the **Mumbai** region. Free tier is fine.
2. Copy from **Project Settings → API** into the Vercel env vars (not `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Enable phone auth**: Auth → Providers → Phone → toggle on. Pick MSG91 (cheaper for India — ~₹0.20/OTP) or Twilio and add credentials.
4. Link and push:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-ref>
   npx supabase db push                          # runs supabase/migrations/*.sql
   ```
   Seed via Studio → SQL editor (paste `supabase/seed.sql`), then edit society/building/menu names to match your real society.
5. Regenerate types against the cloud schema:
   ```bash
   npx supabase gen types typescript --linked > types/supabase.ts
   ```

### 2.2 UPI assets

1. Pick your UPI ID (e.g., `yourname@upi`). Put it in Vercel env as `NEXT_PUBLIC_UPI_ID`.
2. Generate a QR for that UPI ID (any UPI app → "My QR" → screenshot). Save as `public/upi-qr.png`. Set `NEXT_PUBLIC_UPI_QR_URL=/upi-qr.png`.

### 2.3 Vercel deploy

1. Push `main` to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Add every `.env.local` key as a Vercel env var, except override `NEXT_PUBLIC_APP_URL=https://<project>.vercel.app`.
4. Deploy. First deploy takes ~2 minutes.

### 2.4 Verify end-to-end on production

- Open `https://<project>.vercel.app` → sign up with phone → complete onboarding → browse menu → place a test order with a fake UPI ref → Supabase Studio, flip your profile's `is_admin = true`, reload → admin dashboard shows the test order appear live. Update its status; the resident's order page updates without refresh.

---

## Ongoing work

All features go through `/ticket N` against the GitHub backlog. See [CLAUDE.md](./CLAUDE.md) for the automation loop.
