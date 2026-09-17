import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AuctionSummary from "./components/AuctionSummary";
import ParticipantLayout from "./layout/ParticipantLayout";
import { ParticipantProvider } from "./context/ParticipantContext";
import { AdminProvider } from "./context/AdminContext";
import AdminApp from "./pages/admin/AdminApp";
import LiveAuction from "./pages/participant/LiveAuction";
import AllItems from "./pages/participant/AllItems";
import MyCollection from "./pages/participant/MyCollection";
import Players from "./pages/participant/Players";
import HowItWorks from "./pages/participant/HowItWorks";
import { lookupCode } from "./api/client";
import { getAdminSession, clearAdminSession, getParticipantSession, clearParticipantSession } from "./api/store";

export default function App() {
  const [mode, setMode] = useState("loading");
  const [adminSession, setAdminSessionState] = useState(null);
  const [participantSession, setParticipantSessionState] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function boot() {
    const admin = getAdminSession();
    if (admin) {
      const result = await lookupCode(admin.code).catch(() => ({ found: false }));
      if (result.found && result.status === "COMPLETED") {
        setSummary(result.summary);
        setMode("summary");
        return;
      }
      if (result.found) {
        setAdminSessionState(admin);
        setMode("admin");
        return;
      }
      clearAdminSession();
    }

    const participant = getParticipantSession();
    if (participant) {
      const result = await lookupCode(participant.code).catch(() => ({ found: false }));
      if (result.found && result.status === "COMPLETED") {
        setSummary(result.summary);
        setMode("summary");
        return;
      }
      if (result.found) {
        setParticipantSessionState(participant);
        setMode("participant");
        return;
      }
      clearParticipantSession();
    }

    setMode("landing");
  }

  return (
    <BrowserRouter>
      {mode === "loading" && <p className="muted" style={{ padding: 40 }}>Loading…</p>}

      {mode === "summary" && summary && (
        <div>
          <AuctionSummary summary={summary} />
          <div style={{ textAlign: "center", paddingBottom: 40 }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                clearAdminSession();
                clearParticipantSession();
                window.location.href = "/";
              }}
            >
              Back to Start
            </button>
          </div>
        </div>
      )}

      {mode === "landing" && (
        <Landing
          onAdminReady={(session) => {
            setAdminSessionState(session);
            setMode("admin");
          }}
          onParticipantReady={(session) => {
            setParticipantSessionState(session);
            setMode("participant");
          }}
        />
      )}

      {mode === "admin" && adminSession && (
        <AdminProvider
          session={adminSession}
          onReset={() => {
            clearAdminSession();
            window.location.reload();
          }}
        >
          <AdminApp />
        </AdminProvider>
      )}

      {mode === "participant" && participantSession && (
        <ParticipantProvider session={participantSession} onSummary={(s) => { setSummary(s); setMode("summary"); }}>
          <Routes>
            <Route element={<ParticipantLayout />}>
              <Route path="/play/live" element={<LiveAuction />} />
              <Route path="/play/items" element={<AllItems />} />
              <Route path="/play/collection" element={<MyCollection />} />
              <Route path="/play/players" element={<Players />} />
              <Route path="/play/how-it-works" element={<HowItWorks />} />
              <Route path="*" element={<Navigate to="/play/live" replace />} />
            </Route>
          </Routes>
        </ParticipantProvider>
      )}
    </BrowserRouter>
  );
}
