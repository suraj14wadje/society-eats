-- Development seed data.
--
-- Society + building data matches the real cloud project (Gokhale Mist, code
-- "1234", two towers named Air and Aqua). Menu items remain design-aligned
-- placeholders — swap for Meera's real menu when the photography ships.
--
-- This seed intentionally does NOT create an auth user or admin profile —
-- those come from real phone-OTP signup (see SETUP.md for promoting the
-- first admin).

insert into public.societies (id, name, code)
values (
  '00000000-0000-0000-0000-000000000001',
  'Gokhale Mist',
  '1234'
)
on conflict (code) do nothing;

insert into public.buildings (society_id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Air'),
  ('00000000-0000-0000-0000-000000000001', 'Aqua')
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
