"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartCount, cartSubtotal } from "@/lib/cart/store";
import { FoodImage } from "@/components/brand/food-image";
import { VegMark } from "@/components/brand/veg-mark";
import { AddButton } from "@/components/brand/add-button";
import { QtyStepper } from "@/components/brand/qty-stepper";
import { TopBar } from "@/components/brand/top-bar";
import { StickyBar } from "@/components/brand/sticky-bar";
import { PACKING_FEE_INR, type MenuItem } from "@/lib/cart/types";

export function MenuList({ items }: { items: MenuItem[] }) {
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);

  const count = cartCount(cartItems);
  const subtotal = useMemo(
    () => cartSubtotal(cartItems, items),
    [cartItems, items],
  );
  const total = subtotal + (count > 0 ? PACKING_FEE_INR : 0);

  return (
    <>
      <TopBar
        right={
          <div
            onClick={count > 0 ? () => router.push("/cart") : undefined}
            role={count > 0 ? "button" : undefined}
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              background: count > 0 ? "#2a2822" : "transparent",
              color: count > 0 ? "#fbf8ef" : "#1d1c17",
              border:
                count > 0
                  ? "1.5px solid #2a2822"
                  : "1.5px solid var(--se-line)",
              fontSize: 12,
              fontWeight: 500,
              display: "flex",
              gap: 6,
              alignItems: "center",
              cursor: count > 0 ? "pointer" : "default",
            }}
          >
            Thali
            {count > 0 && (
              <span
                style={{
                  background: "#fbf8ef",
                  color: "#2a2822",
                  padding: "1px 6px",
                  borderRadius: 999,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                }}
              >
                {count}
              </span>
            )}
          </div>
        }
      />

      <div style={{ height: 24 }} />

      <div
        style={{
          padding: "0 16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {items.map((item) => {
          const qty = cartItems[item.id] ?? 0;
          const soldOut =
            item.stock !== null && item.stock !== undefined && item.stock <= 0;
          const unavailable = !item.is_available || soldOut;
          return (
            <div
              key={item.id}
              data-testid={`menu-card-${item.id}`}
              data-menu-name={item.name}
              style={{
                background: "#f7f2e3",
                borderRadius: 16,
                padding: 14,
                display: "flex",
                gap: 14,
                alignItems: "center",
                opacity: unavailable ? 0.55 : 1,
                boxShadow: "0 1px 2px rgba(40,60,30,0.04)",
              }}
            >
              <FoodImage art={item.art} size={76} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <VegMark />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1d1c17",
                    margin: "0 0 3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.name}
                </h3>
                {item.description && (
                  <p
                    style={{
                      fontSize: 11,
                      color: "#8a8674",
                      lineHeight: 1.4,
                      margin: "0 0 8px",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#1d1c17",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ₹{item.price_inr}
                  </span>
                  {unavailable ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.06em",
                        color: "#924021",
                        background: "#fdf2ec",
                        border: "1px solid #f2b896",
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {soldOut ? "Sold Out" : "Not Available"}
                    </span>
                  ) : qty > 0 ? (
                    <QtyStepper
                      qty={qty}
                      onAdd={() => add(item.id)}
                      onRemove={() => remove(item.id)}
                      compact
                    />
                  ) : (
                    <AddButton onClick={() => add(item.id)} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <StickyBar
          label={`${count} Item${count > 1 ? "s" : ""} In Your Thali`}
          total={total}
          cta="View Thali"
          onClick={() => router.push("/cart")}
        />
      )}
    </>
  );
}
