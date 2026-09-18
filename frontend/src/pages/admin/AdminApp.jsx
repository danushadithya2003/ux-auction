import { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import AuctionSummary from "../../components/AuctionSummary";
import TimerRing from "../../components/TimerRing";
import SoldPopup from "../../components/SoldPopup";
import BroadcastBar from "../../layout/BroadcastBar";
import { computePhase, computeLotCounter } from "../../layout/ParticipantLayout";
import { colorForPlayer } from "../../theme/playerColors";
import { clearAdminSession } from "../../api/store";
import "../../components/components.css";
import "./admin.css";

export default function AdminApp() {
  const { state, act, soldFlash } = useAdmin();
  const [confirmState, setConfirmState] = useState(null);
  const askConfirm = (opts, onConfirm) => setConfirmState({ ...opts, onConfirm });

  if (!state) return <p className="muted" style={{ padding: 40 }}>Loading…</p>;

  if (state.role === "summary") {
    return (
      <AuctionSummary
        summary={state}
        viewerRole="admin"
        onBackToStart={() => {
          clearAdminSession();
          location.reload();
        }}
      />
    );
  }

  return (
    <div className="app-frame">
      <BroadcastBar mode="admin" phase={computePhase(state)} code={state.code} lotCounter={computeLotCounter(state)} />
      <div className="admin-shell">
        {state.status === "LOBBY" && <Lobby state={state} act={act} />}
        {state.status === "PLANNING" && <Planning state={state} act={act} />}
        {(state.status === "LIVE" || state.status === "PAUSED") && (
          <LiveDashboard state={state} act={act} soldFlash={soldFlash} askConfirm={askConfirm} />
        )}
      </div>
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(null)} />
    </div>
  );
}

