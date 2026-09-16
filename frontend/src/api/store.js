// localStorage helpers for resuming a session on refresh/reconnect.

const ADMIN_KEY = "uxauction_admin";
const PARTICIPANT_KEY = "uxauction_participant";

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY));
  } catch {
    return null;
  }
}

export function setAdminSession(code, adminToken) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ code, adminToken }));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}

export function getParticipantSession() {
  try {
    return JSON.parse(localStorage.getItem(PARTICIPANT_KEY));
  } catch {
    return null;
  }
}

export function setParticipantSession(code, participantId, token) {
  localStorage.setItem(PARTICIPANT_KEY, JSON.stringify({ code, participantId, token }));
}

export function clearParticipantSession() {
  localStorage.removeItem(PARTICIPANT_KEY);
}
