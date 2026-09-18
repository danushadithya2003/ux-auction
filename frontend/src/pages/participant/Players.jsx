import { useParticipant } from "../../context/ParticipantContext";
import { colorForPlayer } from "../../theme/playerColors";

const STARTING_BUDGET = 100;

export default function Players() {
  const { state } = useParticipant();
  const players = [...state.players].sort((a, b) => b.balance - a.balance);
  const leaderName = state.currentItem?.currentBidderName;
  const categoryNames = state.categoriesProgress.map((c) => c.name);

  return (
    <div>
      <h2 style={{ fontSize: 44, marginBottom: 4 }}>Players</h2>
      <p className="muted" style={{ marginBottom: 22 }}>Who still has money to compete with you.</p>

      <div className="players-grid">
        {players.map((p) => {
          const color = colorForPlayer(p.id, state.players);
          const isLeader = p.name === leaderName;
          const covered = new Set(p.collection.map((c) => c.categoryName));
          return (
            <div key={p.id} className={`card player-card${p.isMe ? " player-card-mine" : ""}${isLeader ? " player-card-leader" : ""}`}>
              <div className="player-card-top">
                <div className="player-card-id">
                  <span className="player-card-avatar" style={{ background: color }}>{p.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <div className="player-card-name">{p.isMe ? "You" : p.name}</div>
                    <div className={`player-card-tag${isLeader ? " player-card-tag-gold" : ""}`}>
                      {p.isMe ? "YOU" : isLeader ? "LEADING THIS LOT" : "IN THE ROOM"}
                      {!p.connected && " · OFFLINE"}
                    </div>
                  </div>
                </div>
                <div className="player-card-purse-block">
                  <div className="player-card-purse">{p.balance}c</div>
                  <div className="player-card-purse-label">PURSE LEFT</div>
                </div>
              </div>

              <div className="player-card-purse-bar">
                <div className="player-card-purse-bar-fill" style={{ width: `${Math.max(0, Math.min(100, (p.balance / STARTING_BUDGET) * 100))}%`, background: color }} />
              </div>

              <div className="player-card-stats">
                <div>
                  <div className="player-card-stat-num">{p.collection.length}</div>
                  <div className="player-card-stat-label">LOTS</div>
                </div>
                <div>
                  <div className="player-card-stat-num">{p.categoriesSecured}/{p.totalCategories}</div>
                  <div className="player-card-stat-label">CATEGORIES</div>
                </div>
              </div>

              <div className="player-card-pips">
                {categoryNames.map((name) => (
                  <span key={name} className="player-card-pip" style={covered.has(name) ? { background: color } : undefined} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
