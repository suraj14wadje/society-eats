"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { FoodImage } from "@/components/brand/food-image";
import { PrimaryButton } from "@/components/brand/primary-button";
import { useCartStore } from "@/lib/cart/store";
import type { FoodArtKey } from "@/components/brand/food-art";

export type HistoryOrder = {
  id: string;
  label: string;
  delivered_at: string | null;
  total_inr: number;
  items: Array<{
    menu_item_id: string;
    name: string;
    qty: number;
    art: FoodArtKey;
  }>;
};

export function HistoryList({ orders }: { orders: HistoryOrder[] }) {
  const router = useRouter();
  const reorder = useCartStore((s) => s.reorder);

  if (orders.length === 0) {
    return <EmptyHistory onBrowse={() => router.push("/")} />;
  }

  const handleReorder = (order: HistoryOrder) => {
    const items: Record<string, number> = {};
    for (const item of order.items) {
      items[item.menu_item_id] = (items[item.menu_item_id] ?? 0) + item.qty;
    }
    reorder(items);
    router.push("/cart");
  };

  return (
    <>
      <TopBar backHref="/" title="Past Thalis" />
      <div style={{ padding: "14px 20px 40px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#8a8674",
            fontWeight: 500,
            marginBottom: 12,
          }}
        >
          {orders.length} Order{orders.length === 1 ? "" : "s"} · Last 30 Days
        </div>

        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: "#f7f2e3",
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              border: "1px solid var(--se-line)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#1d1c17" }}
                >
                  {o.label}
                </div>
                <div style={{ fontSize: 11, color: "#8a8674", marginTop: 2 }}>
                  #{o.id.slice(0, 8).toUpperCase()}
                  {o.delivered_at ? ` · Delivered` : ""}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#1d1c17",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{o.total_inr}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {o.items.map((it, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <FoodImage art={it.art} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#5f5c4d",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {it.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#8a8674" }}>
                      × {it.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingTop: 10,
                borderTop: "1px dashed #c4b68f",
              }}
            >
              <button
                type="button"
                onClick={() => handleReorder(o)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1.5px solid #2a2822",
                  color: "#2a2822",
                  background: "#fbf8ef",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Reorder
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyHistory({ onBrowse }: { onBrowse: () => void }) {
  return (
    <>
      <TopBar backHref="/" title="Past Thalis" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{ marginBottom: 24, opacity: 0.6 }}
          aria-hidden
        >
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="#f7f2e3"
            stroke="#c4b68f"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle
            cx="60"
            cy="60"
            r="38"
            fill="none"
            stroke="#c4b68f"
            strokeWidth="0.8"
            strokeDasharray="2 3"
          />
        </svg>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#1d1c17",
          }}
        >
          No Thalis{" "}
          <em style={{ color: "#467132", fontStyle: "italic" }}>Yet.</em>
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            lineHeight: 1.5,
            margin: "12px 0 24px",
            maxWidth: 260,
          }}
        >
          Your first order will show up here. Meera is cooking today&apos;s
          thalis now.
        </p>
        <div style={{ width: "100%", maxWidth: 240 }}>
          <PrimaryButton onClick={onBrowse}>
            See Today&apos;s Menu
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
