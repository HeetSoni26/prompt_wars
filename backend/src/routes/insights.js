/**
 * @fileoverview Insights routes — surfaces proactive career insights.
 * GET /api/insights — get proactive insights for the dashboard
 */

const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const { apiRateLimiter } = require('../middleware/rateLimit');
const { getOrCreateUserProfile, getRecentSessions } = require('../services/firestoreService');
const { generateProactiveInsight, buildDashboardInsights } = require('../services/insightEngine');

const router = express.Router();

router.use(verifyFirebaseToken);
router.use(apiRateLimiter);

/**
 * GET /api/insights
 * Returns proactive insight message + dashboard insight cards.
 */
router.get('/', async (req, res, next) => {
  try {
    const { uid, name, email } = req.user;

    const [profile, sessions] = await Promise.all([
      getOrCreateUserProfile(uid, { displayName: name, email }),
      getRecentSessions(uid, 5),
    ]);

    const [proactiveInsight, insightCards] = await Promise.all([
      generateProactiveInsight(uid, profile),
      Promise.resolve(buildDashboardInsights(sessions, profile)),
    ]);

    res.json({
      proactiveInsight,
      insightCards,
      sessionCount: sessions.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
