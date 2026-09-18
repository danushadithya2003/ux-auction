import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./layout.css";

const PHASE_STYLE = {
  LOBBY: { label: "LOBBY", cls: "phase-lobby" },
  PLANNING: { label: "PLANNING", cls: "phase-planning" },
  LIVE: { label: "LIVE", cls: "phase-live" },
  PAUSED: { label: "PAUSED", cls: "phase-paused" },
  CATEGORY_CLOSE: { label: "CATEGORY CLOSE", cls: "phase-paused" },
  CLOSED: { label: "CLOSED", cls: "phase-lobby" },
};

const NAV_ITEMS = [
  { to: "/play/live", num: "01", label: "LIVE AUCTION" },
  { to: "/play/items", num: "02", label: "ALL ITEMS" },
  { to: "/play/collection", num: "03", label: "MY COLLECTION" },
  { to: "/play/players", num: "04", label: "PLAYERS" },
  { to: "/play/how-it-works", num: "05", label: "HOW IT WORKS" },
];

export default function BroadcastBar({ mode = "participant", phase, code, lotCounter, userName, showNav = false }) {
  const [copied, setCopied] = useState(false);
  const phaseInfo = PHASE_STYLE[phase] || PHASE_STYLE.LOBBY;

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <header className="broadcast-bar">
      <div className="broadcast-bar-top">
        <div className="broadcast-left">
          <div className="broadcast-wordmark">
            UX <span className="wordmark-accent">WARS</span>
          </div>
          {mode === "admin" && <span className="broadcast-sublabel">AUCTIONEER CONSOLE</span>}
          {phase && (
            <span className={`phase-pill ${phaseInfo.cls}`}>
              <span className="phase-dot" />
              {phaseInfo.label}
            </span>
          )}
        </div>
        <div className="broadcast-right">
          {lotCounter && (
            <div className="lot-counter">
              <span className="faint">LOT</span> {lotCounter.resolved} / {lotCounter.total}
            </div>
          )}
          {code && (
            <button className="code-plate" onClick={copyCode} title="Copy invite code">
              <span className="code-plate-label">{mode === "admin" ? "ROOM" : "INVITE CODE"}</span>
              <span className="code-plate-value">{code}</span>
              {copied && <span className="code-plate-copied">COPIED</span>}
            </button>
          )}
          {userName && (
            <div className="user-chip">
              <span className="user-chip-avatar">{userName.charAt(0).toUpperCase()}</span>
              {userName}
            </div>
          )}
        </div>
      </div>
      {showNav && (
        <nav className="broadcast-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => "nav-tab" + (isActive ? " nav-tab-active" : "")}
            >
              <span className="nav-tab-num">{item.num}</span>
              <span className="nav-tab-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
