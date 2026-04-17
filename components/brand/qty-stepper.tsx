"use client";

export function QtyStepper({
  qty,
  onAdd,
  onRemove,
  compact = false,
}: {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  compact?: boolean;
}) {
  const btnSize = compact ? 20 : 22;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 6 : 10,
        border: "1.5px solid #467132",
        borderRadius: 999,
        padding: compact ? "2px 4px" : "3px 6px",
        background: "#fbf8ef",
      }}
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label="Decrease"
        style={{
          width: btnSize,
          height: btnSize,
          border: "none",
          background: "none",
          color: "#467132",
          fontSize: 16,
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
        }}
      >
        −
      </button>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: compact ? 12 : 13,
          color: "#467132",
          minWidth: 10,
          textAlign: "center",
        }}
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onAdd}
        aria-label="Increase"
        style={{
          width: btnSize,
          height: btnSize,
          border: "none",
          background: "none",
          color: "#467132",
          fontSize: 16,
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  );
}
