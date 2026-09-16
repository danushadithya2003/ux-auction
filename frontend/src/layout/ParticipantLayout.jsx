import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useParticipant } from "../context/ParticipantContext";
import "./layout.css";

export default function ParticipantLayout() {
  const { state, session } = useParticipant();

  return (
    <div className="app-frame">
      <Topbar code={session.code} name={state?.name} />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">{state ? <Outlet /> : <p className="muted">Loading…</p>}</main>
      </div>
    </div>
  );
}
