-- Development seed data.
--
-- TODO(before go-live): replace the placeholder society name/code, building
-- names, and menu items below with the real society's data. Tracked as a
-- follow-on ticket filed from #1; safe to leave as-is for all local dev.
--
-- This seed intentionally does NOT create an auth user or admin profile —
-- those come from real phone-OTP signup (see SETUP.md for promoting the
-- first admin).

insert into public.societies (id, name, code)
values (
  '00000000-0000-0000-0000-000000000001',
  'Greenpark Residences',
  'greenpark'
)
on conflict (code) do nothing;

insert into public.buildings (society_id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Tower A'),
  ('00000000-0000-0000-0000-000000000001', 'Tower B'),
  ('00000000-0000-0000-0000-000000000001', 'Tower C'),
  ('00000000-0000-0000-0000-000000000001', 'Tower D')
on conflict (society_id, name) do nothing;

-- image_url holds the FoodArt key (paneer, dalChawal, rotiSabzi, khichdi,
-- rajma) until real photography lands. See lib/menu/art-map.ts.
insert into public.menu_items (name, description, price_inr, image_url, stock, is_available) values
  ('Paneer Butter Masala Thali', '2 Katoris · Jeera Rice · 3 Phulka · Salad', 180, 'paneer', 8, true),
  ('Dal Chawal Thali', 'Ghee Dal · Basmati Rice · Papad · Pickle', 160, 'dalChawal', 12, true),
  ('Roti Sabzi Thali', '4 Phulka · Seasonal Sabzi · Dal · Raita', 140, 'rotiSabzi', 6, true),
  ('Moong Khichdi', 'Light, Homestyle · Served With Ghee & Papad', 120, 'khichdi', 0, false),
  ('Rajma Chawal', 'Punjabi-Style · Rice · Onion Salad', 150, 'rajma', 10, true)
on conflict do nothing;
