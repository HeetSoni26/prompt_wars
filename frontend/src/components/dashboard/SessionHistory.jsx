/**
 * @fileoverview SessionHistory — displays the user's session timeline on the dashboard.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { truncateTitle, formatRelativeTime } from '../../utils/formatters';
import { SessionItemSkeleton } from '../ui/SkeletonLoader';

/**
 * Session history timeline for the dashboard.
 * @param {Object} props
 * @param {Array} props.sessions - Array of session objects
 * @param {boolean} props.loading - Loading state
 */
export default function SessionHistory({ sessions, loading }) {
  const navigate = useNavigate();

  return (
    <section aria-label="Session history">
      <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Session History
      </h2>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <SessionItemSkeleton key={i} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-slate-500">No sessions yet. Start coaching!</p>
        </div>
      ) : (
        <ol className="space-y-2" aria-label="Session timeline">
          {sessions.map((session, i) => (
            <motion.li
              key={session.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => navigate(`/chat?session=${session.id}`)}
                className="w-full flex items-center gap-4 p-3.5 rounded-card glass-card hover:border-indigo-500/30 text-left group transition-all"
                aria-label={`Open session: ${session.title}`}
              >
                {/* Timeline dot */}
                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 group-hover:bg-indigo-400 transition-colors" aria-hidden="true" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-50">
                    {truncateTitle(session.title, 50)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatRelativeTime(session.updatedAt)} · {session.messageCount || 0} messages
                  </p>
                </div>

                <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
