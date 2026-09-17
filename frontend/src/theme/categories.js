// Each category gets a consistent accent, drawn from a desaturated
// navy/blue/slate spectrum (never a bright or playful hue) - used
// sparingly for tags, eyebrow labels, and its numbered mark.

export const CATEGORY_COLORS = [
  { accent: "#0072CE", soft: "#E8F2FC", name: "blue" },
  { accent: "#0A1F44", soft: "#E9EDF3", name: "navy" },
  { accent: "#4C7A8C", soft: "#EAF0F2", name: "teal" },
  { accent: "#1E4C8A", soft: "#EAF0F8", name: "slate-blue" },
  { accent: "#6B7686", soft: "#EEF0F3", name: "slate" },
];

export function colorForCategory(categoryIdOrName, categories) {
  if (categories && categories.length) {
    const idx = categories.findIndex((c) => c.id === categoryIdOrName || c.name === categoryIdOrName);
    if (idx >= 0) return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  }
  return { accent: "#6B7686", soft: "#EEF0F3", name: "neutral" };
}
