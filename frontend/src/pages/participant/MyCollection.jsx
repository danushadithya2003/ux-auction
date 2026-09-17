import { useParticipant } from "../../context/ParticipantContext";
import { colorForCategory } from "../../theme/categories";
import BudgetCard from "../../components/BudgetCard";
import "../../components/components.css";

export default function MyCollection() {
  const { state } = useParticipant();

  const byCategory = {};
  for (const it of state.collection) {
    (byCategory[it.categoryName] = byCategory[it.categoryName] || []).push(it);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>My Collection</h2>
      <p className="muted">Everything you've acquired so far, grouped by category.</p>

      <div className="category-chip-row">
        {state.categoriesProgress.map((c, i) => (
          <span key={c.id} className={`category-chip${c.secured ? " category-chip-done" : ""}`}>
            {c.secured ? "✓ " : `${String(i + 1).padStart(2, "0")} · `}
            {c.name}
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        {state.collection.length === 0 ? (
          <p className="muted">Nothing yet — head to Live Auction to start bidding.</p>
        ) : (
          Object.entries(byCategory).map(([catName, items]) => {
            const theme = colorForCategory(catName, state.categories);
            return (
              <div key={catName} style={{ marginBottom: 18 }}>
                <h4 style={{ color: theme.accent, fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "0.06em" }}>{catName}</h4>
                <ul className="all-items-list">
                  {items.map((it, i) => (
                    <li key={i}>
                      <div className="all-items-row">
                        <strong>{it.name}</strong>
                        <span className="muted small">{it.price}c</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 20, maxWidth: 220 }}>
        <BudgetCard balance={state.balance} />
      </div>
    </div>
  );
}
