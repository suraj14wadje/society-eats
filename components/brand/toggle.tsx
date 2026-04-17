"use client";

export function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: on ? "#467132" : "#c4b68f",
        border: "none",
        padding: 0,
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 180ms var(--se-ease)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fbf8ef",
          transition: "left 180ms var(--se-ease)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}
