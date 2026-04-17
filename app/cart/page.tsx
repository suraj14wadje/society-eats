import { getMenu } from "@/lib/menu/get-menu";
import { getKitchenStatus } from "@/lib/kitchen/get-status";
import { CartView } from "@/components/screens/resident/cart-view";
import { CartHydrator } from "@/lib/cart/hydrate";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [items, kitchen] = await Promise.all([getMenu(), getKitchenStatus()]);
  return (
    <>
      <CartHydrator />
      <CartView
        items={items}
        kitchenPaused={kitchen.paused}
        cutoffLabel={kitchen.cutoffLabel}
      />
    </>
  );
}
