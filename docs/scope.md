# Scope

Living document. When a feature gets deferred, moved in, or explicitly ruled out, edit this file and commit it in the same PR as the decision.

## In Scope for v1

1. **Menu-first landing** — `/` is a public menu, no login required (ADR-009)
2. **Cart** — Zustand + localStorage client-side persistence
3. **Checkout with auth-at-end** — Name / Mobile / Tower / Flat form then OTP for first-timers; saved-address card for returning residents
4. **Cash on Delivery** (ADR-008) — only payment method in v1
5. **Order confirmation + live status tracker** — 4-stage design tracker, realtime-updating
6. **Past Thalis** — resident order history at `/history`, last 30 days, one-tap reorder
7. **Meera's operator surface** (ADR-010) at `/admin/queue` (live queue) and `/admin/controls` (pause toggle + per-item stock)
8. **Kitchen state** — `societies.orders_paused` + `menu_items.stock` back the real sold-out / closed / past-cutoff edge states
9. **Edge states** for residents — closed kitchen, past lunch cutoff (dinner preview), mostly sold out, OTP wrong, order failed mid-checkout, empty history
10. **Production deploy** on `society-eats.vercel.app`
11. **Initial seed data** (society + buildings + 5 design-aligned menu items) via Supabase migration
12. **Local-first dev loop** — `npx supabase start` + test OTPs (ADR-006); cloud provisioning once, paired with Vercel deploy
13. **Mobile-first responsive layout** — 375–414px phones primary; desktop renders the same layout centered in `max-w-md` (ADR-007)

## Deferred to v1.1 or later

### Payments

- **UPI manual reconciliation** — considered in ADR-002, then reversed by ADR-008 because Meera prefers cash. Could return in v1.1 if residents ask for digital rails.
- **Razorpay / Cashfree integration** — automated UPI confirmation via webhook. Deferred. Trigger to move this in: sustained >10 orders/day or complaints about carrying change.
- **Refund workflow** — admin-initiated refund with status tracking. Deferred; refunds are cash-handed-back in v1.

### Menu & Kitchen Ops

- **Admin menu CRUD UI** — partially in v1: Meera's `/admin/controls` screen toggles availability + stock per item. Adding / removing menu items is still done in Supabase Studio. Full CRUD deferred.
- **Daily menu scheduling** — automated lunch/dinner switching driven by a scheduler table. v1 uses hardcoded IST cutoffs (11:30am lunch, 5:30pm dinner). Deferred.
- **Inventory with history** — `menu_items.stock` tracks today's count (ADR-010) but we don't store a per-day audit of stock changes. Deferred.
- **Item variants / add-ons / quantity-based pricing** — deferred. v1 is one price per item.

### Notifications

- **SMS order confirmations** — residents learn order status by refreshing the app. Deferred; revisit if residents complain.
- **WhatsApp broadcast integration** — deferred.
- **Push notifications (web push)** — deferred.
- **Admin push notification for new orders** — deferred; admin keeps the dashboard tab open, Realtime pushes updates.

### Residents

- **Address book (multiple delivery addresses)** — one flat per account in v1. The Hi-Fi design showed two saved addresses; that's v1.1.
- **One-tap reorder** — shipped in v1 via `/history`.
- **Ratings / reviews** — deferred. `HistoryScreen` has space for stars but the button is disabled in v1.
- **Referral / invite flow** — deferred.

### Ops & Growth

- **Multi-society support** — explicitly out of v1. Architecture assumes one society. Reworking to multi-tenant is a v2 decision.
- **Multi-kitchen support** — out of v1.
- **Custom domain** — out of v1. `*.vercel.app` is fine.
- **Email** — out of v1 (no transactional email, no marketing).
- **Analytics beyond Vercel Analytics** — deferred.

### Promos / Pricing

- **Promo codes / discount codes** — deferred.
- **Loyalty points** — deferred.
- **Dynamic pricing / surge** — deferred (and probably never).
- **GST invoices** — deferred; household-scale kitchen, not GST-registered in v1.

### Compliance

- **SOC 2** — explicitly out of scope. Not applicable at this scale.
- **Formal audit trail table** — deferred. Basic structured logging in Route Handlers is enough for v1.
- **Data export / "delete my account"** — deferred. Handle manually on request until volume warrants automation.

### Internationalization

- **Languages other than English** — deferred. Marathi / Hindi labels could come in v1.1 if residents ask.
- **Currencies other than INR** — never. This is India-only by design.

## Explicitly Ruled Out (not "deferred", not coming)

- International expansion
- Becoming a marketplace for multiple kitchens
- A native mobile app (web app is the product)
- Desktop-specific multi-column layouts / tablet-optimized views — one mobile-first layout, centered on wider screens (ADR-007)
