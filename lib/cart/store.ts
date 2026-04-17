"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItems } from "./types";

type CartState = {
  items: CartItems;
  note: string;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setNote: (note: string) => void;
  clear: () => void;
  reorder: (items: CartItems) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      note: "",
      add: (id) =>
        set((s) => ({
          items: { ...s.items, [id]: (s.items[id] ?? 0) + 1 },
        })),
      remove: (id) =>
        set((s) => {
          const next = { ...s.items };
          const n = (next[id] ?? 0) - 1;
          if (n <= 0) delete next[id];
          else next[id] = n;
          return { items: next };
        }),
      setQty: (id, qty) =>
        set((s) => {
          const next = { ...s.items };
          if (qty <= 0) delete next[id];
          else next[id] = qty;
          return { items: next };
        }),
      setNote: (note) => set(() => ({ note })),
      clear: () => set(() => ({ items: {}, note: "" })),
      reorder: (items) => set(() => ({ items: { ...items }, note: "" })),
    }),
    {
      name: "se-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

// Selector helpers used by multiple screens.
export const cartCount = (items: CartItems): number =>
  Object.values(items).reduce((s, n) => s + n, 0);

export const cartSubtotal = (
  items: CartItems,
  menu: Array<{ id: string; price_inr: number }>,
): number => {
  const priceById = new Map(menu.map((m) => [m.id, m.price_inr]));
  return Object.entries(items).reduce(
    (sum, [id, qty]) => sum + (priceById.get(id) ?? 0) * qty,
    0,
  );
};
