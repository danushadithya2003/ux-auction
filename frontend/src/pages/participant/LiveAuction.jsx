import { useParticipant } from "../../context/ParticipantContext";
import { Link } from "react-router-dom";
import TimerRing from "../../components/TimerRing";
import SoldPopup from "../../components/SoldPopup";
import BidControl from "../../components/BidControl";
import ParticipantWaiting from "./ParticipantWaiting";
import useAnimatedNumber from "../../hooks/useAnimatedNumber";
import { colorForPlayer } from "../../theme/playerColors";
import "../../components/components.css";

export default function LiveAuction() {
  const { state, bid, soldFlash } = useParticipant();

  if (state.status === "LOBBY" || state.status === "PLANNING") {
    return <ParticipantWaiting state={state} />;
  }

  if (state.status === "PAUSED") {
    return <ParticipantPaused state={state} />;
  }

  return (
    <div>
      <SoldPopup flash={soldFlash} kicker="HAMMER DOWN" />
      {state.currentItem ? (
        <StageAndScorebug state={state} bid={bid} />
      ) : state.allCategoriesClosed ? (
        <div className="banner banner-success">
          <h4>All categories are complete.</h4>
          <p className="muted">Waiting for the Auctioneer to end the auction.</p>
        </div>
      ) : (
        <div className="banner">Waiting for the next item&hellip;</div>
      )}
    </div>
  );
}

function ParticipantPaused({ state }) {
  return (
    <div className="paused-participant-shell">
      <div className="paused-participant-kicker">THE FLOOR IS ON HOLD</div>
      <h1 className="paused-participant-title">Bidding paused</h1>
      <p className="paused-participant-body">The auctioneer has stepped away. Your balance and the lot on the block are held exactly as they are.</p>
      <div className="paused-band">
        <div className="paused-band-cell">
          <div className="hud-label">LOT ON THE BLOCK</div>
          <div className="paused-band-value">{state.currentItem?.name || "—"}</div>
        </div>
        <div className="paused-band-cell">
          <div className="hud-label">HELD AT</div>
          <div className="paused-band-value paused-band-value-gold">{state.currentItem?.currentBid != null ? `${state.currentItem.currentBid}c` : "—"}</div>
        </div>
        <div className="paused-band-cell">
          <div className="hud-label">YOUR BALANCE</div>
          <div className="paused-band-value">{state.balance}c</div>
        </div>
      </div>
    </div>
  );
}

