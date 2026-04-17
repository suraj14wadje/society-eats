"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "./logo";

export function TopBar({
  title,
  right,
  backHref,
  onBack,
  sticky = true,
}: {
  title?: string;
  right?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  sticky?: boolean;
}) {
  const router = useRouter();
  const handleBack =
    onBack ?? (backHref ? () => router.push(backHref) : () => router.back());
  const showBack = Boolean(backHref || onBack);
  return (
    <div
      className={sticky ? "sticky top-0 z-10" : ""}
      style={{
        background: "rgba(251,248,239,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--se-line)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 48,
      }}
    >
      <div style={{ width: 32, display: "flex" }}>
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
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
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M8 2L4 6l4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <div
        style={{
          flex: 1,
          textAlign: "center",
          fontFamily: title ? "var(--font-serif)" : "inherit",
          fontSize: title ? 17 : 18,
          color: "#1d1c17",
          letterSpacing: "-0.01em",
        }}
      >
        {title ?? <Logo small />}
      </div>
      <div style={{ width: 32, display: "flex", justifyContent: "flex-end" }}>
        {right}
      </div>
    </div>
  );
}
