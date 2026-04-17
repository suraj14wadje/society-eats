"use client";

import { useState, useTransition } from "react";
import { TopBar } from "@/components/brand/top-bar";
import { Toggle } from "@/components/brand/toggle";
import { StockStepper } from "@/components/brand/stock-stepper";
import { FoodImage } from "@/components/brand/food-image";
import {
  toggleKitchenPaused,
  updateMenuItem,
} from "@/lib/orders/advance-order";
import { toast } from "sonner";
import type { FoodArtKey } from "@/components/brand/food-art";

export type ControlsMenuItem = {
  id: string;
  name: string;
  price_inr: number;
  is_available: boolean;
  stock: number | null;
  art: FoodArtKey;
};

export function ControlsPanel({
  initialPaused,
  initialItems,
}: {
  initialPaused: boolean;
  initialItems: ControlsMenuItem[];
}) {
  const [paused, setPaused] = useState(initialPaused);
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();

  const togglePaused = (next: boolean) => {
    setPaused(next);
    startTransition(async () => {
      const result = await toggleKitchenPaused(next);
      if (result.status !== "ok") {
        toast.error(result.message);
        setPaused(!next);
      }
    });
  };

  const toggleAvailable = (id: string, next: boolean) => {
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_available: next } : m)),
    );
    startTransition(async () => {
      const result = await updateMenuItem(id, { is_available: next });
      if (result.status !== "ok") toast.error(result.message);
    });
  };

  const changeStock = (id: string, next: number) => {
    const bounded = Math.max(0, next);
    setItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stock: bounded } : m)),
    );
    startTransition(async () => {
      const result = await updateMenuItem(id, { stock: bounded });
      if (result.status !== "ok") toast.error(result.message);
    });
  };

  return (
    <>
      <TopBar backHref="/admin/queue" title="Kitchen Controls" />
      <div style={{ padding: "16px 20px 40px" }}>
        <div
          style={{
            padding: 16,
            background: paused ? "#fdf2ec" : "#dfecd6",
            border: "1px solid " + (paused ? "#f2b896" : "#b9d4aa"),
            borderRadius: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  color: paused ? "#924021" : "#467132",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {paused ? "Kitchen Paused" : "Accepting Orders"}
              </div>
              <div style={{ fontSize: 13, color: "#1d1c17", fontWeight: 500 }}>
                {paused
                  ? "Residents Can Browse But Not Order."
                  : "New Orders Flowing In."}
              </div>
            </div>
            <Toggle
              on={!paused}
              onChange={(v) => togglePaused(!v)}
              ariaLabel="Toggle kitchen"
            />
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a8674",
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          Today&apos;s Menu · Stock
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 12,
              background: "#f7f2e3",
              border: "1px solid var(--se-line)",
              borderRadius: 12,
              marginBottom: 8,
              display: "flex",
              gap: 12,
              alignItems: "center",
              opacity: item.is_available ? 1 : 0.55,
            }}
          >
            <FoodImage art={item.art} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#1d1c17",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 4,
                }}
              >
                {item.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: (item.stock ?? 0) > 0 ? "#5f5c4d" : "#924021",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.stock === null
                    ? "∞ portions"
                    : `${item.stock} portions left`}
                </div>
                <StockStepper
                  value={item.stock ?? 0}
                  onChange={(n) => changeStock(item.id, n)}
                />
              </div>
            </div>
            <Toggle
              on={item.is_available}
              onChange={(v) => toggleAvailable(item.id, v)}
              ariaLabel={`Toggle availability for ${item.name}`}
            />
          </div>
        ))}
      </div>
    </>
  );
}
