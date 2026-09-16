import { useParticipant } from "../../context/ParticipantContext";
import { colorForCategory } from "../../theme/categories";
import "../../components/components.css";

export default function Players() {
  const { state } = useParticipant();

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Players</h2>
      <p className="muted">See where everyone stands — budgets, and what they've picked up so far.</p>

      <div className="players-grid">
        {state.players.map((p) => (
          <div key={p.id} className={`card players-card${p.isMe ? " players-card-me" : ""}${p.connected ? "" : " players-card-offline"}`}>
            <div className="players-card-head">
              <span className="avatar-circle">{p.name.charAt(0).toUpperCase()}</span>
              <div>
                <strong>
                  {p.name}
                  {p.isMe && <span className="muted small"> (you)</span>}
                </strong>
                <div className="muted small">{p.connected ? "Online" : "Offline"}</div>
              </div>
              <div className="players-balance">{p.balance}c</div>
            </div>
            <div className="players-progress">
              {p.categoriesSecured}/{p.totalCategories} categories
            </div>
            {p.collection.length > 0 && (
              <div className="players-items">
                {p.collection.map((it, i) => {
                  const theme = colorForCategory(it.categoryName, state.categories);
                  return (
                    <span key={i} className="collection-mini-tag" style={{ background: theme.soft, color: theme.accent }}>
                      {it.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
