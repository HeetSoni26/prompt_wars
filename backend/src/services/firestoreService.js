/**
 * @fileoverview Firebase Admin SDK initialization and Firestore service.
 * Provides CRUD operations for user profiles, sessions, and messages.
 * All Firestore paths follow: users/{uid}/sessions/{sessionId}/messages/{msgId}
 *
 * Uses lazy initialization so Jest mocks are applied before first SDK access.
 */

const admin = require('firebase-admin');

/**
 * Lazily initializes Firebase Admin and returns the Firestore instance.
 * @returns {import('firebase-admin').firestore.Firestore} Firestore db instance
 */
function getDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

/**
 * Returns the Firestore FieldValue helper.
 * Works with both real Firebase Admin SDK (admin.firestore.FieldValue)
 * and Jest mocks (admin.FieldValue).
 * @returns {import('firebase-admin').firestore.FieldValue}
 */
function fv() {
  return admin.firestore.FieldValue || admin.FieldValue;
}

// ─── User Profile ──────────────────────────────────────────────────────────────

/**
 * Gets or creates a user profile document.
 * @param {string} uid - Firebase user UID
 * @param {Object} defaults - Default fields for new profiles
 * @returns {Promise<Object>} User profile data
 */
async function getOrCreateUserProfile(uid, defaults = {}) {
  const ref = getDb().collection('users').doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    return snap.data();
  }

  const profile = {
    uid,
    displayName: defaults.displayName || 'Job Seeker',
    email: defaults.email || '',
    targetRole: '',
    expertiseLevel: 'intermediate',
    memorySummary: '',
    createdAt: fv().serverTimestamp(),
    updatedAt: fv().serverTimestamp(),
    ...defaults,
  };

  await ref.set(profile);
  return profile;
}

/**
 * Updates fields on a user profile.
 * @param {string} uid - Firebase user UID
 * @param {Object} updates - Fields to update
 */
async function updateUserProfile(uid, updates) {
  await getDb().collection('users').doc(uid).update({
    ...updates,
    updatedAt: fv().serverTimestamp(),
  });
}

// ─── Memory Summary ────────────────────────────────────────────────────────────

/**
 * Retrieves the AI-generated memory summary for a user.
 * @param {string} uid - Firebase user UID
 * @returns {Promise<string>} Memory summary string
 */
async function getMemorySummary(uid) {
  const snap = await getDb().collection('users').doc(uid).get();
  return snap.data()?.memorySummary || '';
}

/**
 * Saves an updated memory summary for a user.
 * @param {string} uid - Firebase user UID
 * @param {string} summary - AI-generated summary text
 */
async function saveMemorySummary(uid, summary) {
  await getDb().collection('users').doc(uid).update({
    memorySummary: summary,
    memoryUpdatedAt: fv().serverTimestamp(),
  });
}

// ─── Sessions ──────────────────────────────────────────────────────────────────

/**
 * Creates a new chat session for a user.
 * @param {string} uid - Firebase user UID
 * @param {string} sessionId - Unique session UUID
 * @param {string} title - Session title
 * @returns {Promise<Object>} Created session data
 */
async function createSession(uid, sessionId, title) {
  const session = {
    sessionId,
    title,
    summary: '',
    messageCount: 0,
    tags: [],
    createdAt: fv().serverTimestamp(),
    updatedAt: fv().serverTimestamp(),
  };
  await getDb()
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .set(session);
  return session;
}

/**
 * Retrieves recent sessions for a user (most recent first).
 * @param {string} uid - Firebase user UID
 * @param {number} limit - Max sessions to fetch
 * @returns {Promise<Array<Object>>} Array of session objects
 */
async function getRecentSessions(uid, limit = 10) {
  const snap = await getDb()
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .orderBy('updatedAt', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Updates session metadata (title, summary, etc).
 * @param {string} uid - Firebase user UID
 * @param {string} sessionId - Session document ID
 * @param {Object} updates - Fields to update
 */
async function updateSession(uid, sessionId, updates) {
  await getDb()
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .update({
      ...updates,
      updatedAt: fv().serverTimestamp(),
    });
}

// ─── Messages ──────────────────────────────────────────────────────────────────

/**
 * Saves a single message to a session.
 * @param {string} uid - Firebase user UID
 * @param {string} sessionId - Session document ID
 * @param {string} messageId - Unique message UUID
 * @param {Object} message - Message data {role, content}
 */
async function saveMessage(uid, sessionId, messageId, message) {
  const db = getDb();

  await db
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .collection('messages')
    .doc(messageId)
    .set({
      ...message,
      createdAt: fv().serverTimestamp(),
    });

  // Increment message counter on session
  await db
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .update({
      messageCount: fv().increment(1),
      updatedAt: fv().serverTimestamp(),
    });
}

/**
 * Retrieves messages from a session ordered chronologically.
 * @param {string} uid - Firebase user UID
 * @param {string} sessionId - Session document ID
 * @param {number} limit - Max messages to fetch
 * @returns {Promise<Array<Object>>} Array of message objects
 */
async function getSessionMessages(uid, sessionId, limit = 20) {
  const snap = await getDb()
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

module.exports = {
  admin,
  getOrCreateUserProfile,
  updateUserProfile,
  getMemorySummary,
  saveMemorySummary,
  createSession,
  getRecentSessions,
  updateSession,
  saveMessage,
  getSessionMessages,
};
