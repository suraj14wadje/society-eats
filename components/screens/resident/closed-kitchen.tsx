import { TopBar } from "@/components/brand/top-bar";
import { PrimaryButton } from "@/components/brand/primary-button";

export function ClosedKitchen() {
  return (
    <>
      <TopBar />
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
          width="110"
          height="110"
          viewBox="0 0 110 110"
          style={{ marginBottom: 22 }}
          aria-hidden
        >
          <g
            stroke="#924021"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 50 L22 82 Q22 92, 32 92 L78 92 Q88 92, 88 82 L88 50" />
            <line x1="16" y1="50" x2="94" y2="50" />
            <path d="M22 58 Q15 58, 15 64 Q15 70, 22 70" />
            <path d="M88 58 Q95 58, 95 64 Q95 70, 88 70" />
            <path d="M18 50 Q18 42, 26 42 L84 42 Q92 42, 92 50" />
            <circle cx="55" cy="38" r="4" fill="#fdf2ec" />
            <line x1="40" y1="20" x2="40" y2="30" strokeDasharray="2 3" />
            <line x1="55" y1="14" x2="55" y2="26" strokeDasharray="2 3" />
            <line x1="70" y1="20" x2="70" y2="30" strokeDasharray="2 3" />
          </g>
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
          Kitchen Closed
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 30,
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#1d1c17",
          }}
        >
          Meera Is Resting{" "}
          <em
            style={{
              color: "#467132",
              fontStyle: "italic",
            }}
          >
            Today.
          </em>
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#5f5c4d",
            lineHeight: 1.55,
            margin: "14px 0 24px",
            maxWidth: 280,
          }}
        >
          We&apos;re not taking orders right now. Service resumes at the next
          meal window — check back shortly.
        </p>

        <div style={{ width: "100%", maxWidth: 260 }}>
          <PrimaryButton disabled>Notify Me Tomorrow</PrimaryButton>
        </div>
      </div>
    </>
  );
}
