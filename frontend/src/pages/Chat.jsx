/**
 * @fileoverview Chat page — main coaching interface with session management.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useMemory } from '../hooks/useMemory';
import ChatWindow from '../components/chat/ChatWindow';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

export default function Chat() {
  const { user } = useAuth();
  const { messages, sessionId, isStreaming, error, startSession, loadSession, sendUserMessage, clearSession, setError } = useChat();
  const { sessions, loading: sessionsLoading, refreshSessions } = useMemory();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('New Session');

  // Load session from URL param or start fresh
  useEffect(() => {
    const sid = searchParams.get('session');
    if (sid) {
      loadSession(sid);
      setSessionTitle(sessions.find((s) => s.id === sid)?.title || 'Session');
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.matches('textarea, input')) return;
      if (e.key === KEYBOARD_SHORTCUTS.newSession) handleNewSession();
      if (e.key === KEYBOARD_SHORTCUTS.toggleSidebar || (e.key === 'b' && e.ctrlKey)) {
        e.preventDefault();
        setSidebarOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Creates a new session optionally with an initial message.
   * @param {string} initialMessage - Optional first message
   */
  const handleNewSession = useCallback(async (initialMessage = '') => {
    clearSession();
    setSessionTitle('New Session');
    try {
      const sid = await startSession(initialMessage.slice(0, 60));
      navigate(`/chat?session=${sid}`, { replace: true });

      // Send initial message if provided (from suggestion prompt)
      if (initialMessage) {
        setTimeout(() => sendUserMessage(initialMessage), 100);
      }

      await refreshSessions();
    } catch {
      setError('Failed to create session. Please try again.');
    }
  }, [clearSession, startSession, navigate, sendUserMessage, refreshSessions, setError]);

  /**
   * Loads an existing session by ID.
   * @param {string} sid - Session ID
   */
  const handleSelectSession = useCallback(async (sid) => {
    clearSession();
    navigate(`/chat?session=${sid}`, { replace: true });
    await loadSession(sid);
    const session = sessions.find((s) => s.id === sid);
    setSessionTitle(session?.title || 'Session');
  }, [clearSession, navigate, loadSession, sessions]);

  const handleSend = useCallback(async (message) => {
    // Auto-create session if none exists
    if (!sessionId) {
      await handleNewSession(message);
      return;
    }
    await sendUserMessage(message);
  }, [sessionId, handleNewSession, sendUserMessage]);

  return (
    <div className="flex h-screen bg-navy-900 bg-glow-indigo overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        loading={sessionsLoading}
        activeSessionId={sessionId}
        onNewSession={() => handleNewSession()}
        onSelectSession={handleSelectSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          title={sessionTitle}
        />

        <main id="main-content" className="flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            error={error}
            onSend={handleSend}
            userName={user?.displayName || user?.email || 'You'}
            sessionStarted={!!sessionId}
            onNewSession={handleNewSession}
          />
        </main>
      </div>

      {/* Keyboard shortcut hint (first-time tooltip) */}
      <AnimatePresence>
        {!sessionId && !messages.length && (
          <motion.div
            className="fixed bottom-20 right-4 px-3 py-2 glass-card text-xs text-slate-500 hidden lg:flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            aria-hidden="true"
          >
            <kbd className="px-1.5 py-0.5 bg-navy-700 rounded text-[10px]">N</kbd>
            New session
            <span className="text-navy-600">|</span>
            <kbd className="px-1.5 py-0.5 bg-navy-700 rounded text-[10px]">Ctrl+B</kbd>
            Toggle sidebar
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
