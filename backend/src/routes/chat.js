/**
 * @fileoverview Chat routes — handles AI message streaming and session management.
 * POST /api/chat/session — create new session
 * POST /api/chat/message — send message and stream AI response
 * GET  /api/chat/session/:sessionId/messages — get message history
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { verifyFirebaseToken } = require('../middleware/auth');
const { chatRateLimiter } = require('../middleware/rateLimit');
const { sanitizeMessage, sanitizeSessionTitle } = require('../utils/sanitizer');
const { streamChatResponse, detectExpertiseLevel } = require('../services/geminiService');
const {
  getOrCreateUserProfile,
  getMemorySummary,
  createSession,
  saveMessage,
  getSessionMessages,
  updateSession,
} = require('../services/firestoreService');
const { generateProactiveInsight } = require('../services/insightEngine');

const router = express.Router();

// All chat routes require authentication
router.use(verifyFirebaseToken);

/**
 * POST /api/chat/session
 * Creates a new chat session for the authenticated user.
 */
router.post('/session', async (req, res, next) => {
  try {
    const { title } = req.body;
    const { uid, name, email } = req.user;

    await getOrCreateUserProfile(uid, { displayName: name, email });

    const sessionId = uuidv4();
    const sessionTitle = sanitizeSessionTitle(title || 'New Career Session');
    const session = await createSession(uid, sessionId, sessionTitle);

    res.status(201).json({ sessionId, title: session.title, createdAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/message
 * Sends a user message and streams AI response via SSE.
 * Body: { sessionId, message, messageId? }
 */
router.post('/message', chatRateLimiter, async (req, res, next) => {
  try {
    const { sessionId, message } = req.body;
    const { uid, name, email } = req.user;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'sessionId and message are required.',
      });
    }

    let userMessage;
    try {
      userMessage = sanitizeMessage(message);
    } catch (validationErr) {
      return res.status(400).json({ error: 'BadRequest', message: validationErr.message });
    }
    const userMsgId = uuidv4();
    const aiMsgId = uuidv4();

    // Fetch user context in parallel
    const [userProfile, memorySummary, messageHistory] = await Promise.all([
      getOrCreateUserProfile(uid, { displayName: name, email }),
      getMemorySummary(uid),
      getSessionMessages(uid, sessionId, 10),
    ]);

    // Save user message optimistically
    await saveMessage(uid, sessionId, userMsgId, {
      role: 'user',
      content: userMessage,
      messageId: userMsgId,
    });

    // Detect expertise and generate proactive insight in parallel
    const [expertiseLevel, proactiveInsight] = await Promise.all([
      detectExpertiseLevel(messageHistory),
      generateProactiveInsight(uid, userProfile),
    ]);

    // Stream AI response — this sends SSE chunks and returns full text
    const fullResponse = await streamChatResponse({
      userMessage,
      userProfile,
      memorySummary,
      recentMessages: messageHistory,
      expertiseLevel,
      proactiveInsight: messageHistory.length === 0 ? proactiveInsight : null,
      res,
    });

    // Save AI response to Firestore after stream completes
    await saveMessage(uid, sessionId, aiMsgId, {
      role: 'assistant',
      content: fullResponse,
      messageId: aiMsgId,
    });

    // Update session title from first message if default
    if (messageHistory.length === 0) {
      const autoTitle = userMessage.slice(0, 60).trim();
      await updateSession(uid, sessionId, { title: autoTitle });
    }
  } catch (err) {
    // SSE already started — send error event instead of status code
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: true, message: 'AI response failed. Please try again.' })}\n\n`);
      res.end();
    } else {
      next(err);
    }
  }
});

/**
 * GET /api/chat/session/:sessionId/messages
 * Returns message history for a session.
 */
router.get('/session/:sessionId/messages', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { uid } = req.user;
    const messages = await getSessionMessages(uid, sessionId, 50);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
