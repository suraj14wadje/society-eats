"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { StatTile } from "@/components/brand/stat-tile";
import { advanceOrder } from "@/lib/orders/advance-order";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { toast } from "sonner";

type OrderStatus = Database["public"]["Enums"]["order_status"];

export type QueueOrder = {
  id: string;
  status: OrderStatus;
  total_inr: number;
  created_at: string;
  note: string | null;
  customer: string;
  address: string;
  line_items: string;
};

const STAGE_LABELS: Record<number, string> = {
  0: "New",
  1: "Cooking",
  2: "Delivering",
  3: "Delivered",
};

const STAGE_TONES: Record<number, { bg: string; fg: string; dot: string }> = {
  0: { bg: "#fdf2ec", fg: "#924021", dot: "#d86e45" },
  1: { bg: "#faf0d1", fg: "#8a6510", dot: "#e0a820" },
  2: { bg: "#dfecd6", fg: "#467132", dot: "#467132" },
  3: { bg: "#eeece0", fg: "#8a8674", dot: "#8a8674" },
};

function stageOf(s: OrderStatus): number {
  if (s === "placed" || s === "payment_pending") return 0;
  if (s === "paid" || s === "cooking") return 1;
  if (s === "out_for_delivery") return 2;
  return 3;
}

const NEXT_CTA: Record<number, string> = {
  0: "Start Cooking →",
  1: "Send Out →",
  2: "Mark Delivered →",
};

export function QueueList({ initialOrders }: { initialOrders: QueueOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();
  const [nowMs, setNowMs] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const tick = setInterval(() => setNowMs(Date.now()), 30_000);
    requestAnimationFrame(() => setNowMs(Date.now()));
    const supabase = createClient();
    const channel = supabase
      .channel("admin-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          router.refresh();
        },
      )
      .subscribe();
    return () => {
      clearInterval(tick);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const totals = {
    pending: orders.filter((o) => stageOf(o.status) < 2).length,
    delivering: orders.filter((o) => stageOf(o.status) === 2).length,
    revenue: orders.reduce((s, o) => s + o.total_inr, 0),
  };

  const handleAdvance = (orderId: string) => {
    startTransition(async () => {
      const result = await advanceOrder(orderId);
      if (result.status === "ok") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: result.nextStatus as OrderStatus }
              : o,
          ),
        );
      } else if (result.status === "admin_only") {
        toast.error("Admin access required.");
      } else if (result.status === "not_found") {
        toast.error("Order not found.");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <TopBar
        title="Kitchen · Today"
        right={
          <button
            type="button"
            onClick={() => router.push("/admin/controls")}
            aria-label="Kitchen controls"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "transparent",
              border: "1px solid var(--se-line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              color: "#1d1c17",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="7" cy="7" r="2" />
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.5 2.5l1.4 1.4M10.1 10.1l1.4 1.4M2.5 11.5l1.4-1.4M10.1 3.9l1.4-1.4" />
            </svg>
          </button>
        }
      />

      <div style={{ padding: "16px 20px 8px" }}>
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
          Today&apos;s Board
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <StatTile big={totals.pending} label="To Cook" tone="warn" />
          <StatTile big={totals.delivering} label="Out" tone="ok" />
          <StatTile
            big={`₹${totals.revenue}`}
            label="Takings"
            tone="neutral"
            mono
          />
        </div>
      </div>

      <div style={{ padding: "0 16px 100px" }}>
        {orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#8a8674",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
            }}
          >
            No orders yet today.
          </div>
        )}
        {orders.map((o) => {
          const stage = stageOf(o.status);
          const tone = STAGE_TONES[stage]!;
          const isNew =
            stage === 0 &&
            nowMs > 0 &&
            nowMs - new Date(o.created_at).getTime() < 10 * 60 * 1000;
          return (
            <div
              key={o.id}
              style={{
                background: "#f7f2e3",
                borderRadius: 14,
                padding: 12,
                marginBottom: 8,
                border: isNew
                  ? "1.5px solid #d86e45"
                  : "1px solid var(--se-line)",
                position: "relative",
              }}
            >
              {isNew && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    left: 12,
                    background: "#d86e45",
                    color: "#fbf8ef",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  NEW
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: tone.dot,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#1d1c17",
                    }}
                  >
                    {o.address}
                    <span
                      style={{
                        color: "#8a8674",
                        fontWeight: 400,
                        marginLeft: 6,
                      }}
                    >
                      · {o.customer}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    color: tone.fg,
                    background: tone.bg,
                    padding: "3px 8px",
                    borderRadius: 999,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {STAGE_LABELS[stage]!.toUpperCase()}
                </span>
              </div>

              <div
                style={{
                  fontSize: 11,
                  color: "#5f5c4d",
                  marginBottom: o.note ? 6 : 10,
                  paddingLeft: 14,
                }}
              >
                {o.line_items}
              </div>

              {o.note && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#924021",
                    background: "#fdf2ec",
                    padding: "4px 8px",
                    borderRadius: 6,
                    marginBottom: 10,
                    marginLeft: 14,
                    fontStyle: "italic",
                    border: "1px solid #f2b896",
                  }}
                >
                  Note: {o.note}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  borderTop: "1px dashed #c4b68f",
                  paddingLeft: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#8a8674",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  #{o.id.slice(0, 8).toUpperCase()} ·{" "}
                  {new Date(o.created_at).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {stage < 3 ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAdvance(o.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 999,
                      border: "1.5px solid #2a2822",
                      color: "#fbf8ef",
                      background: "#2a2822",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      cursor: isPending ? "wait" : "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {NEXT_CTA[stage]}
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#8a8674",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ₹{o.total_inr} · COD
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
