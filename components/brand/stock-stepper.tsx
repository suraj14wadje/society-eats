"use client";

export function StockStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="Decrease stock"
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          border: "1px solid #c4b68f",
          background: "#fbf8ef",
          fontSize: 11,
          cursor: "pointer",
          color: "#5f5c4d",
          padding: 0,
        }}
      >
        −
      </button>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase stock"
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          border: "1px solid #c4b68f",
          background: "#fbf8ef",
          fontSize: 11,
          cursor: "pointer",
          color: "#5f5c4d",
          padding: 0,
        }}
      >
        +
      </button>
    </div>
  );
}
