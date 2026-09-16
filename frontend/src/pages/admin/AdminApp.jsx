import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import AuctionSummary from "../../components/AuctionSummary";
import TimerRing from "../../components/TimerRing";
import CategoryIllustration from "../../components/CategoryIllustration";
import { colorForCategory } from "../../theme/categories";
import { clearAdminSession } from "../../api/store";
import "../../components/components.css";
import "./admin.css";

export default function AdminApp() {
  const { state, act } = useAdmin();
  if (!state) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;

  if (state.role === "summary") {
    return (
      <div>
        <AuctionSummary summary={state} />
        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              clearAdminSession();
              location.reload();
            }}
          >
            Create New Auction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminTopbar state={state} />
      {state.status === "LOBBY" && <WaitingPanel title="Lobby" state={state} onGo={() => act("start_planning")} goLabel="Start Auction →" />}
      {state.status === "PLANNING" && (
        <WaitingPanel title="Planning phase" subtitle="Participants are browsing the items." state={state} onGo={() => act("begin_bidding")} goLabel="Begin Bidding →" />
      )}
      {(state.status === "LIVE" || state.status === "PAUSED") && <LiveDashboard state={state} act={act} />}
    </div>
  );
}

function AdminTopbar({ state }) {
  return (
    <header className="admin-topbar">
      <div className="topbar-logo">
        <span className="topbar-logo-mark">UX</span> <span className="topbar-logo-script">Auction</span>
        <div className="topbar-tagline">Auctioneer console</div>
      </div>
      <span className="badge badge-status">{state.status}</span>
    </header>
  );
}

function WaitingPanel({ title, subtitle, state, onGo, goLabel }) {
  return (
    <div className="card center-panel admin-waiting">
      <div className="room-code" style={{ margin: "0 auto 18px", cursor: "default" }}>
        <span className="faint small">Invite code</span> <strong>{state.code}</strong>
      </div>
      <h2>{title}</h2>
      {subtitle && <p className="muted">{subtitle}</p>}
      <p className="muted">{state.participants.length} joined so far</p>
      <div className="name-pills">
        {state.participants.map((p) => (
          <span key={p.id} className="name-pill">
            {p.name}
          </span>
        ))}
      </div>
      <button className="btn btn-primary" onClick={onGo}>
        {goLabel}
      </button>
    </div>
  );
}

function LiveDashboard({ state, act }) {
  return (
    <div className="admin-grid">
      <div className="admin-main">
        {state.currentItem ? (
          <CurrentItemAdmin state={state} act={act} />
        ) : state.allCategoriesClosed ? (
          <div className="banner banner-success">
            <p>All categories are complete.</p>
            <button className="btn btn-primary" onClick={() => confirmThen("End the auction for everyone?", () => act("end_auction"))}>
              End Auction
            </button>
          </div>
        ) : (
          <CategoryCloseArea state={state} act={act} />
        )}

        {state.missingGrantSuggestions.length > 0 && <MissingGrantSuggestions state={state} act={act} />}

        <div className="control-row">
          {state.status === "LIVE" ? (
            <button className="btn btn-outline" onClick={() => act("pause")}>
              Pause
            </button>
          ) : (
            <button className="btn btn-outline" onClick={() => act("resume")}>
              Resume
            </button>
          )}
          <button className="btn btn-danger" onClick={() => confirmThen("End the auction now?", () => act("end_auction"))}>
            End Auction
          </button>
          <button className="btn btn-text" onClick={() => confirmThen("Reset and discard this auction entirely?", () => act("reset_auction"))}>
            Reset
          </button>
        </div>
      </div>
      <div className="admin-side">
        <PlayerTable state={state} />
      </div>
    </div>
  );
}

