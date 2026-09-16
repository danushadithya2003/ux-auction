import useAnimatedNumber from "../hooks/useAnimatedNumber";
import "./components.css";

const STARTING_BUDGET = 100;

export default function BudgetCard({ balance }) {
  const animated = useAnimatedNumber(balance);
  return (
    <div>
      <div className="hud-label">Your Budget</div>
      <div className="hud-value hud-value-accent">{animated}c</div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: `${Math.max(0, Math.min(100, (balance / STARTING_BUDGET) * 100))}%` }} />
      </div>
      <span className="muted small">of {STARTING_BUDGET}c remaining</span>
    </div>
  );
}
