"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { StickyBar } from "@/components/brand/sticky-bar";
import { FoodImage } from "@/components/brand/food-image";
import { VegMark } from "@/components/brand/veg-mark";
import { QtyStepper } from "@/components/brand/qty-stepper";
import { useCartStore, cartSubtotal } from "@/lib/cart/store";
import {
  DELIVERY_FEE_INR,
  PACKING_FEE_INR,
  type MenuItem,
} from "@/lib/cart/types";

export function CartView({
  items,
  kitchenPaused,
  cutoffLabel,
}: {
  items: MenuItem[];
  kitchenPaused: boolean;
  cutoffLabel: string;
}) {
  const router = useRouter();
  const cart = useCartStore((s) => s.items);
  const note = useCartStore((s) => s.note);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const setNote = useCartStore((s) => s.setNote);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => {
          const menu = items.find((m) => m.id === id);
          return menu ? { ...menu, qty: q } : null;
        })
        .filter((l): l is MenuItem & { qty: number } => l !== null),
    [cart, items],
  );

  const subtotal = cartSubtotal(cart, items);
  const packing = lines.length ? PACKING_FEE_INR : 0;
  const total = subtotal + packing + DELIVERY_FEE_INR;

  useEffect(() => {
    if (lines.length === 0) router.replace("/");
  }, [lines.length, router]);

  if (lines.length === 0) return null;

  return (
    <>
      <TopBar backHref="/" title="Your Thali" />
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
          {lines.length} Item{lines.length !== 1 ? "s" : ""} · {cutoffLabel}
        </div>

        {lines.map((l, i) => (
          <div
            key={l.id}
            style={{
              display: "flex",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i === lines.length - 1 ? "none" : "1px dashed #c4b68f",
              alignItems: "center",
            }}
          >
            <FoodImage art={l.art} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <VegMark size={10} />
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#1d1c17" }}
                >
                  {l.name}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#8a8674" }}>
                ₹{l.price_inr} each
              </div>
            </div>
            <QtyStepper
              qty={l.qty}
              onAdd={() => add(l.id)}
              onRemove={() => remove(l.id)}
              compact
            />
          </div>
        ))}

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8a8674",
              fontWeight: 500,
              marginBottom: 6,
            }}
          >
            Note For The Kitchen
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder="Less Spice, Extra Roti…"
            style={{
              width: "100%",
              minHeight: 64,
              padding: 12,
              background: "#fbf8ef",
              border: "1.5px solid #c4b68f",
              borderRadius: 12,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "#1d1c17",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "#f7f2e3",
            border: "1px dashed #c4b68f",
            borderRadius: 14,
          }}
        >
          <BillRow label="Subtotal" value={`₹${subtotal}`} />
          <BillRow label="Delivery" value="Free" />
          <BillRow label="Packing" value={`₹${packing}`} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              paddingTop: 8,
              borderTop: "1px solid #c4b68f",
              fontSize: 14,
              fontWeight: 600,
              color: "#1d1c17",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <StickyBar
        label={kitchenPaused ? "Kitchen Paused" : "Cash On Delivery"}
        total={total}
        cta={kitchenPaused ? "Closed" : "Checkout"}
        disabled={kitchenPaused}
        onClick={() => router.push("/checkout")}
      />
    </>
  );
}

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#5f5c4d",
        padding: "3px 0",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
