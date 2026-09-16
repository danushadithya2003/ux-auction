import { createContext, useContext, useEffect, useRef, useState } from "react";
import { openStream, adminAction } from "../api/client";

const AdminContext = createContext(null);

export function AdminProvider({ session, onReset, children }) {
  const [state, setState] = useState(null);
  const [soldFlash, setSoldFlash] = useState(null);
  const closeRef = useRef(null);
  const prevItemRef = useRef(null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    closeRef.current = openStream(
      { role: "admin", code: session.code, adminToken: session.adminToken },
      (payload) => {
        const prevItem = prevItemRef.current;
        const newItem = payload.currentItem || null;
        if (prevItem && prevItem.id !== (newItem && newItem.id) && prevItem.currentBidderName) {
          setSoldFlash({ name: prevItem.name, winner: prevItem.currentBidderName, price: prevItem.currentBid });
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          flashTimerRef.current = setTimeout(() => setSoldFlash(null), 1500);
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
  }, [session.code, session.adminToken]);

  async function act(action, extra) {
    try {
      const res = await adminAction(action, session.code, session.adminToken, extra);
      if (res.reset) onReset();
    } catch (e) {
      alert(e.message);
    }
  }

  return <AdminContext.Provider value={{ state, act, session, soldFlash }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
