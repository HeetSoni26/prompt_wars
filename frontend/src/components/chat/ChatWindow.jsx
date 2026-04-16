/**
 * @fileoverview ChatWindow — main chat interface with message list and suggestion prompts.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import { MessageSkeleton } from '../ui/SkeletonLoader';
import { useVoice } from '../../hooks/useVoice';
import { SUGGESTION_PROMPTS } from '../../utils/constants';

/**
 * Full chat window component with scrollable messages and input bar.
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isStreaming - Whether AI is currently generating
 * @param {string|null} props.error - Error message to display
 * @param {Function} props.onSend - Called with user message string
 * @param {string} props.userName - Current user's display name
 * @param {boolean} props.sessionStarted - Whether a session is active
 * @param {Function} props.onNewSession - Callback to create a new session
 */
export default function ChatWindow({
  messages,
  isStreaming,
  error,
  onSend,
  userName,
  sessionStarted,
  onNewSession,
}) {
  const bottomRef = useRef(null);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSpeak = useCallback((text) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  }, [isSpeaking, speak, stopSpeaking]);

  const handleSuggestion = (text) => {
    if (!sessionStarted) {
      onNewSession(text);
    } else {
      onSend(text);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
        aria-label="Conversation"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* Empty state */}
        {!messages.length && (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Illustrated logo */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-glow">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-slate-50 mb-2">
              Hi {userName?.split(' ')[0] || 'there'} 👋
            </h2>
            <p className="text-slate-400 max-w-sm mb-8 text-balance">
              I'm CareerPilot, your AI career coach. Ask me anything about your job search, resume, or interview prep.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTION_PROMPTS.map((s) => (
                <motion.button
                  key={s.text}
                  onClick={() => handleSuggestion(s.text)}
                  className="flex items-start gap-3 p-3.5 glass-card text-left text-sm text-slate-300 hover:text-slate-50 hover:border-indigo-500/40 transition-all duration-200 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg flex-shrink-0" aria-hidden="true">{s.icon}</span>
                  <span className="group-hover:text-slate-100">{s.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              userName={userName}
              onSpeak={handleSpeak}
            />
          ))}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-3 p-4 rounded-card bg-red-900/20 border border-red-500/30 text-red-300 text-sm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} aria-hidden="true" />
      </main>

      {/* Input */}
      <InputBar
        onSend={onSend}
        disabled={isStreaming || !sessionStarted}
        placeholder={sessionStarted ? 'Ask your career question… (/ to focus)' : 'Start a new session to chat…'}
      />
    </div>
  );
}
