"use client";

export function StickyBar({
  label,
  total,
  cta,
  onClick,
  disabled = false,
  editorial = false,
}: {
  label: string;
  total?: number | string;
  cta: string;
  onClick?: () => void;
  disabled?: boolean;
  editorial?: boolean;
}) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        padding: "10px 14px calc(10px + env(safe-area-inset-bottom))",
        background:
          "linear-gradient(to bottom, transparent, rgba(251,248,239,0.98) 20%)",
        zIndex: 20,
      }}
    >
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          width: "100%",
          background: disabled ? "#8a8674" : editorial ? "#467132" : "#2a2822",
          color: "#fbf8ef",
          borderRadius: 16,
          border: "none",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: "0 8px 24px rgba(40,60,30,0.18)",
          transition: "transform 150ms var(--se-ease)",
          minHeight: 44,
        }}
      >
        <div
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#c4b68f",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>
          {total !== undefined && (
            <span
              style={{
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
              }}
            >
              {typeof total === "number" ? `₹${total}` : total}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {cta} <span>→</span>
        </div>
      </button>
    </div>
  );
}
