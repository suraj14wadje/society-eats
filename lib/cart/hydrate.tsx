"use client";

import { useEffect } from "react";
import { useCartStore } from "./store";

// Hydrates the persisted zustand store exactly once on the client.
// Mount this in the root layout or any client page that reads cart state.
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}
