import { Link } from "react-router-dom";
import { colorForCategory } from "../theme/categories";
import BudgetCard from "./BudgetCard";
import "./components.css";

export default function BudgetAndCollectionStrip({ state }) {
  const items = state.collection;

  return (
    <div className="bottom-strip">
      <BudgetCard balance={state.balance} />

      <div className="collection-strip">
        <div className="collection-strip-head">
          <h4 style={{ margin: 0 }}>Your Collection ({items.length})</h4>
          <Link to="/play/collection" className="small">
            View all →
          </Link>
        </div>
        <div className="collection-mini-row">
          {items.slice(0, 3).map((it, i) => {
            const theme = colorForCategory(it.categoryName, state.categories);
            return (
              <div className="collection-mini-card" key={i}>
                <span className="collection-mini-tag" style={{ background: theme.soft, color: theme.accent }}>
                  {it.categoryName}
                </span>
                <div className="collection-mini-name">{it.name}</div>
                <div className="collection-mini-price">{it.price}c</div>
              </div>
            );
          })}
          {state.categoriesProgress.filter((c) => !c.secured).length > 0 && (
            <div className="collection-mini-empty">{state.categoriesProgress.filter((c) => !c.secured).length} more to go!</div>
          )}
        </div>
      </div>
    </div>
  );
}
