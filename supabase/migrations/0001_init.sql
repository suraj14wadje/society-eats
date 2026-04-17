-- society-eats initial schema
-- Creates societies, buildings, profiles, menu_items, orders, order_items
-- with Row Level Security enforced from day one.

set statement_timeout = 0;
set lock_timeout = 0;

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- Helper: is_admin() — used by RLS policies
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ============================================================================
-- societies (seeded with exactly one row for v1)
-- ============================================================================
create table public.societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);
alter table public.societies enable row level security;

create policy "societies: authenticated read"
  on public.societies for select
  to authenticated
  using (true);

-- ============================================================================
-- buildings (seeded per society)
-- ============================================================================
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  society_id uuid not null references public.societies(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  unique (society_id, name)
);
alter table public.buildings enable row level security;

create policy "buildings: authenticated read"
  on public.buildings for select
  to authenticated
  using (true);

-- ============================================================================
-- profiles (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  society_id uuid not null references public.societies(id) on delete restrict,
  building_id uuid not null references public.buildings(id) on delete restrict,
  flat_number text not null check (length(flat_number) between 1 and 16),
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles: self read"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles: self insert"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: self update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select is_admin from public.profiles where id = auth.uid()));

-- Admin can update is_admin on any profile (covers promoting a second admin later)
create policy "profiles: admin update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- menu_items (everyone signed in can read; admin writes)
-- ============================================================================
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  description text check (length(description) <= 500),
  price_inr integer not null check (price_inr >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.menu_items enable row level security;

create policy "menu_items: authenticated read"
  on public.menu_items for select
  to authenticated
  using (true);

create policy "menu_items: admin write"
  on public.menu_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- orders
-- ============================================================================
create type public.order_status as enum (
  'placed',
  'payment_pending',
  'paid',
  'cooking',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.delivery_slot as enum (
  'today_lunch',
  'today_dinner',
  'tomorrow_lunch',
  'tomorrow_dinner'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'placed',
  total_inr integer not null check (total_inr >= 0),
  delivery_slot public.delivery_slot not null,
  upi_ref text check (length(upi_ref) <= 64),
  notes text check (length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create policy "orders: self read"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: self insert"
  on public.orders for insert
  to authenticated
  with check (user_id = auth.uid());

-- Residents can update their own pending orders to add a UPI ref or cancel.
-- Admins can update any order.
create policy "orders: self update pending"
  on public.orders for update
  to authenticated
  using (user_id = auth.uid() and status in ('placed', 'payment_pending'))
  with check (user_id = auth.uid() and status in ('placed', 'payment_pending', 'cancelled'));

create policy "orders: admin update any"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- order_items
-- ============================================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  qty integer not null check (qty > 0 and qty <= 50),
  price_inr_at_order integer not null check (price_inr_at_order >= 0)
);
alter table public.order_items enable row level security;

create policy "order_items: read via parent order"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_items: insert via parent order"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger menu_items_touch_updated_at
  before update on public.menu_items
  for each row execute function public.touch_updated_at();

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Realtime — publish orders for admin dashboard live updates
-- ============================================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
