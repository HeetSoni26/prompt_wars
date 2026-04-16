/**
 * @fileoverview Utility formatters for display values.
 */

/**
 * Formats a Firestore timestamp or Date to a relative time string.
 * @param {Object|Date|string} timestamp - Firestore Timestamp or Date
 * @returns {string} Relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    date = new Date(timestamp);
  }

  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a session title, truncating if too long.
 * @param {string} title - Session title
 * @param {number} maxLength - Max display length
 * @returns {string} Truncated title
 */
export function truncateTitle(title, maxLength = 40) {
  if (!title) return 'Untitled Session';
  return title.length > maxLength ? `${title.slice(0, maxLength)}…` : title;
}

/**
 * Gets user initials from display name.
 * @param {string} name - Full display name
 * @returns {string} 1–2 character initials
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Converts markdown-like bold (**text**) in AI responses to HTML.
 * Note: Full markdown is handled by prose-ai CSS class.
 * @param {string} text - Raw text
 * @returns {string} Text with basic formatting
 */
export function highlightKeyTerms(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Formats a byte count to a human-readable string.
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g. "2.4 KB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
