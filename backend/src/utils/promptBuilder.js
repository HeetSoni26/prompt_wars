/**
 * @fileoverview Dynamic system prompt builder for CareerPilot AI.
 * Constructs personalized, context-rich prompts using user profile,
 * memory summary, conversation history, and proactive insights.
 */

/**
 * Expertise levels mapped from message complexity analysis.
 */
const EXPERTISE_LEVELS = {
  beginner: 'beginner (explain jargon, use simple language, be encouraging)',
  intermediate: 'intermediate (assume basic knowledge, use industry terms)',
  expert: 'expert (use technical language, skip basics, be concise and direct)',
};

/**
 * Builds the main system prompt for CareerPilot conversations.
 * @param {Object} options - Prompt configuration
 * @param {Object} options.userProfile - User profile from Firestore
 * @param {string} options.memorySummary - AI-generated summary of past sessions
 * @param {Array<Object>} options.recentMessages - Last 5 messages for context
 * @param {string} options.expertiseLevel - 'beginner' | 'intermediate' | 'expert'
 * @param {string|null} options.proactiveInsight - Optional proactive nudge
 * @returns {string} Fully constructed system prompt
 */
function buildSystemPrompt({
  userProfile,
  memorySummary,
  recentMessages = [],
  expertiseLevel = 'intermediate',
  proactiveInsight = null,
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const name = userProfile?.displayName || 'Job Seeker';
  const role = userProfile?.targetRole || 'professional';
  const expertise = EXPERTISE_LEVELS[expertiseLevel] || EXPERTISE_LEVELS.intermediate;

  const recentContext = formatRecentMessages(recentMessages);
  const insightSection = proactiveInsight
    ? `\n🔔 Proactive Insight (surface naturally): ${proactiveInsight}`
    : '';

  return `You are CareerPilot, a world-class AI career strategist and interview coach specializing in helping job seekers land their dream roles. You combine the tactical precision of a top recruiter with the empathy of a career counselor.

## User Profile
- **Name**: ${name}
- **Target Role**: ${role}
- **Expertise Level**: ${expertise}
- **Session Date**: ${dateStr} at ${timeStr}

## Persistent Memory (Cross-Session Context)
${memorySummary || 'No prior sessions — this is the user\'s first interaction. Welcome them warmly and ask about their job search goals.'}
${insightSection}

## Recent Conversation Context
${recentContext || 'Start of conversation.'}

## Your Capabilities
You help with: resume optimization, cover letter generation, interview preparation (behavioral + technical), job search strategy, salary negotiation, LinkedIn optimization, application tracking, and career pivots.

## Response Rules
1. **Always** respond in structured markdown with clear headers/bullets
2. **Bold** key action items, role names, and critical advice
3. Reference the user's name and past context naturally — never make them repeat themselves
4. For complex questions, use multi-step reasoning: break the problem down, then solve each part
5. Calibrate depth to expertise level — ${expertiseLevel}s need ${expertiseLevel === 'beginner' ? 'more explanation' : 'concise, direct guidance'}
6. Keep responses under 350 words unless the complexity demands more
7. **Always end** with one specific, immediately-actionable next step labeled "**Your Next Step:**"
8. Never give generic advice — personalize every response to the user's specific situation
9. If the user seems stressed or discouraged, acknowledge their emotion before advising
10. Format code snippets (e.g., LinkedIn headlines) in \`code blocks\``;
}

/**
 * Builds a lightweight prompt for generating memory summaries.
 * @param {Array<Object>} sessions - Array of recent session objects
 * @returns {string} Prompt to summarize sessions into persistent memory
 */
function buildMemorySummaryPrompt(sessions) {
  const sessionText = sessions
    .map((s, i) => `Session ${i + 1} (${s.createdAt || 'recent'}): ${s.summary || s.title}`)
    .join('\n');

  return `Summarize the following career coaching sessions into a concise memory profile (max 150 words) that captures: the user's job search goals, progress made, key challenges discussed, and any commitments or action items. Write in third person past tense.

Sessions:
${sessionText}

Output only the summary, no preamble.`;
}

/**
 * Formats the last N messages into readable context string.
 * @param {Array<Object>} messages - Array of message objects
 * @returns {string} Formatted conversation context
 */
function formatRecentMessages(messages) {
  if (!messages?.length) return '';
  return messages
    .slice(-5)
    .map((m) => `${m.role === 'user' ? '👤 User' : '🤖 CareerPilot'}: ${m.content?.slice(0, 200)}`)
    .join('\n');
}

module.exports = { buildSystemPrompt, buildMemorySummaryPrompt, formatRecentMessages };
