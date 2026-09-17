import { useParticipant } from "../../context/ParticipantContext";
import CategoryTabs from "../../components/CategoryTabs";
import TimerRing from "../../components/TimerRing";
import BudgetAndCollectionStrip from "../../components/BudgetAndCollectionStrip";
import SoldPopup from "../../components/SoldPopup";
import useAnimatedNumber from "../../hooks/useAnimatedNumber";
import "../../components/components.css";

export default function LiveAuction() {
  const { state, bid, soldFlash } = useParticipant();

  if (state.status === "LOBBY" || state.status === "PLANNING") {
    return <WaitingCard state={state} />;
  }

  const categories = state.categories;
  const activeCategoryId = categories.find((c) => c.name === state.currentCategoryName)?.id;

  return (
    <div>
      <CategoryTabs categories={withSecured(categories)} activeId={activeCategoryId} readOnly />

      {state.status === "PAUSED" && (
        <div className="banner banner-pause">The Auctioneer has paused the auction. Hang tight.</div>
      )}

      <SoldPopup flash={soldFlash} />

      <div className="item-stage">
        {state.currentItem ? (
          <ItemHero state={state} bid={bid} />
        ) : state.allCategoriesClosed ? (
          <div className="banner banner-success">All categories are complete. Waiting for the Auctioneer to end the auction.</div>
        ) : (
          <div className="banner">Waiting for the next item…</div>
        )}
      </div>

      <BudgetAndCollectionStrip state={state} />
    </div>
  );
}

function withSecured(categories) {
  return categories.map((c) => ({ ...c, secured: c.items.some((it) => it.status === "SOLD") }));
}

function WaitingCard({ state }) {
  return (
    <div className="card center-panel" style={{ padding: 48 }}>
      <h2>{state.status === "LOBBY" ? "Waiting for the Auctioneer to start…" : "Take a look around"}</h2>
      <p className="muted">
        {state.status === "LOBBY"
          ? "The auction will begin shortly."
          : "Bidding hasn't started yet — browse All Items while you wait."}
      </p>
    </div>
  );
}

function ItemHero({ state, bid }) {
  const item = state.currentItem;

  const animatedBid = useAnimatedNumber(item.currentBid ?? item.startingPrice);

  return (
    <div className="item-hero">
      <div className="item-hero-top">
        <span className="eyebrow">{state.currentCategoryName}</span>
        <span className="badge badge-live">Live</span>
      </div>

      <h1 className="item-hero-name">{item.name}</h1>
      <p className="item-hero-desc">{item.description}</p>

      <div className="item-hero-stats">
        <div>
          <div className="stat-label">Current Bid</div>
          <div className="stat-value stat-value-accent">{item.currentBid != null ? `${animatedBid}c` : `${item.startingPrice}c start`}</div>
        </div>
        <div>
          <div className="stat-label">Leading Player</div>
          <div className="stat-value stat-value-sm">{item.currentBidderName || "No bids yet"}</div>
        </div>
        {item.status === "BIDDING" && (
          <div className="timer-slot">
            <TimerRing secondsRemaining={item.timeRemaining} size={44} />
          </div>
        )}
      </div>

      <BidControls state={state} item={item} bid={bid} />
    </div>
  );
}

function BidControls({ state, item, bid }) {
  if (item.status === "PENDING_CONFIRM") {
    return <p className="muted">Going once… waiting for the Auctioneer to confirm.</p>;
  }
  if (state.status === "PAUSED") {
    return <p className="muted">Bidding is paused.</p>;
  }
  if (item.status !== "BIDDING") return null;
  if (item.isMine) {
    return <p className="highest-mine">You're leading — hold your nerve.</p>;
  }
  if (item.bidOptions.length === 0) {
    return <p className="muted">Your budget is getting nervous — nothing affordable without breaking a category.</p>;
  }
  return (
    <div className="bid-options">
      {item.bidOptions.map((amount, i) => (
        <button
          key={amount}
          className={`bid-pill${i === 1 ? " bid-pill-recommended" : ""}`}
          onClick={async (e) => {
            e.currentTarget.disabled = true;
            try {
              await bid(amount);
            } catch (err) {
              alert(err.message);
            } finally {
              e.currentTarget.disabled = false;
            }
          }}
        >
          Bid {amount}c
        </button>
      ))}
    </div>
  );
}
