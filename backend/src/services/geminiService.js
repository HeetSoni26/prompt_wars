/**
 * @fileoverview Gemini AI service for CareerPilot.
 * Wraps @google/generative-ai SDK with streaming support,
 * memory summarization, and expertise level detection.
 */

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { buildSystemPrompt, buildMemorySummaryPrompt } = require('../utils/promptBuilder');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** Safety settings — allow career coaching content */
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Creates a configured Gemini generative model instance.
 * @param {string} systemPrompt - System instruction string
 * @returns {import('@google/generative-ai').GenerativeModel} Configured model
 */
function createModel(systemPrompt) {
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });
}

/**
 * Streams a Gemini response to an Express response object via SSE.
 * @param {Object} options - Stream options
 * @param {string} options.userMessage - The user's latest message
 * @param {Object} options.userProfile - User profile from Firestore
 * @param {string} options.memorySummary - Cross-session memory summary
 * @param {Array<Object>} options.recentMessages - Recent conversation history
 * @param {string} options.expertiseLevel - Detected expertise level
 * @param {string|null} options.proactiveInsight - Optional proactive insight
 * @param {import('express').Response} options.res - Express response object
 * @returns {Promise<string>} Full accumulated response text
 */
async function streamChatResponse({
  userMessage,
  userProfile,
  memorySummary,
  recentMessages,
  expertiseLevel,
  proactiveInsight,
  res,
}) {
  const systemPrompt = buildSystemPrompt({
    userProfile,
    memorySummary,
    recentMessages,
    expertiseLevel,
    proactiveInsight,
  });

  const model = createModel(systemPrompt);

  // Build chat history for Gemini (exclude most recent user message — it's sent separately)
  const history = buildGeminiHistory(recentMessages);
  const chat = model.startChat({ history });

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let fullResponse = '';

  const result = await chat.sendMessageStream(userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();

  return fullResponse;
}

/**
 * Generates a memory summary from recent session data (non-streaming).
 * @param {Array<Object>} sessions - Recent sessions with summaries/titles
 * @returns {Promise<string>} AI-generated memory summary
 */
async function generateMemorySummary(sessions) {
  if (!sessions?.length) return '';

  const prompt = buildMemorySummaryPrompt(sessions);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.3, maxOutputTokens: 256 },
  });

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * Detects the user's expertise level from their message history.
 * @param {Array<Object>} messages - Recent user messages
 * @returns {Promise<string>} Expertise level: 'beginner' | 'intermediate' | 'expert'
 */
async function detectExpertiseLevel(messages) {
  if (!messages?.length) return 'intermediate';

  const userMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-5)
    .map((m) => m.content)
    .join('\n');

  const prompt = `Analyze these job seeker messages and classify their career expertise level.
Messages: "${userMessages}"
Reply with ONLY one word: beginner, intermediate, or expert.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
    });
    const result = await model.generateContent(prompt);
    const level = result.response.text().trim().toLowerCase();
    return ['beginner', 'intermediate', 'expert'].includes(level) ? level : 'intermediate';
  } catch {
    return 'intermediate';
  }
}

/**
 * Converts CareerPilot message format to Gemini history format.
 * @param {Array<Object>} messages - Array of {role, content} objects
 * @returns {Array<Object>} Gemini-compatible history array
 */
function buildGeminiHistory(messages) {
  if (!messages?.length) return [];

  // Gemini requires alternating user/model turns starting with user
  const filtered = messages.slice(-8); // Last 8 messages for context
  return filtered.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '' }],
  }));
}

module.exports = { streamChatResponse, generateMemorySummary, detectExpertiseLevel };
