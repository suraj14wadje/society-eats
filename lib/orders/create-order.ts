"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrderSchema, type CreateOrderInput } from "./schemas";

export type CreateOrderResult =
  | { status: "ok"; orderId: string }
  | { status: "invalid"; issues: string[] }
  | { status: "unauthenticated" }
  | { status: "kitchen_paused" }
  | { status: "sold_out"; menuItemIds: string[] }
  | { status: "error"; message: string };

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "invalid",
      issues: parsed.error.issues.map((i) => i.message),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "unauthenticated" };

  const { data, error } = await supabase.rpc("create_order", {
    p_items: parsed.data.items,
    p_note: parsed.data.note ?? "",
    p_slot: parsed.data.slot,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("kitchen_paused")) return { status: "kitchen_paused" };
    if (msg.includes("sold_out")) {
      const ids = Array.from(msg.matchAll(/sold_out:([0-9a-f-]{36})/g)).map(
        (m) => m[1]!,
      );
      return { status: "sold_out", menuItemIds: ids };
    }
    if (msg.includes("unauthenticated")) return { status: "unauthenticated" };
    return { status: "error", message: msg };
  }

  if (!data) return { status: "error", message: "No order id returned" };

  return { status: "ok", orderId: data };
}
