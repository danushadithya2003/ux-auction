import { useEffect, useRef, useState } from "react";

// Smoothly counts up/down to `value` whenever it changes, so price and
// balance changes feel alive instead of snapping.
export default function useAnimatedNumber(value, duration = 450) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value || value == null) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        fromRef.current = value;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return Math.round(display);
}
