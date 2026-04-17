-- Development seed data. Overwrite the society/building names before running
-- against your real project.
--
-- This seed intentionally does NOT create an auth user or admin profile —
-- those come from real phone-OTP signup (see SETUP.md for promoting the
-- first admin).

insert into public.societies (id, name, code)
values (
  '00000000-0000-0000-0000-000000000001',
  'Your Society Name',
  'your-society'
)
on conflict (code) do nothing;

insert into public.buildings (society_id, name) values
  ('00000000-0000-0000-0000-000000000001', 'A Wing'),
  ('00000000-0000-0000-0000-000000000001', 'B Wing'),
  ('00000000-0000-0000-0000-000000000001', 'C Wing')
on conflict (society_id, name) do nothing;

insert into public.menu_items (name, description, price_inr, is_available) values
  ('Dal Khichdi', 'Moong dal + rice, ghee, side of pickle & papad.', 180, true),
  ('Paneer Butter Masala + 2 Rotis', 'House paneer, tomato-butter gravy, fresh rotis.', 260, true),
  ('Jeera Rice + Rajma', 'Classic North Indian comfort combo.', 220, true),
  ('Veg Biryani', 'Basmati, mixed veg, raita.', 240, true),
  ('Masala Dosa', 'Crisp dosa, aloo masala, chutney, sambar.', 160, true)
on conflict do nothing;
