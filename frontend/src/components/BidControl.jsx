import { useEffect, useState } from "react";

// The redesign's key interaction: one dominant BID button showing the exact
// amount you're about to pay, plus a "jump ahead" cluster to raise that
// amount before committing. The game's real bid economy is a small fixed
// set of increments (+1/+5/+10 over the current bid) - this control picks
// among those real, server-valid amounts rather than inventing a freeform
// offer the backend would just reject.
export default function BidControl({ item, bid }) {
  const options = item.bidOptions;
  const base = item.currentBid ?? item.startingPrice;
  const [selected, setSelected] = useState(options[0]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelected(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.currentBid]);

  if (!options.length) {
    return <p className="muted bid-control-empty">Your budget is getting nervous — nothing affordable without breaking a category.</p>;
  }

  const minRaise = options[0];
  const isMin = selected === minRaise;
  const isOpeningBid = item.currentBid == null;
  const jumpOptions = options.slice(1);

  async function submit() {
    setBusy(true);
    try {
      await bid(selected);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bid-control">
      <button className="bid-primary" disabled={busy} onClick={submit}>
        <span className="bid-primary-word">BID</span>
        <span className="bid-primary-amount-block">
          <span className="bid-primary-amount">{selected}c</span>
          <span className="bid-primary-note">{isMin ? (isOpeningBid ? "OPENING BID" : "MINIMUM RAISE") : `MIN ${minRaise}c`}</span>
        </span>
        <span className="bid-primary-hint">TAP TO BID</span>
      </button>

      {jumpOptions.length > 0 && (
        <div className="jump-cluster">
          <div className="jump-label">JUMP AHEAD</div>
          <div className="jump-buttons">
            {jumpOptions.map((opt) => (
              <button
                key={opt}
                className={`jump-btn${selected === opt ? " jump-btn-active" : ""}`}
                onClick={() => setSelected(opt)}
              >
                +{opt - base}
              </button>
            ))}
            <button className={`jump-btn${isMin ? " jump-btn-active" : ""}`} onClick={() => setSelected(minRaise)}>
              MIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
