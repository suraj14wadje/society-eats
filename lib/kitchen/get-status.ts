import "server-only";
import { createClient } from "@/lib/supabase/server";

export type KitchenStatus = {
  paused: boolean;
  window: "open" | "past_cutoff";
  cutoffLabel: string;
  deliveryLabel: string;
};

// Hardcoded daily service windows. IST (UTC+5:30). Until we ship a proper
// scheduler table, the resident + operator apps agree on these times.
const SERVICE = {
  lunch: { cutoffHourIst: 11.5, windowLabel: "1:00 – 1:30pm" },
  dinner: { cutoffHourIst: 17.5, windowLabel: "8:00 – 8:30pm" },
};

export async function getKitchenStatus(): Promise<KitchenStatus> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("societies")
    .select("orders_paused")
    .limit(1)
    .maybeSingle();

  const paused = data?.orders_paused ?? false;
  const nowIst = getCurrentIstHour();

  // After the dinner cutoff AND before midnight → past_cutoff for the day.
  // Between lunch cutoff and before dinner service window prep → past_cutoff.
  // (Lunch orders close at 11:30, dinner opens at 15:00 in the design.)
  let window: KitchenStatus["window"] = "open";
  let cutoffLabel = "Lunch Cutoff 11:30am";
  let deliveryLabel = SERVICE.lunch.windowLabel;

  if (nowIst >= SERVICE.lunch.cutoffHourIst && nowIst < 15) {
    window = "past_cutoff";
    cutoffLabel = "Lunch Cutoff Passed · Dinner Opens 3:00pm";
    deliveryLabel = SERVICE.dinner.windowLabel;
  } else if (nowIst >= 15 && nowIst < SERVICE.dinner.cutoffHourIst) {
    cutoffLabel = "Dinner Cutoff 5:30pm";
    deliveryLabel = SERVICE.dinner.windowLabel;
  } else if (nowIst >= SERVICE.dinner.cutoffHourIst) {
    window = "past_cutoff";
    cutoffLabel = "Today's Kitchen Is Closed";
    deliveryLabel = SERVICE.lunch.windowLabel;
  }

  return { paused, window, cutoffLabel, deliveryLabel };
}

function getCurrentIstHour(): number {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + 330) % (24 * 60);
  return istMinutes / 60;
}

export function currentDeliverySlot(): "today_lunch" | "today_dinner" {
  const h = getCurrentIstHour();
  return h < SERVICE.lunch.cutoffHourIst ? "today_lunch" : "today_dinner";
}
