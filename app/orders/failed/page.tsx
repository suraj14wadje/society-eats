import { createClient } from "@/lib/supabase/server";
import { OrderFailed } from "@/components/screens/resident/order-failed";

export const dynamic = "force-dynamic";

export default async function OrderFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items } = await searchParams;
  const ids = items ? items.split(",").filter(Boolean) : [];

  let names: string[] = [];
  if (ids.length) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("menu_items")
      .select("name")
      .in("id", ids);
    names = (data ?? []).map((r) => r.name);
  }

  return <OrderFailed soldOutNames={names} />;
}
