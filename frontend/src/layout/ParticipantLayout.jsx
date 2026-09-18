import { Outlet } from "react-router-dom";
import BroadcastBar from "./BroadcastBar";
import { useParticipant } from "../context/ParticipantContext";
import "./layout.css";

export default function ParticipantLayout() {
  const { state, session } = useParticipant();

  const lotCounter = state ? computeLotCounter(state) : null;

  return (
    <div className="app-frame">
      <BroadcastBar
        mode="participant"
        phase={computePhase(state)}
        code={session.code}
        lotCounter={lotCounter}
        userName={state?.name}
        showNav
      />
      <div className="app-body">
        <main className="app-main">{state ? <Outlet /> : <p className="muted">Loading…</p>}</main>
      </div>
    </div>
  );
}

export function computePhase(state) {
  if (!state) return null;
  if (state.status === "PAUSED") return "PAUSED";
  if (state.status === "LIVE" && !state.currentItem && !state.allCategoriesClosed) return "CATEGORY_CLOSE";
  if (state.status === "COMPLETED") return "CLOSED";
  return state.status;
}

export function computeLotCounter(state) {
  if (!state.categories) return null;
  const allItems = state.categories.flatMap((c) => c.items);
  const total = allItems.length;
  const resolved = allItems.filter((it) => it.status === "SOLD" || it.status === "UNSOLD_PENDING_REOFFER").length;
  return { resolved: Math.min(resolved + 1, total), total };
}
