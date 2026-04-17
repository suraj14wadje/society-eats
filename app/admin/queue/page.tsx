import { createClient } from "@/lib/supabase/server";
import {
  QueueList,
  type QueueOrder,
} from "@/components/screens/admin/queue-list";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("orders")
    .select(
      "id, status, total_inr, created_at, notes, profiles!orders_user_id_fkey(full_name, flat_number, buildings(name)), order_items(qty, menu_items(name))",
    )
    .gte("created_at", startOfDay.toISOString())
    .order("created_at", { ascending: false });

  const orders: QueueOrder[] = (data ?? []).map((o) => ({
    id: o.id,
    status: o.status,
    total_inr: o.total_inr,
    created_at: o.created_at,
    note: o.notes,
    customer: o.profiles?.full_name ?? "Resident",
    address: `${o.profiles?.buildings?.name ?? "Tower"} · ${o.profiles?.flat_number ?? "-"}`,
    line_items: (o.order_items ?? [])
      .map((li) => `${li.menu_items?.name ?? "Item"} × ${li.qty}`)
      .join(", "),
  }));

  return <QueueList initialOrders={orders} />;
}
