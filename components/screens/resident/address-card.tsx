"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { StickyBar } from "@/components/brand/sticky-bar";
import { useCartStore } from "@/lib/cart/store";
import { createOrder } from "@/lib/orders/create-order";
import { toast } from "sonner";

export function AddressCard({
  profile,
  total,
  items,
  slot,
}: {
  profile: {
    full_name: string;
    building_name: string;
    flat_number: string;
    phone: string;
  };
  total: number;
  items: Array<{ menu_item_id: string; qty: number }>;
  slot: "today_lunch" | "today_dinner" | "tomorrow_lunch" | "tomorrow_dinner";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<"home">("home");
  const clearCart = useCartStore((s) => s.clear);
  const note = useCartStore((s) => s.note);

  const handlePlace = () => {
    startTransition(async () => {
      const result = await createOrder({ items, note, slot });
      if (result.status === "ok") {
        clearCart();
        router.push(`/orders/${result.orderId}?fresh=1`);
      } else if (result.status === "kitchen_paused") {
        toast.error("Kitchen just paused — try again shortly.");
      } else if (result.status === "sold_out") {
        router.push(`/orders/failed?items=${result.menuItemIds.join(",")}`);
      } else if (result.status === "unauthenticated") {
        router.push("/checkout");
      } else {
        toast.error(
          result.status === "invalid"
            ? (result.issues[0] ?? "Invalid order")
            : result.message,
        );
      }
    });
  };

  return (
    <>
      <TopBar backHref="/cart" title="Deliver To" />
      <div style={{ padding: "14px 20px 120px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a8674",
            fontWeight: 500,
            marginBottom: 10,
          }}
        >
          Saved Address
        </div>

        <div
          onClick={() => setSelected("home")}
          style={{
            padding: 14,
            borderRadius: 14,
            background: "#fbf8ef",
            border:
              selected === "home"
                ? "2px solid #2a2822"
                : "1.5px dashed #c4b68f",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 16,
              height: 16,
              borderRadius: "50%",
              border:
                "1.5px solid " + (selected === "home" ? "#2a2822" : "#c4b68f"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selected === "home" && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#2a2822",
                }}
              />
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#1d1c17",
              marginBottom: 4,
            }}
          >
            {profile.full_name} · Home
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#5f5c4d",
              lineHeight: 1.45,
              whiteSpace: "pre-line",
            }}
          >
            {profile.building_name} · Flat {profile.flat_number}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#8a8674",
              marginTop: 8,
              display: "flex",
              gap: 10,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>{maskPhone(profile.phone)}</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a8674",
            fontWeight: 500,
            margin: "22px 0 10px",
          }}
        >
          Payment
        </div>
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "#f7f2e3",
            border: "1px solid var(--se-line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1c17" }}>
              Cash On Delivery
            </div>
            <div style={{ fontSize: 11, color: "#8a8674", marginTop: 2 }}>
              Pay Meera At The Door · ₹{total}
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#8a8674",
              letterSpacing: "0.08em",
            }}
          >
            ONLY OPTION
          </div>
        </div>
      </div>

      <StickyBar
        label={isPending ? "Placing Order…" : "Place Order"}
        total={total}
        cta={isPending ? "Please wait" : "Confirm"}
        onClick={handlePlace}
        disabled={isPending}
      />
    </>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;
  const last10 = digits.slice(-10);
  return `+91 ${last10.slice(0, 2)}••• •${last10.slice(-3)}`;
}
