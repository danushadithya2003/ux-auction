import { Link } from "react-router-dom";

const COPY = {
  LOBBY: {
    kicker: "SEAT CONFIRMED",
    title: "You are in",
    body: "Seat confirmed and 100 coins issued. The auctioneer starts the auction when the room is full.",
  },
  PLANNING: {
    kicker: "STUDY THE BOARD",
    title: "Study the board",
    body: "Bidding opens the moment the auctioneer calls the first lot. Use the time to work out which categories you cannot afford to miss.",
  },
};

export default function ParticipantWaiting({ state }) {
  const copy = COPY[state.status] || COPY.LOBBY;
  const players = [...state.players].sort((a, b) => (a.isMe ? -1 : b.isMe ? 1 : 0));

  return (
    <div className="waiting-shell">
      <div className="waiting-left">
        <div className="waiting-ring-row">
          <span className="waiting-ring" />
          <span className="waiting-kicker">{copy.kicker}</span>
        </div>
        <h1 className="waiting-title">{copy.title}</h1>
        <p className="entry-body waiting-body">{copy.body}</p>
        <div className="waiting-progress-track">
          <div className="waiting-progress-bar" />
        </div>
        <div className="waiting-actions">
          <div className="hud-label" style={{ marginBottom: 10 }}>WHILE YOU WAIT</div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/play/items" className="btn btn-outline">BROWSE ALL ITEMS</Link>
            <Link to="/play/how-it-works" className="btn btn-outline">HOW IT WORKS</Link>
          </div>
        </div>
      </div>

      <div className="waiting-rail">
        <div className="rail-panel-header">
          <span>IN THE ROOM</span>
          <span>{players.length} JOINED</span>
        </div>
        <div className="waiting-roster">
          {players.map((p) => (
            <div key={p.id} className={`roster-row${p.isMe ? " roster-row-mine" : ""}`}>
              <span className="roster-avatar">{p.name.charAt(0).toUpperCase()}</span>
              <div className="roster-body">
                <div className="roster-name">{p.name}</div>
                {p.isMe && <div className="roster-tag">THAT IS YOU</div>}
              </div>
              <div className="roster-purse">{p.balance}c</div>
            </div>
          ))}
        </div>
        <p className="waiting-rail-footer">NEXT — the auctioneer opens Category 01 · User.</p>
      </div>
    </div>
  );
}
