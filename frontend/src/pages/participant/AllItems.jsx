import { useState } from "react";
import { useParticipant } from "../../context/ParticipantContext";
import CategoryTabs from "../../components/CategoryTabs";
import "../../components/components.css";

export default function AllItems() {
  const { state } = useParticipant();
  const categories = state.categories;
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) || categories[0];

  return (
    <div>
      <h2 style={{ fontSize: 54, marginBottom: 4 }}>All Items</h2>
      <p className="muted" style={{ fontSize: 17, marginBottom: 20 }}>Browse every category — starting prices, and what's already sold.</p>

      <CategoryTabs categories={categories} activeId={active?.id} onSelect={setActiveId} />

      {active && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 0" }}>
          <span className="hud-label">IN THIS CATEGORY &middot; {active.items.length}</span>
        </div>
      )}

      {active && (
        <ul className="all-items-list">
          {active.items.map((it, i) => {
            const isLive = it.status === "BIDDING" || it.status === "PENDING_CONFIRM";
            const isMine = it.status === "SOLD" && it.soldToName === state.name;
            return (
              <li key={it.id} className={isLive ? "all-items-row-live" : ""} style={{ listStyle: "none" }}>
                <div className="all-items-row-item">
                  <span className="all-items-index">{String(i + 1).padStart(2, "0")}</span>
                  <div className="all-items-body">
                    <div className="all-items-name">{it.name}</div>
                    <div className="all-items-desc">{it.description}</div>
                  </div>
                  <span className={`all-items-status${isLive ? " all-items-status-live" : isMine ? " all-items-status-yours" : it.status === "SOLD" ? " all-items-status-sold" : ""}`}>
                    {isLive ? "ON THE BLOCK" : isMine ? "YOURS" : it.status === "SOLD" ? `SOLD · ${it.soldToName}` : it.status === "UNSOLD_PENDING_REOFFER" ? "PASSED" : `OPENS AT ${it.startingPrice}c`}
                  </span>
                  <span className={`all-items-price${isLive ? " all-items-price-live" : ""}`}>
                    {it.status === "UNSOLD_PENDING_REOFFER" ? "—" : it.status === "SOLD" ? `${it.soldPrice}c` : `${it.startingPrice}c`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
