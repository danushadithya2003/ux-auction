import { useState } from "react";
import "./layout.css";

export default function Topbar({ code, name, right }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <header className="topbar">
      <div className="topbar-logo">
        <span className="topbar-logo-mark">UX</span> <span className="topbar-logo-script">Auction</span>
        <div className="topbar-tagline">Think. Bid. Solve.</div>
      </div>
      <div className="topbar-right">
        {code && (
          <button className="room-code" onClick={copyCode} title="Copy invite code">
            <span className="faint small">Room Code</span> <strong>{code}</strong>
            <span className="room-code-copy">{copied ? "Copied!" : "⧉"}</span>
          </button>
        )}
        {right}
        {name && (
          <div className="avatar-chip">
            <span className="avatar-circle">{name.charAt(0).toUpperCase()}</span>
            {name}
          </div>
        )}
      </div>
    </header>
  );
}
