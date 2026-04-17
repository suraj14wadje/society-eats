"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal } from "@/lib/cart/store";
import { AddressCard } from "@/components/screens/resident/address-card";
import { PACKING_FEE_INR, type MenuItem } from "@/lib/cart/types";
import { useEffect } from "react";

export function CheckoutBridge({
  menu,
  kitchenPaused,
  slot,
  profile,
}: {
  menu: MenuItem[];
  kitchenPaused: boolean;
  slot: "today_lunch" | "today_dinner" | "tomorrow_lunch" | "tomorrow_dinner";
  profile: {
    full_name: string;
    phone: string;
    building_name: string;
    flat_number: string;
  };
}) {
  const router = useRouter();
  const cart = useCartStore((s) => s.items);

  const items = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([menu_item_id, qty]) => ({ menu_item_id, qty })),
    [cart],
  );

  const subtotal = cartSubtotal(cart, menu);
  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = subtotal + (count > 0 ? PACKING_FEE_INR : 0);

  useEffect(() => {
    if (items.length === 0) router.replace("/");
  }, [items.length, router]);

  if (items.length === 0) return null;
  if (kitchenPaused) {
    // kitchen flipped paused between /cart and /checkout — bounce back
    router.replace("/");
    return null;
  }

  return (
    <AddressCard profile={profile} total={total} items={items} slot={slot} />
  );
}
