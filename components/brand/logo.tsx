import { cn } from "@/lib/utils";

export function Logo({
  small = false,
  className,
}: {
  small?: boolean;
  className?: string;
}) {
  const size = small ? 18 : 22;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-serif leading-none text-[var(--se-ink-700)]",
        className,
      )}
      style={{ fontSize: small ? 18 : 22 }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <g stroke="#467132" strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M16 26 C16 18, 20 12, 26 8" />
          <path
            d="M20 16 C16 14, 13 15, 11 18 C14 20, 17 19, 20 16 Z"
            fill="#467132"
            fillOpacity="0.2"
          />
          <path
            d="M22 12 C19 10, 16 10, 14 12 C16 14, 20 14, 22 12 Z"
            fill="#467132"
            fillOpacity="0.2"
          />
        </g>
      </svg>
      <span>
        Society{" "}
        <em className="italic text-[var(--se-green-600)] not-italic">
          <i className="italic">Eats</i>
        </em>
      </span>
    </div>
  );
}
