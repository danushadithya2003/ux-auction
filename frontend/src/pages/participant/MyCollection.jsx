import { useNavigate } from "react-router-dom";
import { useParticipant } from "../../context/ParticipantContext";

const STARTING_BUDGET = 100;

export default function MyCollection() {
  const { state } = useParticipant();
  const navigate = useNavigate();

  const byCategory = {};
  for (const it of state.collection) {
    (byCategory[it.categoryName] = byCategory[it.categoryName] || []).push(it);
  }

  const spent = STARTING_BUDGET - state.balance;
  const lotsWon = state.collection.length;
  const avgPerLot = lotsWon ? Math.round(spent / lotsWon) : 0;

  return (
    <div className="collection-shell">
      <div>
        <h2 style={{ fontSize: 44, marginBottom: 4 }}>My Collection</h2>
        <p className="muted" style={{ marginBottom: 18 }}>Everything you've acquired so far, grouped by category.</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {state.categoriesProgress.map((c, i) => (
            <span key={c.id} className={`collection-chip${c.secured ? " collection-chip-held" : ""}`}>
              {String(i + 1).padStart(2, "0")} {c.name} &middot; {c.secured ? "HELD" : "OPEN"}
            </span>
          ))}
        </div>

        {state.collection.length === 0 ? (
          <div className="collection-empty">
            Nothing yet.<br />Win a lot on the live stage and it lands here.
          </div>
        ) : (
          Object.entries(byCategory).map(([catName, items]) => (
            <div key={catName} style={{ marginBottom: 20 }}>
              <div className="hand-group-label hand-group-label-filled" style={{ marginTop: 0 }}>{catName.toUpperCase()}</div>
              {items.map((it, i) => (
                <div className="collection-row" key={i}>
                  <span className="collection-badge">&#10003;</span>
                  <div className="collection-row-body">
                    <div className="collection-row-name">{it.name}</div>
                    <div className="collection-row-desc">{it.description}</div>
                  </div>
                  <span className="collection-row-price">{it.price}c</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div>
        <div className="hud-label">BALANCE LEFT</div>
        <div className="hud-value" style={{ fontSize: 66, margin: "6px 0" }}>{state.balance}c</div>
        <div className="purse-track" style={{ marginBottom: 8 }}>
          <div className="purse-fill" style={{ width: `${Math.max(0, Math.min(100, (state.balance / STARTING_BUDGET) * 100))}%` }} />
        </div>
        <p className="muted small">of {STARTING_BUDGET}c &middot; {state.reserveFloor}c reserved</p>

        <div className="spend-block">
          <div className="spend-row"><span>Lots won</span><strong>{lotsWon}</strong></div>
          <div className="spend-row"><span>Spent</span><strong>{spent}c</strong></div>
          <div className="spend-row"><span>Average per lot</span><strong>{avgPerLot}c</strong></div>
        </div>

        <button className="btn btn-outline" style={{ width: "100%", marginTop: 20 }} onClick={() => navigate("/play/live")}>
          BACK TO THE STAGE
        </button>
      </div>
    </div>
  );
}
