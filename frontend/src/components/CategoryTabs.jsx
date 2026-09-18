import "./components.css";

// Used on All Items only - the bidding stage itself just labels the
// current category as plain text, no tab switcher.
export default function CategoryTabs({ categories, activeId, onSelect }) {
  return (
    <div className="category-tabs">
      {categories.map((c, i) => {
        const active = c.id === activeId;
        return (
          <button
            key={c.id}
            className={`category-tab${active ? " category-tab-active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="category-tab-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="category-tab-name">
              {c.name}
              {c.secured && <span className="category-tab-check">&#10003;</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
