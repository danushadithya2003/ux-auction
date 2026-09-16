import { Link } from "react-router-dom";
import useAnimatedNumber from "../hooks/useAnimatedNumber";
import "./components.css";

const STARTING_BUDGET = 100;

export default function BudgetAndCollectionStrip({ state }) {
  const balance = useAnimatedNumber(state.balance);
  const items = state.collection;
  const players = [...state.players].sort((a, b) => b.balance - a.balance);

  return (
    <div className="bottom-strip">
      <div className="strip-block">
        <div className="strip-block-head">
          <h4>My Budget</h4>
        </div>
        <div className="hud-value hud-value-accent">{balance}c</div>
        <div className="budget-track">
          <div className="budget-fill" style={{ width: `${Math.max(0, Math.min(100, (state.balance / STARTING_BUDGET) * 100))}%` }} />
        </div>
      </div>

      <div className="strip-block">
        <div className="strip-block-head">
          <h4>My Collection ({items.length})</h4>
          <Link to="/play/collection" className="small">
            View all →
          </Link>
        </div>
        {items.length ? (
          <div className="collection-mini-row">
            {items.slice(0, 4).map((it, i) => (
              <div className="collection-mini-item" key={i}>
                <strong>{it.name}</strong>
                <span>{it.price}c</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="collection-mini-empty">Nothing yet — {state.categoriesProgress.filter((c) => !c.secured).length} categories to go.</p>
        )}
      </div>

      <div className="strip-block">
        <div className="strip-block-head">
          <h4>Players</h4>
        </div>
        <div className="players-mini-list">
          {players.map((p) => (
            <div key={p.id} className={`players-mini-row${p.isMe ? " is-me" : ""}${p.connected ? "" : " offline"}`}>
              <span>{p.isMe ? "You" : p.name}</span>
              <span className="players-mini-balance">{p.balance}c</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
