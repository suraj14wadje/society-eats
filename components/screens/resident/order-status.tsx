"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { PrimaryButton } from "@/components/brand/primary-button";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const STAGE_INFO = [
  { label: "Pending", meta: "Received" },
  { label: "Preparing", meta: "On The Stove" },
  { label: "Delivering", meta: "Out For Delivery" },
  { label: "Delivered", meta: "Enjoy Your Meal" },
] as const;

const ACTIVE_COPY = [
  "Order Received. Meera Will Start Soon.",
  "Meera Is Cooking Your Thali.",
  "Tiffin Is Out For Delivery.",
  "Delivered. Enjoy Your Meal.",
] as const;

function stageFromStatus(s: OrderStatus): number {
  switch (s) {
    case "placed":
    case "payment_pending":
      return 0;
    case "paid":
    case "cooking":
      return 1;
    case "out_for_delivery":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
  }
}

export function OrderStatus({
  orderId,
  initialStatus,
  profile,
  total,
  deliveryLabel,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  profile: { building_name: string; flat_number: string };
  total: number;
  deliveryLabel: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const fresh = search.get("fresh") === "1";
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const stage = stageFromStatus(status);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const next = (payload.new as { status: OrderStatus }).status;
          if (next) setStatus(next);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (status === "cancelled") {
    return (
      <>
        <TopBar backHref="/" title={`Order #${shortId(orderId)}`} />
        <div
          style={{
            padding: "40px 24px",
            textAlign: "center",
            color: "#5f5c4d",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              color: "#924021",
            }}
          >
            Order Cancelled.
          </h1>
          <p style={{ fontSize: 13, marginTop: 10 }}>
            Nothing was charged. You can reorder from the menu.
          </p>
          <div style={{ marginTop: 20, maxWidth: 260, margin: "20px auto 0" }}>
            <PrimaryButton onClick={() => router.push("/")}>
              Back To Menu
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  if (fresh && stage === 0) {
    return (
      <>
        <TopBar />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 24px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              border: "2px solid #467132",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 22,
              position: "relative",
              animation: "se-check-pulse 1.8s var(--se-ease) infinite",
            }}
          >
            <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
              <path
                d="M2 13l10 9L34 2"
                stroke="#467132"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 34,
              fontWeight: 400,
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#1d1c17",
            }}
          >
            On The Stove.
            <br />
            <em style={{ color: "#467132", fontStyle: "italic" }}>
              Ready By {deliveryLabel}.
            </em>
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#5f5c4d",
              lineHeight: 1.5,
              margin: "16px 0 24px",
              maxWidth: 280,
            }}
          >
            We&apos;ll knock at the door when your tiffin is outside{" "}
            {profile.building_name} · Flat {profile.flat_number}.
          </p>

          <div style={{ width: "100%", maxWidth: 260 }}>
            <InfoRow label="ORDER" value={`#${shortId(orderId)}`} />
            <div style={{ height: 10 }} />
            <InfoRow label="WINDOW" value={deliveryLabel} />
            <div style={{ height: 10 }} />
            <InfoRow label="TOTAL" value={`₹${total}`} />
            <div style={{ height: 24 }} />
            <PrimaryButton onClick={() => router.replace(`/orders/${orderId}`)}>
              Track Order
            </PrimaryButton>
            <div style={{ height: 10 }} />
            <PrimaryButton variant="outline" onClick={() => router.push("/")}>
              Back To Menu
            </PrimaryButton>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar backHref="/" title={`Order #${shortId(orderId)}`} />
      <div style={{ padding: "12px 20px 40px" }}>
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
          Stage {Math.max(stage, 0) + 1} Of 4 · Updated Now
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 26,
            fontWeight: 400,
            margin: "4px 0 6px",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#1d1c17",
          }}
        >
          {ACTIVE_COPY[Math.max(stage, 0)]}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            lineHeight: 1.5,
            margin: "0 0 16px",
          }}
        >
          {stage < 3 ? (
            <>
              Ready at your door by{" "}
              <b style={{ color: "#1d1c17" }}>{deliveryLabel}</b>. We&apos;ll
              knock when it&apos;s outside.
            </>
          ) : (
            <>Hope it was delicious.</>
          )}
        </p>

        <div
          style={{
            padding: "18px 18px 10px",
            background: "#f7f2e3",
            border: "1px solid var(--se-line)",
            borderRadius: 14,
          }}
        >
          {STAGE_INFO.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            const future = i > stage;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  paddingBottom: i < 3 ? 18 : 0,
                  position: "relative",
                }}
              >
                {i < 3 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 7,
                      top: 18,
                      bottom: -2,
                      width: 2,
                      background:
                        i < stage
                          ? "#467132"
                          : "repeating-linear-gradient(to bottom, #c4b68f 0 4px, transparent 4px 8px)",
                    }}
                  />
                )}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border:
                      done || active
                        ? "1.5px solid #467132"
                        : "1.5px solid #c4b68f",
                    background: done || active ? "#467132" : "#fbf8ef",
                    flexShrink: 0,
                    marginTop: 1,
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: active
                      ? "se-dot-pulse 1.8s var(--se-ease) infinite"
                      : undefined,
                  }}
                >
                  {done && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3l2 2 4-4"
                        stroke="#fbf8ef"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: active
                        ? "#467132"
                        : future
                          ? "#8a8674"
                          : "#1d1c17",
                      marginBottom: 2,
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#8a8674" }}>{s.meta}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 14,
            background: "#fbf8ef",
            border: "1px solid var(--se-line)",
            borderRadius: 14,
          }}
        >
          <Row
            label="Delivering To"
            value={`${profile.building_name} · ${profile.flat_number}`}
          />
          <Row label="Payment" value="Cash On Delivery" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              paddingTop: 8,
              borderTop: "1px solid var(--se-line)",
              fontSize: 14,
              fontWeight: 600,
              color: "#1d1c17",
            }}
          >
            <span>Total Due</span>
            <span>₹{total}</span>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <PrimaryButton variant="outline" onClick={() => router.push("/")}>
            Back To Menu
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        background: "#f7f2e3",
        border: "1px dashed #c4b68f",
        borderRadius: 14,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 10, color: "#8a8674", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "#1d1c17",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#5f5c4d",
        padding: "3px 0",
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
