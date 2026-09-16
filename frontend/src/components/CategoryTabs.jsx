import { colorForCategory } from "../theme/categories";
import "./components.css";

// Purely a viewing aid - during Live bidding the auction always dictates
// which category/item is current; these tabs let a participant preview
// other categories without affecting the live item anyone else sees.
export default function CategoryTabs({ categories, activeId, onSelect, readOnly = false }) {
  return (
    <div className="category-tabs">
      {categories.map((c) => {
        const theme = colorForCategory(c.id, categories);
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            className={`category-tab${active ? " category-tab-active" : ""}${readOnly ? " category-tab-readonly" : ""}`}
            style={active ? { color: theme.accent, borderColor: theme.accent } : undefined}
            onClick={readOnly ? undefined : () => onSelect(c.id)}
          >
            {c.name}
            {c.secured && <span className="category-tab-check">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
