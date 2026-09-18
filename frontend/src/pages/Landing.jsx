import { useState, useRef } from "react";
import { lookupCode, createAuction, joinAuction } from "../api/client";
import { setAdminSession, setParticipantSession } from "../api/store";
import AuctionSummary from "../components/AuctionSummary";
import "./landing.css";

export default function Landing({ onAdminReady, onParticipantReady }) {
  const [summary, setSummary] = useState(null);
  const [step, setStep] = useState("role"); // role -> join
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (summary) return <AuctionSummary summary={summary} viewerRole="admin" onBackToStart={() => setSummary(null)} />;

  async function createAsAdmin() {
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
    <div className="entry-shell">
      <div className="entry-col">
        <div>
          <div className="entry-wordmark">
            UX <span className="wordmark-accent">WARS</span>
          </div>
          <div className="entry-tagline">THINK &middot; BID &middot; SOLVE</div>
        </div>
        <div className="entry-center">
          <div className="entry-kicker">RESEARCH AUCTION</div>
          <h1 className="entry-hero-title">
            UX<br />WARS
          </h1>
          <p className="entry-body">
            Bid for information. Walk away with a different hand than everyone else — that's the exercise.
          </p>
        </div>
        <div className="entry-stat-row">
          <Stat value="5" label="CATEGORIES" />
          <Stat value="50" label="LOTS" />
          <Stat value="100c" label="PURSE" />
          <Stat value="15s" label="BID WINDOW" />
        </div>
      </div>

      <div className="entry-col entry-col-right">
        {step === "role" ? (
          <RolePicker busy={busy} error={error} onPlayer={() => setStep("join")} onAdmin={createAsAdmin} />
        ) : (
          <JoinStep
            busy={busy}
            setBusy={setBusy}
            error={error}
            setError={setError}
            onBack={() => setStep("role")}
            onJoined={onParticipantReady}
            onSummary={setSummary}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="entry-stat-value">{value}</div>
      <div className="entry-stat-label">{label}</div>
    </div>
  );
}

function RolePicker({ busy, error, onPlayer, onAdmin }) {
  return (
    <div>
      <div className="role-picker-label">PICK YOUR ROLE TO CONTINUE</div>

      <button className="role-btn role-btn-player" onClick={onPlayer}>
        <div className="role-kicker">FOR PLAYERS</div>
        <div className="role-title">Join as Player</div>
        <div className="role-sub">Enter the code your Auctioneer shared with you.</div>
      </button>

      <button className="role-btn role-btn-admin" disabled={busy} onClick={onAdmin}>
        <div className="role-kicker">FOR THE FACILITATOR</div>
        <div className="role-title">Run the Auction</div>
        <div className="role-sub">Create the auction and run it from your device.</div>
      </button>

      {error && <p className="error small">{error}</p>}
      <p className="entry-footnote">Everyone starts with 100 coins. Five categories. One incomplete hand each.</p>
    </div>
  );
}

function JoinStep({ busy, setBusy, error, setError, onBack, onJoined, onSummary }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [codeState, setCodeState] = useState("idle"); // idle | checking | valid | invalid
  const checkTimer = useRef(null);

  function onCodeChange(value) {
    setCode(value);
    setCodeState("idle");
    setError(null);
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!value.trim()) return;
    checkTimer.current = setTimeout(() => validateCode(value), 450);
  }

  async function validateCode(value) {
    setCodeState("checking");
    try {
      const result = await lookupCode(value.trim().toUpperCase());
      if (!result.found) {
        setCodeState("invalid");
      } else if (result.status === "COMPLETED") {
        onSummary(result.summary);
      } else {
        setCodeState("valid");
      }
    } catch {
      setCodeState("invalid");
    }
  }

  async function enterRoom() {
    if (codeState !== "valid" || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const upperCode = code.trim().toUpperCase();
      const { participantId, token } = await joinAuction(upperCode, name.trim());
      setParticipantSession(upperCode, participantId, token);
      onJoined({ code: upperCode, participantId, token });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const canEnter = codeState === "valid" && name.trim().length > 0 && !busy;

  return (
    <div>
      <div className="step-label">STEP 2 OF 2</div>
      <h2 className="join-title">Take your seat</h2>
      <p className="entry-body" style={{ marginBottom: 24 }}>
        Your name is what everyone else sees at the table — pick something recognizable.
      </p>

      <div className={`field-plate${codeState === "valid" ? " field-plate-valid" : ""}`}>
        <div className="field-plate-label">
          <span>INVITE CODE</span>
          {codeState === "valid" && <span className="field-plate-check">ROOM FOUND &#10003;</span>}
          {codeState === "invalid" && <span className="error">NOT FOUND</span>}
        </div>
        <input
          placeholder="UX7K2P"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          autoComplete="off"
          maxLength={8}
        />
      </div>

      <div className="field-plate field-plate-focus">
        <div className="field-plate-label">
          <span>DISPLAY NAME</span>
          <span>{name.length} / 16</span>
        </div>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 16))}
          autoComplete="off"
        />
      </div>

      <button className="enter-room-btn" disabled={!canEnter} onClick={enterRoom} style={!canEnter ? { opacity: 0.4, cursor: "not-allowed" } : undefined}>
        ENTER THE ROOM &rarr;
        <span className="enter-room-btn-hint">100c ISSUED ON ENTRY</span>
      </button>

      {error && <p className="error small" style={{ marginTop: 10 }}>{error}</p>}

      <button className="back-link" onClick={onBack}>
        &larr; BACK TO ROLE SELECT
      </button>
    </div>
  );
}
