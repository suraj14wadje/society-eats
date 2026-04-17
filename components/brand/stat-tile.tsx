export function StatTile({
  big,
  label,
  tone,
  mono = false,
}: {
  big: string | number;
  label: string;
  tone: "warn" | "ok" | "neutral";
  mono?: boolean;
}) {
  const palette =
    tone === "warn"
      ? { bg: "#fdf2ec", fg: "#924021" }
      : tone === "ok"
        ? { bg: "#dfecd6", fg: "#467132" }
        : { bg: "#f7f2e3", fg: "#1d1c17" };
  return (
    <div
      style={{
        flex: 1,
        padding: 12,
        background: palette.bg,
        borderRadius: 12,
        border: "1px solid var(--se-line)",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: palette.fg,
          lineHeight: 1,
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
        }}
      >
        {big}
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          color: palette.fg,
          opacity: 0.7,
          textTransform: "uppercase",
          marginTop: 5,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}
