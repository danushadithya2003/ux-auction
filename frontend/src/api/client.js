// Thin wrappers around the Flask backend's HTTP + SSE surface.

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function lookupCode(code) {
  const res = await fetch(`/api/lookup/${encodeURIComponent(code)}`);
  return res.json();
}

export function createAuction() {
  return postJSON("/api/auction", {});
}

export function joinAuction(code, name) {
  return postJSON("/api/join", { code, name });
}

export function placeBid(code, token, amount) {
  return postJSON("/api/bid", { code, token, amount });
}

export function adminAction(action, code, adminToken, extra) {
  return postJSON(`/api/admin/${action}`, { code, adminToken, ...(extra || {}) });
}

// Opens an SSE connection; calls onState(data) for every fresh snapshot.
// Returns a close() function. EventSource reconnects automatically.
export function openStream(params, onState, onError) {
  const qs = new URLSearchParams(params).toString();
  const es = new EventSource(`/api/stream?${qs}`);
  es.onmessage = (evt) => {
    let data;
    try {
      data = JSON.parse(evt.data);
    } catch {
      return;
    }
    onState(data);
  };
  es.onerror = () => onError && onError();
  return () => es.close();
}
