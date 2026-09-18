// The "hammer down" moment - a full-frame takeover shown the instant an
// item resolves, then it auto-dismisses (the underlying state has already
// advanced to the next lot, so there is nothing left to "confirm" here).
export default function SoldPopup({ flash, kicker = "HAMMER DOWN" }) {
  if (!flash) return null;
  return (
    <div className="sold-backdrop">
      <div className="sold-sweep" />
      <div className="sold-label">{kicker}</div>
      <h1 className="sold-item-name">SOLD</h1>
      <div className="sold-winner-row">
        <span className="sold-winner-avatar">{flash.winner.charAt(0).toUpperCase()}</span>
        {flash.name} &rarr; {flash.winner}
      </div>
      <div className="sold-price">{flash.price}c</div>
    </div>
  );
}
