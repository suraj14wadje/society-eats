"use client";

export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 999,
        border: "1.5px solid #467132",
        color: "#467132",
        background: "#fbf8ef",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.04em",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        transition:
          "background 150ms var(--se-ease), color 150ms var(--se-ease)",
        minHeight: 32,
      }}
    >
      ADD
    </button>
  );
}
