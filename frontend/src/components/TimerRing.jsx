import { useEffect, useState } from "react";

// Bid-window indicator: a continuously spinning arc (not a proportional
// fill) paired with the actual seconds-remaining numeral. Ticks against
// the server's raw expiry timestamp rather than a rounded "seconds
// remaining" integer - a rounded value can land on the same number twice
// in a row (e.g. a bid moments after a reveal both reading as "15"),
// which would make a value-based reset silently miss that the deadline
// actually moved. A timestamp never has that ambiguity.
export default function TimerRing({ expiresAt, size = 86 }) {
  const [display, setDisplay] = useState(computeRemaining(expiresAt));

  useEffect(() => {
    setDisplay(computeRemaining(expiresAt));
    if (expiresAt == null) return undefined;
    const id = setInterval(() => setDisplay(computeRemaining(expiresAt)), 250);
    return () => clearInterval(id);
  }, [expiresAt]);

  const urgent = display != null && display <= 7;

  return (
    <div className={`timer-ring-wrap${urgent ? " timer-ring-urgent" : ""}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" width={size} height={size}>
        <circle cx="28" cy="28" r="24" className="timer-ring-track" />
        <circle cx="28" cy="28" r="24" className="timer-ring-fill" />
      </svg>
      <span className="timer-ring-seconds" style={{ fontSize: size * 0.34 }}>
        {display ?? ""}
      </span>
    </div>
  );
}

function computeRemaining(expiresAt) {
  if (expiresAt == null) return null;
  return Math.max(0, Math.ceil(expiresAt - Date.now() / 1000));
}