function CurrentItemAdmin({ state, act }) {
  const item = state.currentItem;
  const catIndex = state.categories.findIndex((c) => c.id === state.currentCategoryId);
  const theme = colorForCategory(state.currentCategoryId, state.categories);
  const canConfirm = !!item.currentBidderName;

  return (
    <div className="item-card">
      <div className="item-card-top">
        <span className="item-card-tag" style={{ background: theme.soft, color: theme.accent }}>
          {state.currentCategoryName}
        </span>
        <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent-deep)" }}>
          {item.tier}
        </span>
      </div>
      <h2 className="item-card-name">{item.name}</h2>
      <p className="item-card-desc">{item.description}</p>
      <div className="item-card-body">
        <CategoryIllustration index={catIndex} categoryName={state.currentCategoryName} />
        <div>
          <div className="item-card-stats">
            <div>
              <div className="stat-label">Current Bid</div>
              <div className="stat-value">{item.currentBid != null ? `${item.currentBid}c` : `${item.startingPrice}c start`}</div>
            </div>
            <div>
              <div className="stat-label">Highest Bidder</div>
              <div className="stat-value-sm">{item.currentBidderName || "—"}</div>
            </div>
            {item.status === "BIDDING" && (
              <div>
                <div className="stat-label">Time Left</div>
                <TimerRing secondsRemaining={item.timeRemaining} size={40} />
              </div>
            )}
          </div>
          <div className="admin-action-row">
            <button className="btn btn-success" disabled={!canConfirm} onClick={() => act("confirm_sale")}>
              {canConfirm ? `Confirm Sale to ${item.currentBidderName}` : "Confirm Sale"}
            </button>
            <button className="btn btn-danger" onClick={() => act("skip_item")}>
              Skip / No Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCloseArea({ state, act }) {
  const missing = state.missingForCurrentCategory;
  const currentCat = state.categories.find((c) => c.id === state.currentCategoryId);
  const available = currentCat ? currentCat.items.filter((it) => it.status === "UNUSED" || it.status === "UNSOLD_PENDING_REOFFER") : [];
  const reofferables = currentCat ? currentCat.items.filter((it) => it.status === "UNSOLD_PENDING_REOFFER") : [];

  return (
    <div>
      {missing.length ? (
        <div className="banner banner-warning">
          <p>Still needed before this category can close: {missing.join(", ")}</p>
          <GrantForm state={state} available={available} missingNames={missing} act={act} />
        </div>
      ) : (
        <div className="banner banner-success">
          <p>Everyone has an item from this category.</p>
          <button className="btn btn-primary" onClick={() => act("close_category")}>
            Close Category →
          </button>
        </div>
      )}
      {reofferables.length > 0 && <ReofferList reofferables={reofferables} act={act} />}
    </div>
  );
}

function GrantForm({ state, available, missingNames, act }) {
  const [participantId, setParticipantId] = useState("");
  const [itemId, setItemId] = useState("");
  const [price, setPrice] = useState(1);

  if (!available.length) return <p className="muted small">No items left in this category to grant — those participants will be exempt.</p>;

  const eligible = state.participants.filter((p) => missingNames.includes(p.name));

  return (
    <div className="grant-form">
      <select className="input" value={participantId || eligible[0]?.id} onChange={(e) => setParticipantId(e.target.value)}>
        {eligible.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select className="input" value={itemId || available[0]?.id} onChange={(e) => setItemId(e.target.value)}>
        {available.map((it) => (
          <option key={it.id} value={it.id}>
            {it.name} ({it.startingPrice}c)
          </option>
        ))}
      </select>
      <input className="input price-input" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button
        className="btn btn-primary"
        onClick={() => act("direct_grant", { participantId: participantId || eligible[0]?.id, itemId: itemId || available[0]?.id, price: Number(price) })}
      >
        Grant
      </button>
    </div>
  );
}

function ReofferList({ reofferables, act }) {
  return (
    <div className="card reoffer-list">
      <h4>Unsold — re-offer at a new price</h4>
      {reofferables.map((it) => (
        <ReofferRow key={it.id} item={it} act={act} />
      ))}
    </div>
  );
}

function ReofferRow({ item, act }) {
  const [price, setPrice] = useState(item.startingPrice);
  return (
    <div className="reoffer-row">
      <span>{item.name}</span>
      <input className="input price-input" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button className="btn btn-outline" onClick={() => act("reoffer_item", { itemId: item.id, price: Number(price) })}>
        Re-offer
      </button>
    </div>
  );
}

function MissingGrantSuggestions({ state, act }) {
  return (
    <div className="banner banner-info">
      <h4>Late joiners missing an already-closed category</h4>
      {state.missingGrantSuggestions.map((s, i) => (
        <div className="suggestion-row" key={i}>
          <span>
            {s.participantName} needs "{s.categoryName}"
            {s.suggestedItemId ? ` — suggested: ${s.suggestedItemName} (${s.suggestedPrice}c)` : " — nothing left to give, exempt."}
          </span>
          {s.suggestedItemId && (
            <button className="btn btn-outline" onClick={() => act("direct_grant", { participantId: s.participantId, itemId: s.suggestedItemId, price: s.suggestedPrice })}>
              Grant
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function PlayerTable({ state }) {
  return (
    <div className="card player-table">
      <h3>Players</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance</th>
            <th>Items</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          {state.participants.map((p) => (
            <tr key={p.id} className={p.connected ? "" : "disconnected"}>
              <td>{p.name}</td>
              <td>{p.balance}c</td>
              <td>{p.itemCount}</td>
              <td>
                {p.categoriesSecured}/{p.totalCategories}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function confirmThen(message, fn) {
  if (window.confirm(message)) fn();
}
