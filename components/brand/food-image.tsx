import { FoodArt, type FoodArtKey } from "./food-art";

export function FoodImage({
  art,
  size = 88,
  className = "",
}: {
  art: FoodArtKey;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: "#f7f2e3",
        boxShadow:
          "0 1px 2px rgba(40,60,30,0.06), inset 0 0 0 1px rgba(196,182,143,0.25)",
      }}
    >
      {FoodArt[art]}
    </div>
  );
}
