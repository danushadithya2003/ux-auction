import useAnimatedNumber from "../hooks/useAnimatedNumber";
import "./components.css";

const STARTING_BUDGET = 100;

export default function BudgetCard({ balance }) {
  const animated = useAnimatedNumber(balance);
  return (
    <div className="budget-card">
      <div className="budget-card-top">
        <span>💰</span>
        <span className="stat-label" style={{ marginBottom: 0 }}>
          Your Budget
        </span>
      </div>
      <div className="budget-value">{animated}c</div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: `${Math.max(0, Math.min(100, (balance / STARTING_BUDGET) * 100))}%` }} />
      </div>
      <span className="muted small">of {STARTING_BUDGET}c remaining</span>
    </div>
  );
}
