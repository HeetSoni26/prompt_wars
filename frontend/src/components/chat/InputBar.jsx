/**
 * @fileoverview InputBar — message input with voice, auto-resize, and keyboard shortcuts.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice';
import { MAX_MESSAGE_LENGTH } from '../../utils/constants';

/**
 * Chat input bar with voice toggle, auto-resize, and send-on-Enter.
 * @param {Object} props
 * @param {Function} props.onSend - Called with the message string
 * @param {boolean} props.disabled - Disables input when streaming
 * @param {string} props.placeholder - Input placeholder text
 */
export default function InputBar({ onSend, disabled = false, placeholder = 'Ask your career question…' }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const { isListening, isSpeaking, transcript, voiceSupported, startListening, stopListening } = useVoice();

  // Keyboard shortcut: / to focus input
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/' && !e.target.matches('textarea, input')) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Fill input with voice transcript
  useEffect(() => {
    if (transcript) setValue(transcript);
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSend = useCallback(() => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setValue(text);
      });
    }
  };

  const charCount = value.length;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;

  return (
    <div className="p-4 border-t border-navy-700">
      {/* Voice waveform indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="flex items-center justify-center gap-1 mb-3 py-2 rounded-lg bg-indigo-900/30 border border-indigo-500/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="status"
            aria-live="polite"
            aria-label="Voice recording active"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 bg-indigo-400 rounded-full animate-wave${i}`}
                style={{ height: 20 }}
                aria-hidden="true"
              />
            ))}
            <span className="ml-3 text-xs text-indigo-300">Listening…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 glass-card p-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Type your message. Press Enter to send. Shift+Enter for new line."
          aria-multiline="true"
          className="flex-1 resize-none bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2 py-2 min-h-[40px] max-h-40 leading-relaxed disabled:opacity-50"
          style={{ scrollbarWidth: 'none' }}
        />

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0 pb-1">
          {/* Char counter */}
          {isNearLimit && (
            <span className={`text-xs ${charCount >= MAX_MESSAGE_LENGTH ? 'text-red-400' : 'text-warning'}`} aria-live="polite">
              {MAX_MESSAGE_LENGTH - charCount}
            </span>
          )}

          {/* Voice toggle */}
          {voiceSupported && (
            <motion.button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700'
              }`}
              whileTap={{ scale: 0.9 }}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input (V)'}
              aria-pressed={isListening}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </motion.button>
          )}

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
            whileTap={!disabled ? { scale: 0.9 } : {}}
            aria-label="Send message (Enter)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-2 text-center">
        Enter to send · Shift+Enter for new line · <kbd className="px-1 py-0.5 bg-navy-800 rounded text-[10px]">/</kbd> to focus
      </p>
    </div>
  );
}
