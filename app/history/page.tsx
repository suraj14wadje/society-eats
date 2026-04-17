import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  HistoryList,
  type HistoryOrder,
} from "@/components/screens/resident/history-list";
import { toArtKey } from "@/lib/menu/art-map";

export const dynamic = "force-dynamic";

function thirtyDaysAgoIso(): string {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const thirtyDaysAgo = thirtyDaysAgoIso();

  const { data } = await supabase
    .from("orders")
    .select(
      "id, created_at, updated_at, total_inr, status, order_items(menu_item_id, qty, menu_items(name, image_url))",
    )
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  const orders: HistoryOrder[] = (data ?? []).map((o) => ({
    id: o.id,
    label: new Date(o.created_at).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    delivered_at: o.status === "delivered" ? o.updated_at : null,
    total_inr: o.total_inr,
    items: (o.order_items ?? []).map((it) => ({
      menu_item_id: it.menu_item_id,
      name: it.menu_items?.name ?? "Thali",
      qty: it.qty,
      art: toArtKey(
        it.menu_items?.image_url ?? null,
        it.menu_items?.name ?? null,
      ),
    })),
  }));

  return <HistoryList orders={orders} />;
}
