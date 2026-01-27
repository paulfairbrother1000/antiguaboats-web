export type CharterSlug = "day" | "half-day" | "sunset" | "restaurant-shuttle";
export type SlotId = "DAY" | "HALF_AM" | "HALF_PM" | "SUNSET";

export const SLOT_DEFS: Record<SlotId, { label: string; start: string; end: string }> = {
  DAY: { label: "Day Charter", start: "10:00", end: "17:00" },
  HALF_AM: { label: "½ Day (AM)", start: "10:00", end: "13:00" },
  HALF_PM: { label: "½ Day (PM)", start: "14:00", end: "17:00" },
  SUNSET: { label: "Sunset Charter", start: "16:30", end: "18:30" },
};

export const CHARTER_SLOTS: Record<CharterSlug, SlotId[]> = {
  day: ["DAY"],
  "half-day": ["HALF_AM", "HALF_PM"],
  sunset: ["SUNSET"],
  "restaurant-shuttle": [],
};
