// Circular countdown - a pure CSS animation keyed by `secondsRemaining`
// so it runs in real wall-clock time in the browser, independent of how
// often the server pushes state updates.
export default function TimerRing({ secondsRemaining, size = 52 }) {
  const urgent = secondsRemaining != null && secondsRemaining <= 5;
  return (
    <svg
      viewBox="0 0 56 56"
      width={size}
      height={size}
      className={`timer-ring${urgent ? " timer-ring-urgent" : ""}`}
      key={secondsRemaining}
    >
      <circle cx="28" cy="28" r="24" className="timer-ring-track" />
      <circle
        cx="28"
        cy="28"
        r="24"
        className="timer-ring-fill"
        style={{ animationDuration: `${Math.max(secondsRemaining ?? 15, 0.001)}s` }}
      />
    </svg>
  );
}
