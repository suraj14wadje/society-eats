-- society-eats — v2 design shift
--
-- 1. Cash on Delivery only (ADR-008): drop upi_ref column.
-- 2. Operator surface (ADR-010): add societies.orders_paused,
--    menu_items.stock; expose atomic create_order + advance_order RPCs.
-- 3. Menu-first landing (ADR-009): loosen catalog reads to anon.

set statement_timeout = 0;
set lock_timeout = 0;

-- ============================================================================
-- 1. Drop UPI column — COD is the only payment method now.
-- ============================================================================
alter table public.orders drop column if exists upi_ref;

-- ============================================================================
-- 2a. Kitchen pause state (per-society).
-- ============================================================================
alter table public.societies
  add column if not exists orders_paused boolean not null default false;

-- ============================================================================
-- 2b. Per-item stock. Null = untracked (legacy items); 0 = sold out.
-- ============================================================================
alter table public.menu_items
  add column if not exists stock integer
    check (stock is null or stock >= 0);

-- ============================================================================
-- 3. Loosen catalog reads to anon so the public menu page works without a session.
-- ============================================================================
drop policy if exists "societies: authenticated read" on public.societies;
create policy "societies: public read"
  on public.societies for select
  to anon, authenticated
  using (true);

drop policy if exists "buildings: authenticated read" on public.buildings;
create policy "buildings: public read"
  on public.buildings for select
  to anon, authenticated
  using (true);

drop policy if exists "menu_items: authenticated read" on public.menu_items;
create policy "menu_items: public read"
  on public.menu_items for select
  to anon, authenticated
  using (true);

-- Admins can toggle orders_paused on societies.
create policy "societies: admin update"
  on public.societies for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 4. create_order RPC — atomic stock check + order insert.
--    Raises a structured exception (sold_out:<uuid> | kitchen_paused)
--    that the app surface can map to the /orders/failed screen.
-- ============================================================================
-- security definer: menu_items RLS restricts UPDATE to admins, but residents
-- need their create_order call to decrement stock. The function is the
-- single controlled path for that — auth.uid() still returns the caller and
-- we validate it's non-null below.
create or replace function public.create_order(
  p_items jsonb,
  p_note  text,
  p_slot  public.delivery_slot
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id   uuid;
  v_total      int := 0;
  v_paused     bool;
  v_user       uuid := auth.uid();
  v_item       record;
  v_menu_row   record;
  v_line_price int;
begin
  if v_user is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  -- v1 is single-society, so the first row is authoritative.
  select orders_paused into v_paused from public.societies limit 1;
  if v_paused then
    raise exception 'kitchen_paused' using errcode = 'P0001';
  end if;

  -- Lock each selected menu row, validate availability + stock, decrement.
  for v_item in
    select * from jsonb_to_recordset(p_items) as x(menu_item_id uuid, qty int)
  loop
    if v_item.qty is null or v_item.qty < 1 or v_item.qty > 50 then
      raise exception 'invalid_qty:%', v_item.menu_item_id using errcode = '22023';
    end if;

    select * into v_menu_row
      from public.menu_items
      where id = v_item.menu_item_id
      for update;

    if not found or not v_menu_row.is_available then
      raise exception 'sold_out:%', v_item.menu_item_id using errcode = 'P0002';
    end if;
    if v_menu_row.stock is not null and v_menu_row.stock < v_item.qty then
      raise exception 'sold_out:%', v_item.menu_item_id using errcode = 'P0002';
    end if;

    v_line_price := v_menu_row.price_inr * v_item.qty;
    v_total := v_total + v_line_price;

    if v_menu_row.stock is not null then
      update public.menu_items
        set stock = stock - v_item.qty
        where id = v_menu_row.id;
    end if;
  end loop;

  insert into public.orders (user_id, status, total_inr, delivery_slot, notes)
    values (v_user, 'placed', v_total, p_slot, p_note)
    returning id into v_order_id;

  insert into public.order_items (order_id, menu_item_id, qty, price_inr_at_order)
    select
      v_order_id,
      x.menu_item_id,
      x.qty,
      (select price_inr from public.menu_items where id = x.menu_item_id)
    from jsonb_to_recordset(p_items) as x(menu_item_id uuid, qty int);

  return v_order_id;
end;
$$;

-- ============================================================================
-- 5. advance_order RPC — admin-only state transition for the operator queue.
-- ============================================================================
-- security definer: admins need to UPDATE any order's status. is_admin()
-- is checked first so non-admin callers get rejected before the update.
create or replace function public.advance_order(p_order_id uuid)
returns public.order_status
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.order_status;
  v_next    public.order_status;
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  select status into v_current
    from public.orders
    where id = p_order_id
    for update;

  if not found then
    raise exception 'order_not_found' using errcode = 'P0003';
  end if;

  v_next := case v_current
    when 'placed'           then 'cooking'::public.order_status
    when 'payment_pending'  then 'cooking'::public.order_status
    when 'paid'             then 'cooking'::public.order_status
    when 'cooking'          then 'out_for_delivery'::public.order_status
    when 'out_for_delivery' then 'delivered'::public.order_status
    else v_current
  end;

  update public.orders set status = v_next where id = p_order_id;
  return v_next;
end;
$$;

-- ============================================================================
-- 6. Grants so the RPCs are callable via PostgREST.
-- ============================================================================
grant execute on function public.create_order(jsonb, text, public.delivery_slot)
  to authenticated;
grant execute on function public.advance_order(uuid)
  to authenticated;
