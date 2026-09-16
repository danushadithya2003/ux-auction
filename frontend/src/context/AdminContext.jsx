import { createContext, useContext, useEffect, useRef, useState } from "react";
import { openStream, adminAction } from "../api/client";

const AdminContext = createContext(null);

export function AdminProvider({ session, onReset, children }) {
  const [state, setState] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current = openStream({ role: "admin", code: session.code, adminToken: session.adminToken }, setState, () => {});
    return () => closeRef.current && closeRef.current();
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

  return <AdminContext.Provider value={{ state, act, session }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
