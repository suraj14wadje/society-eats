import {
  FOOD_ART_KEYS,
  type FoodArtKey,
  isFoodArtKey,
} from "@/components/brand/food-art";

// Maps a menu_items.image_url value (or slugified name) to a FoodArt key.
// image_url is repurposed as a short art identifier until real photography lands.
export function toArtKey(
  imageUrl: string | null,
  name: string | null,
): FoodArtKey {
  if (isFoodArtKey(imageUrl)) return imageUrl;

  const slug = (name ?? "").toLowerCase();
  if (slug.includes("paneer")) return "paneer";
  if (slug.includes("dal") && slug.includes("chawal")) return "dalChawal";
  if (slug.includes("khichdi")) return "khichdi";
  if (slug.includes("rajma")) return "rajma";
  if (slug.includes("roti") || slug.includes("sabzi")) return "rotiSabzi";

  return FOOD_ART_KEYS[0];
}
