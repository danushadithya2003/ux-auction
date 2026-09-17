import { createContext, useContext, useEffect, useRef, useState } from "react";
import { openStream, placeBid as apiPlaceBid } from "../api/client";

const ParticipantContext = createContext(null);

export function ParticipantProvider({ session, onSummary, children }) {
  const [state, setState] = useState(null);
  const [soldFlash, setSoldFlash] = useState(null);
  const closeRef = useRef(null);
  const prevItemRef = useRef(null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    closeRef.current = openStream(
      { role: "participant", code: session.code, token: session.token },
      (payload) => {
        if (payload.role === "summary") {
          onSummary(payload);
          if (closeRef.current) closeRef.current();
          return;
        }

        const prevItem = prevItemRef.current;
        const newItem = payload.currentItem || null;
        if (prevItem && prevItem.id !== (newItem && newItem.id) && prevItem.currentBidderName) {
          setSoldFlash({ name: prevItem.name, winner: prevItem.currentBidderName, price: prevItem.currentBid });
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          flashTimerRef.current = setTimeout(() => setSoldFlash(null), 2600);
        }
        prevItemRef.current = newItem
          ? { id: newItem.id, name: newItem.name, currentBidderName: newItem.currentBidderName, currentBid: newItem.currentBid }
          : null;

        setState(payload);
      },
      () => {}
    );
    return () => {
      closeRef.current && closeRef.current();
      flashTimerRef.current && clearTimeout(flashTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.code, session.token]);

  async function bid(amount) {
    await apiPlaceBid(session.code, session.token, amount);
  }

  return <ParticipantContext.Provider value={{ state, bid, session, soldFlash }}>{children}</ParticipantContext.Provider>;
}

export function useParticipant() {
  return useContext(ParticipantContext);
}
