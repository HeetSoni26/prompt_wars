/**
 * @fileoverview API service — handles all backend HTTP calls with auth tokens.
 * All AI operations route through backend; API key never exposed to client.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Gets a fresh Firebase ID token for authenticating backend requests.
 * @param {import('firebase/auth').User} user - Firebase user object
 * @returns {Promise<string>} Firebase ID token
 */
async function getAuthToken(user) {
  if (!user) throw new Error('User not authenticated.');
  return user.getIdToken();
}

/**
 * Makes an authenticated fetch request to the backend.
 * @param {string} endpoint - API endpoint path (e.g. '/chat/session')
 * @param {import('firebase/auth').User} user - Firebase user for token
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} Fetch Response object
 */
async function authFetch(endpoint, user, options = {}) {
  const token = await getAuthToken(user);
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// ─── Chat API ──────────────────────────────────────────────────────────────────

/**
 * Creates a new chat session on the backend.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @param {string} title - Optional session title
 * @returns {Promise<{sessionId: string, title: string}>} Session data
 */
export async function createSession(user, title = '') {
  const res = await authFetch('/chat/session', user, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create session.');
  }
  return res.json();
}

/**
 * Sends a message and returns an SSE ReadableStreamDefaultReader for streaming.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @param {string} sessionId - Current session ID
 * @param {string} message - User message content
 * @returns {Promise<ReadableStreamDefaultReader>} SSE stream reader
 */
export async function sendMessage(user, sessionId, message) {
  const token = await getAuthToken(user);
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send message.');
  }

  return res.body.getReader();
}

/**
 * Fetches message history for a session.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Messages array
 */
export async function getSessionMessages(user, sessionId) {
  const res = await authFetch(`/chat/session/${sessionId}/messages`, user);
  if (!res.ok) throw new Error('Failed to load messages.');
  const data = await res.json();
  return data.messages || [];
}

// ─── Memory API ────────────────────────────────────────────────────────────────

/**
 * Fetches user profile, memory summary, and sessions.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @returns {Promise<Object>} Profile data
 */
export async function getMemoryProfile(user) {
  const res = await authFetch('/memory/profile', user);
  if (!res.ok) throw new Error('Failed to load profile.');
  return res.json();
}

/**
 * Updates user profile fields.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updateProfile(user, updates) {
  const res = await authFetch('/memory/profile', user, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update profile.');
  return res.json();
}

/**
 * Fetches session list.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @param {number} limit - Max sessions
 * @returns {Promise<Array>} Sessions array
 */
export async function getSessions(user, limit = 20) {
  const res = await authFetch(`/memory/sessions?limit=${limit}`, user);
  if (!res.ok) throw new Error('Failed to load sessions.');
  const data = await res.json();
  return data.sessions || [];
}

/**
 * Triggers memory summarization on the backend.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @returns {Promise<{summary: string}>} New summary
 */
export async function triggerMemorySummarize(user) {
  const res = await authFetch('/memory/summarize', user, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to summarize memory.');
  return res.json();
}

// ─── Insights API ──────────────────────────────────────────────────────────────

/**
 * Fetches proactive insights for the dashboard.
 * @param {import('firebase/auth').User} user - Authenticated user
 * @returns {Promise<Object>} Insights data
 */
export async function getInsights(user) {
  const res = await authFetch('/insights', user);
  if (!res.ok) throw new Error('Failed to load insights.');
  return res.json();
}
