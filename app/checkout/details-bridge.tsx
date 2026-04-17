"use client";

import { useMemo } from "react";
import { useCartStore, cartSubtotal } from "@/lib/cart/store";
import { DetailsForm } from "@/components/screens/resident/details-form";
import { PACKING_FEE_INR } from "@/lib/cart/types";

export function DetailsBridge({
  towers,
  menu,
}: {
  towers: Array<{ id: string; name: string }>;
  menu: Array<{ id: string; price_inr: number }>;
}) {
  const cart = useCartStore((s) => s.items);
  const subtotal = cartSubtotal(cart, menu);
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  const total = useMemo(
    () => subtotal + (count > 0 ? PACKING_FEE_INR : 0),
    [subtotal, count],
  );

  return <DetailsForm towers={towers} total={total} />;
}
