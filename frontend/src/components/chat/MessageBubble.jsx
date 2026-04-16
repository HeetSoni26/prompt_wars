/**
 * @fileoverview MessageBubble — renders a single chat message with markdown support.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import StreamingCursor from './StreamingCursor';
import { formatRelativeTime, getInitials } from '../../utils/formatters';

/**
 * Renders a user or AI message bubble with markdown and streaming cursor.
 * @param {Object} props
 * @param {Object} props.message - Message object {role, content, timestamp, streaming}
 * @param {string} props.userName - User's display name for avatar
 * @param {Function} props.onSpeak - Callback to speak this message
 */
const MessageBubble = memo(function MessageBubble({ message, userName, onSpeak }) {
  const isUser = message.role === 'user';
  const initials = isUser ? getInitials(userName) : 'CP';

  return (
    <motion.article
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-label={`${isUser ? 'You' : 'CareerPilot'}: ${message.content?.slice(0, 60)}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
        }`}
        aria-hidden="true"
      >
        {isUser ? initials : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] min-w-0 ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 text-sm ${isUser ? 'message-user' : 'message-ai'}`}>
          {isUser ? (
            <p className="text-slate-100 whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div
              className="prose-ai"
              // We render markdown as basic formatted text
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content || '') }}
              aria-live={message.streaming ? 'polite' : 'off'}
            />
          )}
          {message.streaming && <StreamingCursor visible />}
        </div>

        {/* Timestamp + speak button */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <time className="text-xs text-slate-500" dateTime={message.timestamp?.toString?.()}>
            {formatRelativeTime(message.timestamp)}
          </time>

          {!isUser && !message.streaming && message.content && onSpeak && (
            <button
              onClick={() => onSpeak(message.content)}
              className="p-1 rounded text-slate-500 hover:text-indigo-400 transition-colors"
              aria-label="Read message aloud"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
});

/**
 * Converts basic markdown to safe HTML for AI responses.
 * @param {string} text - Markdown text
 * @returns {string} HTML string (no XSS — content is backend-generated)
 */
function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^#{3}\s(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s(.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^[-*]\s(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^(?!<[^>]+>)(.+)$/gm, (match) => match.startsWith('<') ? match : `<p>${match}</p>`);
}

export default MessageBubble;