function StageAndScorebug({ state, bid }) {
  const item = state.currentItem;
  const animatedBid = useAnimatedNumber(item.currentBid ?? item.startingPrice);
  const animatedBalance = useAnimatedNumber(state.balance);

  const allItems = state.categories.flatMap((c) => c.items);
  const total = allItems.length;
  const resolved = allItems.filter((it) => it.status === "SOLD" || it.status === "UNSOLD_PENDING_REOFFER").length;
  const lotNum = Math.min(resolved + 1, total);

  const categoryIndex = state.categories.findIndex((c) => c.status === "OPEN");
  const currentCategory = categoryIndex >= 0 ? state.categories[categoryIndex] : null;
  const categoryNum = String(categoryIndex >= 0 ? categoryIndex + 1 : 1).padStart(2, "0");
  const runningOrder = currentCategory?.items || [];

  const reserveCategoriesLeft = state.categoriesProgress.filter((c) => !c.secured && c.name !== state.currentCategoryName).length;

  const standings = [...state.players].sort((a, b) => b.balance - a.balance);

  return (
    <div>
      <div className="stage-row">
        <div className="stage-main">
          <span className="stage-ghost-numeral">{categoryNum}</span>
          <div className="stage-content">
            <div className="stage-meta-row">
              <span className="stage-category-label">CATEGORY &middot; {state.currentCategoryName}</span>
              <span className="stage-rule" />
              <span className="stage-lot-counter">LOT {lotNum} / {total}</span>
            </div>
            <h1 className="item-hero-name">{item.name}</h1>
            <p className="item-hero-desc">{item.description}</p>

            <div className="stage-bottom">
              <div>
                <div className="stat-label">CURRENT BID</div>
                <div className="stat-value stat-value-accent">
                  {item.currentBid != null ? animatedBid : item.startingPrice}
                  <span className="stat-value-suffix">c</span>
                </div>
              </div>
              <div>
                <div className="stat-label">LEADING BIDDER</div>
                {item.currentBidderName ? (
                  <div className={`leading-bidder-chip${item.isMine ? " leading-bidder-chip-mine" : ""}`}>
                    <span className="leading-bidder-avatar">{item.currentBidderName.charAt(0).toUpperCase()}</span>
                    <span className="stat-value-sm">{item.currentBidderName}</span>
                  </div>
                ) : (
                  <div className="stat-value-sm muted">No bids yet</div>
                )}
              </div>
              {item.status === "BIDDING" && (
                <div className="timer-slot">
                  <TimerRing expiresAt={item.biddingExpiresAt} size={72} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stage-rail">
          <div className="rail-panel" style={{ flex: "1 1 55%" }}>
            <div className="rail-panel-header">
              <span>{categoryNum} {state.currentCategoryName} &middot; RUNNING ORDER</span>
              <span>{runningOrder.length} LOTS</span>
            </div>
            <div className="running-order-list">
              {runningOrder.map((it) => (
                <RunningOrderRow key={it.id} item={it} currentItem={item} />
              ))}
            </div>
          </div>

          <div className="rail-panel" style={{ flex: "1 1 35%" }}>
            <div className="rail-panel-header">
              <span>THIS LOT &middot; BID FEED</span>
            </div>
            <div className="bid-feed-list">
              {(item.bidFeed || []).map((entry, i) => (
                <BidFeedRow key={i} entry={entry} players={state.players} />
              ))}
            </div>
          </div>

          <div className="rail-footer-strip">
            <span className="rail-footer-strip-label">MY COLLECTION ({state.collection.length})</span>
            <Link to="/play/collection" className="small">VIEW ALL &rarr;</Link>
          </div>
        </div>
      </div>

      <div className="scorebug">
        <div className="scorebug-col scorebug-col-left">
          <div className="scorebug-balance-label">MY BALANCE / 100c</div>
          <div className={`scorebug-balance-value${state.balance < 40 ? " scorebug-balance-value-low" : ""}`}>{animatedBalance}c</div>
          <div className="purse-track">
            <div className="purse-fill" style={{ width: `${Math.max(0, Math.min(100, state.balance))}%` }} />
          </div>
          <div className="reserve-note">{reserveCategoriesLeft} categories to cover &middot; {state.reserveFloor}c reserved</div>
        </div>

        <div className="scorebug-col scorebug-col-center">
          {item.status === "PENDING_CONFIRM" ? (
            <p className="muted">Going once&hellip; waiting for the Auctioneer to confirm.</p>
          ) : item.isMine ? (
            <p className="highest-mine">You're leading &mdash; hold your nerve.</p>
          ) : item.status === "BIDDING" ? (
            <BidControl item={item} bid={bid} />
          ) : null}
        </div>

        <div className="scorebug-col scorebug-col-right">
          <div className="standings-header">STANDINGS &middot; PURSE</div>
          {standings.map((p, i) => (
            <div key={p.id} className="standing-row">
              <span className="standing-rank">{i + 1}</span>
              <span className="standing-swatch" style={{ background: colorForPlayer(p.id, state.players) }} />
              <span className={`standing-name${p.name === item.currentBidderName ? " standing-name-gold" : ""}`}>
                {p.isMe ? "You" : p.name}
              </span>
              <span className="standing-purse">{p.balance}c</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RunningOrderRow({ item, currentItem }) {
  const isCurrent = item.id === currentItem.id;
  const isMine = item.status === "SOLD" && currentItem.isMine && isCurrent;
  let status = "QUEUED";
  let markCls = "";
  let statusCls = "";
  let price = "—";

  if (isCurrent && item.status !== "SOLD" && item.status !== "UNSOLD_PENDING_REOFFER") {
    status = "LIVE";
    markCls = "running-order-mark-live";
    statusCls = "running-order-status-live";
    price = `${currentItem.currentBid ?? currentItem.startingPrice}c`;
  } else if (item.status === "SOLD") {
    if (item.soldToName === currentItem.currentBidderName && isCurrent) {
      status = "YOURS";
    } else {
      status = item.soldToName || "SOLD";
    }
    markCls = "running-order-mark-sold";
    statusCls = "running-order-status-sold";
    price = `${item.soldPrice}c`;
  } else if (item.status === "UNSOLD_PENDING_REOFFER") {
    status = "PASSED";
  } else {
    status = "QUEUED";
    price = `${item.startingPrice}c`;
  }

  return (
    <div className="running-order-row">
      <span className={`running-order-mark ${markCls}`} />
      <span className="running-order-name">{item.name}</span>
      <span className={`running-order-status ${statusCls}`}>{status}</span>
      <span className="running-order-price">{price}</span>
    </div>
  );
}

function BidFeedRow({ entry, players }) {
  const isOpen = entry.kind === "open";
  const player = players.find((p) => p.name === entry.name);
  const color = player ? colorForPlayer(player.id, players) : "#8c93a8";
  return (
    <div className="bid-feed-row">
      <span className="bid-feed-avatar" style={{ background: isOpen ? "#232b3d" : color }}>
        {isOpen ? "•" : entry.name.charAt(0).toUpperCase()}
      </span>
      <div className="bid-feed-body">
        <div className="bid-feed-name">{isOpen ? "Lot opened" : entry.name}{player?.isMe ? " (YOU)" : ""}</div>
        <div className="bid-feed-note">{isOpen ? "15s window" : "raised the bid"}</div>
      </div>
      <span className={`bid-feed-amount${player?.isMe ? " bid-feed-amount-mine" : ""}`}>{entry.amount}c</span>
    </div>
  );
}
