import type { FoodArtKey } from "@/components/brand/food-art";

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_inr: number;
  is_available: boolean;
  stock: number | null;
  art: FoodArtKey;
};

export type CartItems = Record<string, number>;

export type CartLine = MenuItem & { qty: number };

export const DELIVERY_FEE_INR = 0;
export const PACKING_FEE_INR = 20;
