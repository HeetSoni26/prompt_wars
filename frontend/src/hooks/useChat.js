/**
 * @fileoverview useChat hook — manages chat state, message sending, and SSE streaming.
 */

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSession, sendMessage, getSessionMessages } from '../services/api';

/** Simple UUID v4 generator without external dependencies */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * useChat hook provides chat state and actions.
 * @returns {Object} Chat state and handlers
 */
export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  /**
   * Starts a new session and resets state.
   * @param {string} title - Optional session title
   * @returns {Promise<string>} New session ID
   */
  const startSession = useCallback(async (title = '') => {
    setError(null);
    setMessages([]);
    try {
      const session = await createSession(user, title);
      setSessionId(session.sessionId);
      return session.sessionId;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [user]);

  /**
   * Loads message history for an existing session.
   * @param {string} sid - Session ID to load
   */
  const loadSession = useCallback(async (sid) => {
    setError(null);
    setSessionId(sid);
    try {
      const msgs = await getSessionMessages(user, sid);
      setMessages(msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt,
      })));
    } catch (err) {
      setError(err.message);
    }
  }, [user]);

  /**
   * Sends a user message and streams the AI response.
   * @param {string} content - User message text
   */
  const sendUserMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming || !sessionId) return;
    setError(null);

    const userMsgId = uuidv4();
    const aiMsgId = uuidv4();

    const userMsg = { id: userMsgId, role: 'user', content, timestamp: new Date() };

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date(), streaming: true },
    ]);

    setIsStreaming(true);

    try {
      const reader = await sendMessage(user, sessionId, content);
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              accumulated += data.chunk;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: accumulated } : m
                )
              );
            }
            if (data.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, streaming: false } : m
                )
              );
            }
            if (data.error) {
              throw new Error(data.message || 'Streaming failed.');
            }
          } catch (_parseError) {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
      setError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  }, [user, sessionId, isStreaming]);

  /**
   * Clears the current session state.
   */
  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    sessionId,
    isStreaming,
    error,
    startSession,
    loadSession,
    sendUserMessage,
    clearSession,
    setError,
  };
}
