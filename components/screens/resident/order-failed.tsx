"use client";

import { useRouter } from "next/navigation";
import { TopBar } from "@/components/brand/top-bar";
import { PrimaryButton } from "@/components/brand/primary-button";

export function OrderFailed({ soldOutNames }: { soldOutNames: string[] }) {
  const router = useRouter();
  return (
    <>
      <TopBar backHref="/" />
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
          width="100"
          height="100"
          viewBox="0 0 100 100"
          style={{ marginBottom: 22 }}
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="#fdf2ec"
            stroke="#d86e45"
            strokeWidth="2"
          />
          <path
            d="M25 35 L42 48 L35 55 L50 60 L45 75 L58 62 L72 70 L65 55 L78 45 L62 42 L65 28 L52 40 L45 25 Z"
            fill="none"
            stroke="#d86e45"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#924021",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Order Couldn&apos;t Go Through
        </div>

        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 26,
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#1d1c17",
          }}
        >
          Meera Just{" "}
          <em style={{ color: "#924021", fontStyle: "italic" }}>Sold Out.</em>
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            lineHeight: 1.55,
            margin: "12px 0 22px",
            maxWidth: 280,
          }}
        >
          {soldOutNames.length > 0
            ? `${soldOutNames.join(", ")} went in the last minute.`
            : "Something you picked went in the last minute."}{" "}
          Your cart is released — nothing charged.
        </p>

        <div style={{ width: "100%", maxWidth: 260 }}>
          <PrimaryButton onClick={() => router.push("/")}>
            Pick Something Else
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
