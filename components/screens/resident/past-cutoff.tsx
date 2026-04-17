import { TopBar } from "@/components/brand/top-bar";
import { FoodImage } from "@/components/brand/food-image";
import { InfoBanner } from "@/components/brand/info-banner";
import type { MenuItem } from "@/lib/cart/types";

export function PastCutoff({
  items,
  cutoffLabel,
  deliveryLabel,
}: {
  items: MenuItem[];
  cutoffLabel: string;
  deliveryLabel: string;
}) {
  return (
    <>
      <TopBar title="Lunch Service" />
      <div style={{ padding: "20px 20px 40px" }}>
        <InfoBanner
          tone="alert"
          title="Lunch Cutoff Passed"
          body={`${cutoffLabel}. Dinner orders open soon — window ${deliveryLabel}.`}
        />

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 400,
            margin: "26px 0 6px",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#1d1c17",
          }}
        >
          Tonight&apos;s{" "}
          <em style={{ color: "#467132", fontStyle: "italic" }}>Menu.</em>
        </h1>
        <p style={{ fontSize: 12, color: "#8a8674", margin: "0 0 16px" }}>
          Preview · Ordering Opens 3:00pm · Dinner Cutoff 5:30pm
        </p>

        <div
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
          data-testid="past-cutoff-preview"
        >
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{
                background: "#f7f2e3",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
                opacity: 0.6,
              }}
            >
              <FoodImage art={item.art} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 12, fontWeight: 500, color: "#1d1c17" }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: 10, color: "#8a8674", marginTop: 2 }}>
                  ₹{item.price_inr}
                </div>
              </div>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  color: "#8a8674",
                  background: "#fbf8ef",
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #c4b68f",
                }}
              >
                OPENS 3:00PM
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
