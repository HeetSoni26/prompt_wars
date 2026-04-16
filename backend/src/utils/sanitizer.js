/**
 * @fileoverview Input sanitization utilities.
 * Strips HTML, enforces length limits, and normalizes user inputs
 * before AI and database operations.
 */

/** Maximum allowed message length in characters */
const MAX_MESSAGE_LENGTH = 2000;

/** Maximum allowed name/tag length */
const MAX_SHORT_LENGTH = 100;

/**
 * Strips all HTML tags from a string.
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string without HTML tags
 */
function stripHtml(input) {
  return String(input).replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitizes a user message: strips HTML and enforces length limit.
 * @param {string} message - Raw user message
 * @returns {string} Sanitized message safe for AI and DB operations
 * @throws {Error} If message is empty after sanitization
 */
function sanitizeMessage(message) {
  const cleaned = stripHtml(message);
  if (!cleaned) {
    throw new Error('Message cannot be empty.');
  }
  return cleaned.slice(0, MAX_MESSAGE_LENGTH);
}

/**
 * Sanitizes a short string input (names, tags, labels).
 * @param {string} value - Raw short string
 * @returns {string} Sanitized short string
 */
function sanitizeShortString(value) {
  return stripHtml(value).slice(0, MAX_SHORT_LENGTH);
}

/**
 * Sanitizes a session title.
 * @param {string} title - Raw session title
 * @returns {string} Safe session title
 */
function sanitizeSessionTitle(title) {
  return sanitizeShortString(title) || 'Untitled Session';
}

module.exports = { sanitizeMessage, sanitizeShortString, sanitizeSessionTitle };
