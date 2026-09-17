// The "happy state" moment - everyone sees this the instant an item
// resolves: what sold, who won it, and for how much. Pops up over
// whatever screen they're on, then fades itself out.
export default function SoldPopup({ flash }) {
  if (!flash) return null;
  return (
    <div className="sold-backdrop">
      <div className="sold-card">
        <div className="sold-label">Sold</div>
        <h2 className="sold-item-name">{flash.name}</h2>
        <div className="sold-winner-row">
          <span className="sold-winner-avatar">{flash.winner.charAt(0).toUpperCase()}</span>
          <span className="sold-winner-name">{flash.winner}</span>
        </div>
        <div className="sold-price-label">Winning bid</div>
        <div className="sold-price">{flash.price}c</div>
      </div>
    </div>
  );
}
