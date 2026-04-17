import { getMenu } from "@/lib/menu/get-menu";
import { getKitchenStatus } from "@/lib/kitchen/get-status";
import { MenuList } from "@/components/screens/resident/menu-list";
import { ClosedKitchen } from "@/components/screens/resident/closed-kitchen";
import { PastCutoff } from "@/components/screens/resident/past-cutoff";
import { CartHydrator } from "@/lib/cart/hydrate";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [items, kitchen] = await Promise.all([getMenu(), getKitchenStatus()]);

  if (kitchen.paused) {
    return <ClosedKitchen />;
  }

  if (kitchen.window === "past_cutoff") {
    return (
      <PastCutoff
        items={items}
        cutoffLabel={kitchen.cutoffLabel}
        deliveryLabel={kitchen.deliveryLabel}
      />
    );
  }

  return (
    <>
      <CartHydrator />
      <MenuList items={items} />
    </>
  );
}
