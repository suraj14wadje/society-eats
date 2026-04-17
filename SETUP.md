# society-eats — First-time setup

This file covers the manual one-time steps that Claude can't do for you (external accounts, keys, deploys). Once done, all subsequent work goes through `/ticket` against GitHub issues.

## 1. Supabase project

1. Create a new project at [supabase.com](https://supabase.com) in the **Mumbai** region. Free tier is fine.
2. Copy these from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Enable phone auth**:
   - Auth → Providers → Phone → toggle on
   - Pick an SMS provider (MSG91 or Twilio) and add credentials. MSG91 is cheaper for India — expect ₹0.20 per OTP.
4. **Install the Supabase CLI** locally and link the project:
   ```bash
   npm install -g supabase
   npx supabase login
   npx supabase link --project-ref <your-ref>
   ```
5. **Apply migrations + seed**:
   ```bash
   npx supabase db push                        # runs supabase/migrations/*.sql
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql  # seeds society + buildings + menu
   ```
   (Or paste the contents of `supabase/seed.sql` into the Supabase Studio SQL editor.)
6. **Generate TypeScript types**:
   ```bash
   npx supabase gen types typescript --linked > types/supabase.ts
   ```
7. **Edit the seed** — open `supabase/seed.sql`, change "Your Society Name" / "your-society" / the building names and menu items to match your real society and menu, then apply.

## 2. Promote yourself to admin

After you sign in for the first time via phone OTP and complete onboarding:

1. Supabase Studio → SQL editor → run:
   ```sql
   update profiles set is_admin = true where phone = '+91XXXXXXXXXX';
   ```
2. Verify:
   ```sql
   select full_name, phone, is_admin from profiles;
   ```

## 3. UPI assets

1. Pick your UPI ID (e.g., `yourname@upi`). Put it in `.env.local` under `NEXT_PUBLIC_UPI_ID`.
2. Generate a QR code for that UPI ID (any UPI app → "My QR" → screenshot) and save as `public/upi-qr.png`. Set `NEXT_PUBLIC_UPI_QR_URL=/upi-qr.png`.

## 4. Vercel deploy

1. Push `main` to GitHub (Claude will have done this during scaffold).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add env vars in the Vercel project: copy every line from `.env.local` except `NEXT_PUBLIC_APP_URL` (set that to `https://<project-name>.vercel.app`).
4. Deploy. First deploy takes ~2 minutes.

## 5. Verify end-to-end

- Open `https://<project>.vercel.app` → sign up with phone → complete onboarding → browse menu → place a test order with a fake UPI ref → log in to Supabase Studio, flip your profile's `is_admin = true`, reload the app, check the admin dashboard.
- You should see the test order appear live. Update its status; the resident's order page should reflect it without refresh.

## Ongoing work

All features from here go through `/ticket N` against the GitHub backlog. See [CLAUDE.md](./CLAUDE.md) for the automation loop.
