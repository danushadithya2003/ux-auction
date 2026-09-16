import { useState } from "react";
import { lookupCode, createAuction, joinAuction } from "../api/client";
import { setAdminSession, setParticipantSession } from "../api/store";
import AuctionSummary from "../components/AuctionSummary";
import "./landing.css";

export default function Landing({ onAdminReady, onParticipantReady }) {
  const [summary, setSummary] = useState(null);

  if (summary) return <AuctionSummary summary={summary} />;

  return (
    <div className="landing">
      <div className="landing-hero">
        <h1>
          <span className="topbar-logo-mark">UX</span> <span className="topbar-logo-script">WARS</span>
        </h1>
        <p className="muted">Think. Bid. Solve. Pick your role to continue.</p>
      </div>
      <div className="landing-choices">
        <AuctioneerCard onAdminReady={onAdminReady} />
        <ParticipantCard onParticipantReady={onParticipantReady} onSummary={setSummary} />
      </div>
    </div>
  );
}

function AuctioneerCard({ onAdminReady }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const { code, adminToken } = await createAuction();
      setAdminSession(code, adminToken);
      onAdminReady({ code, adminToken });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card landing-card">
      <h2>I'm the Auctioneer</h2>
      <p className="muted">Create the auction and run it from your device.</p>
      <button className="btn btn-primary" disabled={busy} onClick={create}>
        Create New Auction
      </button>
      {error && <p className="error small">{error}</p>}
    </div>
  );
}

function ParticipantCard({ onParticipantReady, onSummary }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("code"); // code -> name
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function checkCode() {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await lookupCode(code.trim().toUpperCase());
      if (!result.found) setError("No auction found with that code.");
      else if (result.status === "COMPLETED") onSummary(result.summary);
      else setPhase("name");
    } catch {
      setError("Something went wrong looking that up.");
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { participantId, token } = await joinAuction(code.trim().toUpperCase(), name.trim());
      setParticipantSession(code.trim().toUpperCase(), participantId, token);
      onParticipantReady({ code: code.trim().toUpperCase(), participantId, token });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card landing-card">
      <h2>I'm a Participant</h2>
      <p className="muted">Enter the code your Auctioneer shared with you.</p>
      <div className="field-row">
        <input
          className="input"
          placeholder="Invite code (e.g. UX7K2P)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={phase === "name"}
        />
        {phase === "code" && (
          <button className="btn btn-outline" disabled={busy} onClick={checkCode}>
            Continue
          </button>
        )}
      </div>
      {phase === "name" && (
        <div className="field-row" style={{ marginTop: 10 }}>
          <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-primary" disabled={busy} onClick={join}>
            Join Auction
          </button>
        </div>
      )}
      {error && <p className="error small">{error}</p>}
    </div>
  );
}