function ConfirmModal({ state, onClose }) {
  if (!state) return null;
  return (
    <div className="sold-backdrop" style={{ background: "rgba(4,5,9,.8)" }} onClick={onClose}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        {state.kicker && <div className="confirm-kicker">{state.kicker}</div>}
        <div className="confirm-message">{state.title}</div>
        {state.body && <p className="confirm-body">{state.body}</p>}
        <div className="confirm-actions">
          <button
            className={state.dangerous ? "btn btn-danger-solid" : "btn btn-primary"}
            onClick={() => {
              state.onConfirm();
              onClose();
            }}
          >
            {state.confirmLabel || "Confirm"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>
            {state.cancelLabel || "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function askEndAuction(askConfirm, act) {
  askConfirm(
    {
      kicker: "CONFIRM",
      title: "End the auction now?",
      body: "Bidding stops for all players and everyone is sent to the summary. Unsold lots stay unsold. This cannot be undone.",
      confirmLabel: "END AUCTION",
      cancelLabel: "KEEP GOING",
      dangerous: true,
    },
    () => act("end_auction")
  );
}

function askReset(askConfirm, act) {
  askConfirm(
    {
      kicker: "CONFIRM",
      title: "Reset and discard this auction?",
      body: "Every bid, sale and joined player is wiped. This cannot be undone.",
      confirmLabel: "RESET",
      cancelLabel: "KEEP GOING",
      dangerous: true,
    },
    () => act("reset_auction")
  );
}

/* ---------- Lobby ---------- */

function Lobby({ state, act }) {
  const seatCount = Math.max(4, Math.ceil(state.participants.length / 4) * 4);
  const seats = Array.from({ length: seatCount }, (_, i) => state.participants[i] || null);

  return (
    <div className="admin-grid">
      <div className="admin-main">
        <div className="phase-marker">PHASE 01</div>
        <h1 className="admin-phase-title">Lobby</h1>
        <p className="admin-phase-sub">Share the invite code below — the auction starts once everyone has taken a seat.</p>

        <div className="invite-plate">
          <div className="invite-plate-info">
            <div className="invite-plate-label">INVITE CODE</div>
            <div className="invite-plate-code">{state.code}</div>
          </div>
          <button className="invite-plate-copy" onClick={() => navigator.clipboard?.writeText(state.code)}>COPY</button>
        </div>

        <div className="joined-count">
          <span className="joined-count-num">{state.participants.length}</span>
          <span className="joined-count-label">JOINED SO FAR</span>
        </div>

        <div className="seat-grid">
          {seats.map((p, i) =>
            p ? (
              <div className="seat seat-filled" key={p.id}>
                <span className="seat-avatar" style={{ background: colorForPlayer(p.id, state.participants) }}>{p.name.charAt(0).toUpperCase()}</span>
                <div className="seat-name">{p.name}</div>
                <div className="seat-tag">READY &middot; 100c</div>
              </div>
            ) : (
              <div className="seat seat-empty" key={`empty-${i}`}>
                <span className="seat-avatar">&mdash;</span>
                <div className="seat-tag">EMPTY SEAT<br />WAITING</div>
              </div>
            )
          )}
        </div>

        <div className="admin-action-row">
          <button className="btn btn-primary" disabled={state.participants.length === 0} onClick={() => act("start_planning")}>
            START AUCTION &rarr;
          </button>
          {state.participants.length === 0 && <span className="admin-action-hint">Waiting for at least one player.</span>}
        </div>
      </div>

      <div className="admin-side">
        <div className="admin-rail-steps">
          <div className="hud-label" style={{ marginBottom: 10 }}>HOW PLAYERS JOIN</div>
          <div className="admin-rail-step"><span className="admin-rail-step-num">1</span> Open the site and choose "Join as Player."</div>
          <div className="admin-rail-step"><span className="admin-rail-step-num">2</span> Enter the invite code and a display name.</div>
          <div className="admin-rail-step"><span className="admin-rail-step-num">3</span> 100 coins are issued and they wait here with you.</div>
        </div>
        <div className="admin-spec-list">
          <div className="hud-label" style={{ marginBottom: 4 }}>THIS AUCTION</div>
          <div className="admin-spec-row"><span>Categories</span><strong>5</strong></div>
          <div className="admin-spec-row"><span>Lots</span><strong>50</strong></div>
          <div className="admin-spec-row"><span>Purse each</span><strong>100c</strong></div>
          <div className="admin-spec-row"><span>Bid window</span><strong>15s</strong></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Planning ---------- */

function Planning({ state, act }) {
  const firstCategory = state.categories[0];
  const firstItem = firstCategory?.items[0];

  return (
    <div className="admin-grid">
      <div className="admin-main">
        <div className="phase-marker phase-marker-cyan">PHASE 02</div>
        <h1 className="admin-phase-title">Planning phase</h1>
        <p className="admin-phase-sub">Participants are browsing the items. Nothing is on the block yet.</p>

        <div className="hud-label" style={{ marginBottom: 10 }}>IN THE ROOM</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
          {state.participants.map((p) => (
            <span key={p.id} className="badge" style={{ borderColor: "var(--border-strong)" }}>{p.name}</span>
          ))}
        </div>

        <div className="category-strip">
          {state.categories.map((c, i) => {
            const min = Math.min(...c.items.map((it) => it.startingPrice));
            return (
              <div className="category-strip-cell" key={c.id}>
                <div className="category-strip-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="category-strip-name">{c.name}</div>
                <div className="category-strip-count">{c.items.length}</div>
                <div className="category-strip-note">LOTS &middot; FROM {min}c</div>
              </div>
            );
          })}
        </div>

        <div className="admin-action-row">
          <button className="btn btn-primary" onClick={() => act("begin_bidding")}>BEGIN BIDDING &rarr;</button>
          {firstItem && <span className="admin-action-hint">First lot: {firstItem.name} &middot; opens at {firstItem.startingPrice}c</span>}
        </div>
      </div>

      <div className="admin-side">
        <div className="rail-panel-header">
          <span>{String(1).padStart(2, "0")} {firstCategory?.name} &middot; RUNNING ORDER</span>
        </div>
        {firstCategory?.items.map((it, i) => (
          <div className="running-order-rail-row" key={it.id}>
            <span className="running-order-rail-idx">{String(i + 1).padStart(2, "0")}</span>
            <span className="running-order-rail-name">{it.name}</span>
            <span className="running-order-rail-price">{it.startingPrice}c</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Live console ---------- */

function LiveDashboard({ state, act, soldFlash, askConfirm }) {
  return (
    <div style={{ position: "relative" }}>
      <div className="admin-grid">
        <div className="admin-main">
          <div className="item-stage">
            <SoldPopup flash={soldFlash} kicker="SALE CONFIRMED" />
            {state.currentItem ? (
              <CurrentItemAdmin state={state} act={act} />
            ) : state.allCategoriesClosed ? (
              <div className="banner banner-success">
                <h4>All categories are complete.</h4>
                <button className="btn btn-primary" onClick={() => askEndAuction(askConfirm, act)}>
                  End Auction
                </button>
              </div>
            ) : (
              <CategoryCloseArea state={state} act={act} />
            )}
          </div>

          {state.missingGrantSuggestions.length > 0 && <MissingGrantSuggestions state={state} act={act} />}

          <div className="control-row">
            {state.status === "LIVE" ? (
              <button className="btn btn-outline" onClick={() => act("pause")}>PAUSE</button>
            ) : (
              <button className="btn btn-primary" onClick={() => act("resume")}>RESUME BIDDING</button>
            )}
            <button className="btn btn-danger" onClick={() => askEndAuction(askConfirm, act)}>END AUCTION</button>
            <button className="btn btn-text" onClick={() => askReset(askConfirm, act)}>RESET</button>
            <span className="control-row-spacer">
              {state.currentCategoryName ? `${state.currentCategoryName.toUpperCase()} · ${categoryProgress(state)}` : ""}
            </span>
          </div>
        </div>
        <div className="admin-side">
          <PlayerRail state={state} />
        </div>
      </div>

      {state.status === "PAUSED" && <PausedOverlay act={act} askConfirm={askConfirm} />}
    </div>
  );
}

function categoryProgress(state) {
  const cat = state.categories.find((c) => c.id === state.currentCategoryId);
  if (!cat) return "";
  const settled = cat.items.filter((it) => it.status === "SOLD" || it.status === "UNSOLD_PENDING_REOFFER").length;
  return `${settled} SETTLED · ${cat.items.length - settled} LEFT`;
}

function PausedOverlay({ act, askConfirm }) {
  return (
    <div className="paused-overlay">
      <div className="paused-panel">
        <div className="paused-kicker">AUCTION PAUSED</div>
        <h2 className="paused-title">Hold on the floor</h2>
        <p className="paused-body">Bidding is frozen for everyone. The current bid and remaining time on this lot are preserved exactly as they were.</p>
        <div className="paused-actions">
          <button className="btn btn-primary" onClick={() => act("resume")}>RESUME BIDDING</button>
          <button className="btn btn-danger" onClick={() => askEndAuction(askConfirm, act)}>END AUCTION</button>
        </div>
      </div>
    </div>
  );
}

function CurrentItemAdmin({ state, act }) {
  const item = state.currentItem;
  const canConfirm = !!item.currentBidderName;

  const allItems = state.categories.flatMap((c) => c.items);
  const total = allItems.length;
  const resolved = allItems.filter((it) => it.status === "SOLD" || it.status === "UNSOLD_PENDING_REOFFER").length;

  return (
    <div>
      <div className="stage-meta-row">
        <span className="stage-category-label">CATEGORY &middot; {state.currentCategoryName}</span>
        <span className="stage-rule" />
        <span className="badge" style={{ borderColor: "rgba(61,220,132,.4)", color: "var(--green)" }}>{item.tier?.toUpperCase()} SIGNAL</span>
        <span className="stage-lot-counter">LOT {Math.min(resolved + 1, total)} / {total}</span>
      </div>
      <h1 className="item-hero-name">{item.name}</h1>
      <p className="item-hero-desc">{item.description}</p>

      <div className="metrics-band">
        <div>
          <div className="stat-label">CURRENT BID</div>
          <div className="stat-value stat-value-accent" style={{ fontSize: 86 }}>{item.currentBid != null ? `${item.currentBid}` : `${item.startingPrice}`}<span className="stat-value-suffix">c</span></div>
        </div>
        <div>
          <div className="stat-label">HIGHEST BIDDER</div>
          {item.currentBidderName ? (
            <div className="leading-bidder-chip">
              <span className="leading-bidder-avatar">{item.currentBidderName.charAt(0).toUpperCase()}</span>
              <span className="stat-value-sm">{item.currentBidderName}</span>
            </div>
          ) : (
            <div className="stat-value-sm muted">No bids yet</div>
          )}
        </div>
        {item.status === "BIDDING" && (
          <div className="timer-slot">
            <TimerRing expiresAt={item.biddingExpiresAt} size={86} />
          </div>
        )}
      </div>

      <div className="settle-block">
        <div className="settle-label">SETTLE THIS LOT</div>
        <div className="settle-row">
          <button className="confirm-sale-btn" disabled={!canConfirm} onClick={() => act("confirm_sale")}>
            {canConfirm ? `CONFIRM SALE TO ${item.currentBidderName.toUpperCase()}` : "CONFIRM SALE"}
            <span className="confirm-sale-hint">{canConfirm ? `${item.currentBid}c` : "NO BIDS YET"}</span>
          </button>
          <button className="skip-btn" onClick={() => act("skip_item")}>SKIP / NO SALE</button>
        </div>
      </div>
    </div>
  );
}

function PlayerRail({ state }) {
  const sorted = [...state.participants].sort((a, b) => b.balance - a.balance);
  const leaderName = state.currentItem?.currentBidderName;
  const settled = [];
  for (const c of state.categories) {
    for (const it of c.items) {
      if (it.status === "SOLD") settled.push({ name: it.name, winner: it.soldToName, price: it.soldPrice });
      else if (it.status === "UNSOLD_PENDING_REOFFER") settled.push({ name: it.name, winner: null, price: null });
    }
  }
  const lastSettled = settled.slice(-3).reverse();

  return (
    <div>
      <div className="admin-players-header">
        <span>PLAYERS</span>
        <span>BAL &middot; LOTS &middot; CATS</span>
      </div>
      {sorted.map((p) => {
        const isLeader = p.name === leaderName;
        return (
          <div key={p.id} className={`admin-player-row${isLeader ? " admin-player-row-leader" : ""}`}>
            <span className="admin-player-avatar" style={{ background: colorForPlayer(p.id, state.participants) }}>{p.name.charAt(0).toUpperCase()}</span>
            <div className="admin-player-body">
              <div className="admin-player-name">{p.name}</div>
              <div className={`admin-player-tag${isLeader ? " admin-player-tag-gold" : ""}`}>
                {isLeader ? "HIGHEST BIDDER" : p.itemCount > 0 ? "IN PLAY" : "NO LOTS YET"}
                {!p.connected && " · OFFLINE"}
              </div>
            </div>
            <span className="admin-player-balance">{p.balance}c</span>
            <span className="admin-player-cats">{p.itemCount}</span>
            <span className={`admin-player-cats ${p.categoriesSecured >= 1 ? "admin-player-cats-ok" : "admin-player-cats-bad"}`}>{p.categoriesSecured}/{p.totalCategories}</span>
          </div>
        );
      })}

      {lastSettled.length > 0 && (
        <div className="last-settled">
          <div className="last-settled-label">LAST SETTLED</div>
          {lastSettled.map((s, i) => (
            <div className="last-settled-row" key={i}>
              <span>{s.name}</span>
              <strong>{s.winner ? `${s.winner} · ${s.price}c` : "PASSED"}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCloseArea({ state, act }) {
  const missing = state.missingForCurrentCategory;
  const exempt = state.exemptForCurrentCategory || [];
  const currentCat = state.categories.find((c) => c.id === state.currentCategoryId);
  const available = currentCat ? currentCat.items.filter((it) => it.status === "UNUSED" || it.status === "UNSOLD_PENDING_REOFFER") : [];
  const reofferables = currentCat ? currentCat.items.filter((it) => it.status === "UNSOLD_PENDING_REOFFER") : [];

  return (
    <div>
      {missing.length ? (
        <div className="banner banner-warning">
          <h4>Still needed before this category can close: {missing.join(", ")}</h4>
          <GrantForm state={state} available={available} missingNames={missing} act={act} />
        </div>
      ) : (
        <div className="banner banner-success">
          <h4>{exempt.length ? "Everyone has an item — or nothing was left to give them." : "Everyone has an item from this category."}</h4>
          {exempt.length > 0 && <p className="muted small">Exempt (no lots remained to grant): {exempt.join(", ")}</p>}
          <button className="btn btn-success" onClick={() => act("close_category")}>CLOSE CATEGORY &rarr;</button>
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
      <select className="grant-select" value={participantId || eligible[0]?.id} onChange={(e) => setParticipantId(e.target.value)}>
        {eligible.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select className="grant-select" value={itemId || available[0]?.id} onChange={(e) => setItemId(e.target.value)}>
        {available.map((it) => (
          <option key={it.id} value={it.id}>{it.name} ({it.startingPrice}c)</option>
        ))}
      </select>
      <input className="price-input" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button
        className="btn btn-primary"
        onClick={() => act("direct_grant", { participantId: participantId || eligible[0]?.id, itemId: itemId || available[0]?.id, price: Number(price) })}
      >
        GRANT
      </button>
    </div>
  );
}

function ReofferList({ reofferables, act }) {
  return (
    <div className="reoffer-list">
      <h4>UNSOLD — RE-OFFER AT A NEW PRICE</h4>
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
      <input className="price-input" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button className="btn btn-outline" onClick={() => act("reoffer_item", { itemId: item.id, price: Number(price) })}>
        RE-OFFER
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
