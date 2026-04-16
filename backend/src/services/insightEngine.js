/**
 * @fileoverview Proactive Insight Engine for CareerPilot.
 * Analyzes user data patterns to surface actionable career insights
 * on dashboard load and session start.
 */

const { getRecentSessions } = require('./firestoreService');

/** Threshold: days since last session to trigger re-engagement insight */
const RE_ENGAGEMENT_DAYS = 3;

/** Threshold: sessions without action item follow-up */
const FOLLOWUP_SESSION_THRESHOLD = 2;

/**
 * Generates a proactive insight string for a user based on their activity.
 * Returns null if no insight is warranted.
 * @param {string} uid - Firebase user UID
 * @param {Object} userProfile - User profile data
 * @returns {Promise<string|null>} Insight string or null
 */
async function generateProactiveInsight(uid, userProfile) {
  try {
    const sessions = await getRecentSessions(uid, 5);
    if (!sessions.length) return null;

    const insight = checkInactivity(sessions)
      || checkMissedFollowups(sessions, userProfile)
      || checkProgressMilestone(sessions);

    return insight;
  } catch {
    return null;
  }
}

/**
 * Checks if the user has been inactive for too long.
 * @param {Array<Object>} sessions - Recent user sessions
 * @returns {string|null} Insight string or null
 */
function checkInactivity(sessions) {
  if (!sessions.length) return null;

  const lastSession = sessions[0];
  const updatedAt = lastSession.updatedAt?.toDate?.() || new Date(lastSession.updatedAt);
  const daysSince = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince >= RE_ENGAGEMENT_DAYS) {
    return `It's been ${Math.floor(daysSince)} days since your last career coaching session. Consistency is key — job seekers who practice daily get 3x more interviews. Ready to pick up where you left off?`;
  }
  return null;
}

/**
 * Checks if the user has not followed up on previous action items.
 * @param {Array<Object>} sessions - Recent sessions
 * @param {Object} userProfile - User profile
 * @returns {string|null} Insight string or null
 */
function checkMissedFollowups(sessions, userProfile) {
  if (sessions.length < FOLLOWUP_SESSION_THRESHOLD) return null;

  const role = userProfile?.targetRole || 'your target role';
  const recentCount = sessions.slice(0, FOLLOWUP_SESSION_THRESHOLD).length;

  if (recentCount >= FOLLOWUP_SESSION_THRESHOLD) {
    return `You've had ${sessions.length} coaching sessions for ${role}. Have you applied to any positions yet? Want me to help you craft targeted applications today?`;
  }
  return null;
}

/**
 * Celebrates session milestones to boost user motivation.
 * @param {Array<Object>} sessions - Recent sessions
 * @returns {string|null} Insight string or null
 */
function checkProgressMilestone(sessions) {
  const milestones = [5, 10, 25, 50];
  if (milestones.includes(sessions.length)) {
    return `🎯 You've completed ${sessions.length} coaching sessions — that's real commitment! Top candidates prep for 8+ hours before interviews. You're on the right track.`;
  }
  return null;
}

/**
 * Builds insight cards for the dashboard from session data.
 * @param {Array<Object>} sessions - Recent sessions
 * @param {Object} userProfile - User profile
 * @returns {Array<Object>} Array of insight card objects
 */
function buildDashboardInsights(sessions, userProfile) {
  const insights = [];

  if (sessions.length === 0) {
    insights.push({
      type: 'welcome',
      title: 'Welcome to CareerPilot!',
      message: 'Start your first coaching session to get personalized career guidance.',
      action: 'Start Session',
      priority: 'high',
    });
    return insights;
  }

  const totalMessages = sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0);

  insights.push({
    type: 'stats',
    title: 'Your Progress',
    message: `${sessions.length} sessions · ${totalMessages} messages · ${userProfile?.targetRole || 'Role not set'}`,
    action: null,
    priority: 'low',
  });

  const lastUpdated = sessions[0]?.updatedAt?.toDate?.() || new Date();
  const daysSince = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince >= 2) {
    insights.push({
      type: 'reminder',
      title: 'Stay Consistent',
      message: `${daysSince} days since your last session. Daily practice leads to better interviews.`,
      action: 'Resume Practice',
      priority: 'medium',
    });
  }

  return insights;
}

module.exports = { generateProactiveInsight, buildDashboardInsights };
