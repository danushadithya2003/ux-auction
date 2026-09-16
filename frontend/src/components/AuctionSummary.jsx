import { colorForCategory } from "../theme/categories";
import "./components.css";

export default function AuctionSummary({ summary }) {
  return (
    <div className="summary-wrap">
      <div className="summary-header">
        <h2>Auction Summary</h2>
        <p className="muted">Code {summary.code} — everyone's final hand, side by side.</p>
      </div>
      <div className="summary-grid">
        {summary.participants.map((p) => {
          const byCategory = {};
          for (const it of p.collection) (byCategory[it.categoryName] = byCategory[it.categoryName] || []).push(it);
          return (
            <div className="card summary-card" key={p.name}>
              <div className="summary-card-head">
                <strong>{p.name}</strong>
                <span className="muted">{p.finalBalance}c left</span>
              </div>
              {summary.categories.map((catName) => {
                const items = byCategory[catName] || [];
                const theme = colorForCategory(catName, summary.categories.map((n) => ({ name: n })));
                return (
                  <div key={catName} style={{ marginBottom: 12 }}>
                    <h4 style={{ color: theme.accent, fontSize: "0.75em", textTransform: "uppercase", letterSpacing: "0.06em" }}>{catName}</h4>
                    {items.length ? (
                      <ul className="summary-item-list">
                        {items.map((it, i) => (
                          <li key={i}>
                            <span>{it.name}</span>
                            <span>{it.price}c</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted small">Nothing acquired here.</p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
