/**
 * @fileoverview Memory routes — manages user profile and cross-session memory.
 * GET  /api/memory/profile — get user profile + memory summary
 * PUT  /api/memory/profile — update user profile fields
 * POST /api/memory/summarize — trigger memory regeneration
 * GET  /api/memory/sessions — get session list
 */

const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const { apiRateLimiter } = require('../middleware/rateLimit');
const { sanitizeShortString } = require('../utils/sanitizer');
const {
  getOrCreateUserProfile,
  updateUserProfile,
  getMemorySummary,
  saveMemorySummary,
  getRecentSessions,
} = require('../services/firestoreService');
const { generateMemorySummary } = require('../services/geminiService');
const { fetchLinkedInProfile } = require('../services/linkedinService');

const router = express.Router();

router.use(verifyFirebaseToken);
router.use(apiRateLimiter);

/**
 * POST /api/memory/sync-linkedin
 * Syncs user profile with LinkedIn data.
 * Body: { accessToken }
 */
router.post('/sync-linkedin', async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const { uid } = req.user;

    if (!accessToken) {
      return res.status(400).json({ error: 'BadRequest', message: 'LinkedIn access token is required.' });
    }

    const linkedInData = await fetchLinkedInProfile(accessToken);

    // Update Firestore profile with LinkedIn context
    await updateUserProfile(uid, {
      displayName: linkedInData.displayName,
      targetRole: linkedInData.headline,
      memorySummary: `LinkedIn Context: ${linkedInData.summary}`,
      updatedFromLinkedIn: true,
      linkedInUid: linkedInData.uid,
    });

    res.json({ message: 'LinkedIn profile synced successfully.', data: linkedInData });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/memory/profile
 * Returns user profile, memory summary, and recent sessions.
 */
router.get('/profile', async (req, res, next) => {
  try {
    const { uid, name, email } = req.user;
    const [profile, sessions] = await Promise.all([
      getOrCreateUserProfile(uid, { displayName: name, email }),
      getRecentSessions(uid, 10),
    ]);

    res.json({
      profile,
      memorySummary: profile.memorySummary || '',
      sessions,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/memory/profile
 * Updates user profile fields (targetRole, displayName, expertiseLevel).
 */
router.put('/profile', async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { targetRole, displayName, expertiseLevel } = req.body;

    const updates = {};
    if (targetRole) updates.targetRole = sanitizeShortString(targetRole);
    if (displayName) updates.displayName = sanitizeShortString(displayName);
    if (expertiseLevel && ['beginner', 'intermediate', 'expert'].includes(expertiseLevel)) {
      updates.expertiseLevel = expertiseLevel;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'BadRequest', message: 'No valid fields to update.' });
    }

    await updateUserProfile(uid, updates);
    res.json({ message: 'Profile updated.', updates });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/memory/summarize
 * Regenerates the memory summary from recent sessions using Gemini.
 */
router.post('/summarize', async (req, res, next) => {
  try {
    const { uid } = req.user;
    const sessions = await getRecentSessions(uid, 3);

    if (!sessions.length) {
      return res.json({ summary: '', message: 'No sessions to summarize.' });
    }

    const summary = await generateMemorySummary(sessions);
    await saveMemorySummary(uid, summary);

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/memory/sessions
 * Returns paginated session list.
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const { uid } = req.user;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const sessions = await getRecentSessions(uid, limit);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
