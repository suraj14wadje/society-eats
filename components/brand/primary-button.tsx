"use client";

import type { ReactNode } from "react";

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = "solid",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "outline";
  type?: "button" | "submit";
}) {
  const solid = variant === "solid";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "14px 18px",
        background: disabled ? "#c4b68f" : solid ? "#2a2822" : "transparent",
        color: solid ? "#fbf8ef" : "#2a2822",
        border: solid ? "none" : "1.5px solid #2a2822",
        borderRadius: 14,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.02em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition:
          "transform 150ms var(--se-ease), background 150ms var(--se-ease)",
        minHeight: 44,
      }}
    >
      {children}
    </button>
  );
}
