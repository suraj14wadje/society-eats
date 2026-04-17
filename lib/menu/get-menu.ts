import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MenuItem } from "@/lib/cart/types";
import { toArtKey } from "./art-map";

export async function getMenu(): Promise<MenuItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, description, price_inr, is_available, stock, image_url")
    .order("is_available", { ascending: false })
    .order("price_inr", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price_inr: row.price_inr,
    is_available: row.is_available,
    stock: row.stock,
    art: toArtKey(row.image_url, row.name),
  }));
}
