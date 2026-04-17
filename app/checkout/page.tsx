import {
  currentDeliverySlot,
  getKitchenStatus,
} from "@/lib/kitchen/get-status";
import { getMenu } from "@/lib/menu/get-menu";
import { createClient } from "@/lib/supabase/server";
import { CartHydrator } from "@/lib/cart/hydrate";
import { CheckoutBridge } from "./bridge";
import { DetailsBridge } from "./details-bridge";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    menu,
    kitchen,
    { data: towersData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getMenu(),
    getKitchenStatus(),
    supabase.from("buildings").select("id, name").order("name"),
  ]);

  const towers = (towersData ?? []).map((b) => ({ id: b.id, name: b.name }));

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, flat_number, buildings(name)")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      return (
        <>
          <CartHydrator />
          <CheckoutBridge
            menu={menu}
            kitchenPaused={kitchen.paused}
            slot={currentDeliverySlot()}
            profile={{
              full_name: profile.full_name,
              phone: profile.phone,
              flat_number: profile.flat_number,
              building_name: profile.buildings?.name ?? "Your Tower",
            }}
          />
        </>
      );
    }
  }

  return (
    <>
      <CartHydrator />
      <DetailsBridge towers={towers} menu={menu} />
    </>
  );
}
