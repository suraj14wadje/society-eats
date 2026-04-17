import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getKitchenStatus } from "@/lib/kitchen/get-status";
import { OrderStatus } from "@/components/screens/resident/order-status";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, total_inr, delivery_slot, user_id, profiles!orders_user_id_fkey(flat_number, buildings(name))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const kitchen = await getKitchenStatus();

  return (
    <OrderStatus
      orderId={order.id}
      initialStatus={order.status}
      profile={{
        building_name: order.profiles?.buildings?.name ?? "Your Tower",
        flat_number: order.profiles?.flat_number ?? "",
      }}
      total={order.total_inr}
      deliveryLabel={kitchen.deliveryLabel}
    />
  );
}
