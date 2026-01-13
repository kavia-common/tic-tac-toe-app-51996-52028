/* global __API_BASE__ */

/**
 * Very small API client for the backend REST endpoints.
 */

const API_BASE =
  typeof __API_BASE__ !== "undefined" ? __API_BASE__ : "http://localhost:8000";

/**
 * PUBLIC_INTERFACE
 * Create a new game session.
 * @returns {Promise<{id: string, state: any}>}
 */
export async function createSession() {
  const res = await fetch(`${API_BASE}/api/sessions`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to create session (${res.status})`);
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Get current session state.
 * @param {string} id
 * @returns {Promise<{id: string, state: any}>}
 */
export async function getSession(id) {
  const res = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch session (${res.status})`);
  return res.json();
}

/**
 * PUBLIC_INTERFACE
 * Submit a move.
 * @param {string} id
 * @param {number} index
 * @returns {Promise<{id: string, state: any}>}
 */
export async function submitMove(id, index) {
  const res = await fetch(
    `${API_BASE}/api/sessions/${encodeURIComponent(id)}/moves`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    },
  );

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = payload?.error || `Move rejected (${res.status})`;
    const err = new Error(message);
    err.code = payload?.code;
    throw err;
  }
  return payload;
}

/**
 * PUBLIC_INTERFACE
 * Reset the board for a session.
 * @param {string} id
 * @returns {Promise<{id: string, state: any}>}
 */
export async function resetSession(id) {
  const res = await fetch(
    `${API_BASE}/api/sessions/${encodeURIComponent(id)}/reset`,
    {
      method: "POST",
    },
  );
  if (!res.ok) throw new Error(`Failed to reset session (${res.status})`);
  return res.json();
}
