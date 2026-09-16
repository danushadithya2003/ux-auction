import { useState } from "react";
import { useParticipant } from "../../context/ParticipantContext";
import CategoryTabs from "../../components/CategoryTabs";
import { colorForCategory } from "../../theme/categories";
import "../../components/components.css";

export default function AllItems() {
  const { state } = useParticipant();
  const categories = state.categories;
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) || categories[0];
  const theme = colorForCategory(active?.id, categories);

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>All Items</h2>
      <p className="muted">Browse every category — starting prices, and what's already sold.</p>

      <CategoryTabs categories={categories} activeId={active?.id} onSelect={setActiveId} />

      {active && (
        <div>
          <span className="eyebrow" style={{ color: theme.accent }}>
            {active.name}
          </span>
          <ul className="all-items-list">
            {active.items.map((it) => (
              <li key={it.id} className={it.status === "SOLD" ? "sold" : ""}>
                <div className="all-items-row">
                  <strong>{it.name}</strong>
                  <span className="muted small">{it.startingPrice}c start</span>
                </div>
                <p className="muted small" style={{ margin: "4px 0 0" }}>
                  {it.description}
                </p>
                {it.status === "SOLD" && (
                  <p className="small" style={{ color: "var(--success)", margin: "4px 0 0" }}>
                    Sold to {it.soldToName} for {it.soldPrice}c
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
