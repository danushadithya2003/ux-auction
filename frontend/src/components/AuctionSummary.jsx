import "./components.css";

// Two shapes for the same data: the Auctioneer sees every hand side by
// side; a participant sees their own hand plus the room standings and
// what they're missing (the "final hand / back to start" screen).
export default function AuctionSummary({ summary, viewerRole = "admin", myParticipantId = null, onBackToStart }) {
  if (viewerRole === "participant" && myParticipantId) {
    return <ParticipantFinalHand summary={summary} myParticipantId={myParticipantId} onBackToStart={onBackToStart} />;
  }
  return <AdminSummaryGrid summary={summary} onBackToStart={onBackToStart} />;
}

function AdminSummaryGrid({ summary, onBackToStart }) {
  return (
    <div className="summary-wrap">
      <div className="summary-header-row">
        <div className="summary-header">
          <div className="summary-kicker">AUCTION CLOSED</div>
          <h2>Auction Summary</h2>
          <p className="muted">Code {summary.code} — everyone's final hand, side by side.</p>
        </div>
        {onBackToStart && (
          <button className="btn btn-outline" onClick={onBackToStart}>CREATE NEW AUCTION</button>
        )}
      </div>
      <div className="hand-grid">
        {summary.participants.map((p) => (
          <HandCard key={p.name} p={p} categories={summary.categories} />
        ))}
      </div>
    </div>
  );
}

function HandCard({ p, categories, mine = false }) {
  const byCategory = {};
  for (const it of p.collection) (byCategory[it.categoryName] = byCategory[it.categoryName] || []).push(it);
  const heldCount = categories.filter((catName) => (byCategory[catName] || []).length > 0).length;

  return (
    <div className={`card hand-card${mine ? " hand-card-mine" : ""}`}>
      <div className="hand-card-head">
        <div className="hand-card-name-row">
          <span className="hand-card-avatar">{p.name.charAt(0).toUpperCase()}</span>
          <span className="hand-card-name">{p.name}</span>
        </div>
        <div className="hand-card-balance">
          <div className="hand-card-balance-value">{p.finalBalance}c</div>
          <div className="hand-card-balance-label">LEFT</div>
        </div>
      </div>
      <div className="hand-card-body">
        {categories.map((catName) => {
          const items = byCategory[catName] || [];
          return (
            <div key={catName}>
              <div className={`hand-group-label${items.length ? " hand-group-label-filled" : ""}`}>{catName.toUpperCase()}</div>
              {items.length ? (
                items.map((it, i) => (
                  <div key={i} className="hand-item-row">
                    <span>{it.name}</span>
                    <span>{it.price}c</span>
                  </div>
                ))
              ) : (
                <div className="hand-item-empty">Nothing acquired here.</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hand-card-foot">
        <span className="coverage-pips">
          {categories.map((catName) => (
            <span key={catName} className={`coverage-pip${(byCategory[catName] || []).length ? " coverage-pip-held" : ""}`} />
          ))}
        </span>
        COVERAGE {heldCount}/{categories.length}
      </div>
    </div>
  );
}

function ParticipantFinalHand({ summary, myParticipantId, onBackToStart }) {
  const me = summary.participants.find((p) => p.id === myParticipantId) || summary.participants[0];
  const others = summary.participants.filter((p) => p.id !== me.id).sort((a, b) => b.finalBalance - a.finalBalance);

  const byCategory = {};
  for (const it of me.collection) (byCategory[it.categoryName] = byCategory[it.categoryName] || []).push(it);
  const spent = 100 - me.finalBalance;
  const missing = summary.categories.filter((catName) => !(byCategory[catName] || []).length);

  return (
    <div className="summary-wrap">
      <div className="collection-shell">
        <div>
          <div className="summary-kicker">YOUR FINAL HAND</div>
          <h2 style={{ fontSize: 76 }}>What you know</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Your hand is deliberately incomplete — compare notes with the room.</p>

          {summary.categories.map((catName) => {
            const items = byCategory[catName] || [];
            if (!items.length) {
              return (
                <div key={catName} className="collection-row" style={{ background: "transparent", borderColor: "#1a2130" }}>
                  <span className="hand-group-label hand-group-label-filled" style={{ margin: 0, width: 150, flexShrink: 0 }}>{catName.toUpperCase()}</span>
                  <span className="muted">Nothing acquired here.</span>
                </div>
              );
            }
            return items.map((it, i) => (
              <div key={`${catName}-${i}`} className="collection-row">
                <span className="hand-group-label hand-group-label-filled" style={{ margin: 0, width: 150, flexShrink: 0 }}>{i === 0 ? catName.toUpperCase() : ""}</span>
                <span className="collection-row-name" style={{ fontSize: 18, flex: 1 }}>{it.name}</span>
                <span className="collection-row-price" style={{ fontSize: 18 }}>{it.price}c</span>
              </div>
            ));
          })}

          <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={onBackToStart}>
            BACK TO START
          </button>
          <p className="muted small" style={{ marginTop: 10 }}>Head to the debrief with your hand in mind — everyone's is different.</p>
        </div>

        <div>
          <div className="hud-label">UNSPENT</div>
          <div className="hud-value" style={{ fontSize: 66, margin: "6px 0" }}>{me.finalBalance}c</div>
          <p className="muted small" style={{ marginBottom: 24 }}>of 100c &middot; {spent}c spent on {me.collection.length} lots</p>

          <div className="hud-label" style={{ marginBottom: 10 }}>THE ROOM</div>
          {[me, ...others].map((p) => (
            <div key={p.id} className="standing-row" style={{ marginBottom: 4 }}>
              <span className="standing-name">{p.id === me.id ? "You" : p.name}</span>
              <span className="standing-purse">{p.finalBalance}c</span>
            </div>
          ))}

          {missing.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="hud-label" style={{ marginBottom: 6 }}>MISSING FROM YOUR HAND</div>
              {missing.map((catName) => (
                <div key={catName} className="muted small">{catName}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
