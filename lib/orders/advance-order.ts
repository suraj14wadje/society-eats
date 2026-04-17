"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdvanceResult =
  | { status: "ok"; nextStatus: string }
  | { status: "admin_only" }
  | { status: "not_found" }
  | { status: "error"; message: string };

export async function advanceOrder(orderId: string): Promise<AdvanceResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("advance_order", {
    p_order_id: orderId,
  });
  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("admin_only")) return { status: "admin_only" };
    if (msg.includes("order_not_found")) return { status: "not_found" };
    return { status: "error", message: msg };
  }
  revalidatePath("/admin/queue");
  revalidatePath(`/orders/${orderId}`);
  return { status: "ok", nextStatus: data ?? "" };
}

export async function toggleKitchenPaused(
  paused: boolean,
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { data: society, error: fetchError } = await supabase
    .from("societies")
    .select("id")
    .limit(1)
    .single();
  if (fetchError || !society)
    return { status: "error", message: fetchError?.message ?? "no society" };
  const { error } = await supabase
    .from("societies")
    .update({ orders_paused: paused })
    .eq("id", society.id);
  if (error) return { status: "error", message: error.message };
  revalidatePath("/");
  revalidatePath("/admin");
  return { status: "ok" };
}

export async function updateMenuItem(
  id: string,
  patch: { is_available?: boolean; stock?: number | null },
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("menu_items")
    .update(patch)
    .eq("id", id);
  if (error) return { status: "error", message: error.message };
  revalidatePath("/");
  revalidatePath("/admin/controls");
  return { status: "ok" };
}
