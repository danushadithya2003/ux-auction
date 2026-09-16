import { useParticipant } from "../../context/ParticipantContext";
import CategoryTabs from "../../components/CategoryTabs";
import CategoryIllustration from "../../components/CategoryIllustration";
import TimerRing from "../../components/TimerRing";
import BudgetAndCollectionStrip from "../../components/BudgetAndCollectionStrip";
import useAnimatedNumber from "../../hooks/useAnimatedNumber";
import { colorForCategory } from "../../theme/categories";
import "../../components/components.css";

export default function LiveAuction() {
  const { state, bid } = useParticipant();

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

      {state.currentItem ? (
        <ItemCard state={state} bid={bid} />
      ) : state.allCategoriesClosed ? (
        <div className="banner banner-success">All categories are complete. Waiting for the Auctioneer to end the auction.</div>
      ) : (
        <div className="banner">Waiting for the next item…</div>
      )}

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

function ItemCard({ state, bid }) {
  const item = state.currentItem;
  const categories = state.categories;
  const catIndex = categories.findIndex((c) => c.name === state.currentCategoryName);
  const cat = categories[catIndex];
  const posInCategory = cat ? cat.items.findIndex((it) => it.id === item.id) + 1 : null;
  const theme = colorForCategory(cat?.id, categories);

  const animatedBid = useAnimatedNumber(item.currentBid ?? item.startingPrice);

  return (
    <div className="item-card">
      <div className="item-card-top">
        <span className="item-card-tag" style={{ background: theme.soft, color: theme.accent }}>
          {state.currentCategoryName}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="badge badge-live">LIVE</span>
          {posInCategory && cat && (
            <span className="item-card-progress">
              {posInCategory} / {cat.items.length}
            </span>
          )}
        </div>
      </div>

      <h2 className="item-card-name">{item.name}</h2>
      <p className="item-card-desc">{item.description}</p>

      <div className="item-card-body">
        <CategoryIllustration index={catIndex} categoryName={state.currentCategoryName} />

        <div>
          <div className="item-card-stats">
            <div>
              <div className="stat-label">Current Bid</div>
              <div className="stat-value">{item.currentBid != null ? `${animatedBid}c` : `${item.startingPrice}c start`}</div>
            </div>
            <div>
              <div className="stat-label">Highest Bidder</div>
              <div className="bidder-row">
                {item.currentBidderName && <span className="avatar-circle" style={{ width: 26, height: 26, fontSize: "0.8em" }}>{item.currentBidderName.charAt(0)}</span>}
                <span className="stat-value-sm">{item.currentBidderName || "—"}</span>
              </div>
            </div>
          </div>

          <div className="meta-row">
            <span>
              Starting bid <strong>{item.startingPrice}c</strong>
            </span>
            {item.status === "BIDDING" && (
              <span style={{ marginLeft: "auto" }}>
                <TimerRing secondsRemaining={item.timeRemaining} size={38} />
              </span>
            )}
          </div>

          <BidControls state={state} item={item} bid={bid} />
        </div>
      </div>
    </div>
  );
}

function BidControls({ state, item, bid }) {
  if (item.status === "PENDING_CONFIRM") {
    return <p className="muted small">Bidding closed — waiting for the Auctioneer to confirm.</p>;
  }
  if (state.status === "PAUSED") {
    return <p className="muted small">Bidding is paused.</p>;
  }
  if (item.status !== "BIDDING") return null;
  if (item.isMine) {
    return <p className="highest-mine">✓ You're the highest bidder</p>;
  }
  if (item.bidOptions.length === 0) {
    return <p className="muted small">No affordable bid available right now — your budget is reserved for other categories.</p>;
  }
  return (
    <div className="bid-options">
      {item.bidOptions.map((amount) => (
        <button
          key={amount}
          className="bid-pill"
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
          {amount}c
        </button>
      ))}
    </div>
  );
}
