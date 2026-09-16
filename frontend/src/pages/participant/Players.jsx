import { useParticipant } from "../../context/ParticipantContext";
import "../../components/components.css";

export default function Players() {
  const { state } = useParticipant();
  const players = [...state.players].sort((a, b) => b.balance - a.balance);

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Players</h2>
      <p className="muted">Who still has money to compete with you.</p>

      <div className="players-list">
        {players.map((p) => (
          <div key={p.id} className={`players-row${p.isMe ? " is-me" : ""}${p.connected ? "" : " offline"}`}>
            <span className="players-row-name">
              {p.isMe ? "You" : p.name}
              {!p.connected && <span className="muted small"> · offline</span>}
            </span>
            <span className="players-row-progress">
              {p.categoriesSecured}/{p.totalCategories} cat · {p.collection.length} items
            </span>
            <span className="players-row-balance">{p.balance}c</span>
          </div>
        ))}
      </div>
    </div>
  );
}
