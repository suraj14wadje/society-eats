import { createClient } from "@/lib/supabase/server";
import {
  ControlsPanel,
  type ControlsMenuItem,
} from "@/components/screens/admin/controls-panel";
import { toArtKey } from "@/lib/menu/art-map";

export const dynamic = "force-dynamic";

export default async function AdminControlsPage() {
  const supabase = await createClient();
  const [{ data: society }, { data: menu }] = await Promise.all([
    supabase.from("societies").select("orders_paused").limit(1).maybeSingle(),
    supabase
      .from("menu_items")
      .select("id, name, price_inr, is_available, stock, image_url")
      .order("price_inr", { ascending: false }),
  ]);

  const items: ControlsMenuItem[] = (menu ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    price_inr: m.price_inr,
    is_available: m.is_available,
    stock: m.stock,
    art: toArtKey(m.image_url, m.name),
  }));

  return (
    <ControlsPanel
      initialPaused={society?.orders_paused ?? false}
      initialItems={items}
    />
  );
}
