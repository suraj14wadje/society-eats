export function VegMark({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-label="Vegetarian">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        stroke="#4a8c2a"
        strokeWidth="1.5"
        fill="white"
      />
      <circle cx="8" cy="8" r="3.5" fill="#4a8c2a" />
    </svg>
  );
}
