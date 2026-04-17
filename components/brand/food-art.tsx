// Warm top-down plate illustrations, ported verbatim from the Hi-Fi prototype
// (/tmp/design-pkg-v2/society-eats/project/hifi/data.jsx). Each is a stylized
// stand-in for photography.

import type { ReactElement } from "react";

export type FoodArtKey =
  | "paneer"
  | "dalChawal"
  | "rotiSabzi"
  | "khichdi"
  | "rajma";

export const FOOD_ART_KEYS = [
  "paneer",
  "dalChawal",
  "rotiSabzi",
  "khichdi",
  "rajma",
] as const satisfies readonly FoodArtKey[];

export function isFoodArtKey(v: unknown): v is FoodArtKey {
  return (
    typeof v === "string" && (FOOD_ART_KEYS as readonly string[]).includes(v)
  );
}

export const FoodArt: Record<FoodArtKey, ReactElement> = {
  paneer: (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <radialGradient id="plate-p" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7f2e3" />
          <stop offset="100%" stopColor="#ede5cf" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#plate-p)" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#d4c8a3"
        strokeWidth="0.8"
      />
      <g>
        <rect
          x="36"
          y="38"
          width="14"
          height="14"
          rx="2"
          fill="#f4e4b5"
          transform="rotate(-12 43 45)"
        />
        <rect
          x="52"
          y="42"
          width="14"
          height="14"
          rx="2"
          fill="#e8c87a"
          transform="rotate(8 59 49)"
        />
        <rect
          x="68"
          y="38"
          width="14"
          height="14"
          rx="2"
          fill="#f4e4b5"
          transform="rotate(-5 75 45)"
        />
        <rect
          x="42"
          y="54"
          width="14"
          height="14"
          rx="2"
          fill="#e8c87a"
          transform="rotate(14 49 61)"
        />
        <rect
          x="60"
          y="56"
          width="14"
          height="14"
          rx="2"
          fill="#f4e4b5"
          transform="rotate(-8 67 63)"
        />
      </g>
      <path
        d="M30 44 Q60 28, 90 44 Q92 70, 82 82 Q60 92, 38 82 Q28 70, 30 44 Z"
        fill="#d86e45"
        fillOpacity="0.35"
      />
      <circle cx="48" cy="72" r="1.5" fill="#467132" />
      <circle cx="66" cy="76" r="1.2" fill="#467132" />
      <circle cx="58" cy="68" r="1" fill="#467132" />
      <circle cx="74" cy="70" r="1.3" fill="#467132" />
    </svg>
  ),
  dalChawal: (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="60" cy="60" r="58" fill="#f7f2e3" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#d4c8a3"
        strokeWidth="0.8"
      />
      <ellipse cx="45" cy="60" rx="22" ry="20" fill="#fbf8ef" />
      <g fill="#ede5cf" opacity="0.9">
        <ellipse cx="38" cy="52" rx="2" ry="1" />
        <ellipse cx="48" cy="50" rx="2" ry="1" transform="rotate(20 48 50)" />
        <ellipse cx="42" cy="62" rx="2" ry="1" transform="rotate(-10 42 62)" />
        <ellipse cx="52" cy="66" rx="2" ry="1" />
        <ellipse cx="38" cy="70" rx="2" ry="1" transform="rotate(30 38 70)" />
      </g>
      <circle cx="82" cy="58" r="18" fill="#e0a820" />
      <circle
        cx="82"
        cy="58"
        r="18"
        fill="none"
        stroke="#b8881a"
        strokeWidth="1"
      />
      <circle cx="78" cy="54" r="1" fill="#fbf8ef" opacity="0.6" />
      <circle cx="86" cy="60" r="0.8" fill="#fbf8ef" opacity="0.6" />
      <circle cx="82" cy="56" r="3" fill="#f4c444" opacity="0.7" />
      <circle cx="80" cy="52" r="0.8" fill="#467132" />
    </svg>
  ),
  rotiSabzi: (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="60" cy="60" r="58" fill="#f7f2e3" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#d4c8a3"
        strokeWidth="0.8"
      />
      <circle cx="45" cy="58" r="22" fill="#e8c87a" />
      <circle
        cx="45"
        cy="58"
        r="22"
        fill="none"
        stroke="#c4a35a"
        strokeWidth="0.8"
      />
      <circle cx="38" cy="52" r="1.5" fill="#924021" opacity="0.5" />
      <circle cx="52" cy="64" r="1.2" fill="#924021" opacity="0.5" />
      <circle cx="46" cy="66" r="1" fill="#924021" opacity="0.4" />
      <circle cx="82" cy="62" r="16" fill="#467132" />
      <circle cx="80" cy="58" r="2" fill="#7aa85c" />
      <circle cx="85" cy="65" r="1.5" fill="#9bc07f" />
      <circle cx="78" cy="66" r="1.3" fill="#7aa85c" />
      <circle cx="85" cy="57" r="1" fill="#9bc07f" />
    </svg>
  ),
  khichdi: (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="60" cy="60" r="58" fill="#f7f2e3" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#d4c8a3"
        strokeWidth="0.8"
      />
      <circle cx="60" cy="60" r="34" fill="#f4c444" />
      <circle
        cx="60"
        cy="60"
        r="34"
        fill="none"
        stroke="#b8881a"
        strokeWidth="0.8"
      />
      <g fill="#e0a820" opacity="0.6">
        <circle cx="50" cy="52" r="1.2" />
        <circle cx="66" cy="50" r="1" />
        <circle cx="58" cy="60" r="1.3" />
        <circle cx="72" cy="62" r="1.1" />
        <circle cx="48" cy="68" r="1.2" />
        <circle cx="64" cy="72" r="1" />
      </g>
      <ellipse cx="60" cy="58" rx="8" ry="4" fill="#fff8d6" opacity="0.7" />
      <circle cx="56" cy="56" r="1" fill="#467132" />
      <circle cx="64" cy="64" r="1.2" fill="#467132" />
      <circle cx="52" cy="66" r="0.8" fill="#467132" />
    </svg>
  ),
  rajma: (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="60" cy="60" r="58" fill="#f7f2e3" />
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#d4c8a3"
        strokeWidth="0.8"
      />
      <circle cx="45" cy="60" r="22" fill="#fbf8ef" />
      <g fill="#ede5cf">
        <ellipse cx="40" cy="54" rx="2" ry="1" />
        <ellipse cx="50" cy="52" rx="2" ry="1" transform="rotate(20 50 52)" />
        <ellipse cx="48" cy="68" rx="2" ry="1" />
      </g>
      <circle cx="80" cy="60" r="18" fill="#924021" />
      <ellipse
        cx="76"
        cy="56"
        rx="2.5"
        ry="1.8"
        fill="#5c2a15"
        transform="rotate(-20 76 56)"
      />
      <ellipse
        cx="84"
        cy="60"
        rx="2.5"
        ry="1.8"
        fill="#5c2a15"
        transform="rotate(30 84 60)"
      />
      <ellipse cx="80" cy="65" rx="2.5" ry="1.8" fill="#5c2a15" />
      <ellipse
        cx="76"
        cy="63"
        rx="2.2"
        ry="1.6"
        fill="#5c2a15"
        transform="rotate(10 76 63)"
      />
    </svg>
  ),
};
