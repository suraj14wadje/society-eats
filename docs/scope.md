# Scope

Living document. When a feature gets deferred, moved in, or explicitly ruled out, edit this file and commit it in the same PR as the decision.

## In Scope for v1

1. Phone OTP auth via Supabase
2. Profile onboarding — Society (fixed, seeded), Building (dropdown from seeded list), Flat Number (freetext), Full Name
3. Menu list page — residents see today's available items
4. Menu item detail page
5. Client-side cart with persistence (localStorage or zustand + persist)
6. Checkout — slot picker, UPI QR + ID display, UPI reference number capture, order create
7. Order history for residents (own orders)
8. Live order status page for a single order
9. Admin dashboard — list + filter orders, update status, uses Supabase Realtime
10. Production deploy on `society-eats.vercel.app`
11. Initial seed data (society + buildings + 5 menu items) via a Supabase migration

## Deferred to v1.1 or later

### Payments

- **Razorpay / Cashfree integration** — automated UPI confirmation via webhook. Deferred; ADR-002 explains the trade-off. Trigger to move this in: sustained >10 orders/day or disputes about unverified payments.
- **Refund workflow** — admin-initiated refund with status tracking. Deferred; refunds are manual over UPI in v1.
- **Cash on delivery** — considered and dropped. UPI manual reconciliation covers the same need with less operational risk.

### Menu & Kitchen Ops

- **Admin menu CRUD UI** — in v1 the owner edits menu items directly in Supabase Studio. A proper admin CRUD surface is deferred until the menu changes more than twice a week.
- **Daily menu scheduling** — availability windows per item, auto-disable after slot ends. Deferred; the `is_available` boolean is flipped manually.
- **Inventory tracking** — out-of-stock count, auto-disable when depleted. Deferred.
- **Item variants / add-ons / quantity-based pricing** — deferred. v1 is one price per item.

### Notifications

- **SMS order confirmations** — residents learn order status by refreshing the app. Deferred; revisit if residents complain.
- **WhatsApp broadcast integration** — deferred.
- **Push notifications (web push)** — deferred.
- **Admin push notification for new orders** — deferred; admin keeps the dashboard tab open, Realtime pushes updates.

### Residents

- **Address book (multiple delivery addresses)** — one flat per account in v1.
- **Favorites / reorder** — deferred.
- **Ratings / reviews** — deferred.
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
