// Each category gets a consistent accent color, used sparingly for tags
// and eyebrow labels - not big decorative blocks.

export const CATEGORY_COLORS = [
  { accent: "#5B7FA6", soft: "#EAF1F8", name: "blue" },
  { accent: "#9A6FB0", soft: "#F1E9F6", name: "purple" },
  { accent: "#4C8C5B", soft: "#E9F4EA", name: "green" },
  { accent: "#C98A2C", soft: "#FBF0DC", name: "amber" },
  { accent: "#C85A7A", soft: "#FBEAF0", name: "pink" },
];

export function colorForCategory(categoryIdOrName, categories) {
  if (categories && categories.length) {
    const idx = categories.findIndex((c) => c.id === categoryIdOrName || c.name === categoryIdOrName);
    if (idx >= 0) return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
  }
  return { accent: "#8A7F6D", soft: "#EDE6D8", name: "neutral" };
}
