/**
 * @fileoverview Sidebar — collapsible left nav with session history and new session button.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { SessionItemSkeleton } from '../ui/SkeletonLoader';
import { truncateTitle, formatRelativeTime } from '../../utils/formatters';
import { APP_NAME } from '../../utils/constants';

/**
 * Collapsible sidebar with session history.
 * @param {Object} props
 * @param {Array} props.sessions - Array of session objects
 * @param {boolean} props.loading - Whether sessions are loading
 * @param {string} props.activeSessionId - Currently active session ID
 * @param {Function} props.onNewSession - Callback to start a new session
 * @param {Function} props.onSelectSession - Callback to load an existing session
 * @param {boolean} props.isOpen - Whether sidebar is expanded
 * @param {Function} props.onToggle - Toggle sidebar open/close
 */
export default function Sidebar({
  sessions,
  loading,
  activeSessionId,
  onNewSession,
  onSelectSession,
  isOpen,
  onToggle,
}) {
  return (
    <>
      {/* Accessibility skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.nav
        className={`fixed lg:relative z-30 lg:z-auto h-full glass-sidebar flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-0 lg:w-14 overflow-hidden'
        }`}
        aria-label="Navigation sidebar"
        aria-expanded={isOpen}
      >
        {/* Logo + toggle */}
        <div className="flex items-center gap-3 p-4 border-b border-navy-700 h-16 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.span
                className="font-bold text-slate-50 whitespace-nowrap gradient-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Content (only visible when open) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="flex flex-col flex-1 min-h-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
            >
              {/* New session button */}
              <div className="p-3">
                <button
                  onClick={onNewSession}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-card btn-primary justify-center text-sm font-semibold"
                  aria-label="Start new career coaching session (N)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Session
                </button>
              </div>

              {/* Session history */}
              <div className="flex-1 overflow-y-auto px-2 pb-4">
                <p className="px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Recent Sessions
                </p>

                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SessionItemSkeleton key={i} />)
                ) : sessions.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-slate-500">No sessions yet.<br />Start your first coaching session!</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onClick={() => onSelectSession(session.id)}
                    />
                  ))
                )}
              </div>

              {/* Dashboard link */}
              <div className="p-3 border-t border-navy-700">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-50 hover:bg-navy-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

/**
 * Individual session list item.
 */
function SessionItem({ session, isActive, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 group ${
        isActive
          ? 'bg-indigo-600/20 text-slate-50 border border-indigo-500/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800'
      }`}
      whileHover={{ x: 2 }}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Session: ${session.title}`}
    >
      <svg className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-xs">{truncateTitle(session.title)}</p>
        <p className="text-xs text-slate-600 mt-0.5">{formatRelativeTime(session.updatedAt)}</p>
      </div>
    </motion.button>
  );
}
