import type { ReactNode } from "react";

export function InfoBanner({
  tone = "warn",
  title,
  body,
}: {
  tone?: "warn" | "alert" | "ok";
  title: string;
  body?: ReactNode;
}) {
  const palette =
    tone === "alert"
      ? { bg: "#fdf2ec", border: "#f2b896", fg: "#924021", badge: "#d86e45" }
      : tone === "ok"
        ? { bg: "#dfecd6", border: "#b9d4aa", fg: "#467132", badge: "#467132" }
        : { bg: "#faf0d1", border: "#e5c878", fg: "#8a6510", badge: "#e0a820" };
  return (
    <div
      style={{
        padding: 16,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 14,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: palette.badge,
          color: "#fbf8ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "var(--font-serif)",
          fontSize: 18,
        }}
      >
        !
      </div>
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: palette.fg,
          }}
        >
          {title}
        </div>
        {body && (
          <div
            style={{
              fontSize: 12,
              color: "#5f5c4d",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
