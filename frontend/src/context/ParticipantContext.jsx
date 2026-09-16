import { createContext, useContext, useEffect, useRef, useState } from "react";
import { openStream, placeBid as apiPlaceBid } from "../api/client";

const ParticipantContext = createContext(null);

export function ParticipantProvider({ session, onSummary, children }) {
  const [state, setState] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current = openStream(
      { role: "participant", code: session.code, token: session.token },
      (payload) => {
        if (payload.role === "summary") {
          onSummary(payload);
          if (closeRef.current) closeRef.current();
          return;
        }
        setState(payload);
      },
      () => {}
    );
    return () => closeRef.current && closeRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.code, session.token]);

  async function bid(amount) {
    await apiPlaceBid(session.code, session.token, amount);
  }

  return <ParticipantContext.Provider value={{ state, bid, session }}>{children}</ParticipantContext.Provider>;
}

export function useParticipant() {
  return useContext(ParticipantContext);
}
